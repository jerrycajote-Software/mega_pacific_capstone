const {
  createStaffSupportThread,
  listStaffSupportThreads,
  getStaffSupportThreadById,
  addStaffSupportMessage,
  markStaffSupportThreadRead,
  updateStaffSupportThreadStatus,
  getStaffSupportUnreadSummary
} = require("../services/staffSupportService");
const {
  notifyAdminNewStaffSupportThread,
  notifyAdminStaffSupportReply,
  notifyStaffAdminSupportReply,
  notifyStaffSupportStatusChanged
} = require("../services/notificationManagerService");

// Return unread conversation counts for sidebar navigation badges
const getStaffSupportUnreadBadge = async (req, res) => {
  try {
    const summary = await getStaffSupportUnreadSummary({
      userId: req.user?.userId,
      role: req.user?.role
    });
    return res.status(200).json({
      success: true,
      message: "Unread message summary loaded successfully.",
      data: summary
    });
  } catch (error) {
    console.error("Failed to fetch staff support unread summary:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to load unread message summary."
    });
  }
};

// List conversations for the signed-in staff user or all departments for Admin
const listStaffSupportThreadsHandler = async (req, res) => {
  try {
    const { status, category, department, search } = req.query || {};
    const result = await listStaffSupportThreads({
      requesterId: req.user?.userId,
      requesterRole: req.user?.role,
      status,
      category,
      department,
      search
    });
    return res.status(200).json({
      success: true,
      message: "Conversations loaded successfully.",
      data: result.threads,
      summary: result.summary
    });
  } catch (error) {
    console.error("Failed to list staff support threads:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to load conversations right now."
    });
  }
};

// Create a new Staff-to-Admin conversation thread and alert connected Admins in real time
const createStaffSupportThreadHandler = async (req, res) => {
  try {
    const { category, priority, subject, message, image } = req.body || {};
    const createdThread = await createStaffSupportThread({
      userId: req.user?.userId,
      userRole: req.user?.role,
      category,
      priority,
      subject,
      message,
      image
    });

    const io = req.app.get("io");
    notifyAdminNewStaffSupportThread({ io, thread: createdThread });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent to the Administrator.",
      data: createdThread
    });
  } catch (error) {
    console.error("Failed to create staff support thread:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to send your message to the Administrator."
    });
  }
};

// Return full message history for a single conversation thread
const getStaffSupportThreadHandler = async (req, res) => {
  try {
    const thread = await getStaffSupportThreadById({
      threadId: req.params.id,
      requesterId: req.user?.userId,
      requesterRole: req.user?.role
    });
    return res.status(200).json({
      success: true,
      message: "Conversation loaded successfully.",
      data: thread
    });
  } catch (error) {
    console.error("Failed to load staff support thread:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to load conversation details."
    });
  }
};

// Append a reply message and broadcast real-time updates to the conversation room and recipient
const sendStaffSupportMessageHandler = async (req, res) => {
  try {
    const { content, image } = req.body || {};
    const { message, thread, senderIsAdmin } = await addStaffSupportMessage({
      threadId: req.params.id,
      senderId: req.user?.userId,
      senderRole: req.user?.role,
      content,
      image
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`staff_support_thread_${thread.id}`).emit("staff_support_message", {
        threadId: thread.id,
        message,
        thread
      });
    }

    if (senderIsAdmin) {
      notifyStaffAdminSupportReply({ io, thread, message });
      if (io) {
        io.to("admin").emit("admin_staff_support_updated", { thread });
      }
    } else {
      notifyAdminStaffSupportReply({ io, thread, message });
    }

    return res.status(201).json({
      success: true,
      message: "Reply sent successfully.",
      data: { message, thread }
    });
  } catch (error) {
    console.error("Failed to send staff support reply:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to send your reply right now."
    });
  }
};

// Mark all messages in a conversation as read for the current portal side
const markStaffSupportThreadReadHandler = async (req, res) => {
  try {
    const updatedThread = await markStaffSupportThreadRead({
      threadId: req.params.id,
      readerId: req.user?.userId,
      readerRole: req.user?.role
    });

    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("admin_staff_support_updated", { thread: updatedThread });
      io.to(`user_${updatedThread.staffId}`).emit("staff_support_badge_updated", { thread: updatedThread });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read.",
      data: updatedThread
    });
  } catch (error) {
    console.error("Failed to mark staff support thread read:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to update read status."
    });
  }
};

// Update thread status (Open, In Progress, Resolved) from Admin portal
const updateStaffSupportThreadStatusHandler = async (req, res) => {
  try {
    const { status } = req.body || {};
    const updatedThread = await updateStaffSupportThreadStatus({
      threadId: req.params.id,
      adminUserId: req.user?.userId,
      status
    });

    const io = req.app.get("io");
    notifyStaffSupportStatusChanged({ io, thread: updatedThread });

    return res.status(200).json({
      success: true,
      message: `Conversation status updated to ${status.replace("_", " ")}.`,
      data: updatedThread
    });
  } catch (error) {
    console.error("Failed to update staff support thread status:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to update conversation status."
    });
  }
};

module.exports = {
  getStaffSupportUnreadBadge,
  listStaffSupportThreadsHandler,
  createStaffSupportThreadHandler,
  getStaffSupportThreadHandler,
  sendStaffSupportMessageHandler,
  markStaffSupportThreadReadHandler,
  updateStaffSupportThreadStatusHandler
};
