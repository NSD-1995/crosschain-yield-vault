const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bridge flow", function () {
  let owner, user, relayer, attacker;
  let sourceToken, destinationToken;
  let bridgeSender, bridgeReceiver;

  const ONE_USDC = 1_000_000n; // 1 USDC
  const FIVE_USDC = 5_000_000n; // 5 USDC
  const TEN_USDC = 10_000_000n; // 10 USDC

  beforeEach(async function () {
    [owner, user, relayer, attacker] = await ethers.getSigners();

    // Deploy source token (Chain A)
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    sourceToken = await MockUSDC.deploy();
    await sourceToken.waitForDeployment();

    // Deploy destination token (Chain B)
    destinationToken = await MockUSDC.deploy();
    await destinationToken.waitForDeployment();

    // Deploy BridgeSender with source token
    const BridgeSender = await ethers.getContractFactory("BridgeSender");
    bridgeSender = await BridgeSender.deploy(await sourceToken.getAddress());
    await bridgeSender.waitForDeployment();

    // Deploy BridgeReceiver with destination token
    const BridgeReceiver = await ethers.getContractFactory("BridgeReceiver");
    bridgeReceiver = await BridgeReceiver.deploy(
      await destinationToken.getAddress(),
    );
    await bridgeReceiver.waitForDeployment();

    // Give user tokens on source chain
    await sourceToken.mint(user.address, TEN_USDC);

    // Fund destination bridge with liquidity to simulate unlock on Chain B
    await destinationToken.mint(await bridgeReceiver.getAddress(), TEN_USDC);

    // Grant relayer role to relayer account on destination bridge
    const RELAYER_ROLE = await bridgeReceiver.RELAYER_ROLE();
    await bridgeReceiver.grantRole(RELAYER_ROLE, relayer.address);
  });

  it("deploys contracts correctly", async function () {
    expect(await bridgeSender.token()).to.equal(await sourceToken.getAddress());
    expect(await bridgeReceiver.token()).to.equal(
      await destinationToken.getAddress(),
    );

    const RELAYER_ROLE = await bridgeReceiver.RELAYER_ROLE();
    expect(
      await bridgeReceiver.hasRole(RELAYER_ROLE, relayer.address),
    ).to.equal(true);
  });

  it("allows user to initiate bridge and locks tokens in BridgeSender", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), ONE_USDC);

    await expect(bridgeSender.connect(user).bridge(ONE_USDC))
      .to.emit(bridgeSender, "BridgeInitiated")
      .withArgs(user.address, ONE_USDC, 1);

    expect(await bridgeSender.nonce()).to.equal(1);
    expect(await sourceToken.balanceOf(user.address)).to.equal(
      TEN_USDC - ONE_USDC,
    );
    expect(
      await sourceToken.balanceOf(await bridgeSender.getAddress()),
    ).to.equal(ONE_USDC);
  });

  it("reverts bridge initiation if amount is zero", async function () {
    await expect(bridgeSender.connect(user).bridge(0)).to.be.revertedWith(
      "Invalid amount",
    );
  });

  it("reverts bridge initiation without approval", async function () {
    await expect(bridgeSender.connect(user).bridge(ONE_USDC)).to.be.reverted;
  });

  it("allows relayer to complete bridge on destination chain", async function () {
    // Chain A: user bridges
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), ONE_USDC);
    await bridgeSender.connect(user).bridge(ONE_USDC);

    // Chain B: relayer completes
    await expect(
      bridgeReceiver.connect(relayer).completeBridge(user.address, ONE_USDC, 1),
    )
      .to.emit(bridgeReceiver, "BridgeCompleted")
      .withArgs(user.address, ONE_USDC, 1);

    expect(await bridgeReceiver.processedNonces(1)).to.equal(true);
    expect(await destinationToken.balanceOf(user.address)).to.equal(ONE_USDC);
    expect(
      await destinationToken.balanceOf(await bridgeReceiver.getAddress()),
    ).to.equal(TEN_USDC - ONE_USDC);
  });

  it("prevents double submission for same nonce", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), ONE_USDC);
    await bridgeSender.connect(user).bridge(ONE_USDC);

    await bridgeReceiver
      .connect(relayer)
      .completeBridge(user.address, ONE_USDC, 1);

    await expect(
      bridgeReceiver.connect(relayer).completeBridge(user.address, ONE_USDC, 1),
    ).to.be.revertedWith("Bridge already processed");
  });

  it("blocks unauthorized user from completing bridge", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), ONE_USDC);
    await bridgeSender.connect(user).bridge(ONE_USDC);

    await expect(
      bridgeReceiver
        .connect(attacker)
        .completeBridge(user.address, ONE_USDC, 1),
    ).to.be.reverted;
  });

  it("handles multiple bridge nonces correctly", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), FIVE_USDC);

    await expect(bridgeSender.connect(user).bridge(ONE_USDC))
      .to.emit(bridgeSender, "BridgeInitiated")
      .withArgs(user.address, ONE_USDC, 1);

    await expect(bridgeSender.connect(user).bridge(TWO_USDC()))
      .to.emit(bridgeSender, "BridgeInitiated")
      .withArgs(user.address, TWO_USDC(), 2);

    expect(await bridgeSender.nonce()).to.equal(2);

    await bridgeReceiver
      .connect(relayer)
      .completeBridge(user.address, ONE_USDC, 1);
    await bridgeReceiver
      .connect(relayer)
      .completeBridge(user.address, TWO_USDC(), 2);

    expect(await bridgeReceiver.processedNonces(1)).to.equal(true);
    expect(await bridgeReceiver.processedNonces(2)).to.equal(true);
    expect(await destinationToken.balanceOf(user.address)).to.equal(
      THREE_USDC(),
    );
  });

  it("locks source tokens and releases destination liquidity correctly", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), FIVE_USDC);

    await bridgeSender.connect(user).bridge(FIVE_USDC);
    expect(
      await sourceToken.balanceOf(await bridgeSender.getAddress()),
    ).to.equal(FIVE_USDC);

    await bridgeReceiver
      .connect(relayer)
      .completeBridge(user.address, FIVE_USDC, 1);

    expect(await destinationToken.balanceOf(user.address)).to.equal(FIVE_USDC);
    expect(
      await destinationToken.balanceOf(await bridgeReceiver.getAddress()),
    ).to.equal(TEN_USDC - FIVE_USDC);
  });

  it("reverts completeBridge if BridgeReceiver has insufficient liquidity", async function () {
    const bigAmount = 20_000_000n; // 20 USDC, more than receiver balance

    await sourceToken.mint(user.address, bigAmount);
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), bigAmount);
    await bridgeSender.connect(user).bridge(bigAmount);

    await expect(
      bridgeReceiver
        .connect(relayer)
        .completeBridge(user.address, bigAmount, 1),
    ).to.be.reverted;
  });

  function TWO_USDC() {
    return 2_000_000n;
  }

  function THREE_USDC() {
    return 3_000_000n;
  }
});
