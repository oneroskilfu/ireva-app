// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title iREVAEscrow
 * @dev A smart contract for managing real estate investment escrow with milestone-based fund releases.
 * This contract facilitates property investment using stablecoins (like USDC), with a milestone-based release mechanism.
 */
contract iREVAEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event Invested(address indexed investor, uint256 amount);
    event FundsReleased(uint256 amount, string milestone);
    event RefundIssued(address indexed investor, uint256 amount);
    event MilestoneApproved(string milestone, uint256 amount);
    event CampaignFinalized(bool successful, uint256 totalRaised);
    event InvestmentRefunded(address indexed investor, uint256 amount);

    // Structs
    struct Investment {
        uint256 amount;
        bool refunded;
    }

    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        bool fundsReleased;
    }

    // State variables
    address public projectOwner;
    IERC20 public stablecoin;
    uint256 public fundingGoal;
    uint256 public campaignEndTime;
    uint256 public totalRaised;
    bool public campaignFinalized;
    bool public fundingSuccessful;
    
    // Mapping of investor address to their investment
    mapping(address => Investment) public investments;
    
    // Array of investors for tracking
    address[] public investors;
    
    // Project milestones
    Milestone[] public milestones;

    /**
     * @dev Constructor to initialize the escrow contract
     * @param _projectOwner Address of the real estate project owner
     * @param _stablecoin Address of the ERC20 stablecoin contract (e.g., USDC)
     * @param _fundingGoal The target funding amount in stablecoin units
     * @param _durationInDays The campaign duration in days
     */
    constructor(
        address _projectOwner, 
        address _stablecoin, 
        uint256 _fundingGoal, 
        uint256 _durationInDays
    ) Ownable(msg.sender) {
        require(_projectOwner != address(0), "Project owner cannot be zero address");
        require(_stablecoin != address(0), "Stablecoin address cannot be zero address");
        require(_fundingGoal > 0, "Funding goal must be greater than zero");
        
        projectOwner = _projectOwner;
        stablecoin = IERC20(_stablecoin);
        fundingGoal = _fundingGoal;
        campaignEndTime = block.timestamp + (_durationInDays * 1 days);
        
        // Initialize with standard milestones
        _setupDefaultMilestones();
    }

    /**
     * @dev Setup default milestones for the real estate project
     * This can be customized based on the specific project needs
     */
    function _setupDefaultMilestones() private {
        // Calculate milestone amounts based on funding goal
        uint256 milestone1Amount = (fundingGoal * 20) / 100; // 20% at project start
        uint256 milestone2Amount = (fundingGoal * 30) / 100; // 30% at foundation completion
        uint256 milestone3Amount = (fundingGoal * 30) / 100; // 30% at structure completion
        uint256 milestone4Amount = (fundingGoal * 20) / 100; // 20% at project completion

        milestones.push(Milestone("Project Initiation", milestone1Amount, false, false));
        milestones.push(Milestone("Foundation Completion", milestone2Amount, false, false));
        milestones.push(Milestone("Structure Completion", milestone3Amount, false, false));
        milestones.push(Milestone("Project Completion", milestone4Amount, false, false));
    }

    /**
     * @dev Allow an investor to invest in the project using stablecoin
     * @param amount The amount of stablecoin to invest
     */
    function invest(uint256 amount) external nonReentrant {
        require(block.timestamp < campaignEndTime, "Investment period has ended");
        require(!campaignFinalized, "Campaign has been finalized");
        require(amount > 0, "Investment amount must be greater than zero");
        
        // Transfer tokens from investor to this contract
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update investor record
        if (investments[msg.sender].amount == 0) {
            investors.push(msg.sender);
        }
        
        investments[msg.sender].amount += amount;
        totalRaised += amount;
        
        emit Invested(msg.sender, amount);
    }

    /**
     * @dev Finalize the campaign and determine if it was successful
     * Can only be called by the contract owner or project owner
     */
    function finalizeCampaign() external {
        require(msg.sender == owner() || msg.sender == projectOwner, "Not authorized");
        require(!campaignFinalized, "Campaign already finalized");
        require(block.timestamp >= campaignEndTime || totalRaised >= fundingGoal, "Campaign still active");
        
        campaignFinalized = true;
        fundingSuccessful = totalRaised >= fundingGoal;
        
        emit CampaignFinalized(fundingSuccessful, totalRaised);
    }

    /**
     * @dev Complete a milestone and approve fund release
     * @param milestoneIndex Index of the milestone to complete
     * Can only be called by the contract owner (iREVA platform)
     */
    function approveMilestone(uint256 milestoneIndex) external onlyOwner {
        require(fundingSuccessful, "Funding was not successful");
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(!milestones[milestoneIndex].completed, "Milestone already completed");
        
        // If there's a previous milestone, ensure it's completed
        if (milestoneIndex > 0) {
            require(milestones[milestoneIndex - 1].completed, "Previous milestone not completed");
        }
        
        milestones[milestoneIndex].completed = true;
        
        emit MilestoneApproved(milestones[milestoneIndex].description, milestones[milestoneIndex].amount);
    }

    /**
     * @dev Release funds for a completed milestone to the project owner
     * @param milestoneIndex Index of the milestone to release funds for
     * Can only be called by the contract owner (iREVA platform)
     */
    function releaseMilestoneFunds(uint256 milestoneIndex) external onlyOwner nonReentrant {
        require(fundingSuccessful, "Funding was not successful");
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(milestones[milestoneIndex].completed, "Milestone not completed");
        require(!milestones[milestoneIndex].fundsReleased, "Funds already released");
        
        milestones[milestoneIndex].fundsReleased = true;
        uint256 amount = milestones[milestoneIndex].amount;
        
        stablecoin.safeTransfer(projectOwner, amount);
        
        emit FundsReleased(amount, milestones[milestoneIndex].description);
    }

    /**
     * @dev Allow investors to claim refunds if the campaign failed
     * Can only be called after campaign is finalized and only if it wasn't successful
     */
    function claimRefund() external nonReentrant {
        require(campaignFinalized, "Campaign not finalized yet");
        require(!fundingSuccessful, "Funding was successful, no refunds available");
        require(investments[msg.sender].amount > 0, "No investment found");
        require(!investments[msg.sender].refunded, "Refund already claimed");
        
        uint256 refundAmount = investments[msg.sender].amount;
        investments[msg.sender].refunded = true;
        
        stablecoin.safeTransfer(msg.sender, refundAmount);
        
        emit InvestmentRefunded(msg.sender, refundAmount);
    }

    /**
     * @dev Emergency function to issue refunds in case of project cancellation
     * Can only be called by the contract owner (iREVA platform)
     */
    function emergencyRefundAll() external onlyOwner nonReentrant {
        require(!fundingSuccessful || !campaignFinalized, "Cannot refund after successful campaign");
        
        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 amount = investments[investor].amount;
            
            if (amount > 0 && !investments[investor].refunded) {
                investments[investor].refunded = true;
                stablecoin.safeTransfer(investor, amount);
                emit RefundIssued(investor, amount);
            }
        }
    }

    /**
     * @dev Get the total number of investors
     * @return The count of unique investors
     */
    function getInvestorCount() external view returns (uint256) {
        return investors.length;
    }

    /**
     * @dev Get the details of a specific investor
     * @param investorAddress The address of the investor
     * @return amount The amount invested
     * @return refunded Whether the investment has been refunded
     */
    function getInvestorDetails(address investorAddress) external view returns (uint256 amount, bool refunded) {
        Investment memory investment = investments[investorAddress];
        return (investment.amount, investment.refunded);
    }

    /**
     * @dev Get the number of milestones
     * @return The count of milestones
     */
    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    /**
     * @dev Get the current campaign status
     * @return endTime The timestamp when the campaign ends
     * @return raised The total amount raised
     * @return goal The funding goal
     * @return isFinalized Whether the campaign is finalized
     * @return isSuccessful Whether the campaign was successful
     */
    function getCampaignStatus() external view returns (
        uint256 endTime,
        uint256 raised,
        uint256 goal,
        bool isFinalized,
        bool isSuccessful
    ) {
        return (
            campaignEndTime,
            totalRaised,
            fundingGoal,
            campaignFinalized,
            fundingSuccessful
        );
    }

    /**
     * @dev Calculate the remaining time in the campaign
     * @return The remaining time in seconds, or 0 if the campaign has ended
     */
    function remainingTime() external view returns (uint256) {
        if (block.timestamp >= campaignEndTime) {
            return 0;
        }
        return campaignEndTime - block.timestamp;
    }

    /**
     * @dev Check if a milestone has been completed
     * @param milestoneIndex The index of the milestone to check
     * @return isCompleted Whether the milestone is completed
     * @return isFundsReleased Whether funds for this milestone have been released
     */
    function checkMilestoneStatus(uint256 milestoneIndex) external view returns (bool isCompleted, bool isFundsReleased) {
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        Milestone memory milestone = milestones[milestoneIndex];
        return (milestone.completed, milestone.fundsReleased);
    }

    /**
     * @dev Allow contract owner to withdraw any tokens accidentally sent to this contract
     * @param tokenAddress The address of the token to withdraw
     * @param amount The amount to withdraw
     */
    function emergencyTokenWithdraw(address tokenAddress, uint256 amount) external onlyOwner nonReentrant {
        require(tokenAddress != address(stablecoin) || !fundingSuccessful, "Cannot withdraw campaign tokens");
        IERC20(tokenAddress).safeTransfer(owner(), amount);
    }
}