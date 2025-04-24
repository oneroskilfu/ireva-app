// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PropertyToken.sol";

/**
 * @title ROIDistributor
 * @dev Contract for distributing returns on investment (ROI) to property token holders
 * This allows property income to be automatically distributed to investors
 */
contract ROIDistributor {
    address public admin;
    address public developer;
    address public propertyTokenAddress;
    uint256 public propertyId;
    uint256 public totalDistributed;
    uint256 public lastDistributionTimestamp;
    
    struct Distribution {
        uint256 amount;
        uint256 timestamp;
        string description;
    }
    
    Distribution[] public distributions;
    mapping(address => uint256) public claimedDistributions;
    mapping(address => uint256) public pendingRewards;
    
    event ROIDistributed(uint256 amount, uint256 timestamp, string description);
    event RewardClaimed(address indexed investor, uint256 amount);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyDeveloper() {
        require(msg.sender == developer, "Only developer can call this function");
        _;
    }
    
    /**
     * @dev Constructor sets up the ROI distributor
     * @param _propertyId ID of the property in the iREVA platform
     * @param _propertyTokenAddress Address of the property token contract
     * @param _developer Address of the property developer
     */
    constructor(
        uint256 _propertyId,
        address _propertyTokenAddress,
        address _developer
    ) {
        admin = msg.sender;
        propertyId = _propertyId;
        propertyTokenAddress = _propertyTokenAddress;
        developer = _developer;
        totalDistributed = 0;
        lastDistributionTimestamp = 0;
    }
    
    /**
     * @dev Distribute ROI to token holders
     * @param description Description of the distribution
     */
    function distributeROI(string memory description) external payable onlyDeveloper {
        require(msg.value > 0, "Must send ETH to distribute");
        
        distributions.push(
            Distribution({
                amount: msg.value,
                timestamp: block.timestamp,
                description: description
            })
        );
        
        totalDistributed += msg.value;
        lastDistributionTimestamp = block.timestamp;
        
        emit ROIDistributed(msg.value, block.timestamp, description);
    }
    
    /**
     * @dev Calculate pending rewards for an investor
     * @param investor Address of the investor
     * @return uint256 The amount of pending rewards
     */
    function calculatePendingRewards(address investor) public view returns (uint256) {
        PropertyToken token = PropertyToken(propertyTokenAddress);
        uint256 investorBalance = token.balanceOf(investor);
        
        if (investorBalance == 0) {
            return 0;
        }
        
        uint256 totalTokens = token.totalSupply();
        uint256 claimed = claimedDistributions[investor];
        uint256 pending = 0;
        
        for (uint i = claimed; i < distributions.length; i++) {
            pending += (distributions[i].amount * investorBalance) / totalTokens;
        }
        
        return pending;
    }
    
    /**
     * @dev Update pending rewards for a specific investor
     * @param investor Address of the investor
     */
    function updatePendingRewards(address investor) public {
        uint256 rewards = calculatePendingRewards(investor);
        pendingRewards[investor] = rewards;
    }
    
    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external {
        updatePendingRewards(msg.sender);
        
        uint256 rewards = pendingRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        require(rewards <= address(this).balance, "Insufficient funds in contract");
        
        pendingRewards[msg.sender] = 0;
        claimedDistributions[msg.sender] = distributions.length;
        
        payable(msg.sender).transfer(rewards);
        
        emit RewardClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Get all distributions
     * @return Distribution[] Array of all distributions
     */
    function getAllDistributions() external view returns (Distribution[] memory) {
        return distributions;
    }
    
    /**
     * @dev Get the number of distributions
     * @return uint256 The number of distributions
     */
    function getDistributionCount() external view returns (uint256) {
        return distributions.length;
    }
    
    /**
     * @dev Check if an investor has any pending rewards
     * @param investor Address of the investor
     * @return bool True if investor has pending rewards
     */
    function hasPendingRewards(address investor) external view returns (bool) {
        return calculatePendingRewards(investor) > 0;
    }
    
    /**
     * @dev Get the total distributed amount
     * @return uint256 The total distributed amount in wei
     */
    function getTotalDistributed() external view returns (uint256) {
        return totalDistributed;
    }
    
    /**
     * @dev Admin can withdraw any accidental ETH sent to contract
     */
    function withdrawExcessFunds() external onlyAdmin {
        uint256 contractBalance = address(this).balance;
        
        // Calculate total pending rewards
        PropertyToken token = PropertyToken(propertyTokenAddress);
        uint256 totalPending = 0;
        
        for (uint i = 0; i < distributions.length; i++) {
            totalPending += distributions[i].amount;
        }
        
        uint256 excess = contractBalance > totalPending ? contractBalance - totalPending : 0;
        require(excess > 0, "No excess funds available");
        
        payable(admin).transfer(excess);
    }
}