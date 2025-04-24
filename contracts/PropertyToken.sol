// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PropertyToken
 * @dev ERC20 token representing ownership shares in a property
 */
contract PropertyToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    address public developer;
    uint256 public propertyId;
    uint256 public tokenPrice;
    
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    
    constructor(
        uint256 _propertyId,
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        address _developer,
        uint256 _tokenPrice
    ) {
        require(_developer != address(0), "Invalid developer address");
        
        propertyId = _propertyId;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        developer = _developer;
        tokenPrice = _tokenPrice;
        
        // Mint initial supply to the developer
        totalSupply = _initialSupply * (10 ** uint256(_decimals));
        balances[_developer] = totalSupply;
        
        emit Transfer(address(0), _developer, totalSupply);
    }
    
    /**
     * @dev Get the balance of an account
     */
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }
    
    /**
     * @dev Transfer tokens to a specified address
     */
    function transfer(address to, uint256 amount) public returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }
    
    /**
     * @dev Check the amount of tokens that an owner allowed to a spender
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return allowances[owner][spender];
    }
    
    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfer tokens from one address to another
     */
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Buy tokens directly with ETH
     */
    function buyTokens() public payable returns (uint256) {
        require(msg.value > 0, "Amount must be greater than 0");
        
        // Calculate tokens to buy (considering decimals)
        uint256 tokensToBuy = (msg.value * (10 ** uint256(decimals))) / tokenPrice;
        
        // Check if the developer has enough tokens
        require(balances[developer] >= tokensToBuy, "Not enough tokens available for sale");
        
        // Transfer tokens from developer to buyer
        _transfer(developer, msg.sender, tokensToBuy);
        
        // Transfer ETH to developer
        (bool success, ) = developer.call{value: msg.value}("");
        require(success, "Failed to send ETH to developer");
        
        emit TokensPurchased(msg.sender, tokensToBuy, msg.value);
        
        return tokensToBuy;
    }
    
    /**
     * @dev Internal function to transfer tokens
     */
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from the zero address");
        require(to != address(0), "Transfer to the zero address");
        require(balances[from] >= amount, "Transfer amount exceeds balance");
        
        unchecked {
            balances[from] -= amount;
            balances[to] += amount;
        }
        
        emit Transfer(from, to, amount);
    }
    
    /**
     * @dev Internal function to approve
     */
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "Approve from the zero address");
        require(spender != address(0), "Approve to the zero address");
        
        allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    /**
     * @dev Internal function to update allowance
     */
    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "Insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
}