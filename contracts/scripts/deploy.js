require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs").promises;

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);
  console.log("Network:", hre.network.name);

  /*
  Deploy MockUSDC
  */

  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");

  const mock = await MockUSDC.deploy();
  await mock.waitForDeployment();

  const mockAddress = await mock.getAddress();

  console.log("MockUSDC deployed:", mockAddress);

  /*
  Deploy YieldVault
  */

  const YieldVault = await hre.ethers.getContractFactory("YieldVault");

  const vault = await YieldVault.deploy(mockAddress);
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();

  console.log("YieldVault deployed:", vaultAddress);

  /*
  Deploy BridgeSender
  */

  const BridgeSender = await hre.ethers.getContractFactory("BridgeSender");

  const sender = await BridgeSender.deploy(mockAddress);
  await sender.waitForDeployment();

  const senderAddress = await sender.getAddress();

  console.log("BridgeSender deployed:", senderAddress);

  /*
  Deploy BridgeReceiver
  */

  const BridgeReceiver = await hre.ethers.getContractFactory("BridgeReceiver");

  const receiver = await BridgeReceiver.deploy(mockAddress);
  await receiver.waitForDeployment();

  const receiverAddress = await receiver.getAddress();

  console.log("BridgeReceiver deployed:", receiverAddress);

  /*
  Save deployment
  */

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

  console.log("deployments.json saved");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
