// This script allows investors to claim their ROI
const { ethers } = require("ethers");
require('dotenv').config();

// You would replace this with the actual contract address after deployment
const ROI_DISTRIBUTOR_ADDRESS = process.env.ROI_DISTRIBUTOR_ADDRESS;

async function main() {
  // Initialize provider
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  
  // Initialize signer (this would be the investor in production)
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Claiming ROI with account:", wallet.address);
  console.log("Account balance before claiming:", ethers.utils.formatEther(await wallet.getBalance()), "ETH");
  
  // Get the ROI distributor contract instance
  const distributorABI = require("../artifacts/contracts/ROIDistributor.sol/ROIDistributor.json").abi;
  const distributorContract = new ethers.Contract(ROI_DISTRIBUTOR_ADDRESS, distributorABI, wallet);
  
  // Check if investor has any pending rewards
  const hasPendingRewards = await distributorContract.hasPendingRewards(wallet.address);
  
  if (!hasPendingRewards) {
    console.log("No pending rewards to claim.");
    return;
  }
  
  // Calculate pending rewards
  const pendingRewards = await distributorContract.calculatePendingRewards(wallet.address);
  console.log("Pending rewards:", ethers.utils.formatEther(pendingRewards), "ETH");
  
  try {
    // Claim rewards
    console.log("Claiming rewards...");
    const tx = await distributorContract.claimRewards();
    
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    await tx.wait();
    
    console.log("Rewards claimed successfully!");
    console.log("Account balance after claiming:", ethers.utils.formatEther(await wallet.getBalance()), "ETH");
  } catch (error) {
    console.error("Error claiming rewards:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });