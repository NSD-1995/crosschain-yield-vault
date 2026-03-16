require("dotenv").config();
const path = require("path");
const fs = require("fs").promises;
const hre = require("hardhat");
const { execSync } = require("child_process");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);
  console.log("Network:", hre.network.name);

  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mock = await MockUSDC.deploy();
  await mock.waitForDeployment();
  const mockAddress = await mock.getAddress();
  console.log("MockUSDC deployed:", mockAddress);

  const YieldVault = await hre.ethers.getContractFactory("YieldVault");
  const vault = await hre.upgrades.deployProxy(
    YieldVault,
    [mockAddress, 1_000_000n * 10n ** 6n, 1_000_000n],
    {
      initializer: "initialize",
      kind: "uups",
    },
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("YieldVault proxy deployed:", vaultAddress);

  const BridgeSender = await hre.ethers.getContractFactory("BridgeSender");
  const sender = await BridgeSender.deploy(mockAddress);
  await sender.waitForDeployment();
  const senderAddress = await sender.getAddress();
  console.log("BridgeSender deployed:", senderAddress);

  const BridgeReceiver = await hre.ethers.getContractFactory("BridgeReceiver");
  const receiver = await BridgeReceiver.deploy(mockAddress);
  await receiver.waitForDeployment();
  const receiverAddress = await receiver.getAddress();
  console.log("BridgeReceiver deployed:", receiverAddress);

  const deployments = {
    network: hre.network.name,
    deployer: deployer.address,
    MockUSDC: mockAddress,
    YieldVault: vaultAddress,
    BridgeSender: senderAddress,
    BridgeReceiver: receiverAddress,
  };

  const rootPath = path.resolve(__dirname, "../../deployments.json");
  await fs.writeFile(rootPath, JSON.stringify(deployments, null, 2), "utf8");

  console.log("Saved deployments.json at:", rootPath);

  execSync("node scripts/sync-env.js", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  console.log("Synced backend and frontend env files");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
