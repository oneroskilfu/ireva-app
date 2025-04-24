// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PropertyEscrow
 * @dev Contract for handling property investment funds in escrow
 */
contract PropertyEscrow {
    uint256 public propertyId;
    address public developer;
    uint256 public targetAmount;
    uint256 public totalInvested;
    uint256 public investmentDeadline;
    bool public fundingComplete;
    bool public fundsReleased;
    
    struct Investor {
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(address => Investor) public investors;
    address[] public investorList;
    
    event Investment(address indexed investor, uint256 amount, uint256 timestamp);
    event FundingComplete(uint256 totalAmount, uint256 timestamp);
    event FundsReleased(address indexed developer, uint256 amount, uint256 timestamp);
    event FundsRefunded(address indexed investor, uint256 amount, uint256 timestamp);
    
    constructor(
        uint256 _propertyId,
        address _developer,
        uint256 _targetAmount,
        uint256 _investmentPeriodInDays
    ) {
        require(_developer != address(0), "Invalid developer address");
        require(_targetAmount > 0, "Target amount must be greater than 0");
        
        propertyId = _propertyId;
        developer = _developer;
        targetAmount = _targetAmount;
        investmentDeadline = block.timestamp + (_investmentPeriodInDays * 1 days);
    }
    
    /**
     * @dev Invest in the property
     */
    function invest() external payable {
        require(!isInvestmentPeriodOver(), "Investment period has ended");
        require(!fundingComplete, "Funding target already reached");
        require(msg.value > 0, "Investment must be greater than 0");
        
        // Update investor record
        if (investors[msg.sender].amount == 0) {
            investorList.push(msg.sender);
        }
        
        investors[msg.sender].amount += msg.value;
        investors[msg.sender].timestamp = block.timestamp;
        
        // Update total invested
        totalInvested += msg.value;
        
        // Check if target has been reached
        if (totalInvested >= targetAmount) {
            fundingComplete = true;
            emit FundingComplete(totalInvested, block.timestamp);
        }
        
        emit Investment(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Release funds to the developer
     */
    function releaseFunds() external {
        require(fundingComplete, "Funding target not reached");
        require(!fundsReleased, "Funds already released");
        
        fundsReleased = true;
        uint256 amount = address(this).balance;
        
        (bool success, ) = developer.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(developer, amount, block.timestamp);
    }
    
    /**
     * @dev Refund investors if funding target is not reached before deadline
     */
    function refundInvestors() external {
        require(isInvestmentPeriodOver(), "Investment period has not ended");
        require(!fundingComplete, "Funding target already reached");
        
        for (uint256 i = 0; i < investorList.length; i++) {
            address investor = investorList[i];
            uint256 amount = investors[investor].amount;
            
            if (amount > 0) {
                investors[investor].amount = 0;
                
                (bool success, ) = investor.call{value: amount}("");
                require(success, "Transfer failed");
                
                emit FundsRefunded(investor, amount, block.timestamp);
            }
        }
    }
    
    /**
     * @dev Check if investment period is over
     */
    function isInvestmentPeriodOver() public view returns (bool) {
        return block.timestamp > investmentDeadline;
    }
    
    /**
     * @dev Get the remaining time for investment in seconds
     */
    function getRemainingTime() public view returns (uint256) {
        if (isInvestmentPeriodOver()) {
            return 0;
        }
        return investmentDeadline - block.timestamp;
    }
    
    /**
     * @dev Get the investment amount of a specific investor
     */
    function getInvestorAmount(address investor) public view returns (uint256) {
        return investors[investor].amount;
    }
    
    /**
     * @dev Get the number of investors
     */
    function getInvestorCount() public view returns (uint256) {
        return investorList.length;
    }
    
    /**
     * @dev Get the list of all investors
     */
    function getInvestors() public view returns (address[] memory) {
        return investorList;
    }
}