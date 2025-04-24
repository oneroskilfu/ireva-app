// Deploy script for the Property Contract Factory and related contracts
const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment process...");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with account: ${deployer.address}`);
    
    // Display account balance
    const deployerBalance = await deployer.getBalance();
    console.log(`Account balance: ${ethers.formatEther(deployerBalance)} ETH`);
    
    // Deploy PropertyContractFactory
    const PropertyContractFactory = await ethers.getContractFactory("PropertyContractFactory");
    const factoryContract = await PropertyContractFactory.deploy();
    await factoryContract.waitForDeployment();
    
    const factoryAddress = await factoryContract.getAddress();
    console.log(`PropertyContractFactory deployed to: ${factoryAddress}`);
    
    console.log("\nDeployment completed successfully!");
    console.log("\nContract addresses:");
    console.log(`- PropertyContractFactory: ${factoryAddress}`);
    
    // Important: Store these addresses in your deployment environment or database
    console.log("\nIMPORTANT: Save the above contract addresses in your environment variables or database.");
    console.log("For example in your .env file:");
    console.log(`FACTORY_CONTRACT_ADDRESS=${factoryAddress}`);
    
    // Return the deployed addresses (useful for automated scripts)
    return {
      factoryAddress
    };
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });