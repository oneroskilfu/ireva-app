import express, { Request, Response } from 'express';
import { db } from '../db';
import { withdrawalRequests, users, withdrawalStatusEnum } from '@shared/schema';
import { insertWithdrawalRequestSchema } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, ensureAdmin } from '../auth-jwt';
import { emailService } from '../services/email-service';

export const withdrawalRouter = express.Router();

// Investor creates withdrawal request
withdrawalRouter.post('/request', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate the request body
    const validationResult = insertWithdrawalRequestSchema.safeParse({
      ...req.body,
      userId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: validationResult.error.errors 
      });
    }

    const withdrawalData = validationResult.data;

    // Create the withdrawal request
    const [newRequest] = await db.insert(withdrawalRequests)
      .values({
        userId,
        amount: withdrawalData.amount,
        walletAddress: withdrawalData.walletAddress,
        currency: withdrawalData.currency,
        network: withdrawalData.network,
        status: 'pending'
      })
      .returning();

    // Get user information for email
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (user && user.length > 0) {
      // Send confirmation email to investor
      emailService.sendWithdrawalRequestedEmail(user[0], newRequest)
        .catch(error => console.error('Failed to send withdrawal request email:', error));
      
      // Find admin emails
      const admins = await db.select({
        email: users.email
      })
      .from(users)
      .where(eq(users.role, 'admin'));
      
      const adminEmails = admins.map(admin => admin.email);
      
      // Send notification to admins
      if (adminEmails.length > 0) {
        emailService.sendAdminWithdrawalRequestNotification(adminEmails, user[0], newRequest)
          .catch(error => console.error('Failed to send admin notification emails:', error));
      }
    }

    // Return success response
    res.status(200).json({
      message: 'Withdrawal request submitted successfully',
      request: newRequest
    });
  } catch (err: any) {
    console.error('Error submitting withdrawal request:', err);
    res.status(500).json({ 
      message: 'Error submitting withdrawal request', 
      error: err.message 
    });
  }
});

// Get investor's withdrawal requests
withdrawalRouter.get('/investor', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get all withdrawal requests for this investor
    const requests = await db.select({
      id: withdrawalRequests.id,
      amount: withdrawalRequests.amount,
      walletAddress: withdrawalRequests.walletAddress,
      currency: withdrawalRequests.currency,
      network: withdrawalRequests.network,
      status: withdrawalRequests.status,
      txHash: withdrawalRequests.txHash,
      requestedAt: withdrawalRequests.requestedAt,
      processedAt: withdrawalRequests.processedAt,
      amountInFiat: withdrawalRequests.amountInFiat,
      feeAmount: withdrawalRequests.feeAmount
    })
    .from(withdrawalRequests)
    .where(eq(withdrawalRequests.userId, userId))
    .orderBy(desc(withdrawalRequests.requestedAt));

    res.json(requests);
  } catch (err: any) {
    console.error('Error fetching withdrawal requests:', err);
    res.status(500).json({ 
      message: 'Error fetching withdrawal requests', 
      error: err.message 
    });
  }
});

// Get all withdrawal requests (admin only)
withdrawalRouter.get('/all', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Get all withdrawal requests with user information
    const requests = await db.select({
      id: withdrawalRequests.id,
      userId: withdrawalRequests.userId,
      amount: withdrawalRequests.amount,
      walletAddress: withdrawalRequests.walletAddress,
      currency: withdrawalRequests.currency,
      network: withdrawalRequests.network,
      status: withdrawalRequests.status,
      txHash: withdrawalRequests.txHash,
      requestedAt: withdrawalRequests.requestedAt,
      processedAt: withdrawalRequests.processedAt,
      processorNotes: withdrawalRequests.processorNotes,
      processedBy: withdrawalRequests.processedBy,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(withdrawalRequests)
    .leftJoin(users, eq(withdrawalRequests.userId, users.id))
    .orderBy(desc(withdrawalRequests.requestedAt));

    res.json(requests);
  } catch (err: any) {
    console.error('Error fetching all withdrawal requests:', err);
    res.status(500).json({ 
      message: 'Error fetching all withdrawal requests', 
      error: err.message 
    });
  }
});

// Update withdrawal request status (admin only)
withdrawalRouter.post('/update/:id', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.jwtPayload?.id;
    const { status, txHash, processorNotes } = req.body;

    if (!adminId) {
      return res.status(401).json({ message: 'Admin not authenticated' });
    }

    // Validate status
    if (!Object.values(withdrawalStatusEnum.enumValues).includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Get the withdrawal request before updating to check previous status
    const existingRequest = await db.select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, id))
      .limit(1);

    if (!existingRequest || existingRequest.length === 0) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    // Update the withdrawal request
    const [updatedRequest] = await db.update(withdrawalRequests)
      .set({
        status,
        txHash: txHash || undefined,
        processorNotes: processorNotes || undefined,
        processedBy: adminId,
        processedAt: new Date()
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Withdrawal request not found after update' });
    }

    // Get user information for email notifications
    const user = await db.select()
      .from(users)
      .where(eq(users.id, updatedRequest.userId))
      .limit(1);

    if (user && user.length > 0) {
      // Send appropriate email based on the updated status
      switch (status) {
        case 'approved':
          emailService.sendWithdrawalApprovedEmail(user[0], updatedRequest)
            .catch(error => console.error('Failed to send withdrawal approved email:', error));
          break;
        
        case 'rejected':
          emailService.sendWithdrawalRejectedEmail(user[0], updatedRequest)
            .catch(error => console.error('Failed to send withdrawal rejected email:', error));
          break;
        
        case 'completed':
          emailService.sendWithdrawalProcessedEmail(user[0], updatedRequest)
            .catch(error => console.error('Failed to send withdrawal processed email:', error));
          break;
          
        default:
          // No email for other status changes
          break;
      }
    }

    res.json(updatedRequest);
  } catch (err: any) {
    console.error('Error updating withdrawal request:', err);
    res.status(500).json({ 
      message: 'Error updating withdrawal request', 
      error: err.message 
    });
  }
});