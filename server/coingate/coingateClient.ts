import CoinGate from 'coingate-v2';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if API key is available
if (!process.env.COINGATE_API_KEY) {
  console.warn('COINGATE_API_KEY is not set. Using mock data for crypto integration.');
}

// Initialize CoinGate client with API key
const client = new CoinGate({
  apiKey: process.env.COINGATE_API_KEY || 'missing-api-key',
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
});

export default client;