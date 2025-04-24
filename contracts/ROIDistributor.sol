// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PropertyToken.sol";

/**
 * @title ROIDistributor
 * @dev Contract for distributing returns to property token holders
 */
contract ROIDistributor {
    PropertyToken public propertyToken;
    uint256 public propertyId;
    address public developer;
    
    struct Distribution {
        uint256 amount;
        string description;
        uint256 timestamp;
    }
    
    struct InvestorReward {
        uint256 amount;
        bool claimed;
    }
    
    Distribution[] public distributions;
    // Mapping of distribution index => investor address => reward info
    mapping(uint256 => mapping(address => InvestorReward)) public investorRewards;
    // Mapping of investor address => last claimed distribution index
    mapping(address => uint256) public lastClaimedDistribution;
    
    event ROIDistributed(uint256 amount, string description, uint256 distributionIndex, uint256 timestamp);
    event RewardClaimed(address indexed investor, uint256 amount, uint256 timestamp);
    
    constructor(
        uint256 _propertyId,
        address _tokenAddress,
        address _developer
    ) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_developer != address(0), "Invalid developer address");
        
        propertyId = _propertyId;
        propertyToken = PropertyToken(_tokenAddress);
        developer = _developer;
    }
    
    /**
     * @dev Distribute ROI to token holders
     */
    function distributeROI(
        string memory description
    ) external payable {
        require(msg.value > 0, "Distribution amount must be greater than 0");
        
        uint256 distributionIndex = distributions.length;
        
        // Store distribution information
        distributions.push(Distribution({
            amount: msg.value,
            description: description,
            timestamp: block.timestamp
        }));
        
        // Calculate and store rewards for each token holder
        address[] memory holders = getAllTokenHolders();
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            uint256 holderBalance = propertyToken.balanceOf(holder);
            
            if (holderBalance > 0) {
                // Calculate holder's share of the distribution
                uint256 holderShare = (msg.value * holderBalance) / propertyToken.totalSupply();
                
                // Store holder's reward for this distribution
                investorRewards[distributionIndex][holder] = InvestorReward({
                    amount: holderShare,
                    claimed: false
                });
            }
        }
        
        emit ROIDistributed(msg.value, description, distributionIndex, block.timestamp);
    }
    
    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external {
        address investor = msg.sender;
        
        uint256 totalRewards = calculatePendingRewards(investor);
        require(totalRewards > 0, "No rewards to claim");
        
        // Update claimed status for each distribution
        for (uint256 i = lastClaimedDistribution[investor]; i < distributions.length; i++) {
            if (investorRewards[i][investor].amount > 0 && !investorRewards[i][investor].claimed) {
                investorRewards[i][investor].claimed = true;
            }
        }
        
        // Update last claimed distribution
        lastClaimedDistribution[investor] = distributions.length;
        
        // Transfer rewards to investor
        (bool success, ) = investor.call{value: totalRewards}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(investor, totalRewards, block.timestamp);
    }
    
    /**
     * @dev Calculate pending rewards for an investor
     */
    function calculatePendingRewards(address investor) public view returns (uint256) {
        uint256 totalRewards = 0;
        
        for (uint256 i = lastClaimedDistribution[investor]; i < distributions.length; i++) {
            if (investorRewards[i][investor].amount > 0 && !investorRewards[i][investor].claimed) {
                totalRewards += investorRewards[i][investor].amount;
            }
        }
        
        return totalRewards;
    }
    
    /**
     * @dev Check if an investor has pending rewards
     */
    function hasPendingRewards(address investor) public view returns (bool) {
        return calculatePendingRewards(investor) > 0;
    }
    
    /**
     * @dev Get the number of distributions
     */
    function getDistributionCount() public view returns (uint256) {
        return distributions.length;
    }
    
    /**
     * @dev Get the total amount distributed
     */
    function getTotalDistributed() public view returns (uint256) {
        uint256 total = 0;
        
        for (uint256 i = 0; i < distributions.length; i++) {
            total += distributions[i].amount;
        }
        
        return total;
    }
    
    /**
     * @dev Get all token holders
     * Note: This is a simplified implementation and might be gas-intensive for many holders
     */
    function getAllTokenHolders() internal view returns (address[] memory) {
        // For simplicity, we're using a placeholder implementation
        // In a real-world scenario, you would use an off-chain solution or maintain a list on-chain
        
        address[] memory holders = new address[](1);
        holders[0] = developer; // Just use the developer as a placeholder
        
        return holders;
    }
}