// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PropertyEscrow.sol";
import "./PropertyToken.sol";
import "./ROIDistributor.sol";

/**
 * @title PropertyContractFactory
 * @dev Factory contract for creating and managing property contracts
 */
contract PropertyContractFactory {
    address public owner;
    
    struct PropertyContract {
        address escrowAddress;
        address tokenAddress;
        address roiDistributorAddress;
        bool isActive;
    }
    
    // Mapping of property ID to property contract addresses
    mapping(uint256 => PropertyContract) private propertyContracts;
    // List of all property IDs in the system
    uint256[] private propertyIds;
    
    event PropertyContractsCreated(
        uint256 indexed propertyId,
        address escrowAddress,
        address tokenAddress,
        address roiDistributorAddress,
        address developer
    );
    
    event PropertyDeactivated(uint256 indexed propertyId);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Create an escrow contract for a property
     */
    function createEscrowContract(
        uint256 propertyId,
        address developer,
        uint256 targetAmount,
        uint256 investmentPeriodInDays
    ) external onlyOwner returns (address) {
        // Check if property contracts already exist
        require(propertyContracts[propertyId].escrowAddress == address(0), "Escrow contract already exists for this property");
        
        // Deploy escrow contract
        PropertyEscrow escrow = new PropertyEscrow(
            propertyId,
            developer,
            targetAmount,
            investmentPeriodInDays
        );
        
        // Store escrow address in mapping
        propertyContracts[propertyId].escrowAddress = address(escrow);
        
        // Add property ID to list if it's a new property
        if (!propertyContracts[propertyId].isActive) {
            propertyIds.push(propertyId);
            propertyContracts[propertyId].isActive = true;
        }
        
        return address(escrow);
    }
    
    /**
     * @dev Create a token contract for a property
     */
    function createTokenContract(
        uint256 propertyId,
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        address developer,
        uint256 tokenPrice
    ) external onlyOwner returns (address) {
        // Check if property contracts already exist
        require(propertyContracts[propertyId].tokenAddress == address(0), "Token contract already exists for this property");
        
        // Deploy token contract
        PropertyToken token = new PropertyToken(
            propertyId,
            name,
            symbol,
            decimals,
            initialSupply,
            developer,
            tokenPrice
        );
        
        // Store token address in mapping
        propertyContracts[propertyId].tokenAddress = address(token);
        
        // Add property ID to list if it's a new property
        if (!propertyContracts[propertyId].isActive) {
            propertyIds.push(propertyId);
            propertyContracts[propertyId].isActive = true;
        }
        
        return address(token);
    }
    
    /**
     * @dev Create a ROI distributor contract for a property
     */
    function createROIDistributorContract(
        uint256 propertyId,
        address developer
    ) external onlyOwner returns (address) {
        // Check if token contract exists
        require(propertyContracts[propertyId].tokenAddress != address(0), "Token contract must be created first");
        
        // Check if ROI distributor contract already exists
        require(propertyContracts[propertyId].roiDistributorAddress == address(0), "ROI distributor contract already exists for this property");
        
        // Deploy ROI distributor contract
        ROIDistributor roiDistributor = new ROIDistributor(
            propertyId,
            propertyContracts[propertyId].tokenAddress,
            developer
        );
        
        // Store ROI distributor address in mapping
        propertyContracts[propertyId].roiDistributorAddress = address(roiDistributor);
        
        // Add property ID to list if it's a new property
        if (!propertyContracts[propertyId].isActive) {
            propertyIds.push(propertyId);
            propertyContracts[propertyId].isActive = true;
        }
        
        // Emit event
        emit PropertyContractsCreated(
            propertyId,
            propertyContracts[propertyId].escrowAddress,
            propertyContracts[propertyId].tokenAddress,
            address(roiDistributor),
            developer
        );
        
        return address(roiDistributor);
    }
    
    /**
     * @dev Deactivate a property
     */
    function deactivateProperty(uint256 propertyId) external onlyOwner {
        require(propertyContracts[propertyId].isActive, "Property is not active");
        
        propertyContracts[propertyId].isActive = false;
        
        emit PropertyDeactivated(propertyId);
    }
    
    /**
     * @dev Get property contract addresses
     */
    function getPropertyContract(uint256 propertyId) external view returns (
        address escrowAddress,
        address tokenAddress,
        address roiDistributorAddress,
        bool isActive
    ) {
        PropertyContract memory contract = propertyContracts[propertyId];
        
        return (
            contract.escrowAddress,
            contract.tokenAddress,
            contract.roiDistributorAddress,
            contract.isActive
        );
    }
    
    /**
     * @dev Get the number of properties
     */
    function getPropertyCount() external view returns (uint256) {
        return propertyIds.length;
    }
    
    /**
     * @dev Get property ID by index
     */
    function getPropertyIdByIndex(uint256 index) external view returns (uint256) {
        require(index < propertyIds.length, "Index out of bounds");
        
        return propertyIds[index];
    }
    
    /**
     * @dev Change the owner of the factory
     */
    function changeOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        
        owner = newOwner;
    }
}