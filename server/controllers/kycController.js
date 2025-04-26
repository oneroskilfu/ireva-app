const KYC = require('../models/KYC');
const { sendNotificationEmail } = require('../services/emailService');

/**
 * Controller for KYC-related operations
 */

/**
 * Submit a new KYC application
 * @route POST /api/kyc/submit
 * @access Private
 */
exports.submitKYC = async (req, res) => {
  try {
    const {
      fullName,
      address,
      city,
      country,
      idDocumentType,
      idDocumentFile,
      proofOfAddressFile,
      cryptoWallet,
      sourceOfFunds,
      occupation,
      citizenship,
      isPEP,
      expectedInvestmentRange
    } = req.body;

    // Check if user already has a pending or approved KYC
    const existingKYC = await KYC.findOne({ 
      user: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingKYC) {
      return res.status(400).json({ 
        message: existingKYC.status === 'approved' 
          ? 'You already have an approved KYC application' 
          : 'You already have a pending KYC application'
      });
    }

    // Create new KYC application
    const newKYC = new KYC({
      user: req.user._id,
      fullName,
      address,
      city,
      country,
      idDocumentType,
      idDocumentUrl: idDocumentFile, // Ideally this would be a URL to the uploaded file
      proofOfAddressUrl: proofOfAddressFile, // Ideally this would be a URL to the uploaded file
      cryptoWallet,
      sourceOfFunds,
      occupation,
      citizenship,
      isPEP,
      expectedInvestmentRange,
      submissionIp: req.ip || req.connection.remoteAddress
    });

    await newKYC.save();

    // Notify admins of new KYC submission
    try {
      // Send email notification to admin
      await sendNotificationEmail({
        to: process.env.ADMIN_EMAIL || process.env.IREVA_EMAIL,
        subject: 'New KYC Application Submitted',
        text: `A new KYC application has been submitted by ${fullName} (User ID: ${req.user._id}) and is pending review.`,
        html: `
          <h2>New KYC Application Submitted</h2>
          <p>A new KYC application has been submitted and is pending review.</p>
          <p><strong>User:</strong> ${fullName}</p>
          <p><strong>User ID:</strong> ${req.user._id}</p>
          <p><strong>Country:</strong> ${country}</p>
          <p><strong>Investment Range:</strong> ${expectedInvestmentRange}</p>
          <p><strong>PEP Status:</strong> ${isPEP ? 'Is a PEP (High Risk)' : 'Not a PEP'}</p>
          <p>Please review this application in the admin dashboard.</p>
        `
      });
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to send KYC notification email:', emailError);
    }

    res.status(201).json({ 
      success: true,
      message: 'KYC application submitted successfully', 
      kyc: {
        id: newKYC._id,
        status: newKYC.status,
        submittedAt: newKYC.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit KYC application',
      error: error.message 
    });
  }
};

/**
 * Upload a document for KYC verification
 * @route POST /api/kyc/upload-document
 * @access Private
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // In a production environment, this would upload to S3/Azure/etc
    // and return a secure URL. For now, we'll just return a mock URL
    const documentUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({ 
      success: true,
      documentUrl,
      message: 'Document uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload document',
      error: error.message 
    });
  }
};

/**
 * Get the current user's KYC status
 * @route GET /api/kyc/status
 * @access Private
 */
exports.getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!kyc) {
      return res.status(200).json({ 
        status: 'not_submitted',
        message: 'No KYC application found'
      });
    }

    res.status(200).json({
      status: kyc.status,
      submittedAt: kyc.createdAt,
      updatedAt: kyc.updatedAt,
      reason: kyc.rejectionReason
    });
  } catch (error) {
    console.error('Error getting KYC status:', error);
    res.status(500).json({ 
      message: 'Failed to get KYC status',
      error: error.message 
    });
  }
};

/**
 * Admin endpoint to get all KYC applications (paginated, filtered)
 * @route GET /api/admin/kyc
 * @access Admin
 */
exports.getAllKYCApplications = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = status !== 'all' ? { status } : {};
    
    const applications = await KYC.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'email');

    const totalCount = await KYC.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      applications,
      totalCount,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting KYC applications:', error);
    res.status(500).json({ 
      message: 'Failed to get KYC applications',
      error: error.message 
    });
  }
};

/**
 * Admin endpoint to get all KYC submissions (simple version)
 * @route GET /api/admin/kyc/all
 * @access Admin
 */
exports.getAllKYCs = async (req, res) => {
  try {
    const kycs = await KYC.find()
      .sort({ createdAt: -1 })
      .populate('user', 'email firstName lastName');
    
    res.status(200).json(kycs);
  } catch (error) {
    console.error('Error fetching KYCs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * Admin endpoint to verify a KYC application
 * @route PATCH /api/admin/kyc/:id/verify
 * @access Admin
 */
exports.verifyKYCApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const kyc = await KYC.findById(id);

    if (!kyc) {
      return res.status(404).json({ message: 'KYC application not found' });
    }

    if (kyc.status !== 'pending') {
      return res.status(400).json({ 
        message: `KYC application is already ${kyc.status}` 
      });
    }

    kyc.status = status;
    
    if (status === 'rejected' && reason) {
      kyc.rejectionReason = reason;
    }
    
    kyc.verifiedBy = req.user._id;
    kyc.verifiedAt = Date.now();
    
    await kyc.save();

    // Notify user of KYC verification result
    try {
      // Get user email from populated field or via lookup
      const userEmail = kyc.user.email || 'user@example.com';
      
      await sendNotificationEmail({
        to: userEmail,
        subject: `KYC Verification ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        text: status === 'approved' 
          ? 'Your KYC application has been approved. You can now make cryptocurrency investments on the platform.'
          : `Your KYC application has been rejected. Reason: ${reason || 'Not specified'}`,
        html: status === 'approved'
          ? `
            <h2>KYC Verification Approved</h2>
            <p>Good news! Your KYC application has been approved.</p>
            <p>You can now make cryptocurrency investments on the platform.</p>
            <p>Thank you for using iREVA.</p>
          `
          : `
            <h2>KYC Verification Rejected</h2>
            <p>Unfortunately, your KYC application has been rejected.</p>
            <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
            <p>You can submit a new application with the correct information.</p>
            <p>If you believe this is an error, please contact our support team.</p>
          `
      });
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to send KYC verification email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: `KYC application ${status}`,
      kyc: {
        id: kyc._id,
        status: kyc.status,
        verifiedAt: kyc.verifiedAt
      }
    });
  } catch (error) {
    console.error('Error verifying KYC application:', error);
    res.status(500).json({ 
      message: 'Failed to verify KYC application',
      error: error.message 
    });
  }
};

/**
 * Admin endpoint to update KYC status (alternate naming convention)
 * @route PATCH /api/admin/kyc/:id/status
 * @access Admin
 */
exports.updateKYCStatus = async (req, res) => {
  try {
    const kycId = req.params.id;
    const { status, adminRemarks } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const kyc = await KYC.findById(kycId);
    
    if (!kyc) {
      return res.status(404).json({ message: 'KYC not found' });
    }

    // Update KYC document
    kyc.status = status;
    kyc.adminRemarks = adminRemarks;
    kyc.updatedAt = Date.now();
    
    // If this is a verification action (changing from pending to approved/rejected)
    if (kyc.status !== 'pending' && !kyc.verifiedAt) {
      kyc.verifiedBy = req.user._id;
      kyc.verifiedAt = Date.now();
      
      // If rejecting, store the admin remarks as rejection reason as well
      if (status === 'rejected' && adminRemarks) {
        kyc.rejectionReason = adminRemarks;
      }
      
      // Notify user via email
      try {
        const userEmail = kyc.user.email || 'user@example.com';
        
        await sendNotificationEmail({
          to: userEmail,
          subject: `KYC Verification ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          text: status === 'approved' 
            ? 'Your KYC application has been approved. You can now make cryptocurrency investments on the platform.'
            : `Your KYC application has been rejected. Reason: ${adminRemarks || 'Not specified'}`,
          html: status === 'approved'
            ? `
              <h2>KYC Verification Approved</h2>
              <p>Good news! Your KYC application has been approved.</p>
              <p>You can now make cryptocurrency investments on the platform.</p>
              <p>Thank you for using iREVA.</p>
            `
            : `
              <h2>KYC Verification Rejected</h2>
              <p>Unfortunately, your KYC application has been rejected.</p>
              <p><strong>Reason:</strong> ${adminRemarks || 'Not specified'}</p>
              <p>You can submit a new application with the correct information.</p>
              <p>If you believe this is an error, please contact our support team.</p>
            `
        });
      } catch (emailError) {
        console.error('Failed to send KYC verification email:', emailError);
      }
    }

    await kyc.save();
    
    res.status(200).json({ 
      success: true,
      message: 'KYC updated successfully',
      kyc: {
        id: kyc._id,
        status: kyc.status,
        updatedAt: kyc.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating KYC:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};