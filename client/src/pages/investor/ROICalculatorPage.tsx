import React from 'react';
import { Helmet } from 'react-helmet-async';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import ROICalculator from '@/components/ROICalculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

const ROICalculatorPage: React.FC = () => {
  return (
    <InvestorLayout>
      <Helmet>
        <title>ROI Calculator | iREVA</title>
      </Helmet>
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ROI Calculator</h1>
          <p className="text-muted-foreground">
            Calculate potential returns on your real estate investments
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-2xl">
                <Calculator className="mr-2 h-6 w-6" />
                Investment Return Calculator
              </CardTitle>
              <CardDescription>
                Estimate your potential returns based on different investment scenarios and timeframes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ROICalculator />
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This calculator helps you estimate potential returns from your real estate investments with iREVA.
                You can adjust various parameters to see how they affect your returns:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Investment Amount:</strong> The total amount you plan to invest</li>
                <li><strong>Annual Return Rate:</strong> Expected annual return percentage</li>
                <li><strong>Investment Duration:</strong> How long you plan to keep your investment (in months)</li>
                <li><strong>Calculation Mode:</strong> Simple or compound interest calculation</li>
                <li><strong>Projection Type:</strong> Conservative, realistic, or optimistic scenarios</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Note: These calculations are estimates and actual returns may vary. Past performance is not indicative of future results.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </InvestorLayout>
  );
};

export default ROICalculatorPage;