const hre = require("hardhat");
const fs = require("fs").promises;
const { ethers } = hre;

async function main() {
  const raw = await fs.readFile("./deployments.json", "utf8");
  const deployments = JSON.parse(raw);

  const usdcAddress = deployments.MockUSDC;
  const senderAddress = deployments.BridgeSender;
  const receiverAddress = deployments.BridgeReceiver;

  const [admin, user, relayer] = await ethers.getSigners();

  const usdc = await ethers.getContractAt("MockUSDC", usdcAddress);
  const sender = await ethers.getContractAt("BridgeSender", senderAddress);
  const receiver = await ethers.getContractAt(
    "BridgeReceiver",
    receiverAddress,
  );

  const amount = 1_000_000n; // 1 USDC

  console.log("Admin:", admin.address);
  console.log("User:", user.address);
  console.log("Relayer:", relayer.address);

  // Give user source-chain tokens
  await usdc.mint(user.address, 10_000_000n);

  // Fund receiver liquidity
  await usdc.mint(receiverAddress, 10_000_000n);

  // Grant relayer role
  const RELAYER_ROLE = await receiver.RELAYER_ROLE();
  await receiver.grantRole(RELAYER_ROLE, relayer.address);

  // Approve and bridge on sender
  await usdc.connect(user).approve(senderAddress, amount);
  const bridgeTx = await sender.connect(user).bridge(amount);
  await bridgeTx.wait();

  const nonce = await sender.nonce();
  const expiry = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour

  console.log("Bridge nonce:", nonce.toString());
  console.log("Expiry:", expiry.toString());

  // Build hash exactly like contract
  const messageHash = await receiver.getMessageHash(
    user.address,
    amount,
    nonce,
    expiry,
  );

  // Admin is allowed signer by default in your contract
  const signature = await admin.signMessage(ethers.getBytes(messageHash));

  console.log("Completing bridge...");
  const completeTx = await receiver
    .connect(relayer)
    .completeBridge(user.address, amount, nonce, expiry, signature);
  await completeTx.wait();

  console.log("Bridge complete");
  console.log(
    "User balance after bridge:",
    (await usdc.balanceOf(user.address)).toString(),
  );
  console.log("Nonce processed:", await receiver.processedNonces(nonce));
}

main().catch((error) => {
  console.error("Bridge script failed:", error);
  process.exitCode = 1;
});
