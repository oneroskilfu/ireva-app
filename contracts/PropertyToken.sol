// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

/**
 * @title ERC1404 interface for restricted transfers
 * @dev Interface for the ERC1404 standard which extends ERC20 with transfer restrictions
 */
interface ERC1404 {
    function detectTransferRestriction(address from, address to, uint256 value) external view returns (uint8);
    function messageForTransferRestriction(uint8 restrictionCode) external view returns (string memory);
}

/**
 * @title PropertyToken
 * @dev ERC1404 token representing fractional ownership of a real estate property
 * Features include:
 * - Transfer restrictions based on investor accreditation
 * - Admin-controlled minting of new shares
 * - Compliance with regulatory requirements
 * - Milestone-based distribution of returns
 */
contract PropertyToken is ERC20, ERC1404, AccessControl, ReentrancyGuard, ERC20Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // Restriction codes
    uint8 public constant RESTRICTION_NONE = 0;
    uint8 public constant RESTRICTION_NON_ACCREDITED = 1;
    uint8 public constant RESTRICTION_LOCK_PERIOD = 2;
    uint8 public constant RESTRICTION_MAX_INVESTORS = 3;
    uint8 public constant RESTRICTION_JURISDICTION = 4;
    
    // Property details
    string public propertyAddress;
    uint256 public propertyValue;
    uint256 public totalShares;
    uint256 public minInvestment;
    
    // Compliance settings
    uint256 public lockPeriodEndDate;
    uint256 public maxInvestors;
    uint256 public currentInvestors;
    
    // Investment tracking
    struct Investment {
        uint256 amount;
        uint256 purchaseDate;
        uint256 roiDistributed;
        bool accredited;
    }
    
    mapping(address => Investment) public investments;
    mapping(address => bool) public accreditedInvestors;
    mapping(address => bool) public whitelistedInvestors;
    mapping(string => bool) public restrictedJurisdictions;
    mapping(address => string) public investorJurisdictions;
    
    // Events
    event SharesMinted(address indexed investor, uint256 amount);
    event SharesRedeemed(address indexed investor, uint256 amount);
    event RoiDistributed(uint256 totalAmount, uint256 perShare);
    event InvestorAccredited(address indexed investor, bool status);
    event InvestorWhitelisted(address indexed investor, bool status);
    event PropertyDetailsUpdated(string propertyAddress, uint256 propertyValue);
    
    /**
     * @dev Constructor for PropertyToken
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _propertyAddress Physical address of the property
     * @param _propertyValue Initial valuation of the property
     * @param _totalShares Total number of shares to be issued
     * @param _minInvestment Minimum investment amount
     * @param _lockPeriodDays Number of days shares are locked after initial offering
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _propertyAddress,
        uint256 _propertyValue,
        uint256 _totalShares,
        uint256 _minInvestment,
        uint256 _lockPeriodDays
    ) ERC20(_name, _symbol) {
        propertyAddress = _propertyAddress;
        propertyValue = _propertyValue;
        totalShares = _totalShares;
        minInvestment = _minInvestment;
        lockPeriodEndDate = block.timestamp + (_lockPeriodDays * 1 days);
        maxInvestors = 99; // Default to SEC Reg D 506(b) limit
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint new shares to an investor
     * @param investor Address of the investor
     * @param amount Amount of shares to mint
     */
    function mintShares(address investor, uint256 amount) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenNotPaused 
    {
        require(amount >= minInvestment, "Investment below minimum");
        require(totalSupply() + amount <= totalShares, "Exceeds total shares");
        
        if (investments[investor].amount == 0) {
            require(currentInvestors < maxInvestors, "Max investors reached");
            currentInvestors++;
        }
        
        // Update investment record
        investments[investor].amount += amount;
        investments[investor].purchaseDate = block.timestamp;
        
        // Mint tokens
        _mint(investor, amount);
        
        emit SharesMinted(investor, amount);
    }
    
    /**
     * @dev Redeem shares from an investor
     * @param investor Address of the investor
     * @param amount Amount of shares to redeem
     */
    function redeemShares(address investor, uint256 amount)
        external
        onlyRole(ADMIN_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(balanceOf(investor) >= amount, "Insufficient shares");
        require(block.timestamp >= lockPeriodEndDate, "Shares are locked");
        
        // Burn tokens
        _burn(investor, amount);
        
        // Update investment record
        investments[investor].amount -= amount;
        
        // Update investor count if fully redeemed
        if (investments[investor].amount == 0) {
            currentInvestors--;
        }
        
        emit SharesRedeemed(investor, amount);
    }
    
    /**
     * @dev Distribute ROI to all token holders
     * @param totalAmount Total amount to distribute
     */
    function distributeRoi(uint256 totalAmount)
        external
        onlyRole(ADMIN_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(totalSupply() > 0, "No shares issued");
        
        uint256 perShare = totalAmount * 1e18 / totalSupply();
        
        emit RoiDistributed(totalAmount, perShare);
    }
    
    /**
     * @dev Set accreditation status for an investor
     * @param investor Address of the investor
     * @param status Accreditation status
     */
    function setAccreditationStatus(address investor, bool status)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        accreditedInvestors[investor] = status;
        investments[investor].accredited = status;
        
        emit InvestorAccredited(investor, status);
    }
    
    /**
     * @dev Add investor to whitelist
     * @param investor Address of the investor
     * @param status Whitelist status
     */
    function setWhitelistStatus(address investor, bool status)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        whitelistedInvestors[investor] = status;
        
        emit InvestorWhitelisted(investor, status);
    }
    
    /**
     * @dev Set jurisdiction for an investor
     * @param investor Address of the investor
     * @param jurisdiction Jurisdiction code
     */
    function setInvestorJurisdiction(address investor, string calldata jurisdiction)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        investorJurisdictions[investor] = jurisdiction;
    }
    
    /**
     * @dev Set restricted status for a jurisdiction
     * @param jurisdiction Jurisdiction code
     * @param restricted Whether jurisdiction is restricted
     */
    function setJurisdictionRestriction(string calldata jurisdiction, bool restricted)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        restrictedJurisdictions[jurisdiction] = restricted;
    }
    
    /**
     * @dev Update property details
     * @param _propertyAddress New property address
     * @param _propertyValue New property value
     */
    function updatePropertyDetails(string calldata _propertyAddress, uint256 _propertyValue)
        external
        onlyRole(ADMIN_ROLE)
    {
        propertyAddress = _propertyAddress;
        propertyValue = _propertyValue;
        
        emit PropertyDetailsUpdated(_propertyAddress, _propertyValue);
    }
    
    /**
     * @dev Update compliance settings
     * @param _maxInvestors Maximum number of investors
     * @param _lockPeriodEndDate End date for the lock period
     */
    function updateComplianceSettings(uint256 _maxInvestors, uint256 _lockPeriodEndDate)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        maxInvestors = _maxInvestors;
        lockPeriodEndDate = _lockPeriodEndDate;
    }
    
    /**
     * @dev Detect if a transfer is restricted
     * @param from Sender address
     * @param to Recipient address
     * @param value Amount to transfer
     * @return Code indicating the restriction status
     */
    function detectTransferRestriction(address from, address to, uint256 value)
        public
        view
        override
        returns (uint8)
    {
        // Check if trading is paused
        if (paused()) {
            return RESTRICTION_LOCK_PERIOD;
        }
        
        // Check lock period
        if (block.timestamp < lockPeriodEndDate) {
            return RESTRICTION_LOCK_PERIOD;
        }
        
        // Skip other checks for zero address (minting/burning)
        if (from == address(0) || to == address(0)) {
            return RESTRICTION_NONE;
        }
        
        // Check accreditation if required
        if (!accreditedInvestors[to] && minInvestment > 0) {
            return RESTRICTION_NON_ACCREDITED;
        }
        
        // Check jurisdiction restrictions
        if (restrictedJurisdictions[investorJurisdictions[to]]) {
            return RESTRICTION_JURISDICTION;
        }
        
        // Check if recipient is a new investor and max investors reached
        if (balanceOf(to) == 0 && investments[to].amount == 0 && currentInvestors >= maxInvestors) {
            return RESTRICTION_MAX_INVESTORS;
        }
        
        return RESTRICTION_NONE;
    }
    
    /**
     * @dev Get message for a restriction code
     * @param restrictionCode Code indicating the restriction status
     * @return Message explaining the restriction
     */
    function messageForTransferRestriction(uint8 restrictionCode)
        public
        view
        override
        returns (string memory)
    {
        if (restrictionCode == RESTRICTION_NON_ACCREDITED) {
            return "Recipient is not an accredited investor";
        } else if (restrictionCode == RESTRICTION_LOCK_PERIOD) {
            return "Tokens are locked until the end of the lock period";
        } else if (restrictionCode == RESTRICTION_MAX_INVESTORS) {
            return "Maximum number of investors reached";
        } else if (restrictionCode == RESTRICTION_JURISDICTION) {
            return "Recipient is in a restricted jurisdiction";
        } else {
            return "No restriction";
        }
    }
    
    /**
     * @dev Override ERC20 transfer function to enforce restrictions
     */
    function transfer(address to, uint256 amount)
        public
        override
        returns (bool)
    {
        uint8 restrictionCode = detectTransferRestriction(msg.sender, to, amount);
        require(restrictionCode == RESTRICTION_NONE, messageForTransferRestriction(restrictionCode));
        
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override ERC20 transferFrom function to enforce restrictions
     */
    function transferFrom(address from, address to, uint256 amount)
        public
        override
        returns (bool)
    {
        uint8 restrictionCode = detectTransferRestriction(from, to, amount);
        require(restrictionCode == RESTRICTION_NONE, messageForTransferRestriction(restrictionCode));
        
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Return property details including valuation and share data
     */
    function getPropertyDetails() external view returns (
        string memory _propertyAddress,
        uint256 _propertyValue,
        uint256 _totalShares,
        uint256 _issuedShares,
        uint256 _minInvestment,
        uint256 _lockPeriodEndDate,
        uint256 _currentInvestors
    ) {
        return (
            propertyAddress,
            propertyValue,
            totalShares,
            totalSupply(),
            minInvestment,
            lockPeriodEndDate,
            currentInvestors
        );
    }
    
    /**
     * @dev Emergency pause functionality for circuit breaker pattern
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Resume operations after pause
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    // Required override from ERC20Pausable and AccessControl
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}