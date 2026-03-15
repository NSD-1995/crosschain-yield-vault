const hre = require("hardhat");
const fs = require("fs").promises;

async function main() {
  const raw = await fs.readFile("./deployments.json", "utf8");
  const deployments = JSON.parse(raw);

  const usdcAddress = deployments.MockUSDC;
  const vaultAddress = deployments.YieldVault;

  const [user] = await hre.ethers.getSigners();

  console.log("User:", user.address);
  console.log("MockUSDC:", usdcAddress);
  console.log("Vault:", vaultAddress);

  const usdc = await hre.ethers.getContractAt("MockUSDC", usdcAddress);
  const vault = await hre.ethers.getContractAt("YieldVault", vaultAddress);

  const depositAmount = 1_000_000n; // 1 USDC

  /*
  Check user balance
  */

  const balanceBefore = await usdc.balanceOf(user.address);

  console.log("User USDC before:", balanceBefore.toString());

  /*
  Mint tokens if needed
  */

  if (balanceBefore < depositAmount) {
    console.log("Minting 10 USDC...");

    const mintTx = await usdc.mint(user.address, 10_000_000n);
    await mintTx.wait();
  }

  /*
  Approve vault
  */

  console.log("Approving vault...");

  const approveTx = await usdc.approve(vaultAddress, depositAmount);
  await approveTx.wait();

  const allowance = await usdc.allowance(user.address, vaultAddress);

  console.log("Allowance:", allowance.toString());

  /*
  Deposit
  */

  console.log("Depositing into vault...");

  const depositTx = await vault.deposit(depositAmount, user.address);
  await depositTx.wait();

  /*
  Vault state
  */

  const shareBalance = await vault.balanceOf(user.address);
  const totalAssets = await vault.totalAssets();
  const totalSupply = await vault.totalSupply();

  console.log("Deposit complete");

  console.log("User shares:", shareBalance.toString());
  console.log("Vault total assets:", totalAssets.toString());
  console.log("Vault total supply:", totalSupply.toString());
}

main().catch((error) => {
  console.error("Deposit script failed:", error);
  process.exitCode = 1;
});
