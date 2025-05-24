import { Request, Response } from 'express';
import { CryptoPaymentService } from '../services/crypto-payment-service';
import { v4 as uuidv4 } from 'uuid';

// Initialize the crypto payment service
const cryptoPaymentService = CryptoPaymentService.getInstance();

// Create a new crypto payment
export const createCryptoPayment = async (req: Request, res: Response) => {
  try {
    const { amount, currency, propertyId, investmentId } = req.body;
    
    // Validation
    if (!amount || !currency) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and currency are required' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than zero' 
      });
    }
    
    // Get user from auth middleware
    const userId = req.user!.id;
    
    // Generate unique order ID with investment reference if available
    const orderId = investmentId 
      ? `IREVA-INV-${investmentId.substring(0, 8)}`
      : `IREVA-${uuidv4().substring(0, 8)}`;
    
    // Base URL for callbacks - use the same host as the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Store metadata in a JSON object
    const metadata = {
      userId,
      propertyId,
      investmentId,
      timestamp: new Date().toISOString()
    };
    
    // Create payment with the CoinGate service
    const payment = await cryptoPaymentService.createPayment({
      amount,
      userId,
      currency,
      description: investmentId 
        ? `iREVA Investment (${currency})` 
        : `iREVA Wallet Fund (${currency})`,
      orderId,
      returnUrl: investmentId
        ? `${baseUrl}/investments?payment=${orderId}`
        : `${baseUrl}/wallet?payment=${orderId}`,
      callbackUrl: `${baseUrl}/api/crypto/webhook`,
      propertyId,
      metadata: JSON.stringify(metadata)
    });
    
    // Log the payment creation
    console.log(`Created crypto payment: ${payment.id} for user: ${userId}, amount: ${amount} ${currency}`);
    
    // Return the payment details
    res.json({ 
      success: true, 
      payment,
      message: 'Payment created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating crypto payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment',
      error: error.message 
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID is required' 
      });
    }
    
    const status = await cryptoPaymentService.getPaymentStatus(paymentId);
    
    res.json({ 
      success: true, 
      status,
      message: 'Payment status retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment status',
      error: error.message 
    });
  }
};

// Get user's payment history
export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const payments = await cryptoPaymentService.getUserPayments(userId);
    
    res.json({ 
      success: true, 
      payments,
      message: 'Payment history retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment history',
      error: error.message 
    });
  }
};

// Handle webhook events from CoinGate
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('Received webhook payload:', payload);
    
    // Extra validation handled by middleware in webhookSecurityMiddleware.ts
    
    // Check if we have the minimum required fields
    if (!payload.id || !payload.status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid webhook payload: Missing required fields' 
      });
    }
    
    // Update payment status in the database
    await cryptoPaymentService.updatePaymentStatus(payload.id, payload.status);
    
    // Process successful payments
    if (['paid', 'confirmed'].includes(payload.status)) {
      try {
        // Extract user ID from custom data or metadata
        let userId = 0;
        let amount = 0;
        
        // Try to get user ID from payload
        if (payload.custom_data && payload.custom_data.userId) {
          userId = parseInt(payload.custom_data.userId);
          amount = parseFloat(payload.price_amount) || 0;
        } else if (payload.metadata) {
          // Parse metadata if available
          try {
            const metadata = JSON.parse(payload.metadata);
            if (metadata.userId) {
              userId = parseInt(metadata.userId);
              amount = parseFloat(payload.price_amount) || 0;
            }
          } catch (e) {
            console.error('Error parsing metadata:', e);
          }
        }
        
        // Only process if we have valid user ID and amount
        if (userId && amount) {
          await cryptoPaymentService.processSuccessfulPayment(payload.id, userId, amount);
          console.log(`Successfully processed payment ${payload.id} for user ${userId} with amount ${amount}`);
        } else {
          console.warn(`Cannot process payment ${payload.id}: Missing user ID or amount`);
        }
      } catch (processingError) {
        console.error('Error processing successful payment:', processingError);
        // We still return 200 to acknowledge receipt to CoinGate
        // but log the error for manual intervention
      }
    }
    
    // Always return 200 OK to acknowledge receipt
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    // Return 500 only for server-side errors, not validation errors
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process webhook due to server error',
      error: error.message 
    });
  }
};

// Admin endpoint to get all crypto payments
export const getAllCryptoPayments = async (req: Request, res: Response) => {
  try {
    const payments = await cryptoPaymentService.getAllPayments();
    
    res.json({ 
      success: true, 
      payments,
      message: 'All crypto payments retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch all payments',
      error: error.message 
    });
  }
};

// Admin endpoint to update payment status
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
    
    if (!paymentId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID and status are required' 
      });
    }
    
    // Validate status
    const validStatuses = ['new', 'pending', 'confirming', 'paid', 'invalid', 'expired', 'canceled', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    await cryptoPaymentService.updatePaymentStatus(paymentId, status);
    
    // If marking as paid/confirmed, process the payment
    if (['paid', 'confirmed'].includes(status)) {
      // Get payment details first
      const payment = await cryptoPaymentService.getPayment(paymentId);
      if (payment && payment.userId && payment.amount) {
        await cryptoPaymentService.processSuccessfulPayment(paymentId, payment.userId, parseFloat(payment.amount));
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Payment status updated successfully' 
    });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update payment status',
      error: error.message 
    });
  }
};