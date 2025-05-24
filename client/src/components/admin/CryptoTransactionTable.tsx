import React from 'react';
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface CryptoTransaction {
  id: string;
  userId: number;
  userName?: string;
  amount: string;
  currency: string;
  status: string;
  network?: string;
  walletAddress?: string;
  txHash?: string;
  createdAt: string;
  propertyId?: number;
  propertyName?: string;
}

interface CryptoTransactionTableProps {
  transactions: CryptoTransaction[];
  title?: string;
  description?: string;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'confirmed':
    case 'completed':
      return 'success';
    case 'pending':
    case 'processing':
      return 'warning';
    case 'failed':
    case 'expired':
    case 'canceled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function CryptoTransactionTable({ 
  transactions, 
  title = "Crypto Transactions", 
  description
}: CryptoTransactionTableProps) {
  
  // Function to get block explorer URL based on network
  const getExplorerUrl = (txHash: string, network?: string) => {
    if (!txHash) return null;
    
    // Default to Ethereum if no network specified
    const currentNetwork = network?.toLowerCase() || 'ethereum';
    
    const explorers: Record<string, string> = {
      ethereum: `https://etherscan.io/tx/${txHash}`,
      polygon: `https://polygonscan.com/tx/${txHash}`,
      bitcoin: `https://www.blockchain.com/btc/tx/${txHash}`,
      binance: `https://bscscan.com/tx/${txHash}`,
      tron: `https://tronscan.org/#/transaction/${txHash}`,
      solana: `https://explorer.solana.com/tx/${txHash}`
    };
    
    return explorers[currentNetwork] || null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Blockchain</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                  <TableCell>{tx.userName || `User #${tx.userId}`}</TableCell>
                  <TableCell>
                    {tx.amount} {tx.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(tx.status)}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tx.propertyName || (tx.propertyId ? `Property #${tx.propertyId}` : 'N/A')}
                  </TableCell>
                  <TableCell>
                    {formatDate(new Date(tx.createdAt))}
                  </TableCell>
                  <TableCell>
                    {tx.txHash ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <a 
                          href={getExplorerUrl(tx.txHash, tx.network)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1"
                        >
                          <span>View</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not available</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default CryptoTransactionTable;