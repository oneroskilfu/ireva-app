import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Home, 
  TrendingUp, 
  Calendar,
  User
} from 'lucide-react';

interface UserData {
  username: string;
  firstName?: string;
  lastName?: string;
  walletBalance?: number;
  role: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  
  useEffect(() => {
    // Get user data from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Investor Dashboard</h1>
        
        {user && (
          <div className="mb-6 p-4 bg-primary/10 rounded-md">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">
                Welcome, {user.firstName || user.username}!
              </h2>
            </div>
            <p className="text-muted-foreground">
              Account Type: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
            <p className="text-muted-foreground">
              Wallet Balance: ₦{user.walletBalance?.toLocaleString() || '0.00'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Investment
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦3,500,000</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Lagos, Abuja, Port Harcourt
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Current ROI
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14.3%</div>
              <p className="text-xs text-muted-foreground">
                Average return on investment
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Performance</CardTitle>
              <CardDescription>
                Your portfolio performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Lagos Waterfront Apartments</span>
                    </div>
                    <span className="text-sm font-medium">₦1,500,000</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Investment: 75% complete</span>
                    <span>ROI: 16.5%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Abuja Office Complex</span>
                    </div>
                    <span className="text-sm font-medium">₦1,200,000</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Investment: 45% complete</span>
                    <span>ROI: 12.8%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Port Harcourt Shopping Mall</span>
                    </div>
                    <span className="text-sm font-medium">₦800,000</span>
                  </div>
                  <Progress value={30} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Investment: 30% complete</span>
                    <span>ROI: 14.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>
                Schedule of your upcoming ROI payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Q2 Dividend Payment</p>
                      <p className="text-xs text-muted-foreground">Lagos Waterfront Apartments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₦65,000</p>
                    <p className="text-xs text-muted-foreground">May 15, 2025</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Q2 Dividend Payment</p>
                      <p className="text-xs text-muted-foreground">Abuja Office Complex</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₦38,400</p>
                    <p className="text-xs text-muted-foreground">June 10, 2025</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Q2 Dividend Payment</p>
                      <p className="text-xs text-muted-foreground">Port Harcourt Shopping Mall</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₦28,400</p>
                    <p className="text-xs text-muted-foreground">June 30, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}