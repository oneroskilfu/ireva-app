// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyToken
 * @dev ERC20 token representing fractional ownership of a property
 */
contract PropertyToken is ERC20, ERC20Burnable, Ownable {
    uint256 public propertyId;
    uint256 public tokenPrice;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost, uint256 timestamp);
    
    constructor(
        uint256 _propertyId,
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        address developer,
        uint256 _tokenPrice
    ) ERC20(name, symbol) Ownable(developer) {
        propertyId = _propertyId;
        tokenPrice = _tokenPrice;
        
        // Mint initial supply to the developer
        _mint(developer, initialSupply * (10 ** uint256(decimals)));
    }
    
    /**
     * @dev Buy tokens with ETH
     */
    function buyTokens() external payable {
        require(msg.value > 0, "Must send ETH to buy tokens");
        
        // Calculate the number of tokens to mint
        uint256 tokensToMint = msg.value / tokenPrice;
        require(tokensToMint > 0, "ETH amount too small to buy tokens");
        
        // Mint tokens to the buyer
        _mint(msg.sender, tokensToMint);
        
        // Emit event
        emit TokensPurchased(msg.sender, tokensToMint, msg.value, block.timestamp);
        
        // Send ETH to the owner
        (bool success, ) = owner().call{value: msg.value}("");
        require(success, "Transfer to owner failed");
    }
    
    /**
     * @dev Update token price
     */
    function updateTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Token price must be greater than 0");
        tokenPrice = newPrice;
    }
    
    /**
     * @dev Get token price
     */
    function getTokenPrice() external view returns (uint256) {
        return tokenPrice;
    }
    
    /**
     * @dev Get all token holders with balances
     * Note: This is a simplified implementation and might be gas-intensive for many holders
     * In a production environment, you would use an off-chain solution to track token holders
     */
    function getHolderCount() external view returns (uint256) {
        // This is a placeholder - in a real implementation, you would track holders
        return 1; // At minimum, the developer holds tokens
    }
    
    /**
     * @dev Emergency token recovery for any ERC20 token accidentally sent to this contract
     */
    function recoverERC20(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(this), "Cannot recover the property token itself");
        
        IERC20 token = IERC20(tokenAddress);
        bool success = token.transfer(owner(), amount);
        require(success, "Token recovery failed");
    }
    
    /**
     * @dev Emergency ETH recovery for any ETH accidentally sent to this contract
     */
    function recoverETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to recover");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "ETH recovery failed");
    }
}