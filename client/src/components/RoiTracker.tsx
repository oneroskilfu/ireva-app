import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth.js';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area, AreaChart, BarChart, Bar
} from 'recharts';

interface RoiDataPoint {
  date: string;
  roi: number;
  projectedRoi?: number;
  investment?: number;
  returns?: number;
}

const RoiTracker = () => {
  const [roiData, setRoiData] = useState<RoiDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('1y');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  const { toast } = useToast();

  useEffect(() => {
    const fetchROI = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/api/investments/roi?timeframe=${timeframe}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setRoiData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ROI data:', err);
        setError('Failed to load ROI data. Please try again later.');
        setLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to fetch ROI data',
          variant: 'destructive',
        });
      }
    };
    
    fetchROI();
  }, [timeframe, toast]);

  // Calculate summary metrics
  const calculateMetrics = () => {
    if (!roiData || roiData.length === 0) return { current: 0, average: 0, trend: 0 };
    
    const current = roiData[roiData.length - 1]?.roi || 0;
    const sum = roiData.reduce((acc, item) => acc + item.roi, 0);
    const average = sum / roiData.length;
    
    // Calculate trend (positive or negative)
    const firstHalf = roiData.slice(0, Math.floor(roiData.length / 2));
    const secondHalf = roiData.slice(Math.floor(roiData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((acc, item) => acc + item.roi, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((acc, item) => acc + item.roi, 0) / secondHalf.length;
    
    const trend = secondHalfAvg - firstHalfAvg;
    
    return { current, average, trend };
  };

  const metrics = calculateMetrics();

  const getTimeframeText = () => {
    switch (timeframe) {
      case '1m': return 'Last Month';
      case '3m': return 'Last 3 Months';
      case '6m': return 'Last 6 Months';
      case '1y': return 'Last Year';
      case 'all': return 'All Time';
      default: return 'Last Year';
    }
  };

  const renderChart = () => {
    // Default chart if there's no data
    if (!roiData || roiData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <p>No data available for this timeframe</p>
        </div>
      );
    }
    
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={roiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="roi" name="Actual ROI %" stroke="#00a86b" strokeWidth={2} dot={{ r: 4 }} />
            {roiData[0]?.projectedRoi && (
              <Line type="monotone" dataKey="projectedRoi" name="Projected ROI %" stroke="#8884d8" strokeDasharray="5 5" />
            )}
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart data={roiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="roi" name="Actual ROI %" stroke="#00a86b" fill="#00a86b" fillOpacity={0.3} />
            {roiData[0]?.projectedRoi && (
              <Area type="monotone" dataKey="projectedRoi" name="Projected ROI %" stroke="#8884d8" fill="#8884d8" fillOpacity={0.1} />
            )}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart data={roiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="roi" name="Actual ROI %" fill="#00a86b" />
            {roiData[0]?.projectedRoi && (
              <Bar dataKey="projectedRoi" name="Projected ROI %" fill="#8884d8" />
            )}
          </BarChart>
        );
      
      default:
        return (
          <AreaChart data={roiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="roi" name="Actual ROI %" stroke="#00a86b" fill="#00a86b" fillOpacity={0.3} />
          </AreaChart>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl ml-72">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">ROI Tracker</h1>
          <p className="text-gray-500">Track your investment returns over time</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="all">All Time</option>
          </select>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Current ROI</p>
              <h3 className="text-2xl font-bold">{metrics.current.toFixed(2)}%</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium flex items-center ${metrics.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.trend >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(metrics.trend).toFixed(2)}% 
            </span>
            <span className="text-gray-500 text-sm ml-1.5">vs previous period</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average ROI</p>
              <h3 className="text-2xl font-bold">{metrics.average.toFixed(2)}%</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-500 text-sm">
              For {getTimeframeText().toLowerCase()} period
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Returns</p>
              <h3 className="text-2xl font-bold">₦{roiData.reduce((acc, item) => acc + (item.returns || 0), 0).toLocaleString()}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-500 text-sm">
              On ₦{roiData.reduce((acc, item) => acc + (item.investment || 0), 0).toLocaleString()} invested
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">ROI Performance ({getTimeframeText()})</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : roiData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <TrendingUp className="h-12 w-12 mb-2" />
            <p>No ROI data available for this timeframe</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Data Table</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI (%)
                  </th>
                  {roiData[0]?.projectedRoi && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projected ROI (%)
                    </th>
                  )}
                  {roiData[0]?.investment && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investment (₦)
                    </th>
                  )}
                  {roiData[0]?.returns && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Returns (₦)
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roiData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${row.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {row.roi.toFixed(2)}%
                    </td>
                    {roiData[0]?.projectedRoi && (
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {row.projectedRoi?.toFixed(2)}%
                      </td>
                    )}
                    {roiData[0]?.investment && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₦{row.investment?.toLocaleString()}
                      </td>
                    )}
                    {roiData[0]?.returns && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₦{row.returns?.toLocaleString()}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoiTracker;