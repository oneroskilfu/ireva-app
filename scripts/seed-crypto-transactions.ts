import { db } from '../server/db';
import { cryptoPayments, users, properties } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seedCryptoTransactions() {
  console.log('Starting to seed crypto transactions...');
  
  try {
    // Get some existing users
    const existingUsers = await db.select().from(users).limit(5);
    if (existingUsers.length === 0) {
      console.log('No users found. Please seed users first.');
      return;
    }
    
    console.log(`Found ${existingUsers.length} users for seeding`);
    console.log('Sample user:', existingUsers[0]);
    
    // Get some existing properties
    const existingProperties = await db.select().from(properties).limit(3);
    if (existingProperties.length === 0) {
      console.log('No properties found. Please seed properties first.');
      return;
    }
    
    console.log(`Found ${existingProperties.length} properties for seeding`);
    console.log('Sample property:', existingProperties[0]);
    
    // Delete existing crypto payments for clean seeding
    const deletedCount = await db.delete(cryptoPayments).returning();
    console.log(`Deleted ${deletedCount.length} existing crypto payments`);
    
    // Sample transactions data
    const sampleTransactions = [
      {
        id: 'txn-1001-bitcoin',
        userId: existingUsers[0]?.id || 1,
        amount: '0.0125',
        currency: 'BTC',
        status: 'completed',
        orderId: 'ORDER-1001-BTC',
        paymentUrl: 'https://example.com/pay/1001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        txHash: '6a6baccd9f2a81dad3cbeb3fb37654c3124e9e12b5b8c36178c68e34be883fcb',
        network: 'bitcoin',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), // 29 days ago
        expiresAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
        propertyId: existingProperties[0]?.id || 1
      },
      {
        id: 'txn-1002-eth',
        userId: existingUsers[1]?.id || 1,
        amount: '0.75',
        currency: 'ETH',
        status: 'completed',
        orderId: 'ORDER-1002-ETH',
        paymentUrl: 'https://example.com/pay/1002',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        network: 'ethereum',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        expiresAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
        propertyId: existingProperties[1]?.id || 1
      },
      {
        id: 'txn-1003-usdt',
        userId: existingUsers[2]?.id || 1,
        amount: '500',
        currency: 'USDT',
        status: 'completed',
        orderId: 'ORDER-1003-USDT',
        paymentUrl: 'https://example.com/pay/1003',
        walletAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        network: 'ethereum',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
        expiresAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        propertyId: existingProperties[2]?.id || 1
      },
      {
        id: 'txn-1004-usdc',
        userId: existingUsers[0]?.id || 1,
        amount: '750',
        currency: 'USDC',
        status: 'completed',
        orderId: 'ORDER-1004-USDC',
        paymentUrl: 'https://example.com/pay/1004',
        walletAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        network: 'ethereum',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        propertyId: existingProperties[0]?.id || 1
      },
      {
        id: 'txn-1005-matic',
        userId: existingUsers[0]?.id || 1,
        amount: '1000',
        currency: 'MATIC',
        status: 'pending',
        orderId: 'ORDER-1005-MATIC',
        paymentUrl: 'https://example.com/pay/1005',
        walletAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
        network: 'polygon',
        createdAt: new Date(), // Today
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        propertyId: existingProperties[1]?.id || 1
      },
      {
        id: 'txn-1006-bnb',
        userId: existingUsers[0]?.id || 1,
        amount: '2.5',
        currency: 'BNB',
        status: 'failed',
        orderId: 'ORDER-1006-BNB',
        paymentUrl: 'https://example.com/pay/1006',
        walletAddress: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
        network: 'binance',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        propertyId: existingProperties[0]?.id || 1
      }
    ];
    
    // Insert the sample transactions
    const inserted = await db.insert(cryptoPayments).values(sampleTransactions).returning();
    console.log(`Successfully inserted ${inserted.length} crypto transactions`);
    
    // Print the inserted data for confirmation
    console.log('Sample transaction:', inserted[0]);
    
  } catch (error) {
    console.error('Error seeding crypto transactions:', error);
  }
  
  console.log('Crypto transactions seeding complete!');
}

// Run the seeding
seedCryptoTransactions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed crypto transactions:', error);
    process.exit(1);
  });