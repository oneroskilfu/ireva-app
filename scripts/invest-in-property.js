// Script to invest in a property using the escrow contract
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
    console.log("Starting property investment process...");
    
    // Get factory address from command line or user input
    let factoryAddress = process.argv[2];
    if (!factoryAddress || !ethers.utils.isAddress(factoryAddress)) {
      console.log("No valid factory address provided in command line arguments.");
      factoryAddress = await askQuestion("Please enter the PropertyContractFactory address");
      
      if (!ethers.utils.isAddress(factoryAddress)) {
        throw new Error("Invalid factory address");
      }
    }
    
    // Get investment details from the user
    const propertyId = await askQuestion("Enter property ID (number)");
    const investorPrivateKey = await askQuestion("Enter investor private key (Warning: Handle with care!)");
    const amount = await askQuestion("Enter investment amount in ETH");
    
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
    
    if (investorBalance.lt(parseEther(amount))) {
      throw new Error("Insufficient funds for investment");
    }
    
    // Create property contract factory instance
    const PropertyContractFactory = await ethers.getContractFactory("PropertyContractFactory");
    const factory = PropertyContractFactory.attach(factoryAddress);
    
    // Get property contract details
    const propertyContract = await factory.getPropertyContract(propertyId);
    
    if (ethers.constants.AddressZero === propertyContract.escrowAddress) {
      throw new Error(`No escrow contract found for property ID ${propertyId}`);
    }
    
    // Create escrow contract instance with investor wallet
    const PropertyEscrow = await ethers.getContractFactory("PropertyEscrow");
    const escrow = PropertyEscrow.attach(propertyContract.escrowAddress).connect(wallet);
    
    // Get escrow details
    const targetAmount = await escrow.targetAmount();
    const totalInvested = await escrow.totalInvested();
    const remainingTime = await escrow.getRemainingTime();
    const fundingComplete = await escrow.fundingComplete();
    const fundingFailed = await escrow.fundingFailed();
    
    console.log(`\nProperty Escrow Details:`);
    console.log(`Target Amount: ${ethers.utils.formatEther(targetAmount)} ETH`);
    console.log(`Total Invested: ${ethers.utils.formatEther(totalInvested)} ETH`);
    console.log(`Remaining Amount: ${ethers.utils.formatEther(targetAmount.sub(totalInvested))} ETH`);
    console.log(`Remaining Time: ${Math.floor(remainingTime / 86400)} days`);
    console.log(`Funding Complete: ${fundingComplete}`);
    console.log(`Funding Failed: ${fundingFailed}`);
    
    if (fundingComplete) {
      throw new Error("Funding is already complete for this property");
    }
    
    if (fundingFailed) {
      throw new Error("Funding has failed for this property");
    }
    
    if (remainingTime === 0) {
      throw new Error("Investment deadline has passed");
    }
    
    console.log(`\nPreparing to invest:`);
    console.log(`Property ID: ${propertyId}`);
    console.log(`Amount: ${amount} ETH`);
    console.log(`Escrow Address: ${propertyContract.escrowAddress}`);
    
    // Confirm with user
    const confirm = await askQuestion("\nConfirm this investment? (yes/no)");
    if (confirm.toLowerCase() !== "yes") {
      console.log("Operation cancelled by user");
      return;
    }
    
    // Make investment
    console.log("\nMaking investment...");
    const tx = await escrow.invest({
      value: parseEther(amount)
    });
    
    console.log(`Transaction hash: ${tx.hash}`);
    await tx.wait();
    
    console.log("\nInvestment completed successfully!");
    
    // Get updated investment details
    const [investAmount, investTimestamp] = await escrow.getInvestment(investorAddress);
    const updatedTotalInvested = await escrow.totalInvested();
    const updatedFundingComplete = await escrow.fundingComplete();
    
    console.log(`\nInvestment Details:`);
    console.log(`Your Investment: ${ethers.utils.formatEther(investAmount)} ETH`);
    console.log(`Investment Time: ${new Date(investTimestamp * 1000).toLocaleString()}`);
    console.log(`Updated Total Invested: ${ethers.utils.formatEther(updatedTotalInvested)} ETH`);
    console.log(`Updated Funding Complete: ${updatedFundingComplete}`);
    
    // Check if funding is complete after this investment
    if (updatedFundingComplete) {
      console.log("\nCongratulations! Your investment has completed the funding target for this property.");
    }
    
    return {
      propertyId,
      investorAddress,
      amount,
      transactionHash: tx.hash,
      investmentTimestamp: new Date(investTimestamp * 1000).toISOString(),
      fundingComplete: updatedFundingComplete
    };
  } catch (error) {
    console.error("Error during property investment:", error);
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