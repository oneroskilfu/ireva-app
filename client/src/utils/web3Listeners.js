/**
 * Utility functions for interacting with blockchain transactions
 */

/**
 * Wait for a transaction to be mined and confirmed
 * 
 * @param {string} providerUrl - The Ethereum provider URL (e.g., Infura endpoint)
 * @param {string} txHash - The transaction hash to wait for
 * @param {number} confirmations - Number of confirmations to wait for (default: 1)
 * @param {number} timeout - Timeout in milliseconds (default: 120000 ms = 2 minutes)
 * @returns {Promise<object>} - The transaction receipt
 */
export const waitForTransaction = async (
  providerUrl,
  txHash,
  confirmations = 1,
  timeout = 120000
) => {
  // For development only - mock the transaction receipt if no provider available
  if (process.env.NODE_ENV === 'development' && (!providerUrl || !txHash)) {
    console.log('Development mode: Mocking transaction receipt');
    
    // Simulate a delay to mimic blockchain confirmation time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      transactionHash: txHash || '0x' + Array(64).fill().map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      blockNumber: 12345678,
      confirmations: confirmations,
      status: 1 // 1 = success
    };
  }
  
  // In production, we would use a provider to check the actual transaction
  // For example with ethers.js:
  // const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  // return provider.waitForTransaction(txHash, confirmations, timeout);
  
  // If no real blockchain provider is available, throw an error
  throw new Error("No blockchain provider available in production mode");
};

/**
 * Listen for blockchain events (like escrow fund releases, investments, etc.)
 * 
 * @param {string} providerUrl - The Ethereum provider URL
 * @param {string} contractAddress - The address of the contract to listen to
 * @param {string} eventName - The name of the event to listen for
 * @param {Function} callback - Callback function to run when event is detected
 * @returns {Function} - Function to call to stop listening
 */
export const listenForContractEvent = (
  providerUrl,
  contractAddress,
  eventName,
  callback
) => {
  // For development only - simulate events if no provider available
  if (process.env.NODE_ENV === 'development') {
    console.log(`Development mode: Mock listening for ${eventName} events`);
    
    // No real listener in development mode
    return () => console.log(`Stopped listening for ${eventName} events`);
  }
  
  // In production, we would use a provider to listen for events
  // For example with ethers.js:
  // const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  // const contract = new ethers.Contract(contractAddress, ABI, provider);
  // const filter = contract.filters[eventName]();
  // contract.on(filter, callback);
  // return () => contract.off(filter, callback);
  
  // If no real blockchain provider is available, return a no-op
  return () => {};
};

/**
 * Get the status of a transaction
 * 
 * @param {string} providerUrl - The Ethereum provider URL
 * @param {string} txHash - The transaction hash to check
 * @returns {Promise<object>} - The transaction status
 */
export const getTransactionStatus = async (providerUrl, txHash) => {
  // For development only - mock the transaction status if no provider available
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Mocking transaction status');
    
    return {
      hash: txHash || '0x' + Array(64).fill().map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      blockNumber: 12345678,
      confirmations: 3,
      status: 'confirmed' // or 'pending', 'failed'
    };
  }
  
  // In production, we would use a provider to check the actual transaction
  // For example with ethers.js:
  // const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  // const tx = await provider.getTransaction(txHash);
  // return {
  //   hash: tx.hash,
  //   blockNumber: tx.blockNumber,
  //   confirmations: tx.confirmations,
  //   status: tx.blockNumber ? 'confirmed' : 'pending'
  // };
  
  // If no real blockchain provider is available, throw an error
  throw new Error("No blockchain provider available in production mode");
};