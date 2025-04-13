import Paystack from 'paystack-node';
import { Request, Response } from 'express';
import { User, Investment, Property } from '@shared/schema';
import { storage } from './storage';

const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

if (!paystackSecret) {
  console.warn('PAYSTACK_SECRET_KEY is not defined. Paystack integration will not work properly.');
}

const paystack = new Paystack(paystackSecret || 'your-paystack-secret-key');

interface PaymentReference {
  reference: string;
  userId: number;
  propertyId: number;
  amount: number;
  investmentId?: number;
}

// In-memory store for payment references (would be in database in production)
const paymentReferences = new Map<string, PaymentReference>();

/**
 * Initialize a payment with Paystack
 */
export async function initializePayment(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ status: false, message: 'User not authenticated' });
  }

  try {
    const { propertyId, amount, investmentId } = req.body;
    
    if (!propertyId || !amount) {
      return res.status(400).json({ status: false, message: 'Property ID and amount are required' });
    }
    
    const user = req.user as User;
    const property = await storage.getProperty(propertyId);
    
    if (!property) {
      return res.status(404).json({ status: false, message: 'Property not found' });
    }
    
    const reference = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    const data = {
      amount: amount * 100, // Convert to kobo (smallest currency unit)
      email: user.email || 'customer@example.com',
      reference,
      callback_url: `${req.protocol}://${req.get('host')}/payment/verify`,
      metadata: {
        userId: user.id,
        propertyId,
        custom_fields: [
          {
            display_name: 'Property',
            variable_name: 'property',
            value: property.name
          },
          {
            display_name: 'Amount',
            variable_name: 'amount',
            value: `$${amount.toLocaleString()}`
          }
        ]
      }
    };
    
    const response = await paystack.transaction.initialize(data);
    
    if (response.body.status) {
      // Store reference for verification later
      paymentReferences.set(reference, {
        reference,
        userId: user.id,
        propertyId,
        amount,
        investmentId
      });
      
      return res.status(200).json(response.body);
    } else {
      return res.status(400).json(response.body);
    }
  } catch (error: any) {
    console.error('Error initializing payment:', error);
    return res.status(500).json({ status: false, message: error.message || 'Failed to initialize payment' });
  }
}

/**
 * Verify a payment with Paystack
 */
export async function verifyPayment(req: Request, res: Response) {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({ status: false, message: 'Reference is required' });
    }
    
    const paymentRef = paymentReferences.get(reference as string);
    
    if (!paymentRef) {
      return res.status(404).json({ status: false, message: 'Payment reference not found' });
    }
    
    const response = await paystack.transaction.verify(reference as string);
    
    if (response.body.status && response.body.data.status === 'success') {
      // Payment was successful, create investment
      if (!paymentRef.investmentId) {
        const investment = await storage.createInvestment({
          userId: paymentRef.userId,
          propertyId: paymentRef.propertyId,
          amount: paymentRef.amount,
          status: 'active',
          currentValue: paymentRef.amount, // Initial value equals investment amount
          returns: 0,
          earnings: 0,
          paymentReference: reference as string
        });
        
        // Clean up references
        paymentReferences.delete(reference as string);
        
        // Redirect to success page or return success response
        if (req.accepts('html')) {
          return res.redirect(`/dashboard?status=success&investmentId=${investment.id}`);
        } else {
          return res.status(200).json({
            status: true,
            message: 'Payment successful and investment created',
            data: { investment }
          });
        }
      } else {
        // This was a payment for an existing investment (e.g., additional investment)
        // Implement additional logic if needed
        
        // Clean up references
        paymentReferences.delete(reference as string);
        
        // Redirect to success page or return success response
        if (req.accepts('html')) {
          return res.redirect(`/dashboard?status=success&investmentId=${paymentRef.investmentId}`);
        } else {
          return res.status(200).json({
            status: true,
            message: 'Payment successful',
            data: { investmentId: paymentRef.investmentId }
          });
        }
      }
    } else {
      // Payment verification failed
      if (req.accepts('html')) {
        return res.redirect('/dashboard?status=failed');
      } else {
        return res.status(400).json({
          status: false,
          message: 'Payment verification failed',
          data: response.body
        });
      }
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    
    if (req.accepts('html')) {
      return res.redirect('/dashboard?status=error');
    } else {
      return res.status(500).json({ status: false, message: error.message || 'Failed to verify payment' });
    }
  }
}

/**
 * List transactions for a user
 */
export async function getTransactions(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ status: false, message: 'User not authenticated' });
  }
  
  try {
    const user = req.user as User;
    const investments = await storage.getUserInvestments(user.id);
    
    // In a real application, you would fetch transaction details from Paystack
    // Here we're just returning the investments as "transactions"
    
    return res.status(200).json({
      status: true,
      data: investments
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ status: false, message: error.message || 'Failed to fetch transactions' });
  }
}

export default {
  initializePayment,
  verifyPayment,
  getTransactions
};