const Investment = require('../models/Investment');
const Project = require('../models/Project');

exports.calculateROI = async (req, res) => {
  try {
    const { projectId, investmentAmount, investmentTerm } = req.body;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Simple ROI calculation based on project's target return
    const annualReturn = project.targetReturn / 100;
    const termInYears = investmentTerm / 12;
    
    // Calculate projected returns
    const projectedValue = investmentAmount * (1 + (annualReturn * termInYears));
    const totalGain = projectedValue - investmentAmount;
    const roi = (totalGain / investmentAmount) * 100;
    
    // Calculate monthly earnings
    const monthlyEarnings = totalGain / investmentTerm;
    
    res.json({
      initialInvestment: investmentAmount,
      projectedValue,
      totalGain,
      roi,
      monthlyEarnings,
      annualReturn: annualReturn * 100, // Convert back to percentage
      termInYears,
      termInMonths: investmentTerm
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInvestmentReturns = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('user', 'name email')
      .populate({
        path: 'project',
        select: 'name targetReturn',
        populate: {
          path: 'property',
          select: 'name location type'
        }
      });
    
    // Calculate current returns for each investment
    const investmentReturns = investments.map(investment => {
      const currentDate = new Date();
      const investmentDate = new Date(investment.investmentDate);
      const monthsActive = Math.max(0, (currentDate.getFullYear() - investmentDate.getFullYear()) * 12 + 
                              currentDate.getMonth() - investmentDate.getMonth());
      
      const annualReturn = investment.project.targetReturn / 100;
      const monthlyReturn = annualReturn / 12;
      const totalReturn = investment.amount * monthlyReturn * monthsActive;
      
      return {
        investmentId: investment._id,
        user: investment.user,
        project: investment.project,
        investmentAmount: investment.amount,
        investmentDate: investment.investmentDate,
        monthsActive,
        currentValue: investment.amount + totalReturn,
        totalReturn,
        returnPercentage: (totalReturn / investment.amount) * 100
      };
    });
    
    res.json(investmentReturns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};