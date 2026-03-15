const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("YieldVault UUPS", function () {
  let owner, user, other;
  let mockUSDC, vault;

  const ONE_USDC = 1_000_000n;
  const TWO_USDC = 2_000_000n;
  const TEN_USDC = 10_000_000n;
  const TWENTY_USDC = 20_000_000n;

  beforeEach(async function () {
    [owner, user, other] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    const YieldVault = await ethers.getContractFactory("YieldVault");
    vault = await upgrades.deployProxy(
      YieldVault,
      [
        await mockUSDC.getAddress(),
        1_000_000n * 10n ** 6n, // depositCap
        ONE_USDC, // minInitialDeposit = 1 USDC
      ],
      {
        initializer: "initialize",
        kind: "uups",
      },
    );
    await vault.waitForDeployment();

    await mockUSDC.mint(user.address, TEN_USDC);
    await mockUSDC.mint(owner.address, TWENTY_USDC);
  });

  it("initializes correctly", async function () {
    expect(await vault.asset()).to.equal(await mockUSDC.getAddress());
    expect(await vault.depositCap()).to.equal(1_000_000n * 10n ** 6n);
    expect(await vault.minInitialDeposit()).to.equal(ONE_USDC);

    const ADMIN_ROLE = await vault.ADMIN_ROLE();
    const UPGRADER_ROLE = await vault.UPGRADER_ROLE();

    expect(await vault.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
    expect(await vault.hasRole(UPGRADER_ROLE, owner.address)).to.equal(true);
  });

  it("cannot be initialized twice", async function () {
    await expect(vault.initialize(await mockUSDC.getAddress(), 100n, 100n)).to
      .be.reverted;
  });

  it("allows deposit with approval", async function () {
    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(user).deposit(ONE_USDC, user.address);

    expect(await vault.balanceOf(user.address)).to.equal(ONE_USDC);
    expect(await vault.totalAssets()).to.equal(ONE_USDC);
    expect(await vault.totalSupply()).to.equal(ONE_USDC);
  });

  it("reverts deposit without approval", async function () {
    await expect(vault.connect(user).deposit(ONE_USDC, user.address)).to.be
      .reverted;
  });

  it("reverts first deposit if below minInitialDeposit", async function () {
    const tooSmall = 500_000n; // 0.5 USDC

    await mockUSDC.connect(user).approve(await vault.getAddress(), tooSmall);

    await expect(
      vault.connect(user).deposit(tooSmall, user.address),
    ).to.be.revertedWith("Initial deposit too small");
  });

  it("reverts deposit when paused", async function () {
    await vault.pause();

    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);

    await expect(
      vault.connect(user).deposit(ONE_USDC, user.address),
    ).to.be.revertedWith("Pausable: paused");
  });

  it("reverts mint when paused", async function () {
    await vault.pause();

    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);

    await expect(
      vault.connect(user).mint(ONE_USDC, user.address),
    ).to.be.revertedWith("Pausable: paused");
  });

  it("reverts withdraw when paused", async function () {
    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(user).deposit(ONE_USDC, user.address);

    await vault.pause();

    await expect(
      vault.connect(user).withdraw(ONE_USDC, user.address, user.address),
    ).to.be.revertedWith("Pausable: paused");
  });

  it("reverts redeem when paused", async function () {
    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(user).deposit(ONE_USDC, user.address);

    await vault.pause();

    await expect(
      vault.connect(user).redeem(ONE_USDC, user.address, user.address),
    ).to.be.revertedWith("Pausable: paused");
  });

  it("reverts deposit when cap exceeded", async function () {
    await vault.updateDepositCap(ONE_USDC);

    await mockUSDC.connect(user).approve(await vault.getAddress(), TWO_USDC);
    await vault.connect(user).deposit(ONE_USDC, user.address);

    await expect(
      vault.connect(user).deposit(ONE_USDC, user.address),
    ).to.be.revertedWith("Deposit cap exceeded");
  });

  it("reverts mint when cap exceeded", async function () {
    await vault.updateDepositCap(ONE_USDC);

    await mockUSDC.connect(user).approve(await vault.getAddress(), TWO_USDC);

    await expect(
      vault.connect(user).mint(TWO_USDC, user.address),
    ).to.be.revertedWith("Deposit cap exceeded");
  });

  it("returns correct maxDeposit", async function () {
    const initialMax = await vault.maxDeposit(user.address);
    expect(initialMax).to.equal(1_000_000n * 10n ** 6n);

    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(user).deposit(ONE_USDC, user.address);

    const nextMax = await vault.maxDeposit(user.address);
    expect(nextMax).to.equal(1_000_000n * 10n ** 6n - ONE_USDC);
  });

  it("returns 0 maxDeposit when paused", async function () {
    await vault.pause();
    expect(await vault.maxDeposit(user.address)).to.equal(0);
  });

  it("allows admin to update deposit cap", async function () {
    await vault.updateDepositCap(TEN_USDC);
    expect(await vault.depositCap()).to.equal(TEN_USDC);
  });

  it("reverts when non-admin updates deposit cap", async function () {
    await expect(vault.connect(user).updateDepositCap(TEN_USDC)).to.be.reverted;
  });

  it("reverts if new cap is below current assets", async function () {
    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(user).deposit(ONE_USDC, user.address);

    await expect(vault.updateDepositCap(500_000n)).to.be.revertedWith(
      "Cap below current assets",
    );
  });

  it("allows admin to update minInitialDeposit", async function () {
    await vault.updateMinInitialDeposit(TWO_USDC);
    expect(await vault.minInitialDeposit()).to.equal(TWO_USDC);
  });

  it("reverts when non-admin updates minInitialDeposit", async function () {
    await expect(vault.connect(user).updateMinInitialDeposit(TWO_USDC)).to.be
      .reverted;
  });

  it("simulateYield increases totalAssets", async function () {
    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(user).deposit(ONE_USDC, user.address);

    await mockUSDC.connect(owner).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(owner).simulateYield(ONE_USDC);

    expect(await vault.totalAssets()).to.equal(TWO_USDC);
    expect(await vault.totalSupply()).to.equal(ONE_USDC);
  });

  it("redeem returns more assets after yield", async function () {
    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(user).deposit(ONE_USDC, user.address);

    await mockUSDC.connect(owner).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(owner).simulateYield(ONE_USDC);

    const balanceBefore = await mockUSDC.balanceOf(user.address);

    await vault.connect(user).redeem(ONE_USDC, user.address, user.address);

    const balanceAfter = await mockUSDC.balanceOf(user.address);
    const redeemedAmount = balanceAfter - balanceBefore;

    expect(
      redeemedAmount === TWO_USDC || redeemedAmount === TWO_USDC - 1n,
    ).to.equal(true);
    expect(await vault.balanceOf(user.address)).to.equal(0);
    expect(await vault.totalAssets()).to.equal(0);
  });

  it("reverts simulateYield when non-admin calls it", async function () {
    await expect(vault.connect(user).simulateYield(ONE_USDC)).to.be.reverted;
  });

  it("allows authorized UUPS upgrade", async function () {
    const YieldVaultV2 = await ethers.getContractFactory("YieldVaultV2");
    const implV2 = await YieldVaultV2.deploy();
    await implV2.waitForDeployment();

    await vault.upgradeTo(await implV2.getAddress());

    const upgraded = await ethers.getContractAt(
      "YieldVaultV2",
      await vault.getAddress(),
    );

    expect(await upgraded.version()).to.equal(2);
  });
});
