// Script to claim ROI rewards from property investments
const { ethers } = require("hardhat");
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
    console.log("Starting ROI claiming process...");
    
    // Get factory address from command line or user input
    let factoryAddress = process.argv[2];
    if (!factoryAddress || !ethers.utils.isAddress(factoryAddress)) {
      console.log("No valid factory address provided in command line arguments.");
      factoryAddress = await askQuestion("Please enter the PropertyContractFactory address");
      
      if (!ethers.utils.isAddress(factoryAddress)) {
        throw new Error("Invalid factory address");
      }
    }
    
    // Get ROI claiming details from the user
    const propertyId = await askQuestion("Enter property ID (number)");
    const investorPrivateKey = await askQuestion("Enter investor private key (Warning: Handle with care!)");
    
    if (!investorPrivateKey || investorPrivateKey.length < 64) {
      throw new Error("Invalid private key");
    }
    
    // Create wallet from private key
    const provider = ethers.provider;
    const wallet = new ethers.Wallet(investorPrivateKey, provider);
    const investorAddress = wallet.address;
    
    console.log(`\nInvestor address: ${investorAddress}`);
    
    // Display account balance
    const investorBalance = await wallet.getBalance();
    console.log(`Investor balance: ${ethers.utils.formatEther(investorBalance)} ETH`);
    
    // Create property contract factory instance
    const PropertyContractFactory = await ethers.getContractFactory("PropertyContractFactory");
    const factory = PropertyContractFactory.attach(factoryAddress);
    
    // Get property contract details
    const propertyContract = await factory.getPropertyContract(propertyId);
    
    if (ethers.constants.AddressZero === propertyContract.roiDistributorAddress) {
      throw new Error(`No ROI distributor contract found for property ID ${propertyId}`);
    }
    
    // Create ROI distributor contract instance with investor wallet
    const ROIDistributor = await ethers.getContractFactory("ROIDistributor");
    const roiDistributor = ROIDistributor.attach(propertyContract.roiDistributorAddress).connect(wallet);
    
    // Check if investor has any pending rewards
    const pendingRewards = await roiDistributor.calculatePendingRewards(investorAddress);
    const hasPendingRewards = await roiDistributor.hasPendingRewards(investorAddress);
    
    console.log(`\nPending rewards: ${ethers.utils.formatEther(pendingRewards)} ETH`);
    
    if (!hasPendingRewards) {
      console.log("You have no pending rewards to claim.");
      return;
    }
    
    // Confirm with user
    const confirm = await askQuestion("\nClaim these rewards? (yes/no)");
    if (confirm.toLowerCase() !== "yes") {
      console.log("Operation cancelled by user");
      return;
    }
    
    // Claim rewards
    console.log("\nClaiming rewards...");
    const tx = await roiDistributor.claimRewards();
    
    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    
    console.log("\nRewards claimed successfully!");
    
    // Get updated balances
    const updatedBalance = await wallet.getBalance();
    console.log(`\nUpdated investor balance: ${ethers.utils.formatEther(updatedBalance)} ETH`);
    console.log(`Balance increase: ${ethers.utils.formatEther(updatedBalance.sub(investorBalance))} ETH`);
    
    return {
      propertyId,
      investorAddress,
      claimedAmount: ethers.utils.formatEther(pendingRewards),
      transactionHash: tx.hash
    };
  } catch (error) {
    console.error("Error during ROI claiming:", error);
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