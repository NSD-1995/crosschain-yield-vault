const hre = require("hardhat");
const fs = require("fs").promises;

async function main() {
  const raw = await fs.readFile("./deployments.json", "utf8");
  const deployments = JSON.parse(raw);

  const usdcAddress = deployments.MockUSDC;
  const senderAddress = deployments.BridgeSender;
  const receiverAddress = deployments.BridgeReceiver;

  const [user, relayer] = await hre.ethers.getSigners();

  const usdc = await hre.ethers.getContractAt("MockUSDC", usdcAddress);
  const sender = await hre.ethers.getContractAt("BridgeSender", senderAddress);
  const receiver = await hre.ethers.getContractAt(
    "BridgeReceiver",
    receiverAddress,
  );

  const amount = 1_000_000n; // 1 USDC

  console.log("User:", user.address);

  /*
  Mint tokens to user
  */

  await usdc.mint(user.address, 10_000_000n);

  /*
  Approve BridgeSender
  */

  console.log("Approving sender...");

  await usdc.connect(user).approve(senderAddress, amount);

  /*
  Bridge from Chain A
  */

  console.log("Initiating bridge...");

  const tx = await sender.connect(user).bridge(amount);
  await tx.wait();

  const nonce = await sender.nonce();

  console.log("Bridge nonce:", nonce.toString());

  /*
  Give liquidity to receiver
  */

  await usdc.mint(receiverAddress, 10_000_000n);

  /*
  Complete bridge on Chain B
  */

  console.log("Completing bridge...");

  await receiver.connect(relayer).completeBridge(user.address, amount, nonce);

  const balance = await usdc.balanceOf(user.address);

  console.log("User balance after bridge:", balance.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
