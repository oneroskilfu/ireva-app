const Investment = require('../models/Investment');
const User = require('../models/User');

exports.getRoiSummary = async (req, res) => {
  const investments = await Investment.find().populate('userId projectId');
  const summary = investments.map(inv => ({
    userEmail: inv.userId.email,
    projectTitle: inv.projectId.title,
    amount: inv.amount,
    roiPercentage: inv.roiPercentage,
    payoutDate: inv.payoutDate,
  }));
  res.json(summary);
};

exports.updateUserRoi = async (req, res) => {
  const { userId } = req.params;
  const { roiPercentage } = req.body;
  await Investment.updateMany({ userId }, { roiPercentage });
  res.json({ message: 'ROI updated for user' });
};
