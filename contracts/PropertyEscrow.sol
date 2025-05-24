// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PropertyEscrow
 * @dev Escrow contract for property investments
 */
contract PropertyEscrow {
    uint256 public propertyId;
    address public developer;
    address public factory;
    uint256 public targetAmount;
    uint256 public totalInvested;
    uint256 public investmentDeadline;
    bool public fundingComplete;
    bool public fundingFailed;
    bool public fundsReleased;
    
    struct Investment {
        uint256 amount;
        uint256 timestamp;
    }
    
    // Mapping of investor address to their investment
    mapping(address => Investment) public investments;
    // Array of investor addresses
    address[] public investors;
    
    event InvestmentReceived(address indexed investor, uint256 amount, uint256 timestamp);
    event FundingCompleted(uint256 totalAmount, uint256 timestamp);
    event FundingFailed(uint256 totalAmount, uint256 timestamp);
    event FundsReleased(uint256 amount, uint256 timestamp);
    event InvestmentRefunded(address indexed investor, uint256 amount, uint256 timestamp);
    
    constructor(
        uint256 _propertyId,
        address _developer,
        uint256 _targetAmount,
        uint256 _investmentPeriodInDays
    ) {
        require(_developer != address(0), "Invalid developer address");
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_investmentPeriodInDays > 0, "Investment period must be greater than 0");
        
        propertyId = _propertyId;
        developer = _developer;
        factory = msg.sender;
        targetAmount = _targetAmount;
        investmentDeadline = block.timestamp + (_investmentPeriodInDays * 1 days);
        
        totalInvested = 0;
        fundingComplete = false;
        fundingFailed = false;
        fundsReleased = false;
    }
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call this function");
        _;
    }
    
    modifier onlyDeveloper() {
        require(msg.sender == developer, "Only developer can call this function");
        _;
    }
    
    modifier escrowActive() {
        require(!fundingComplete, "Funding already completed");
        require(!fundingFailed, "Funding has failed");
        require(block.timestamp < investmentDeadline, "Investment deadline has passed");
        _;
    }
    
    /**
     * @dev Invest in the property
     */
    function invest() external payable escrowActive {
        require(msg.value > 0, "Investment amount must be greater than 0");
        
        // Update existing or create new investment
        if (investments[msg.sender].amount > 0) {
            investments[msg.sender].amount += msg.value;
            investments[msg.sender].timestamp = block.timestamp;
        } else {
            investments[msg.sender] = Investment({
                amount: msg.value,
                timestamp: block.timestamp
            });
            
            // Add investor to list if first investment
            investors.push(msg.sender);
        }
        
        // Update total invested
        totalInvested += msg.value;
        
        // Check if funding target is reached
        if (totalInvested >= targetAmount) {
            fundingComplete = true;
            emit FundingCompleted(totalInvested, block.timestamp);
        }
        
        emit InvestmentReceived(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Release funds to the developer
     * Can only be called after funding is complete
     */
    function releaseFunds() external onlyDeveloper {
        require(fundingComplete, "Funding not completed");
        require(!fundsReleased, "Funds already released");
        
        fundsReleased = true;
        
        // Transfer funds to developer
        (bool success, ) = developer.call{value: totalInvested}("");
        require(success, "Transfer to developer failed");
        
        emit FundsReleased(totalInvested, block.timestamp);
    }
    
    /**
     * @dev Mark funding as failed
     * Can only be called by factory after deadline
     */
    function markFundingFailed() external onlyFactory {
        require(block.timestamp >= investmentDeadline, "Investment deadline has not passed");
        require(!fundingComplete, "Funding already completed");
        require(!fundingFailed, "Funding already marked as failed");
        
        fundingFailed = true;
        
        emit FundingFailed(totalInvested, block.timestamp);
    }
    
    /**
     * @dev Refund investment
     * Can only be called after funding is marked as failed
     */
    function refund() external {
        require(fundingFailed, "Funding not marked as failed");
        require(investments[msg.sender].amount > 0, "No investment to refund");
        
        uint256 amount = investments[msg.sender].amount;
        
        // Reset investment
        investments[msg.sender].amount = 0;
        
        // Transfer funds back to investor
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund transfer failed");
        
        emit InvestmentRefunded(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Get investment details for an investor
     */
    function getInvestment(address investor) external view returns (uint256 amount, uint256 timestamp) {
        Investment memory investment = investments[investor];
        
        return (investment.amount, investment.timestamp);
    }
    
    /**
     * @dev Get number of investors
     */
    function getInvestorCount() external view returns (uint256) {
        return investors.length;
    }
    
    /**
     * @dev Get investor address by index
     */
    function getInvestorByIndex(uint256 index) external view returns (address) {
        require(index < investors.length, "Index out of bounds");
        return investors[index];
    }
    
    /**
     * @dev Get remaining time until investment deadline
     */
    function getRemainingTime() external view returns (uint256) {
        if (block.timestamp >= investmentDeadline) {
            return 0;
        }
        
        return investmentDeadline - block.timestamp;
    }
}