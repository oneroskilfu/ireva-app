import { Request, Response } from 'express';
import { smartContractSecurityService } from '../services/smart-contract-security';

/**
 * Controller for smart contract security administration
 */
export const smartContractController = {
  /**
   * Get all deployed contracts
   */
  getAllContracts: async (req: Request, res: Response) => {
    try {
      const contracts = smartContractSecurityService.getDeployedContracts();
      res.status(200).json(contracts);
    } catch (error) {
      console.error('Error getting deployed contracts:', error);
      res.status(500).json({
        message: 'Failed to get deployed contracts',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  /**
   * Get a single contract by address
   */
  getContract: async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const contract = smartContractSecurityService.getContractDeployment(address);
      
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      res.status(200).json(contract);
    } catch (error) {
      console.error('Error getting contract:', error);
      res.status(500).json({
        message: 'Failed to get contract',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  /**
   * Get contract source code
   */
  getContractSource: async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const source = await smartContractSecurityService.getContractSource(name);
      
      if (!source) {
        return res.status(404).json({ message: 'Contract source not found' });
      }
      
      res.status(200).json({ name, source });
    } catch (error) {
      console.error('Error getting contract source:', error);
      res.status(500).json({
        message: 'Failed to get contract source',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  /**
   * Analyze a contract for security issues
   */
  analyzeContract: async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const analysis = await smartContractSecurityService.analyzeContract(name);
      res.status(200).json(analysis);
    } catch (error) {
      console.error('Error analyzing contract:', error);
      res.status(500).json({
        message: 'Failed to analyze contract',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  /**
   * Verify a contract on blockchain explorer
   */
  verifyContract: async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const { contractName, network, constructorArguments } = req.body;
      
      const result = await smartContractSecurityService.verifyContract(
        address,
        contractName,
        network,
        constructorArguments
      );
      
      if (result) {
        res.status(200).json({ 
          message: 'Contract verification successful', 
          verified: true 
        });
      } else {
        res.status(400).json({ 
          message: 'Contract verification failed', 
          verified: false 
        });
      }
    } catch (error) {
      console.error('Error verifying contract:', error);
      res.status(500).json({
        message: 'Failed to verify contract',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  /**
   * Get audit result for a contract
   */
  getAuditResult: async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const auditResult = await smartContractSecurityService.getAuditResult(address);
      res.status(200).json(auditResult);
    } catch (error) {
      console.error('Error getting audit result:', error);
      res.status(500).json({
        message: 'Failed to get audit result',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  /**
   * Generate a comprehensive security report for all contracts
   */
  generateSecurityReport: async (req: Request, res: Response) => {
    try {
      const report = await smartContractSecurityService.generateSecurityReport();
      res.status(200).json(report);
    } catch (error) {
      console.error('Error generating security report:', error);
      res.status(500).json({
        message: 'Failed to generate security report',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};