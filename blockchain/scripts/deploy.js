const hre = require("hardhat");

async function main() {
  console.log("Deploying VeriTrust AI EvidenceRegistry Smart Contract...");

  const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
  const registry = await EvidenceRegistry.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log(`EvidenceRegistry contract deployed successfully to: ${address}`);
  console.log("Update CONTRACT_ADDRESS in your .env file with this address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

