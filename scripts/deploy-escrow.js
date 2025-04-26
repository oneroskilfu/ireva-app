// Deploy script for the iREVA Escrow smart contract
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  try {
    console.log("Starting iREVA Escrow deployment process...");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with account: ${deployer.address}`);
    
    // Display account balance
    const deployerBalance = await deployer.getBalance();
    console.log(`Account balance: ${ethers.formatEther(deployerBalance)} ETH`);
    
    // Get parameters from environment variables or use defaults
    const projectOwner = process.env.PROJECT_OWNER_ADDRESS || deployer.address;
    const stablecoinAddress = process.env.STABLECOIN_CONTRACT_ADDRESS || "0xe11A86849d99F524cAC3E7A0Ec1241828e332C62"; // Mumbai USDC
    const fundingGoal = process.env.FUNDING_GOAL || "10000";
    const campaignDuration = process.env.CAMPAIGN_DURATION || "30";
    
    console.log(`Project Owner Address: ${projectOwner}`);
    console.log(`Stablecoin Contract Address: ${stablecoinAddress}`);
    console.log(`Funding Goal: ${fundingGoal} USDC`);
    console.log(`Campaign Duration: ${campaignDuration} days`);
    
    // Deploy iREVAEscrow
    const iREVAEscrow = await ethers.getContractFactory("iREVAEscrow");
    
    // Convert funding goal to proper units (USDC has 6 decimals)
    const fundingGoalInTokenUnits = ethers.parseUnits(fundingGoal, 6);
    
    const escrowContract = await iREVAEscrow.deploy(
      projectOwner, 
      stablecoinAddress,
      fundingGoalInTokenUnits,
      campaignDuration
    );
    
    await escrowContract.waitForDeployment();
    
    const escrowAddress = await escrowContract.getAddress();
    console.log(`iREVA Escrow contract deployed to: ${escrowAddress}`);
    
    console.log("\nDeployment completed successfully!");
    console.log("\nContract address:");
    console.log(`- iREVAEscrow: ${escrowAddress}`);
    
    // Important: Store this address in your deployment environment or database
    console.log("\nIMPORTANT: Save the above contract address in your environment variables or database.");
    console.log("For example in your .env file:");
    console.log(`ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);
    
    // Return the deployed address (useful for automated scripts)
    return {
      escrowAddress
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