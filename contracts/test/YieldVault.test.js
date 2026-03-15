const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YieldVault", function () {
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
    vault = await YieldVault.deploy(await mockUSDC.getAddress());
    await vault.waitForDeployment();

    await mockUSDC.mint(user.address, TEN_USDC);
    await mockUSDC.mint(owner.address, TWENTY_USDC);
  });

  it("deploys with correct asset and roles", async function () {
    expect(await vault.asset()).to.equal(await mockUSDC.getAddress());

    const ADMIN_ROLE = await vault.ADMIN_ROLE();
    const DEFAULT_ADMIN_ROLE = await vault.DEFAULT_ADMIN_ROLE();

    expect(await vault.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
    expect(await vault.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(
      true,
    );
  });

  it("sets initial deposit cap correctly", async function () {
    expect(await vault.depositCap()).to.equal(1_000_000n * 10n ** 6n);
  });

  it("allows approve and deposit", async function () {
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

  it("reverts deposit when paused", async function () {
    await vault.pause();

    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);

    await expect(
      vault.connect(user).deposit(ONE_USDC, user.address),
    ).to.be.revertedWith("Pausable: paused");
  });

  it("allows admin to unpause after pause", async function () {
    await vault.pause();
    await vault.unpause();

    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await expect(vault.connect(user).deposit(ONE_USDC, user.address)).to.not.be
      .reverted;
  });

  it("reverts when non-admin tries to pause", async function () {
    await expect(vault.connect(user).pause()).to.be.reverted;
  });

  it("reverts deposit when cap exceeded", async function () {
    await vault.updateDepositCap(ONE_USDC);

    await mockUSDC.connect(user).approve(await vault.getAddress(), TWO_USDC);

    await vault.connect(user).deposit(ONE_USDC, user.address);

    await expect(
      vault.connect(user).deposit(ONE_USDC, user.address),
    ).to.be.revertedWith("Deposit cap exceeded");
  });

  it("allows admin to update deposit cap", async function () {
    await vault.updateDepositCap(TEN_USDC);
    expect(await vault.depositCap()).to.equal(TEN_USDC);
  });

  it("reverts when non-admin updates deposit cap", async function () {
    await expect(vault.connect(user).updateDepositCap(TEN_USDC)).to.be.reverted;
  });

  it("allows redeem after deposit", async function () {
    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(user).deposit(ONE_USDC, user.address);

    await vault.connect(user).redeem(ONE_USDC, user.address, user.address);

    expect(await vault.balanceOf(user.address)).to.equal(0);
    expect(await vault.totalAssets()).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
  });

  it("previewDeposit returns expected shares initially", async function () {
    const shares = await vault.previewDeposit(ONE_USDC);
    expect(shares).to.equal(ONE_USDC);
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

    const userBalanceBefore = await mockUSDC.balanceOf(user.address);

    await vault.connect(user).redeem(ONE_USDC, user.address, user.address);

    const userBalanceAfter = await mockUSDC.balanceOf(user.address);

    expect(userBalanceAfter - userBalanceBefore).to.equal(TWO_USDC);
    expect(await vault.balanceOf(user.address)).to.equal(0);
    expect(await vault.totalAssets()).to.equal(0);
  });

  it("reverts simulateYield when non-admin calls it", async function () {
    await expect(vault.connect(user).simulateYield(ONE_USDC)).to.be.reverted;
  });

  it("reverts redeem when paused", async function () {
    await mockUSDC.connect(user).approve(await vault.getAddress(), ONE_USDC);
    await vault.connect(user).deposit(ONE_USDC, user.address);

    await vault.pause();

    await expect(
      vault.connect(user).redeem(ONE_USDC, user.address, user.address),
    ).to.be.revertedWith("Pausable: paused");
  });
});
