// Script to distribute ROI to property investors
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
    console.log("Starting ROI distribution process...");
    
    // Get factory address from command line or user input
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
    
    // Get distribution details from the user
    const propertyId = await askQuestion("Enter property ID (number)");
    const amount = await askQuestion("Enter ROI distribution amount in ETH");
    const description = await askQuestion("Enter distribution description (e.g., 'Q2 2025 Dividend')");
    
    // Create property contract factory instance
    const PropertyContractFactory = await ethers.getContractFactory("PropertyContractFactory");
    const factory = PropertyContractFactory.attach(factoryAddress);
    
    // Get property contract details
    const propertyContract = await factory.getPropertyContract(propertyId);
    
    if (ethers.constants.AddressZero === propertyContract.roiDistributorAddress) {
      throw new Error(`No ROI distributor contract found for property ID ${propertyId}`);
    }
    
    // Create ROI distributor contract instance
    const ROIDistributor = await ethers.getContractFactory("ROIDistributor");
    const roiDistributor = ROIDistributor.attach(propertyContract.roiDistributorAddress);
    
    console.log(`\nPreparing to distribute ROI with the following details:`);
    console.log(`Property ID: ${propertyId}`);
    console.log(`Amount: ${amount} ETH`);
    console.log(`Description: ${description}`);
    console.log(`ROI Distributor Address: ${propertyContract.roiDistributorAddress}`);
    
    // Confirm with user
    const confirm = await askQuestion("\nConfirm these details? (yes/no)");
    if (confirm.toLowerCase() !== "yes") {
      console.log("Operation cancelled by user");
      return;
    }
    
    // Distribute ROI
    console.log("\nDistributing ROI...");
    const tx = await roiDistributor.distributeROI(description, {
      value: parseEther(amount)
    });
    
    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    
    console.log("\nROI distribution completed successfully!");
    
    // Get total distributed
    const totalDistributed = await roiDistributor.getTotalDistributed();
    const distributionCount = await roiDistributor.getDistributionCount();
    
    console.log(`\nDistribution Statistics:`);
    console.log(`Total Distributed: ${ethers.utils.formatEther(totalDistributed)} ETH`);
    console.log(`Distribution Count: ${distributionCount}`);
    
    return {
      propertyId,
      amount,
      description,
      transactionHash: tx.hash,
      totalDistributed: ethers.utils.formatEther(totalDistributed),
      distributionCount: distributionCount.toString()
    };
  } catch (error) {
    console.error("Error during ROI distribution:", error);
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