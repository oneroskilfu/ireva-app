// This script allows investors to invest in a property
const { ethers } = require("ethers");
require('dotenv').config();

// You would replace this with the actual contract address after deployment
const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;

async function main() {
  // Initialize provider
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  
  // Initialize signer (this would be the investor in production)
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Investing with account:", wallet.address);
  console.log("Account balance before investment:", ethers.utils.formatEther(await wallet.getBalance()), "ETH");
  
  // Get the escrow contract instance
  const escrowABI = require("../artifacts/contracts/PropertyEscrow.sol/PropertyEscrow.json").abi;
  const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, escrowABI, wallet);
  
  // Check if investment period is over
  const isInvestmentPeriodOver = await escrowContract.isInvestmentPeriodOver();
  
  if (isInvestmentPeriodOver) {
    console.log("Investment period has ended. Cannot invest anymore.");
    return;
  }
  
  // Check if funding is complete
  const fundingComplete = await escrowContract.fundingComplete();
  
  if (fundingComplete) {
    console.log("Funding target already reached. Cannot invest anymore.");
    return;
  }
  
  // Get remaining time
  const remainingTime = await escrowContract.getRemainingTime();
  console.log("Remaining time for investment:", remainingTime.toString(), "seconds");
  
  // Get target amount and current total invested
  const targetAmount = await escrowContract.targetAmount();
  const totalInvested = await escrowContract.totalInvested();
  console.log("Target amount:", ethers.utils.formatEther(targetAmount), "ETH");
  console.log("Total invested so far:", ethers.utils.formatEther(totalInvested), "ETH");
  console.log("Remaining to reach target:", ethers.utils.formatEther(targetAmount.sub(totalInvested)), "ETH");
  
  // Investment amount
  const investmentAmount = ethers.utils.parseEther("0.1"); // 0.1 ETH
  
  try {
    // Make investment
    console.log(`Investing ${ethers.utils.formatEther(investmentAmount)} ETH...`);
    const tx = await escrowContract.invest({
      value: investmentAmount
    });
    
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    await tx.wait();
    
    console.log("Investment successful!");
    console.log("Account balance after investment:", ethers.utils.formatEther(await wallet.getBalance()), "ETH");
    
    // Get updated total invested
    const updatedTotalInvested = await escrowContract.totalInvested();
    console.log("Updated total invested:", ethers.utils.formatEther(updatedTotalInvested), "ETH");
    
    // Check if funding is now complete
    const updatedFundingComplete = await escrowContract.fundingComplete();
    if (updatedFundingComplete) {
      console.log("Funding target has been reached!");
    }
  } catch (error) {
    console.error("Error making investment:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });