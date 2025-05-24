import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { useApiRequest } from '../../../hooks/useApiRequest';
import { useToast } from '../../../hooks/use-toast';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { useReactToPdf } from 'react-to-pdf';

import ROITimelineChart from '../../../components/charts/ROITimelineChart';
import WalletActivityChart from '../../../components/charts/WalletActivityChart';
import ProjectParticipationChart from '../../../components/charts/ProjectParticipationChart';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Label,
  Input,
  Switch,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Badge,
  Separator,
} from '../../../components/ui/DesignSystem';

import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

const InvestorReportDashboard = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  const { toast } = useToast();
  const reportRef = useRef();
  
  // State for report configuration
  const [selectedTimeframe, setSelectedTimeframe] = useState('last_6_months');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('monthly');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  
  // PDF generation hook
  const { toPdf, targetRef } = useReactToPdf({
    filename: `iREVA_Investment_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
    options: {
      format: 'a4',
      orientation: 'portrait',
      unit: 'mm',
    },
  });
  
  // Get ROI timeline data
  const {
    data: roiData,
    isLoading: isLoadingRoi
  } = useQuery({
    queryKey: ['/api/insights/roi-history', selectedTimeframe],
    queryFn: async () => {
      const response = await api.get(`insights/roi-history?timeframe=${selectedTimeframe}`);
      return response.data.data;
    }
  });
  
  // Get wallet activity data
  const {
    data: walletData,
    isLoading: isLoadingWallet
  } = useQuery({
    queryKey: ['/api/insights/wallet-activity', selectedTimeframe],
    queryFn: async () => {
      const response = await api.get(`insights/wallet-activity?timeframe=${selectedTimeframe}`);
      return response.data.data;
    }
  });
  
  // Get project participation data
  const {
    data: projectData,
    isLoading: isLoadingProjects
  } = useQuery({
    queryKey: ['/api/insights/project-participation'],
    queryFn: async () => {
      const response = await api.get('insights/project-participation');
      return response.data.data;
    }
  });
  
  // Schedule report mutation
  const scheduleReportMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('insights/schedule-report', data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Report Scheduled',
        description: `You will receive ${scheduleFrequency} reports at ${emailAddress}`,
        variant: 'success',
      });
      setShowEmailDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Schedule Failed',
        description: error.response?.data?.message || 'Failed to schedule report',
        variant: 'destructive',
      });
    }
  });
  
  // Send one-time email report mutation
  const emailReportMutation = useMutation({
    mutationFn: async (data) => {
      setIsEmailing(true);
      const response = await api.post('insights/email-report', data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Report Sent',
        description: `Report has been sent to ${emailAddress}`,
        variant: 'success',
      });
      setShowEmailDialog(false);
      setIsEmailing(false);
    },
    onError: (error) => {
      toast({
        title: 'Email Failed',
        description: error.response?.data?.message || 'Failed to send report',
        variant: 'destructive',
      });
      setIsEmailing(false);
    }
  });
  
  // Download report handler
  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      
      if (reportFormat === 'pdf') {
        await toPdf();
      } else if (reportFormat === 'csv') {
        // Request CSV from the server
        const response = await api.get(`insights/export-csv?timeframe=${selectedTimeframe}`, {
          responseType: 'blob'
        });
        
        // Create a download link
        saveAs(response.data, `iREVA_Investment_Data_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      }
      
      toast({
        title: 'Report Downloaded',
        description: `Your ${reportFormat.toUpperCase()} report has been downloaded successfully`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading your report',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Email report handler
  const handleEmailReport = () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    
    if (scheduleEnabled) {
      // Schedule recurring reports
      scheduleReportMutation.mutate({
        email: emailAddress,
        frequency: scheduleFrequency,
        format: reportFormat,
        timeframe: selectedTimeframe
      });
    } else {
      // Send one-time report
      emailReportMutation.mutate({
        email: emailAddress,
        format: reportFormat,
        timeframe: selectedTimeframe
      });
    }
  };
  
  // Generate dummy data if real data is not available yet
  const getDummyROIData = () => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        roi: 5 + Math.random() * 3,
        investmentAmount: 10000 + Math.random() * 5000,
        returnAmount: (10000 + Math.random() * 5000) * (1 + (5 + Math.random() * 3) / 100)
      });
    }
    
    const predictions = [];
    for (let i = 1; i <= 3; i++) {
      const date = new Date();
      date.setMonth(today.getMonth() + i);
      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedRoi: 6 + Math.random() * 3
      });
    }
    
    return { data, predictions };
  };
  
  const getDummyWalletData = () => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        deposits: Math.round(1000 + Math.random() * 4000),
        withdrawals: Math.round(500 + Math.random() * 2000),
        investments: Math.round(2000 + Math.random() * 3000),
        transactionCount: Math.round(3 + Math.random() * 7)
      });
    }
    return data;
  };
  
  const getDummyProjectData = () => {
    return [
      { name: 'Oakwood Residences', value: 15000, roi: 7.2, status: 'Active' },
      { name: 'Marina Heights', value: 25000, roi: 8.5, status: 'Active' },
      { name: 'Parkview Condos', value: 10000, roi: 6.8, status: 'Funded' },
      { name: 'City Center Plaza', value: 20000, roi: 7.8, status: 'Active' },
      { name: 'Riverside Development', value: 30000, roi: 9.1, status: 'Funded' }
    ];
  };
  
  // Use real data if available, otherwise use dummy data
  const roiChartData = roiData?.roiHistory || getDummyROIData().data;
  const roiPredictions = roiData?.predictions || getDummyROIData().predictions;
  const walletChartData = walletData?.activities || getDummyWalletData();
  const projectChartData = projectData?.investments || getDummyProjectData();
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Investment Reports</h1>
          <p className="text-gray-600">Detailed analytics and performance reports for your investments</p>
        </div>
        <div className="flex gap-3">
          <Select value={reportFormat} onValueChange={setReportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleDownloadReport} 
            disabled={isDownloading}
            className="flex items-center gap-2"
          >
            {isDownloading ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="h-4 w-4" />
            )}
            <span>Download</span>
          </Button>
          
          <Button 
            onClick={() => setShowEmailDialog(true)}
            className="flex items-center gap-2"
          >
            <EnvelopeIcon className="h-4 w-4" />
            <span>Email Report</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="bg-gray-50 border rounded-md p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Report Timeframe</h2>
            <p className="text-sm text-gray-600">Select the period for your investment report</p>
          </div>
          <div className="w-64">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Report content - this div will be used for PDF export */}
        <div ref={targetRef} className="space-y-6 p-4 bg-white">
          {/* Report header - only visible in PDF */}
          <div className="print-only mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">iREVA Investment Report</h1>
              <p className="text-gray-600">{format(new Date(), 'MMMM d, yyyy')}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-gray-600">Investor:</p>
                <p className="font-medium">{user?.name || 'John Doe'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account:</p>
                <p className="font-medium">{user?.email || 'john.doe@example.com'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Timeframe:</p>
                <p className="font-medium">
                  {selectedTimeframe === 'last_month' && 'Last Month'}
                  {selectedTimeframe === 'last_3_months' && 'Last 3 Months'}
                  {selectedTimeframe === 'last_6_months' && 'Last 6 Months'}
                  {selectedTimeframe === 'last_year' && 'Last Year'}
                  {selectedTimeframe === 'all_time' && 'All Time'}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
          </div>
          
          {/* ROI Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle>ROI Timeline</CardTitle>
              <CardDescription>
                Your return on investment over time with future projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRoi ? (
                <div className="flex justify-center py-20">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="h-80">
                  <ROITimelineChart 
                    data={roiChartData} 
                    predictions={roiPredictions}
                    height={300}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="w-full flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span>Average ROI:</span>
                  <span className="font-medium">
                    {roiChartData.length > 0
                      ? (roiChartData.reduce((sum, item) => sum + item.roi, 0) / roiChartData.length).toFixed(2) + '%'
                      : '0.00%'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Projected ROI (3 Months):</span>
                  <span className="font-medium">
                    {roiPredictions.length > 0
                      ? (roiPredictions.reduce((sum, item) => sum + item.predictedRoi, 0) / roiPredictions.length).toFixed(2) + '%'
                      : '0.00%'
                    }
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Wallet Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Activity</CardTitle>
              <CardDescription>
                Your wallet transactions over time including deposits, withdrawals, and investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWallet ? (
                <div className="flex justify-center py-20">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="h-80">
                  <WalletActivityChart 
                    data={walletChartData}
                    height={300}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="w-full grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-xs text-gray-600">Total Deposits</p>
                  <p className="text-lg font-medium text-green-600">
                    ${walletChartData.reduce((sum, item) => sum + item.deposits, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-md">
                  <p className="text-xs text-gray-600">Total Withdrawals</p>
                  <p className="text-lg font-medium text-red-600">
                    ${walletChartData.reduce((sum, item) => sum + item.withdrawals, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-xs text-gray-600">Total Investments</p>
                  <p className="text-lg font-medium text-blue-600">
                    ${walletChartData.reduce((sum, item) => sum + item.investments, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Project Participation Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Project Participation</CardTitle>
              <CardDescription>
                Breakdown of your investments across different projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProjects ? (
                <div className="flex justify-center py-20">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="h-80">
                  <ProjectParticipationChart 
                    data={projectChartData}
                    height={300}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Total Invested:</span>
                  <span className="font-medium">
                    ${projectChartData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Investment Count:</span>
                  <span className="font-medium">
                    {projectChartData.length} project{projectChartData.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Investment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
              <CardDescription>
                Quick overview of your investment portfolio performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-sm">Total Invested</span>
                    <span className="font-medium">
                      ${projectChartData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-sm">Average ROI</span>
                    <span className="font-medium">
                      {projectChartData.length > 0
                        ? (projectChartData.reduce((sum, item) => sum + item.roi, 0) / projectChartData.length).toFixed(2) + '%'
                        : '0.00%'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-sm">Highest Performing Project</span>
                    <span className="font-medium">
                      {projectChartData.length > 0
                        ? projectChartData.reduce((prev, current) => 
                            (prev.roi > current.roi) ? prev : current
                          ).name
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-sm">Total Projects</span>
                    <span className="font-medium">
                      {projectChartData.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-sm">Active Projects</span>
                    <span className="font-medium">
                      {projectChartData.filter(p => p.status === 'Active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-sm">Total Projected Returns</span>
                    <span className="font-medium">
                      ${projectChartData
                        .reduce((sum, item) => sum + (item.value * (1 + item.roi / 100)), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Report Footer - only visible in PDF */}
          <div className="print-only mt-8">
            <Separator className="mb-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <p>Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
              <p>iREVA Platform - Investment Report</p>
              <p>Page 1 of 1</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Email Report Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Investment Report</DialogTitle>
            <DialogDescription>
              Get your investment report delivered to your email inbox
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="your.email@example.com"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="format" className="text-right">
                Format
              </Label>
              <Select
                value={reportFormat}
                onValueChange={setReportFormat}
                className="col-span-3"
              >
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="schedule">Schedule</Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="schedule"
                  checked={scheduleEnabled}
                  onCheckedChange={setScheduleEnabled}
                />
                <Label htmlFor="schedule">
                  Send recurring reports
                </Label>
              </div>
            </div>
            
            {scheduleEnabled && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <Select
                  value={scheduleFrequency}
                  onValueChange={setScheduleFrequency}
                  className="col-span-3"
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEmailReport}
              disabled={isEmailing}
              className="flex items-center gap-2"
            >
              {isEmailing ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <EnvelopeIcon className="h-4 w-4" />
              )}
              {scheduleEnabled ? 'Schedule Reports' : 'Send Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestorReportDashboard;