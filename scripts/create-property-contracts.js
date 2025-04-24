// Script to create contracts for a property
const { ethers } = require("hardhat");
const { parseEther } = ethers.utils;
const readline = require("readline");

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get user input
function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(`${query}: `, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log("Starting property contract creation process...");
    
    // Get the factory contract address from command line args or ask user
    let factoryAddress = process.argv[2];
    if (!factoryAddress || !ethers.utils.isAddress(factoryAddress)) {
      console.log("No valid factory address provided in command line arguments.");
      factoryAddress = await askQuestion("Please enter the PropertyContractFactory address");
      
      if (!ethers.utils.isAddress(factoryAddress)) {
        throw new Error("Invalid factory address");
      }
    }
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`\nUsing account: ${deployer.address}`);
    
    // Display account balance
    const deployerBalance = await deployer.getBalance();
    console.log(`Account balance: ${ethers.utils.formatEther(deployerBalance)} ETH`);
    
    // Get property information from the user
    const propertyId = await askQuestion("Enter property ID (number)");
    const developerAddress = await askQuestion("Enter developer address");
    const tokenName = await askQuestion("Enter token name (e.g., 'Westfield Retail Center')");
    const targetAmount = await askQuestion("Enter target funding amount in ETH");
    const investmentPeriodInDays = await askQuestion("Enter investment period in days");
    
    // Create property contract factory instance
    const PropertyContractFactory = await ethers.getContractFactory("PropertyContractFactory");
    const factory = PropertyContractFactory.attach(factoryAddress);
    
    // Create token symbol from property name
    const tokenSymbol = tokenName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
    
    console.log(`\nCreating property contracts with the following details:`);
    console.log(`Property ID: ${propertyId}`);
    console.log(`Developer: ${developerAddress}`);
    console.log(`Token Name: ${tokenName}`);
    console.log(`Token Symbol: ${tokenSymbol}`);
    console.log(`Target Amount: ${targetAmount} ETH`);
    console.log(`Investment Period: ${investmentPeriodInDays} days`);
    
    // Confirm with user
    const confirm = await askQuestion("\nConfirm these details? (yes/no)");
    if (confirm.toLowerCase() !== "yes") {
      console.log("Operation cancelled by user");
      return;
    }
    
    // Step 1: Create escrow contract
    console.log("\nStep 1: Creating escrow contract...");
    const escrowTx = await factory.createEscrowContract(
      propertyId,
      developerAddress,
      parseEther(targetAmount),
      investmentPeriodInDays
    );
    
    console.log(`Transaction hash: ${escrowTx.hash}`);
    await escrowTx.wait();
    console.log("Escrow contract created successfully");
    
    // Get escrow contract address
    const propertyContractAfterEscrow = await factory.getPropertyContract(propertyId);
    console.log(`Escrow contract address: ${propertyContractAfterEscrow.escrowAddress}`);
    
    // Step 2: Create token contract
    console.log("\nStep 2: Creating token contract...");
    const tokenTx = await factory.createTokenContract(
      propertyId,
      tokenName,
      tokenSymbol,
      18, // decimals
      1000000, // initial supply (1 million tokens)
      developerAddress,
      parseEther('0.0001') // price per token (0.0001 ETH)
    );
    
    console.log(`Transaction hash: ${tokenTx.hash}`);
    await tokenTx.wait();
    console.log("Token contract created successfully");
    
    // Get token contract address
    const propertyContractAfterToken = await factory.getPropertyContract(propertyId);
    console.log(`Token contract address: ${propertyContractAfterToken.tokenAddress}`);
    
    // Step 3: Create ROI distributor contract
    console.log("\nStep 3: Creating ROI distributor contract...");
    const roiDistributorTx = await factory.createROIDistributorContract(
      propertyId,
      developerAddress
    );
    
    console.log(`Transaction hash: ${roiDistributorTx.hash}`);
    await roiDistributorTx.wait();
    console.log("ROI distributor contract created successfully");
    
    // Get full property contract details
    const propertyContract = await factory.getPropertyContract(propertyId);
    
    console.log("\nProperty contracts created successfully!");
    console.log("\nContract addresses:");
    console.log(`- Escrow: ${propertyContract.escrowAddress}`);
    console.log(`- Token: ${propertyContract.tokenAddress}`);
    console.log(`- ROI Distributor: ${propertyContract.roiDistributorAddress}`);
    
    // Important: Store these addresses in your database
    console.log("\nIMPORTANT: Store these addresses in your database for property ID", propertyId);
    
    return {
      propertyId,
      escrowAddress: propertyContract.escrowAddress,
      tokenAddress: propertyContract.tokenAddress,
      roiDistributorAddress: propertyContract.roiDistributorAddress
    };
  } catch (error) {
    console.error("Error during property contract creation:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });