// This script creates escrow and token contracts for a property using the factory
const { ethers } = require("ethers");
require('dotenv').config();

// You would replace this with the actual factory contract address after deployment
const FACTORY_CONTRACT_ADDRESS = process.env.FACTORY_CONTRACT_ADDRESS;

async function main() {
  // Initialize provider
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  
  // Initialize signer
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Using account:", wallet.address);
  console.log("Account balance:", (await wallet.getBalance()).toString());
  
  // Get the factory contract instance
  const factoryABI = require("../artifacts/contracts/PropertyContractFactory.sol/PropertyContractFactory.json").abi;
  const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryABI, wallet);
  
  // Example property details
  const propertyId = 1; // This should match your propertyId in the database
  const developer = wallet.address; // In production, this would be the developer's address
  const targetAmount = ethers.utils.parseEther("100"); // 100 ETH funding target
  const investmentPeriodInDays = 60; // 60 day investment period
  
  // Create escrow contract
  console.log(`Creating escrow contract for property ${propertyId}...`);
  const escrowTx = await factoryContract.createEscrowContract(
    propertyId,
    developer,
    targetAmount,
    investmentPeriodInDays
  );
  
  await escrowTx.wait();
  console.log("Escrow contract creation transaction:", escrowTx.hash);
  
  // Get the created escrow contract address
  const propertyContract = await factoryContract.getPropertyContract(propertyId);
  console.log("Escrow contract created at:", propertyContract.escrowAddress);
  
  // Token details
  const tokenName = "iREVA Property Token";
  const tokenSymbol = "IREV";
  const tokenDecimals = 18;
  const initialSupply = 1000000; // 1 million tokens
  const pricePerToken = ethers.utils.parseEther("0.0001"); // 0.0001 ETH per token
  
  // Create token contract
  console.log(`Creating token contract for property ${propertyId}...`);
  const tokenTx = await factoryContract.createTokenContract(
    propertyId,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    initialSupply,
    developer,
    pricePerToken
  );
  
  await tokenTx.wait();
  console.log("Token contract creation transaction:", tokenTx.hash);
  
  // Get the updated property contract details with both contracts
  const updatedPropertyContract = await factoryContract.getPropertyContract(propertyId);
  console.log("\nProperty contracts created successfully:");
  console.log("Property ID:", updatedPropertyContract.propertyId.toString());
  console.log("Escrow Contract:", updatedPropertyContract.escrowAddress);
  console.log("Token Contract:", updatedPropertyContract.tokenAddress);
  console.log("Created At:", new Date(updatedPropertyContract.createdAt.toNumber() * 1000).toISOString());
  console.log("Is Active:", updatedPropertyContract.isActive);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });