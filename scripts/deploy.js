// This script deploys the PropertyContractFactory contract
const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
  // Initialize provider
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  
  // Initialize signer (account that will deploy the contract)
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Deploying contracts with the account:", wallet.address);
  console.log("Account balance:", (await wallet.getBalance()).toString());
  
  // Get the contract factories
  const PropertyContractFactory = await ethers.getContractFactory("PropertyContractFactory", wallet);
  
  // Deploy PropertyContractFactory
  console.log("Deploying PropertyContractFactory...");
  const factoryContract = await PropertyContractFactory.deploy();
  await factoryContract.deployed();
  console.log("PropertyContractFactory deployed to:", factoryContract.address);
  
  // Save the contract addresses for future use
  console.log("\nSave these contract addresses:");
  console.log("PropertyContractFactory:", factoryContract.address);
  
  return {
    factoryContract
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });