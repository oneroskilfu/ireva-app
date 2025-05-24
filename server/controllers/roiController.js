const roiData = require('../data/roiMockData');

// Get dashboard summary stats for ROI overview component
exports.getROIDashboardStats = (req, res) => {
  try {
    const stats = roiData.dashboardStats;
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching ROI stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ROI dashboard statistics'
    });
  }
};

// Get chart data for monthly distributions
exports.getROIChartData = (req, res) => {
  try {
    const chartData = roiData.chartData;
    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Error fetching ROI chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ROI chart data'
    });
  }
};

// Get table data for ROI distributions
exports.getROITableData = (req, res) => {
  try {
    const { search, status, project, page = 1, limit = 10 } = req.query;
    let tableData = [...roiData.tableData];

    // Filter by search term (investor name)
    if (search) {
      const searchLower = search.toLowerCase();
      tableData = tableData.filter(item => 
        item.investor.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (status) {
      tableData = tableData.filter(item => 
        item.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter by project
    if (project) {
      tableData = tableData.filter(item => 
        item.project.toLowerCase().includes(project.toLowerCase())
      );
    }

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = tableData.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      totalCount: tableData.length,
      page: Number(page),
      limit: Number(limit),
      data: paginatedData
    });
  } catch (error) {
    console.error('Error fetching ROI table data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ROI distribution table data'
    });
  }
};

// Trigger ROI payout to investors
exports.triggerROIPayout = (req, res) => {
  try {
    const { projectId, roiPercentage, distributionPeriod, notes } = req.body;
    
    // In a real implementation, this would:
    // 1. Calculate ROI for each investor in the project
    // 2. Create transaction records
    // 3. Send email notifications to investors
    // 4. Update investment records with new ROI data
    
    // For demo purposes, we'll just return success
    res.status(200).json({
      success: true,
      message: 'ROI payout process initiated successfully',
      data: {
        projectId,
        roiPercentage,
        distributionPeriod,
        timestamp: new Date(),
        status: 'Processing'
      }
    });
  } catch (error) {
    console.error('Error triggering ROI payout:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering ROI payout'
    });
  }
};

// Get logs of ROI distributions (for admin dashboard)
exports.getROIDistributionLogs = async (req, res) => {
  try {
    // In a real implementation, this would fetch distribution logs from the database
    // For demo purposes, we'll return the distribution data
    res.status(200).json({
      success: true,
      data: roiData.roiDistributions
    });
  } catch (error) {
    console.error('Error fetching ROI distribution logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ROI distribution logs'
    });
  }
};