// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title iREVAEscrow
 * @dev Smart contract to handle crowdfunding for real estate investments
 */
contract iREVAEscrow is ReentrancyGuard, Ownable {
    // USDC token contract
    IERC20 public immutable usdc;

    // Campaign parameters
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public immutable fundingGoal;
    
    // Campaign state
    uint256 public totalRaised;
    bool public isFinalized;
    bool public isSuccessful;
    
    // Milestone tracking
    struct Milestone {
        uint256 amount;
        uint256 releaseTime;
        bool isApproved;
        bool isReleased;
    }
    Milestone[] public milestones;
    
    // Investment tracking
    mapping(address => uint256) public contributions;
    mapping(address => bool) public refunded;
    
    // Events
    event Contribution(address indexed investor, uint256 amount);
    event Refund(address indexed investor, uint256 amount);
    event CampaignFinalized(bool successful, uint256 totalRaised);
    event MilestoneApproved(uint256 indexed milestoneIndex);
    event MilestoneReleased(uint256 indexed milestoneIndex, uint256 amount);

    /**
     * @dev Constructor to initialize the escrow contract
     * @param _usdcAddress Address of the USDC token contract
     * @param _duration Duration of the campaign in seconds
     * @param _fundingGoal Target amount to raise in USDC
     */
    constructor(
        address _usdcAddress,
        uint256 _duration,
        uint256 _fundingGoal
    ) Ownable(msg.sender) {
        require(_usdcAddress != address(0), "Invalid USDC address");
        require(_duration > 0, "Duration must be positive");
        require(_fundingGoal > 0, "Funding goal must be positive");
        
        usdc = IERC20(_usdcAddress);
        startTime = block.timestamp;
        endTime = startTime + _duration;
        fundingGoal = _fundingGoal;
        
        // Initialize default milestones (can be customized by admin later)
        // 30% after campaign success
        // 40% at 50% completion
        // 30% at 100% completion
        milestones.push(Milestone({
            amount: (_fundingGoal * 30) / 100,
            releaseTime: endTime + 30 days,
            isApproved: false,
            isReleased: false
        }));
        
        milestones.push(Milestone({
            amount: (_fundingGoal * 40) / 100,
            releaseTime: endTime + 90 days,
            isApproved: false,
            isReleased: false
        }));
        
        milestones.push(Milestone({
            amount: (_fundingGoal * 30) / 100,
            releaseTime: endTime + 180 days,
            isApproved: false,
            isReleased: false
        }));
    }

    /**
     * @dev Allows an investor to contribute to the campaign
     * @param _amount Amount to invest in USDC
     */
    function invest(uint256 _amount) external nonReentrant {
        require(block.timestamp < endTime, "Campaign has ended");
        require(!isFinalized, "Campaign is finalized");
        require(_amount > 0, "Amount must be positive");
        
        // Transfer USDC from investor to this contract
        bool success = usdc.transferFrom(msg.sender, address(this), _amount);
        require(success, "USDC transfer failed");
        
        // Update investor's contribution
        contributions[msg.sender] += _amount;
        
        // Update total raised
        totalRaised += _amount;
        
        emit Contribution(msg.sender, _amount);
    }

    /**
     * @dev Allows the admin to finalize the campaign
     */
    function finalizeCampaign() external onlyOwner {
        require(!isFinalized, "Campaign already finalized");
        require(block.timestamp >= endTime || totalRaised >= fundingGoal, "Campaign not yet ended");
        
        isFinalized = true;
        
        // Determine if campaign was successful
        isSuccessful = totalRaised >= fundingGoal;
        
        emit CampaignFinalized(isSuccessful, totalRaised);
    }

    /**
     * @dev Allows an investor to claim a refund if campaign failed
     */
    function claimRefund() external nonReentrant {
        require(isFinalized, "Campaign not finalized");
        require(!isSuccessful, "Campaign was successful");
        require(contributions[msg.sender] > 0, "No contribution found");
        require(!refunded[msg.sender], "Already refunded");
        
        uint256 amount = contributions[msg.sender];
        refunded[msg.sender] = true;
        
        bool success = usdc.transfer(msg.sender, amount);
        require(success, "USDC transfer failed");
        
        emit Refund(msg.sender, amount);
    }

    /**
     * @dev Allows the admin to approve a milestone
     * @param _milestoneIndex Index of the milestone to approve
     */
    function approveMilestone(uint256 _milestoneIndex) external onlyOwner {
        require(_milestoneIndex < milestones.length, "Invalid milestone index");
        require(isFinalized && isSuccessful, "Campaign not successful");
        require(!milestones[_milestoneIndex].isApproved, "Milestone already approved");
        
        milestones[_milestoneIndex].isApproved = true;
        
        emit MilestoneApproved(_milestoneIndex);
    }

    /**
     * @dev Allows the admin to release funds for a milestone
     * @param _milestoneIndex Index of the milestone to release
     */
    function releaseMilestoneFunds(uint256 _milestoneIndex) external onlyOwner {
        require(_milestoneIndex < milestones.length, "Invalid milestone index");
        require(isFinalized && isSuccessful, "Campaign not successful");
        require(milestones[_milestoneIndex].isApproved, "Milestone not approved");
        require(!milestones[_milestoneIndex].isReleased, "Milestone already released");
        require(block.timestamp >= milestones[_milestoneIndex].releaseTime, "Release time not reached");
        
        uint256 amount = milestones[_milestoneIndex].amount;
        milestones[_milestoneIndex].isReleased = true;
        
        bool success = usdc.transfer(owner(), amount);
        require(success, "USDC transfer failed");
        
        emit MilestoneReleased(_milestoneIndex, amount);
    }

    /**
     * @dev Gets the details of an investor's contribution
     * @param _investor Address of the investor
     * @return amount The amount contributed
     * @return hasRefunded Whether the investor has been refunded
     */
    function getInvestorDetails(address _investor) external view returns (uint256 amount, bool hasRefunded) {
        return (contributions[_investor], refunded[_investor]);
    }

    /**
     * @dev Gets the status of the current campaign
     * @return endTime The end time of the campaign
     * @return raised The total amount raised
     * @return goal The funding goal
     * @return isFinal Whether the campaign is finalized
     * @return isSuccess Whether the campaign was successful
     */
    function getCampaignStatus() external view returns (
        uint256 endTime,
        uint256 raised,
        uint256 goal,
        bool isFinal,
        bool isSuccess
    ) {
        return (
            endTime,
            totalRaised,
            fundingGoal,
            isFinalized,
            isSuccessful
        );
    }

    /**
     * @dev Gets the remaining time in the campaign
     * @return The remaining time in seconds
     */
    function remainingTime() external view returns (uint256) {
        if (block.timestamp >= endTime) {
            return 0;
        }
        
        return endTime - block.timestamp;
    }
}