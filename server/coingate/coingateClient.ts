import coingate from 'coingate-v2';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if API key is available
if (!process.env.COINGATE_API_KEY) {
  console.warn('COINGATE_API_KEY is not set. Using mock data for crypto integration.');
}

// Initialize CoinGate client with API key
const cgClient = process.env.NODE_ENV === 'production' 
  ? coingate.client(process.env.COINGATE_API_KEY || 'missing-api-key')
  : coingate.testClient(process.env.COINGATE_API_KEY || 'missing-api-key');

export default cgClient;