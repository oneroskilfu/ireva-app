// This script distributes ROI to token holders
const { ethers } = require("ethers");
require('dotenv').config();

// You would replace these with the actual contract addresses after deployment
const ROI_DISTRIBUTOR_ADDRESS = process.env.ROI_DISTRIBUTOR_ADDRESS;

async function main() {
  // Initialize provider
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  
  // Initialize signer (this would be the developer/admin in production)
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Distributing ROI with account:", wallet.address);
  console.log("Account balance:", ethers.utils.formatEther(await wallet.getBalance()), "ETH");
  
  // Get the ROI distributor contract instance
  const distributorABI = require("../artifacts/contracts/ROIDistributor.sol/ROIDistributor.json").abi;
  const distributorContract = new ethers.Contract(ROI_DISTRIBUTOR_ADDRESS, distributorABI, wallet);
  
  // Distribution amount and description
  const distributionAmount = ethers.utils.parseEther("1.0"); // 1 ETH
  const description = "October 2023 Rental Income Distribution";
  
  // Distribute ROI
  console.log(`Distributing ${ethers.utils.formatEther(distributionAmount)} ETH to token holders...`);
  console.log(`Description: ${description}`);
  
  try {
    const tx = await distributorContract.distributeROI(
      description,
      { value: distributionAmount }
    );
    
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    await tx.wait();
    
    console.log("ROI distribution successful!");
    
    // Get distribution details
    const distributionCount = await distributorContract.getDistributionCount();
    console.log("Total distributions:", distributionCount.toString());
    
    const totalDistributed = await distributorContract.getTotalDistributed();
    console.log("Total distributed:", ethers.utils.formatEther(totalDistributed), "ETH");
  } catch (error) {
    console.error("Error distributing ROI:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });