import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Calculator, PieChart, LineChart, Wallet, TrendingUp, PiggyBank } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ROIResult {
  totalInvestment: number;
  totalReturns: number;
  netProfit: number;
  roi: number;
  monthlyReturns: number[];
  annualReturns: number[];
}

const ROICalculator = () => {
  const { toast } = useToast();
  const [calculationMode, setCalculationMode] = useState<'simple' | 'compound'>('simple');
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000000);
  const [annualRate, setAnnualRate] = useState<number>(12.5);
  const [duration, setDuration] = useState<number>(36);
  const [reinvestment, setReinvestment] = useState<number>(0);
  const [projectionType, setProjectionType] = useState<'optimistic' | 'realistic' | 'conservative'>('realistic');
  const [result, setResult] = useState<ROIResult | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Rate adjustment based on projection type
  const getRateAdjustment = () => {
    switch (projectionType) {
      case 'optimistic': return 1.2; // 20% higher
      case 'conservative': return 0.8; // 20% lower
      case 'realistic': default: return 1;
    }
  };

  // Calculate ROI
  const calculateROI = () => {
    if (!investmentAmount || !annualRate || !duration) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to calculate ROI",
        variant: "destructive",
      });
      return;
    }

    // Validate inputs
    if (investmentAmount <= 0 || annualRate <= 0 || duration <= 0) {
      toast({
        title: "Invalid input",
        description: "All values must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    // Adjust rate based on projection type
    const adjustedRate = annualRate * getRateAdjustment();
    const monthlyRate = adjustedRate / 12 / 100;
    const totalMonths = duration;
    const monthlyReinvestmentRate = reinvestment / 100;

    let totalReturns = 0;
    let currentPrincipal = investmentAmount;
    const monthlyReturns: number[] = [];
    const annualReturns: number[] = [0]; // Starting with 0 for the initial investment

    if (calculationMode === 'simple') {
      // Simple interest calculation
      for (let month = 1; month <= totalMonths; month++) {
        const monthlyReturn = currentPrincipal * monthlyRate;
        const reinvestedAmount = monthlyReturn * monthlyReinvestmentRate;
        
        totalReturns += monthlyReturn;
        currentPrincipal += reinvestedAmount;
        
        monthlyReturns.push(monthlyReturn);
        
        // Track annual returns
        if (month % 12 === 0) {
          const yearIndex = month / 12;
          annualReturns[yearIndex] = totalReturns;
        }
      }
    } else {
      // Compound interest calculation
      for (let month = 1; month <= totalMonths; month++) {
        const monthlyReturn = currentPrincipal * monthlyRate;
        const reinvestedAmount = monthlyReturn * monthlyReinvestmentRate;
        
        totalReturns += monthlyReturn;
        currentPrincipal += reinvestedAmount;
        
        monthlyReturns.push(monthlyReturn);
        
        // Track annual returns
        if (month % 12 === 0) {
          const yearIndex = month / 12;
          annualReturns[yearIndex] = totalReturns;
        }
      }
    }

    const roi = (totalReturns / investmentAmount) * 100;
    const netProfit = totalReturns;

    setResult({
      totalInvestment: investmentAmount,
      totalReturns,
      netProfit,
      roi,
      monthlyReturns,
      annualReturns
    });

    setShowDetails(true);
  };

  // Format currency in Naira
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-6 w-6" />
          <span>Investment ROI Calculator</span>
        </CardTitle>
        <CardDescription>
          Estimate your real estate investment returns based on different scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="results" disabled={!result}>Results</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calculation-mode">Calculation Method</Label>
                  <Select 
                    defaultValue={calculationMode}
                    onValueChange={(value) => setCalculationMode(value as 'simple' | 'compound')}
                  >
                    <SelectTrigger id="calculation-mode">
                      <SelectValue placeholder="Select calculation method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="simple">Simple Interest</SelectItem>
                        <SelectItem value="compound">Compound Interest</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="investment-amount">
                    Investment Amount (₦) - {formatNaira(investmentAmount)}
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="investment-amount"
                      min={100000}
                      max={50000000}
                      step={100000}
                      value={[investmentAmount]}
                      onValueChange={(value) => setInvestmentAmount(value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                      className="w-28"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="annual-rate">
                    Annual Rate (%) - {annualRate.toFixed(1)}%
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="annual-rate"
                      min={1}
                      max={30}
                      step={0.5}
                      value={[annualRate]}
                      onValueChange={(value) => setAnnualRate(value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={annualRate}
                      onChange={(e) => setAnnualRate(Number(e.target.value))}
                      className="w-28"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="duration">
                    Duration (Months) - {duration} months
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="duration"
                      min={1}
                      max={60}
                      step={1}
                      value={[duration]}
                      onValueChange={(value) => setDuration(value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-28"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reinvestment">
                    Monthly Reinvestment (%) - {reinvestment}%
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="reinvestment"
                      min={0}
                      max={100}
                      step={10}
                      value={[reinvestment]}
                      onValueChange={(value) => setReinvestment(value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={reinvestment}
                      onChange={(e) => setReinvestment(Number(e.target.value))}
                      className="w-28"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="projection-type">Projection Type</Label>
                  <Select 
                    defaultValue={projectionType}
                    onValueChange={(value) => setProjectionType(value as 'optimistic' | 'realistic' | 'conservative')}
                  >
                    <SelectTrigger id="projection-type">
                      <SelectValue placeholder="Select projection type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="optimistic">Optimistic</SelectItem>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="conservative">Conservative</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button onClick={calculateROI} className="w-full mt-6">
              Calculate ROI
            </Button>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {result && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Wallet className="h-4 w-4 mr-2" />
                        Investment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">{formatNaira(result.totalInvestment)}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Total Returns
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">{formatNaira(result.totalReturns)}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <PiggyBank className="h-4 w-4 mr-2" />
                        Net Profit
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">{formatNaira(result.netProfit)}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <PieChart className="h-4 w-4 mr-2" />
                        ROI
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-2xl font-bold">{result.roi.toFixed(2)}%</p>
                    </CardContent>
                  </Card>
                </div>

                {showDetails && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Annual Returns Breakdown</h3>
                    <Table>
                      <TableCaption>Projected returns over the investment period</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Year</TableHead>
                          <TableHead className="text-right">Cumulative Return</TableHead>
                          <TableHead className="text-right">ROI</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.annualReturns.map((annual, index) => (
                          index > 0 && (
                            <TableRow key={index}>
                              <TableCell>Year {index}</TableCell>
                              <TableCell className="text-right">{formatNaira(annual)}</TableCell>
                              <TableCell className="text-right">
                                {((annual / result.totalInvestment) * 100).toFixed(2)}%
                              </TableCell>
                            </TableRow>
                          )
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          {projectionType === 'optimistic' && "Optimistic projections assume higher than average market performance."}
          {projectionType === 'realistic' && "Realistic projections are based on typical market performance."}
          {projectionType === 'conservative' && "Conservative projections assume lower than average market performance."}
        </p>
      </CardFooter>
    </Card>
  );
};

export default ROICalculator;