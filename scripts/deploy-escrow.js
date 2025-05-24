// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// USDC contract address
// Mumbai testnet address for test USDC
const USDC_ADDRESS = "0xe11A86849d99F524cAC3E7A0Ec1241828e332C62";

// Campaign parameters
const CAMPAIGN_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
const FUNDING_GOAL = ethers.parseUnits("1000000", 6); // 1,000,000 USDC (6 decimals)

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  console.log("Deploying iREVA Escrow contract...");
  console.log("Network:", hre.network.name);
  console.log("USDC Address:", USDC_ADDRESS);
  console.log("Campaign Duration:", CAMPAIGN_DURATION, "seconds");
  console.log("Funding Goal:", ethers.formatUnits(FUNDING_GOAL, 6), "USDC");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  // Deploy the contract
  const iREVAEscrow = await ethers.getContractFactory("iREVAEscrow");
  const escrow = await iREVAEscrow.deploy(
    USDC_ADDRESS,
    CAMPAIGN_DURATION,
    FUNDING_GOAL
  );

  await escrow.waitForDeployment();

  const escrowAddress = await escrow.getAddress();
  console.log("iREVA Escrow deployed to:", escrowAddress);

  // Save the contract information
  const contractInfo = {
    network: hre.network.name,
    address: escrowAddress,
    deployer: deployer.address,
    usdc: USDC_ADDRESS,
    duration: CAMPAIGN_DURATION,
    fundingGoal: ethers.formatUnits(FUNDING_GOAL, 6),
    deploymentTime: new Date().toISOString(),
    abi: JSON.parse(escrow.interface.formatJson())
  };

  // Create the deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)){
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save the contract information to a JSON file
  const deploymentPath = path.join(deploymentsDir, `${hre.network.name}-escrow.json`);
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(contractInfo, null, 2)
  );
  console.log(`Deployment information saved to ${deploymentPath}`);

  // Update the .env.escrow file with the contract address
  const envPath = path.join(__dirname, '../.env.escrow');
  let envContents = '';
  
  if (fs.existsSync(envPath)) {
    envContents = fs.readFileSync(envPath, 'utf8');
  }

  // Replace or add the ESCROW_CONTRACT_ADDRESS
  if (envContents.includes('ESCROW_CONTRACT_ADDRESS=')) {
    envContents = envContents.replace(
      /ESCROW_CONTRACT_ADDRESS=.*/,
      `ESCROW_CONTRACT_ADDRESS=${escrowAddress}`
    );
  } else {
    envContents += `\nESCROW_CONTRACT_ADDRESS=${escrowAddress}\n`;
  }

  fs.writeFileSync(envPath, envContents);
  console.log(`Updated ${envPath} with contract address`);

  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: escrowAddress,
      constructorArguments: [
        USDC_ADDRESS,
        CAMPAIGN_DURATION,
        FUNDING_GOAL
      ],
    });
    console.log("Contract verified on Etherscan!");
  } catch (error) {
    console.log("Error verifying contract:", error.message);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });