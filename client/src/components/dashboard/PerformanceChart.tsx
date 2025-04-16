import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property, Investment } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

interface MonthlyData {
  name: string;
  sales: number;
  target: number;
}

export default function PerformanceChart() {
  const { data: investments } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  const [selectedMonth, setSelectedMonth] = useState<string>("Jul");
  
  if (!investments || investments.length === 0) {
    return (
      <div className="bg-slate-800 text-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-semibold">Performance vs Target</h4>
        </div>
        <div className="py-8 text-center text-slate-300">
          No investment performance data available yet.
        </div>
      </div>
    );
  }
  
  // Generate sample data for the chart
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const currentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  
  // Generate monthly performance data (including past and projected future)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  const performanceData: MonthlyData[] = months.map((month, index) => {
    // Simulate growth pattern with variation
    const isPast = index <= currentMonth;
    const baseGrowth = 0.7 + (index * 0.05); // Slightly increased growth each month
    const randomVariation = Math.random() * 0.2 - 0.1; // -0.1 to +0.1
    
    // Target always grows steadily
    const targetGrowth = 0.75 + (index * 0.04);
    
    // For past months, create variation around target (sometimes above, sometimes below)
    // For future months, just show the target
    return {
      name: month,
      sales: isPast ? totalInvested * (baseGrowth + randomVariation) : 0,
      target: totalInvested * targetGrowth,
    };
  });
  
  // Get data for the selected month
  const selectedMonthData = performanceData.find(data => data.name === selectedMonth);
  const isAboveTarget = selectedMonthData && selectedMonthData.sales > selectedMonthData.target;
  
  // Calculate percentage above/below target
  const percentageDiff = selectedMonthData 
    ? ((selectedMonthData.sales - selectedMonthData.target) / selectedMonthData.target) * 100
    : 0;
  
  return (
    <div className="bg-slate-800 text-white rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">Performance vs Target</h4>
        <div className="flex items-center">
          <button className="h-8 w-8 flex items-center justify-center rounded-full text-slate-300 hover:bg-slate-700">
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h5 className="text-sm text-slate-400 mb-1">Total Sales:</h5>
          <div className="text-xl font-bold">₦{Math.round(currentValue).toLocaleString()}</div>
        </div>
        <div>
          <h5 className="text-sm text-slate-400 mb-1">Total Target:</h5>
          <div className="text-xl font-bold">₦{Math.round(totalInvested * 1.1).toLocaleString()}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm text-slate-400 mb-1">{selectedMonth} 2024</h4>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold">₦{(selectedMonthData?.sales || 0).toLocaleString()}</div>
            <div className="flex items-center">
              <div className={`flex items-center ${isAboveTarget ? 'text-green-400' : 'text-red-400'}`}>
                {isAboveTarget ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="text-sm">{Math.abs(percentageDiff).toFixed(1)}%</span>
              </div>
              <span className="text-xs text-slate-400 ml-2">vs target</span>
            </div>
          </div>
          <div>
            <div className="text-lg font-medium">₦{(selectedMonthData?.target || 0).toLocaleString()}</div>
            <span className="text-xs text-slate-400">Target</span>
          </div>
        </div>
      </div>
      
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={performanceData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
            />
            <YAxis 
              hide={true}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1E293B', 
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white'
              }}
              itemStyle={{ color: 'white' }}
              formatter={(value: number) => [`₦${value.toLocaleString()}`, '']}
              labelFormatter={(label) => `${label} 2024`}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#8884d8" 
              strokeWidth={3}
              dot={{ r: 0 }}
              activeDot={{ r: 5, stroke: '#8884d8', strokeWidth: 2, fill: '#111827' }}
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#4ADE80" 
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}