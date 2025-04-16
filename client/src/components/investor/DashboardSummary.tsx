import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Building, 
  ArrowUpRight, 
  Wallet,
  PieChart
} from "lucide-react";

interface PortfolioSummary {
  totalInvestment: number;
  projectsInvested: number;
  roiEarned: number;
  walletBalance: number;
}

const DashboardSummary = () => {
  // Fetch portfolio summary data
  const { data: portfolio, isLoading, isError } = useQuery<PortfolioSummary>({
    queryKey: ['/api/investor/portfolio'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/investor/portfolio');
      return await res.json();
    },
  });

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Define summary items with icons and labels
  const summaryItems = [
    {
      key: 'totalInvestment',
      label: 'Total Investment',
      icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-50 dark:bg-blue-950',
      textColor: 'text-blue-700 dark:text-blue-300',
    },
    {
      key: 'projectsInvested',
      label: 'Projects Invested',
      icon: <Building className="h-6 w-6 text-purple-500" />,
      color: 'bg-purple-50 dark:bg-purple-950',
      textColor: 'text-purple-700 dark:text-purple-300',
      isCount: true,
    },
    {
      key: 'roiEarned',
      label: 'ROI Earned',
      icon: <ArrowUpRight className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50 dark:bg-green-950',
      textColor: 'text-green-700 dark:text-green-300',
    },
    {
      key: 'walletBalance',
      label: 'Wallet Balance',
      icon: <Wallet className="h-6 w-6 text-amber-500" />,
      color: 'bg-amber-50 dark:bg-amber-950',
      textColor: 'text-amber-700 dark:text-amber-300',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryItems.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[120px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !portfolio) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Unable to load portfolio summary. Please try again later.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryItems.map((item, index) => {
        const value = portfolio[item.key as keyof PortfolioSummary];
        const displayValue = item.isCount ? value : formatCurrency(value);
        
        return (
          <Card key={index} className={`${item.color} border-0`}>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-white">
                  {item.icon}
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </h3>
                <p className={`text-2xl font-bold ${item.textColor}`}>
                  {displayValue}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardSummary;