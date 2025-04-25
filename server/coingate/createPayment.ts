import coingateClient from './coingateClient';
import { v4 as uuidv4 } from 'uuid';

interface PaymentParams {
  userId: number;
  propertyId: number;
  amount: number;
  currency?: string;
  callbackUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
  title?: string;
  description?: string;
  receiveCurrency?: string;
}

/**
 * Create a new payment with CoinGate
 * @param params Payment parameters
 * @returns Payment object from CoinGate or mock data
 */
const createPayment = async (params: PaymentParams) => {
  // Create a unique order ID for this payment
  const orderId = `iREVA-${params.userId}-${params.propertyId}-${Date.now()}`;
  
  // Default callback URL if not provided
  const baseUrl = process.env.BASE_URL || 'https://your-domain.com';
  const callbackUrl = params.callbackUrl || `${baseUrl}/api/crypto/webhooks/coingate/webhook`;
  const successUrl = params.successUrl || `${baseUrl}/payment-success`;
  const cancelUrl = params.cancelUrl || `${baseUrl}/payment-cancelled`;
  
  // Prepare payment parameters for CoinGate
  const paymentParams = {
    order_id: orderId,
    price_amount: params.amount,
    price_currency: params.currency || 'USD',
    receive_currency: params.receiveCurrency || 'USDT',
    callback_url: callbackUrl,
    cancel_url: cancelUrl,
    success_url: successUrl,
    title: params.title || 'iREVA Investment Payment',
    description: params.description || `Investment payment for property #${params.propertyId}`,
    token: uuidv4() // Generate a random token for this order
  };

  try {
    // Check if we have an API key
    if (!process.env.COINGATE_API_KEY) {
      console.log('Using mock payment data (COINGATE_API_KEY not set)');
      
      // Return mock data for development/testing
      return {
        id: uuidv4(),
        status: 'pending',
        price_amount: params.amount,
        price_currency: params.currency || 'USD',
        receive_amount: params.amount,
        receive_currency: params.receiveCurrency || 'USDT',
        payment_url: `https://mockpayment.example/pay/${orderId}`,
        token: paymentParams.token,
        created_at: new Date().toISOString(),
        order_id: orderId,
        payment_address: '0xMockCryptoAddress1234567890abcdef',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
      };
    }
    
    // Make the actual API call to CoinGate
    const response = await coingateClient.createOrder(paymentParams);
    console.log('CoinGate payment created:', response);
    return response;
  } catch (err) {
    console.error('CoinGate Payment Error:', err);
    throw err;
  }
};

export default createPayment;