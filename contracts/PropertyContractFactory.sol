// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PropertyEscrow.sol";
import "./PropertyToken.sol";

/**
 * @title PropertyContractFactory
 * @dev Factory contract for creating and managing property-related contracts
 * This allows the iREVA platform to deploy new contracts for each property
 */
contract PropertyContractFactory {
    address public admin;
    
    struct PropertyContract {
        uint256 propertyId;
        address escrowAddress;
        address tokenAddress;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(uint256 => PropertyContract) public propertyContracts;
    uint256[] public propertyIds;
    
    event EscrowContractCreated(uint256 indexed propertyId, address escrowAddress, address developer);
    event TokenContractCreated(uint256 indexed propertyId, address tokenAddress, string symbol);
    event ContractDeactivated(uint256 indexed propertyId);
    event ContractReactivated(uint256 indexed propertyId);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Create a new escrow contract for a property
     * @param propertyId ID of the property in the iREVA platform
     * @param developer Address of the property developer
     * @param targetAmount Funding target in wei
     * @param investmentPeriodInDays Duration of investment period in days
     * @return address Address of the newly created escrow contract
     */
    function createEscrowContract(
        uint256 propertyId,
        address payable developer,
        uint256 targetAmount,
        uint256 investmentPeriodInDays
    ) external onlyAdmin returns (address) {
        require(propertyContracts[propertyId].escrowAddress == address(0), "Escrow contract already exists for this property");
        
        PropertyEscrow escrowContract = new PropertyEscrow(
            developer,
            propertyId,
            targetAmount,
            investmentPeriodInDays
        );
        
        if (propertyContracts[propertyId].tokenAddress == address(0)) {
            propertyContracts[propertyId] = PropertyContract({
                propertyId: propertyId,
                escrowAddress: address(escrowContract),
                tokenAddress: address(0),
                createdAt: block.timestamp,
                isActive: true
            });
            
            propertyIds.push(propertyId);
        } else {
            propertyContracts[propertyId].escrowAddress = address(escrowContract);
        }
        
        emit EscrowContractCreated(propertyId, address(escrowContract), developer);
        
        return address(escrowContract);
    }
    
    /**
     * @dev Create a new token contract for a property
     * @param propertyId ID of the property in the iREVA platform
     * @param name Name of the token
     * @param symbol Symbol of the token
     * @param decimals Decimals for token precision
     * @param initialSupply Initial token supply
     * @param developer Address of the property developer
     * @param pricePerToken Initial price per token in wei
     * @return address Address of the newly created token contract
     */
    function createTokenContract(
        uint256 propertyId,
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        address developer,
        uint256 pricePerToken
    ) external onlyAdmin returns (address) {
        require(propertyContracts[propertyId].tokenAddress == address(0), "Token contract already exists for this property");
        
        PropertyToken tokenContract = new PropertyToken(
            name,
            symbol,
            decimals,
            propertyId,
            initialSupply,
            developer,
            pricePerToken
        );
        
        if (propertyContracts[propertyId].escrowAddress == address(0)) {
            propertyContracts[propertyId] = PropertyContract({
                propertyId: propertyId,
                escrowAddress: address(0),
                tokenAddress: address(tokenContract),
                createdAt: block.timestamp,
                isActive: true
            });
            
            propertyIds.push(propertyId);
        } else {
            propertyContracts[propertyId].tokenAddress = address(tokenContract);
        }
        
        emit TokenContractCreated(propertyId, address(tokenContract), symbol);
        
        return address(tokenContract);
    }
    
    /**
     * @dev Deactivate a property contract
     * @param propertyId ID of the property to deactivate
     */
    function deactivateContract(uint256 propertyId) external onlyAdmin {
        require(propertyContracts[propertyId].escrowAddress != address(0) || propertyContracts[propertyId].tokenAddress != address(0), "No contracts found for this property");
        require(propertyContracts[propertyId].isActive, "Contract is already inactive");
        
        propertyContracts[propertyId].isActive = false;
        
        emit ContractDeactivated(propertyId);
    }
    
    /**
     * @dev Reactivate a property contract
     * @param propertyId ID of the property to reactivate
     */
    function reactivateContract(uint256 propertyId) external onlyAdmin {
        require(propertyContracts[propertyId].escrowAddress != address(0) || propertyContracts[propertyId].tokenAddress != address(0), "No contracts found for this property");
        require(!propertyContracts[propertyId].isActive, "Contract is already active");
        
        propertyContracts[propertyId].isActive = true;
        
        emit ContractReactivated(propertyId);
    }
    
    /**
     * @dev Get a property's contract details
     * @param propertyId ID of the property
     * @return PropertyContract The property contract details
     */
    function getPropertyContract(uint256 propertyId) external view returns (PropertyContract memory) {
        return propertyContracts[propertyId];
    }
    
    /**
     * @dev Get the total number of properties with contracts
     * @return uint256 The number of properties
     */
    function getPropertyCount() external view returns (uint256) {
        return propertyIds.length;
    }
    
    /**
     * @dev Get a list of all property IDs
     * @return uint256[] Array of property IDs
     */
    function getAllPropertyIds() external view returns (uint256[] memory) {
        return propertyIds;
    }
    
    /**
     * @dev Transfer admin rights to a new address
     * @param newAdmin Address of the new admin
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Cannot transfer to zero address");
        admin = newAdmin;
    }
}