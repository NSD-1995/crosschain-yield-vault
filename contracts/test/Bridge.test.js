const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Signature-based Bridge", function () {
  let owner, user, relayer, signer, attacker;
  let sourceToken, destinationToken;
  let bridgeSender, bridgeReceiver;

  const ONE_USDC = 1_000_000n;
  const FIVE_USDC = 5_000_000n;
  const TEN_USDC = 10_000_000n;

  beforeEach(async function () {
    [owner, user, relayer, signer, attacker] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");

    // Source chain token
    sourceToken = await MockUSDC.deploy();
    await sourceToken.waitForDeployment();

    // Destination chain token
    destinationToken = await MockUSDC.deploy();
    await destinationToken.waitForDeployment();

    const BridgeSender = await ethers.getContractFactory("BridgeSender");
    bridgeSender = await BridgeSender.deploy(await sourceToken.getAddress());
    await bridgeSender.waitForDeployment();

    const BridgeReceiver = await ethers.getContractFactory("BridgeReceiver");
    bridgeReceiver = await BridgeReceiver.deploy(
      await destinationToken.getAddress(),
    );
    await bridgeReceiver.waitForDeployment();

    // Source-chain user balance
    await sourceToken.mint(user.address, TEN_USDC);

    // Destination-chain liquidity
    await destinationToken.mint(await bridgeReceiver.getAddress(), TEN_USDC);

    // Grant relayer role
    const RELAYER_ROLE = await bridgeReceiver.RELAYER_ROLE();
    await bridgeReceiver.grantRole(RELAYER_ROLE, relayer.address);

    // Allow a dedicated signer
    await bridgeReceiver.setAllowedSigner(signer.address, true);
  });

  async function latestTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return BigInt(block.timestamp);
  }

  async function signBridgeMessage(
    userAddr,
    amount,
    nonce,
    expiry,
    signingWallet,
  ) {
    const messageHash = await bridgeReceiver.getMessageHash(
      userAddr,
      amount,
      nonce,
      expiry,
    );

    return await signingWallet.signMessage(ethers.getBytes(messageHash));
  }

  it("deploys correctly", async function () {
    expect(await bridgeSender.token()).to.equal(await sourceToken.getAddress());
    expect(await bridgeReceiver.token()).to.equal(
      await destinationToken.getAddress(),
    );

    const RELAYER_ROLE = await bridgeReceiver.RELAYER_ROLE();
    expect(
      await bridgeReceiver.hasRole(RELAYER_ROLE, relayer.address),
    ).to.equal(true);
    expect(await bridgeReceiver.allowedSigners(signer.address)).to.equal(true);
  });

  it("allows user to initiate bridge and lock source tokens", async function () {
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

  it("reverts bridge initiation with zero amount", async function () {
    await expect(bridgeSender.connect(user).bridge(0)).to.be.revertedWith(
      "Invalid amount",
    );
  });

  it("reverts bridge initiation without approval", async function () {
    await expect(bridgeSender.connect(user).bridge(ONE_USDC)).to.be.reverted;
  });

  it("allows relayer to complete bridge with valid signature", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), ONE_USDC);
    await bridgeSender.connect(user).bridge(ONE_USDC);

    const nonce = await bridgeSender.nonce();
    const expiry = (await latestTimestamp()) + 3600n;
    const signature = await signBridgeMessage(
      user.address,
      ONE_USDC,
      nonce,
      expiry,
      signer,
    );

    await expect(
      bridgeReceiver
        .connect(relayer)
        .completeBridge(user.address, ONE_USDC, nonce, expiry, signature),
    )
      .to.emit(bridgeReceiver, "BridgeCompleted")
      .withArgs(user.address, ONE_USDC, nonce, expiry);

    expect(await bridgeReceiver.processedNonces(nonce)).to.equal(true);
    expect(await destinationToken.balanceOf(user.address)).to.equal(ONE_USDC);
  });

  it("reverts with expired signature", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), ONE_USDC);
    await bridgeSender.connect(user).bridge(ONE_USDC);

    const nonce = await bridgeSender.nonce();
    const expiry = (await latestTimestamp()) - 1n;

    const signature = await signBridgeMessage(
      user.address,
      ONE_USDC,
      nonce,
      expiry,
      signer,
    );

    await expect(
      bridgeReceiver
        .connect(relayer)
        .completeBridge(user.address, ONE_USDC, nonce, expiry, signature),
    ).to.be.revertedWith("Signature expired");
  });

  it("reverts with invalid signer", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), ONE_USDC);
    await bridgeSender.connect(user).bridge(ONE_USDC);

    const nonce = await bridgeSender.nonce();
    const expiry = (await latestTimestamp()) + 3600n;

    const invalidSignature = await signBridgeMessage(
      user.address,
      ONE_USDC,
      nonce,
      expiry,
      attacker,
    );

    await expect(
      bridgeReceiver
        .connect(relayer)
        .completeBridge(
          user.address,
          ONE_USDC,
          nonce,
          expiry,
          invalidSignature,
        ),
    ).to.be.revertedWith("Invalid signer");
  });

  it("reverts duplicate nonce submission", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), ONE_USDC);
    await bridgeSender.connect(user).bridge(ONE_USDC);

    const nonce = await bridgeSender.nonce();
    const expiry = (await latestTimestamp()) + 3600n;
    const signature = await signBridgeMessage(
      user.address,
      ONE_USDC,
      nonce,
      expiry,
      signer,
    );

    await bridgeReceiver
      .connect(relayer)
      .completeBridge(user.address, ONE_USDC, nonce, expiry, signature);

    await expect(
      bridgeReceiver
        .connect(relayer)
        .completeBridge(user.address, ONE_USDC, nonce, expiry, signature),
    ).to.be.revertedWith("Bridge already processed");
  });

  it("reverts unauthorized relayer", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), ONE_USDC);
    await bridgeSender.connect(user).bridge(ONE_USDC);

    const nonce = await bridgeSender.nonce();
    const expiry = (await latestTimestamp()) + 3600n;
    const signature = await signBridgeMessage(
      user.address,
      ONE_USDC,
      nonce,
      expiry,
      signer,
    );

    await expect(
      bridgeReceiver
        .connect(attacker)
        .completeBridge(user.address, ONE_USDC, nonce, expiry, signature),
    ).to.be.reverted;
  });

  it("reverts if receiver has insufficient liquidity", async function () {
    const bigAmount = 20_000_000n; // 20 USDC > receiver liquidity

    await sourceToken.mint(user.address, bigAmount);
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), bigAmount);
    await bridgeSender.connect(user).bridge(bigAmount);

    const nonce = await bridgeSender.nonce();
    const expiry = (await latestTimestamp()) + 3600n;
    const signature = await signBridgeMessage(
      user.address,
      bigAmount,
      nonce,
      expiry,
      signer,
    );

    await expect(
      bridgeReceiver
        .connect(relayer)
        .completeBridge(user.address, bigAmount, nonce, expiry, signature),
    ).to.be.revertedWith("Token transfer failed");
  });

  it("handles multiple bridge nonces correctly", async function () {
    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), FIVE_USDC);

    await bridgeSender.connect(user).bridge(ONE_USDC);
    await bridgeSender.connect(user).bridge(2_000_000n);

    const expiry = (await latestTimestamp()) + 3600n;

    const sig1 = await signBridgeMessage(
      user.address,
      ONE_USDC,
      1,
      expiry,
      signer,
    );

    const sig2 = await signBridgeMessage(
      user.address,
      2_000_000n,
      2,
      expiry,
      signer,
    );

    await bridgeReceiver
      .connect(relayer)
      .completeBridge(user.address, ONE_USDC, 1, expiry, sig1);

    await bridgeReceiver
      .connect(relayer)
      .completeBridge(user.address, 2_000_000n, 2, expiry, sig2);

    expect(await bridgeReceiver.processedNonces(1)).to.equal(true);
    expect(await bridgeReceiver.processedNonces(2)).to.equal(true);
    expect(await destinationToken.balanceOf(user.address)).to.equal(3_000_000n);
  });

  it("admin can disable signer and old signer stops working", async function () {
    await bridgeReceiver.setAllowedSigner(signer.address, false);

    await sourceToken
      .connect(user)
      .approve(await bridgeSender.getAddress(), ONE_USDC);
    await bridgeSender.connect(user).bridge(ONE_USDC);

    const nonce = await bridgeSender.nonce();
    const expiry = (await latestTimestamp()) + 3600n;

    const signature = await signBridgeMessage(
      user.address,
      ONE_USDC,
      nonce,
      expiry,
      signer,
    );

    await expect(
      bridgeReceiver
        .connect(relayer)
        .completeBridge(user.address, ONE_USDC, nonce, expiry, signature),
    ).to.be.revertedWith("Invalid signer");
  });
});
