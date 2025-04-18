import { Request, Response, Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { transactions, Transaction } from "@shared/schema";
import { authMiddleware } from "./auth-jwt";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const transactionRouter = Router();

// Get all transactions for the logged-in user
transactionRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    const userTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, req.user.id))
      .orderBy(transactions.createdAt, "desc");
    
    // Return transaction data with project names from the metadata
    const formattedTransactions = userTransactions.map((transaction: Transaction) => {
      let projectName = "Unknown Project";
      
      if (transaction.metadata && typeof transaction.metadata === 'object') {
        // Extract project name from metadata if available
        projectName = (transaction.metadata as any).projectName || "Unknown Project";
      }
      
      return {
        id: transaction.id,
        date: transaction.createdAt,
        projectName,
        amount: transaction.amount,
        status: transaction.status,
        receiptUrl: transaction.reference ? `/api/investor/transactions/receipt/${transaction.id}` : undefined,
        description: transaction.description,
        type: transaction.type
      };
    });
    
    res.json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
});

// Generate a PDF receipt for a transaction
transactionRouter.get("/receipt/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    const { id } = req.params;
    
    // Fetch the transaction
    const [transaction] = await db.select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .where(eq(transactions.userId, req.user.id));
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    // Create a new PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${id}.pdf`);
    
    // Pipe PDF document to response
    doc.pipe(res);
    
    // Add content to the PDF
    const user = await storage.getUser(req.user.id);
    
    // Extract project name from metadata if available
    let projectName = "Unknown Project";
    if (transaction.metadata && typeof transaction.metadata === 'object') {
      projectName = (transaction.metadata as any).projectName || "Unknown Project";
    }
    
    // Format the receipt
    doc.fontSize(20).text('iREVA Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Receipt Number: ${transaction.reference || transaction.id}`, { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(12).text('Transaction Details:', { underline: true });
    doc.moveDown();
    doc.text(`Date: ${new Date(transaction.createdAt).toLocaleDateString()}`);
    doc.text(`Amount: ₦${transaction.amount.toLocaleString()}`);
    doc.text(`Description: ${transaction.description}`);
    doc.text(`Project: ${projectName}`);
    doc.text(`Status: ${transaction.status}`);
    doc.text(`Type: ${transaction.type}`);
    doc.moveDown(2);
    
    doc.fontSize(12).text('User Information:', { underline: true });
    doc.moveDown();
    doc.text(`Name: ${user?.firstName || ''} ${user?.lastName || ''}`);
    doc.text(`Email: ${user?.email || ''}`);
    doc.moveDown(2);
    
    doc.fontSize(10).text('This is an automatically generated receipt.', { align: 'center', italics: true });
    doc.text('For any questions, please contact support@ireva.com', { align: 'center', italics: true });
    
    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({ error: "Failed to generate receipt" });
  }
});

// Get transaction statistics for the current user
transactionRouter.get("/stats", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    const userTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, req.user.id));
    
    // Calculate statistics
    const totalTransactions = userTransactions.length;
    
    const totalInvested = userTransactions
      .filter(tx => tx.type === 'investment')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const totalReturns = userTransactions
      .filter(tx => tx.type === 'return')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Latest 5 transactions for quick overview
    const recentTransactions = userTransactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(tx => ({
        id: tx.id,
        date: tx.createdAt,
        amount: tx.amount,
        type: tx.type,
        status: tx.status
      }));
    
    res.json({
      totalTransactions,
      totalInvested,
      totalReturns,
      recentTransactions
    });
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    res.status(500).json({ error: "Failed to fetch transaction statistics" });
  }
});

export default transactionRouter;