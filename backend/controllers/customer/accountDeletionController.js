const {
  getCustomerDeletionStatus,
  createCustomerDeletionRequest,
  cancelCustomerDeletionRequest
} = require("../../services/accountDeletionService");
const {
  notifyAdminNewDeletionRequest
} = require("../../services/notificationManagerService");

// Return the signed-in customer's live eligibility and current account deletion request status
const getMyAccountDeletionStatus = async (req, res) => {
  try {
    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Account deletion requests are only available for customer accounts."
      });
    }

    const statusData = await getCustomerDeletionStatus(req.user.userId);
    return res.status(200).json({
      success: true,
      message: "Account deletion eligibility loaded successfully.",
      data: statusData
    });
  } catch (error) {
    console.error("Failed to fetch customer deletion status:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to check your account deletion status right now."
    });
  }
};

// Submit a new customer account deletion request after verifying password and order/refund eligibility
const submitMyAccountDeletionRequest = async (req, res) => {
  try {
    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customer accounts can submit an account deletion request."
      });
    }

    const { password, reason } = req.body || {};
    const { request: createdRequest, eligibility } = await createCustomerDeletionRequest({
      userId: req.user.userId,
      password,
      reason
    });

    const io = req.app.get("io");
    notifyAdminNewDeletionRequest({
      io,
      request: createdRequest
    }).catch((notifyErr) => {
      console.error("[ACCOUNT DELETION NOTICE] Non-fatal notification error:", notifyErr.message);
    });

    return res.status(201).json({
      success: true,
      message: "Your account deletion request has been sent to the Administrator for review.",
      data: {
        request: createdRequest,
        eligibility
      }
    });
  } catch (error) {
    console.error("Failed to submit customer deletion request:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to submit your account deletion request right now.",
      details: error.details || null
    });
  }
};

// Cancel the signed-in customer's pending account deletion request before Admin reviews it
const cancelMyAccountDeletionRequest = async (req, res) => {
  try {
    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customer accounts can cancel an account deletion request."
      });
    }

    const cancelledRequest = await cancelCustomerDeletionRequest({
      userId: req.user.userId
    });

    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("admin_deletion_request_updated", {
        request: cancelledRequest
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your account deletion request has been cancelled. Your account remains active.",
      data: cancelledRequest
    });
  } catch (error) {
    console.error("Failed to cancel customer deletion request:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to cancel your account deletion request right now."
    });
  }
};

module.exports = {
  getMyAccountDeletionStatus,
  submitMyAccountDeletionRequest,
  cancelMyAccountDeletionRequest
};
