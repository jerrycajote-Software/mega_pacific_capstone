const {
  listAdminDeletionRequests,
  getAdminDeletionRequestById,
  approveCustomerDeletionRequest,
  rejectCustomerDeletionRequest
} = require("../../services/accountDeletionService");
const {
  notifyCustomerDeletionApproved,
  notifyCustomerDeletionRejected
} = require("../../services/notificationManagerService");

// Return filtered customer account deletion requests and KPI counts for the Admin portal
const listAccountDeletionRequests = async (req, res) => {
  try {
    const { status, search } = req.query || {};
    const result = await listAdminDeletionRequests({ status, search });

    return res.status(200).json({
      success: true,
      message: "Account deletion requests loaded successfully.",
      data: result.requests,
      summary: result.summary
    });
  } catch (error) {
    console.error("Failed to list account deletion requests:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to load account deletion requests right now."
    });
  }
};

// Return full customer details and live order/refund eligibility checks for one request
const getAccountDeletionRequestDetail = async (req, res) => {
  try {
    const requestDetail = await getAdminDeletionRequestById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Account deletion request details loaded successfully.",
      data: requestDetail
    });
  } catch (error) {
    console.error("Failed to load account deletion request detail:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to load account deletion request details."
    });
  }
};

// Approve a customer deletion request after re-verifying there are no ongoing orders or pending refunds
const approveAccountDeletionRequest = async (req, res) => {
  try {
    const { adminNotes } = req.body || {};
    const { request: approvedRequest, originalEmail, customerName, reviewedAt } =
      await approveCustomerDeletionRequest({
        requestId: req.params.id,
        adminUserId: req.user?.userId,
        adminNotes
      });

    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("admin_deletion_request_updated", {
        request: approvedRequest
      });
    }

    notifyCustomerDeletionApproved({
      io,
      userId: approvedRequest.userId,
      customerEmail: originalEmail,
      customerName,
      adminNotes: approvedRequest.adminNotes,
      reviewedAt
    }).catch((notifyErr) => {
      console.error("[ACCOUNT DELETION APPROVED NOTICE] Non-fatal error:", notifyErr.message);
    });

    return res.status(200).json({
      success: true,
      message: `Account deletion approved for ${customerName}. The customer account has been deleted.`,
      data: approvedRequest
    });
  } catch (error) {
    console.error("Failed to approve account deletion request:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to approve this account deletion request.",
      details: error.details || null
    });
  }
};

// Reject a customer deletion request with a clear Admin explanation
const rejectAccountDeletionRequest = async (req, res) => {
  try {
    const { adminNotes } = req.body || {};
    const { request: rejectedRequest, originalEmail, customerName, reviewedAt } =
      await rejectCustomerDeletionRequest({
        requestId: req.params.id,
        adminUserId: req.user?.userId,
        adminNotes
      });

    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("admin_deletion_request_updated", {
        request: rejectedRequest
      });
    }

    notifyCustomerDeletionRejected({
      io,
      userId: rejectedRequest.userId,
      customerEmail: originalEmail,
      customerName,
      adminNotes: rejectedRequest.adminNotes,
      reviewedAt
    }).catch((notifyErr) => {
      console.error("[ACCOUNT DELETION REJECTED NOTICE] Non-fatal error:", notifyErr.message);
    });

    return res.status(200).json({
      success: true,
      message: `Account deletion request for ${customerName} has been rejected.`,
      data: rejectedRequest
    });
  } catch (error) {
    console.error("Failed to reject account deletion request:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to reject this account deletion request."
    });
  }
};

module.exports = {
  listAccountDeletionRequests,
  getAccountDeletionRequestDetail,
  approveAccountDeletionRequest,
  rejectAccountDeletionRequest
};
