// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PropertyToken
 * @dev Contract for tokenizing real estate properties on the iREVA platform
 * This contract allows fractional ownership of properties through ERC20-like tokens
 */
contract PropertyToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    uint256 public propertyId;
    address public admin;
    address public developer;
    uint256 public pricePerToken;
    bool public saleActive;
    
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event SaleStarted(uint256 timestamp);
    event SaleStopped(uint256 timestamp);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyDeveloper() {
        require(msg.sender == developer, "Only developer can call this function");
        _;
    }
    
    modifier onlySaleActive() {
        require(saleActive, "Token sale is not active");
        _;
    }
    
    /**
     * @dev Constructor creates a new property token
     * @param _name Name of the token
     * @param _symbol Symbol of the token
     * @param _decimals Decimals for token precision
     * @param _propertyId ID of the property in the iREVA platform
     * @param _initialSupply Initial token supply
     * @param _developer Address of the property developer
     * @param _pricePerToken Initial price per token in wei
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _propertyId,
        uint256 _initialSupply,
        address _developer,
        uint256 _pricePerToken
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        propertyId = _propertyId;
        admin = msg.sender;
        developer = _developer;
        pricePerToken = _pricePerToken;
        saleActive = false;
        
        totalSupply = _initialSupply * (10**uint256(decimals));
        balances[developer] = totalSupply;
        
        emit Transfer(address(0), developer, totalSupply);
    }
    
    /**
     * @dev Get token balance of an account
     * @param account The account to query
     * @return uint256 The balance of the account
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
    
    /**
     * @dev Get allowance of spender for owner's tokens
     * @param owner The token owner
     * @param spender The token spender
     * @return uint256 The amount of tokens approved
     */
    function allowance(address owner, address spender) external view returns (uint256) {
        return allowances[owner][spender];
    }
    
    /**
     * @dev Transfer tokens to a specified address
     * @param to The recipient address
     * @param amount The amount to transfer
     * @return bool Success indicator
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(amount <= balances[msg.sender], "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Approve spender to spend tokens
     * @param spender The spender address
     * @param amount The amount to approve
     * @return bool Success indicator
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "Cannot approve zero address");
        
        allowances[msg.sender][spender] = amount;
        
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfer tokens from one address to another
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount to transfer
     * @return bool Success indicator
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(from != address(0), "Cannot transfer from zero address");
        require(to != address(0), "Cannot transfer to zero address");
        require(amount <= balances[from], "Insufficient balance");
        require(amount <= allowances[from][msg.sender], "Insufficient allowance");
        
        balances[from] -= amount;
        balances[to] += amount;
        allowances[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Start token sale
     */
    function startSale() external onlyAdmin {
        saleActive = true;
        emit SaleStarted(block.timestamp);
    }
    
    /**
     * @dev Stop token sale
     */
    function stopSale() external onlyAdmin {
        saleActive = false;
        emit SaleStopped(block.timestamp);
    }
    
    /**
     * @dev Update price per token
     * @param _newPrice New price per token in wei
     */
    function updatePrice(uint256 _newPrice) external onlyAdmin {
        require(_newPrice > 0, "Price must be greater than 0");
        
        uint256 oldPrice = pricePerToken;
        pricePerToken = _newPrice;
        
        emit PriceUpdated(oldPrice, _newPrice);
    }
    
    /**
     * @dev Purchase tokens with ETH
     * @param minTokens Minimum tokens to receive (slippage protection)
     */
    function buyTokens(uint256 minTokens) external payable onlySaleActive {
        require(msg.value > 0, "Must send ETH to buy tokens");
        
        uint256 tokenAmount = (msg.value * (10**uint256(decimals))) / pricePerToken;
        require(tokenAmount >= minTokens, "Slippage too high");
        require(tokenAmount <= balances[developer], "Not enough tokens available for sale");
        
        balances[developer] -= tokenAmount;
        balances[msg.sender] += tokenAmount;
        
        // Transfer ETH to the developer
        payable(developer).transfer(msg.value);
        
        emit Transfer(developer, msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }
    
    /**
     * @dev Admin can withdraw any accidental ETH sent to contract
     */
    function withdraw() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        payable(admin).transfer(balance);
    }
}