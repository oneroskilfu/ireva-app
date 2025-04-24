// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PropertyEscrow
 * @dev Smart contract for handling real estate investment escrow on the iREVA platform
 * This contract holds funds from investors until conditions are met for release to developers
 */
contract PropertyEscrow {
    address public admin;
    address payable public developer;
    uint256 public propertyId;
    uint256 public targetAmount;
    uint256 public investmentPeriod; // in seconds
    uint256 public startTime;
    uint256 public totalInvested;
    bool public fundingComplete;
    bool public projectCancelled;
    
    enum InvestmentStatus { Active, Completed, Refunded, Cancelled }
    
    struct Investment {
        address investor;
        uint256 amount;
        uint256 timestamp;
        InvestmentStatus status;
    }
    
    mapping(address => Investment[]) public investorToInvestments;
    address[] public investors;
    
    event InvestmentMade(address indexed investor, uint256 amount, uint256 timestamp);
    event FundsReleased(address indexed developer, uint256 amount, uint256 timestamp);
    event RefundIssued(address indexed investor, uint256 amount, uint256 timestamp);
    event ProjectCancelled(uint256 timestamp, string reason);
    event WithdrawalApproved(uint256 amount, uint256 timestamp);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyDeveloper() {
        require(msg.sender == developer, "Only developer can call this function");
        _;
    }
    
    modifier fundingNotComplete() {
        require(!fundingComplete, "Funding target already reached");
        _;
    }
    
    modifier fundingIsComplete() {
        require(fundingComplete, "Funding target not yet reached");
        _;
    }
    
    modifier projectNotCancelled() {
        require(!projectCancelled, "Project has been cancelled");
        _;
    }
    
    /**
     * @dev Constructor sets up the escrow contract with property details
     * @param _developer The address of the property developer
     * @param _propertyId The ID of the property in the iREVA platform
     * @param _targetAmount The funding target in wei
     * @param _investmentPeriodInDays The period for investment in days
     */
    constructor(
        address payable _developer,
        uint256 _propertyId,
        uint256 _targetAmount,
        uint256 _investmentPeriodInDays
    ) {
        admin = msg.sender;
        developer = _developer;
        propertyId = _propertyId;
        targetAmount = _targetAmount;
        investmentPeriod = _investmentPeriodInDays * 1 days;
        startTime = block.timestamp;
        fundingComplete = false;
        projectCancelled = false;
    }
    
    /**
     * @dev Function for investors to make investments
     */
    function invest() external payable projectNotCancelled fundingNotComplete {
        require(msg.value > 0, "Investment amount must be greater than 0");
        require(block.timestamp < startTime + investmentPeriod, "Investment period has ended");
        require(totalInvested + msg.value <= targetAmount, "Investment would exceed target amount");
        
        // Record the investment
        investorToInvestments[msg.sender].push(
            Investment({
                investor: msg.sender,
                amount: msg.value,
                timestamp: block.timestamp,
                status: InvestmentStatus.Active
            })
        );
        
        // Add investor to list if first investment
        bool isNewInvestor = true;
        for (uint i = 0; i < investors.length; i++) {
            if (investors[i] == msg.sender) {
                isNewInvestor = false;
                break;
            }
        }
        
        if (isNewInvestor) {
            investors.push(msg.sender);
        }
        
        // Update total invested
        totalInvested += msg.value;
        
        // Check if funding target reached
        if (totalInvested >= targetAmount) {
            fundingComplete = true;
        }
        
        emit InvestmentMade(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Admin can release funds to developer after funding is complete
     */
    function releaseFundsToDeveloper() external onlyAdmin fundingIsComplete projectNotCancelled {
        uint256 amount = address(this).balance;
        developer.transfer(amount);
        
        emit FundsReleased(developer, amount, block.timestamp);
    }
    
    /**
     * @dev Admin can approve partial withdrawal to developer
     * @param amount The amount to be released in wei
     */
    function approveWithdrawal(uint256 amount) external onlyAdmin fundingIsComplete projectNotCancelled {
        require(amount <= address(this).balance, "Insufficient funds in contract");
        
        developer.transfer(amount);
        
        emit WithdrawalApproved(amount, block.timestamp);
    }
    
    /**
     * @dev Admin can cancel project and enable refunds
     * @param reason Reason for cancellation
     */
    function cancelProject(string memory reason) external onlyAdmin projectNotCancelled {
        projectCancelled = true;
        
        emit ProjectCancelled(block.timestamp, reason);
    }
    
    /**
     * @dev Investors can claim refund if project is cancelled
     */
    function claimRefund() external {
        require(projectCancelled, "Project has not been cancelled");
        
        uint256 totalRefundAmount = 0;
        Investment[] storage investments = investorToInvestments[msg.sender];
        
        for (uint i = 0; i < investments.length; i++) {
            if (investments[i].status == InvestmentStatus.Active) {
                totalRefundAmount += investments[i].amount;
                investments[i].status = InvestmentStatus.Refunded;
            }
        }
        
        require(totalRefundAmount > 0, "No active investments to refund");
        require(totalRefundAmount <= address(this).balance, "Insufficient funds in contract");
        
        payable(msg.sender).transfer(totalRefundAmount);
        
        emit RefundIssued(msg.sender, totalRefundAmount, block.timestamp);
    }
    
    /**
     * @dev Get investment details for a specific investor
     * @param investor The address of the investor
     * @return Investment[] An array of investments made by the investor
     */
    function getInvestorInvestments(address investor) external view returns (Investment[] memory) {
        return investorToInvestments[investor];
    }
    
    /**
     * @dev Get the total number of unique investors
     * @return uint256 The number of investors
     */
    function getInvestorCount() external view returns (uint256) {
        return investors.length;
    }
    
    /**
     * @dev Get the contract balance
     * @return uint256 The balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Check if investment period is over
     * @return bool True if investment period is over
     */
    function isInvestmentPeriodOver() external view returns (bool) {
        return block.timestamp >= startTime + investmentPeriod;
    }
    
    /**
     * @dev Get the remaining time in the investment period
     * @return uint256 The remaining time in seconds
     */
    function getRemainingTime() external view returns (uint256) {
        if (block.timestamp >= startTime + investmentPeriod) {
            return 0;
        }
        return (startTime + investmentPeriod) - block.timestamp;
    }
}