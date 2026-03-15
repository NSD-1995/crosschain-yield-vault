require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs").promises;

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

  await fs.writeFile(
    "./deployments.json",
    JSON.stringify(deployments, null, 2),
  );

  console.log("Saved deployments.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
