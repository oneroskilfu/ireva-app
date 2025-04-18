// Sample ROI distribution data for dashboard
const roiDistributions = [
  {
    id: 'roi-001',
    projectId: 1,
    projectName: 'Skyline Apartments',
    investorId: 101,
    investorDetails: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    amount: 500000,
    roiPercentage: 12.5,
    distributionDate: new Date('2025-01-15'),
    distributionPeriod: 'Q1 2025',
    status: 'Completed',
    transactionReference: 'TRX-ROI-124578',
    notes: 'First quarter ROI distribution for Skyline Apartments project'
  },
  {
    id: 'roi-002',
    projectId: 2,
    projectName: 'Palm Estate',
    investorId: 102,
    investorDetails: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    },
    amount: 300000,
    roiPercentage: 10.8,
    distributionDate: new Date('2025-02-10'),
    distributionPeriod: 'Q1 2025',
    status: 'Completed',
    transactionReference: 'TRX-ROI-124982',
    notes: 'First quarter ROI distribution for Palm Estate project'
  },
  {
    id: 'roi-003',
    projectId: 3,
    projectName: 'Ocean View Residences',
    investorId: 103,
    investorDetails: {
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@example.com'
    },
    amount: 750000,
    roiPercentage: 13.2,
    distributionDate: new Date('2025-03-12'),
    distributionPeriod: 'Q1 2025',
    status: 'Completed',
    transactionReference: 'TRX-ROI-125034',
    notes: 'First quarter ROI distribution for Ocean View Residences project'
  },
  {
    id: 'roi-004',
    projectId: 1,
    projectName: 'Skyline Apartments',
    investorId: 104,
    investorDetails: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com'
    },
    amount: 420000,
    roiPercentage: 12.5,
    distributionDate: new Date('2025-04-15'),
    distributionPeriod: 'Q2 2025',
    status: 'Pending',
    transactionReference: 'TRX-ROI-125198',
    notes: 'Second quarter ROI distribution for Skyline Apartments project'
  },
  {
    id: 'roi-005',
    projectId: 2,
    projectName: 'Palm Estate',
    investorId: 105,
    investorDetails: {
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@example.com'
    },
    amount: 380000,
    roiPercentage: 10.8,
    distributionDate: new Date('2025-05-10'),
    distributionPeriod: 'Q2 2025',
    status: 'Pending',
    transactionReference: 'TRX-ROI-125437',
    notes: 'Second quarter ROI distribution for Palm Estate project'
  }
];

// Dashboard stats for ROI overview
const dashboardStats = {
  totalPaid: 12500000,
  pendingROI: 3200000,
  investorsPaid: 85,
  projectsActive: 6
};

// Chart data for monthly distributions
const chartData = [
  { month: 'Jan', roi: 1500000 },
  { month: 'Feb', roi: 1800000 },
  { month: 'Mar', roi: 1200000 },
  { month: 'Apr', roi: 2000000 },
  { month: 'May', roi: 2500000 },
  { month: 'Jun', roi: 3500000 }
];

// Table data for ROI distributions
const tableData = [
  {
    investor: 'John Doe',
    project: 'CityView Estate',
    amount: '₦500,000',
    status: 'Paid',
    date: '2025-04-01'
  },
  {
    investor: 'Jane Smith',
    project: 'Palm Estate',
    amount: '₦300,000',
    status: 'Pending',
    date: '2025-04-10'
  },
  {
    investor: 'Michael Johnson',
    project: 'Skyline Apartments',
    amount: '₦850,000',
    status: 'Paid',
    date: '2025-03-15'
  },
  {
    investor: 'Sarah Williams',
    project: 'Ocean View Residences',
    amount: '₦420,000',
    status: 'Pending',
    date: '2025-04-22'
  },
  {
    investor: 'David Brown',
    project: 'Green Valley Estate',
    amount: '₦650,000',
    status: 'Paid',
    date: '2025-02-28'
  }
];

// ROI summary stats (keeping for compatibility)
const roiStats = {
  totalDistributed: 2350000,
  avgRoiPercentage: 12.8,
  activeInvestors: 324,
  nextDistributionDate: new Date('2025-05-02'),
  totalProjects: 8,
  monthlyDistribution: [
    { month: 'Jan', amount: 2400000 },
    { month: 'Feb', amount: 1800000 },
    { month: 'Mar', amount: 3200000 },
    { month: 'Apr', amount: 2780000 },
    { month: 'May', amount: 1890000 },
    { month: 'Jun', amount: 3390000 }
  ]
};

module.exports = {
  roiDistributions,
  roiStats,
  dashboardStats,
  chartData,
  tableData
};