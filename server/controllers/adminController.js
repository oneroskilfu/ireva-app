// Admin controller for escrow management and other admin operations

/**
 * Get all escrow projects for admin dashboard
 * @route GET /api/admin/escrow-projects
 * @access Private/Admin
 */
exports.getEscrowProjects = async (req, res) => {
  try {
    // In a real implementation, fetch projects from database or blockchain
    // For demonstration, we're using mock data
    const projects = [
      {
        id: 1,
        name: "Lagos Heights Residential Tower",
        goal: "5,000,000",
        raised: "3,750,000",
        status: "active",
        percentComplete: 75,
        nextMilestone: {
          id: 2,
          title: "Construction Phase 2",
          amount: "1,500,000",
          releaseDate: "2023-09-15",
          status: "pending"
        }
      },
      {
        id: 2,
        name: "Abuja Commercial Plaza",
        goal: "2,500,000",
        raised: "2,500,000",
        status: "successful",
        percentComplete: 100,
        nextMilestone: {
          id: 3,
          title: "Final Completion",
          amount: "750,000",
          releaseDate: "2023-07-30",
          status: "ready"
        }
      },
      {
        id: 3,
        name: "Port Harcourt Business Hub",
        goal: "3,200,000",
        raised: "1,250,000",
        status: "failed",
        percentComplete: 39,
        nextMilestone: null
      },
      {
        id: 4,
        name: "Gwagwalada Estate Phase 1",
        goal: "50,000",
        raised: "32,000",
        status: "active",
        percentComplete: 64,
        nextMilestone: {
          id: 5,
          title: "Infrastructure Development",
          amount: "15,000",
          releaseDate: "2023-10-20",
          status: "pending"
        }
      },
      {
        id: 5,
        name: "Abuja Smart City",
        goal: "75,000",
        raised: "75,000",
        status: "successful",
        percentComplete: 100,
        nextMilestone: {
          id: 6,
          title: "Final Phase Completion",
          amount: "25,000",
          releaseDate: "2023-08-10",
          status: "ready"
        }
      }
    ];

    res.json({ projects });
  } catch (error) {
    console.error("Error fetching escrow projects:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * Get escrow wallet balance for admin dashboard
 * @route GET /api/admin/escrow-wallet-balance
 * @access Private/Admin
 */
exports.getEscrowWalletBalance = async (req, res) => {
  try {
    // In a real implementation, fetch balance from blockchain or payment provider
    // For demonstration, we're using mock data
    const balance = {
      usdc: "3,750,000",
      eth: "1.25"
    };

    res.json({ balance });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};