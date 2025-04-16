import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Plus, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function WalletPage() {
  const { user } = useAuth();
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [amount, setAmount] = useState("");
  
  // Mock data for wallet balance
  const walletBalance = 104000; // ₦104,000
  
  // Mock data for transactions
  const transactions = [
    { id: 1, type: "credit", description: "Wallet Funding", amount: 20000, date: new Date(2023, 3, 15) },
    { id: 2, type: "debit", description: "Investment - Epe Land", amount: 30000, date: new Date(2023, 3, 10) },
    { id: 3, type: "debit", description: "Investment - Ibeju-Lekki Land", amount: 50000, date: new Date(2023, 3, 5) },
  ];
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const handleAddFunds = () => {
    // In a real application, this would connect to a payment gateway
    alert(`Adding ₦${amount} to wallet`);
    setIsAddingFunds(false);
    setAmount("");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <DashboardHeader />
      
      <main className="flex-grow py-6">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Wallet</h2>
          
          {/* Wallet Balance Card */}
          <div className="bg-emerald-700 text-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-sm font-medium uppercase mb-2">Wallet Balance</h3>
            <div className="text-3xl font-bold mb-4">₦{walletBalance.toLocaleString()}</div>
            
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-white text-emerald-700 hover:bg-gray-100"
                onClick={() => setIsAddingFunds(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
              
              <Button className="flex-1 bg-white text-emerald-700 hover:bg-gray-100">
                Withdraw
              </Button>
            </div>
          </div>
          
          {/* Add Funds Form */}
          {isAddingFunds && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Add Funds to Wallet</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsAddingFunds(false)}
                >
                  Cancel
                </Button>
                
                <Button 
                  className="flex-1"
                  onClick={handleAddFunds}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  Proceed
                </Button>
              </div>
            </div>
          )}
          
          {/* Transactions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Transactions</h3>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDown className="h-5 w-5" />
                        ) : (
                          <ArrowUp className="h-5 w-5" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium">{transaction.description}</h4>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.type === 'credit' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}