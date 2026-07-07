const prisma = require("../config/db");

exports.createInquiry = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { subject, initialMessage } = req.body;

    const inquiry = await prisma.inquiry.create({
      data: {
        customerId,
        subject,
        messages: {
          create: {
            senderId: customerId,
            content: initialMessage,
          },
        },
      },
      include: {
        messages: {
          include: { sender: { select: { id: true, name: true, role: true } } }
        },
        customer: { select: { id: true, name: true, email: true } }
      },
    });

    // Notify employees via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to("employees").emit("new_inquiry", inquiry);
    }

    res.status(201).json(inquiry);
  } catch (error) {
    console.error("Error creating inquiry:", error);
    res.status(500).json({ error: "Failed to create inquiry" });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { id } = req.params; // inquiry id
    const { content } = req.body;

    const message = await prisma.message.create({
      data: {
        inquiryId: parseInt(id),
        senderId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    // Notify room via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(`inquiry_${id}`).emit("new_message", message);
      io.to("employees").emit("inquiry_updated", { inquiryId: id, message });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Failed to add message" });
  }
};

exports.getCustomerInquiries = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const inquiries = await prisma.inquiry.findMany({
      where: { customerId },
      include: {
        messages: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(inquiries);
  } catch (error) {
    console.error("Error fetching customer inquiries:", error);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true } },
        messages: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(inquiries);
  } catch (error) {
    console.error("Error fetching all inquiries:", error);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
};

exports.getInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        messages: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    
    if (!inquiry) return res.status(404).json({ error: "Inquiry not found" });
    
    res.json(inquiry);
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    res.status(500).json({ error: "Failed to fetch inquiry" });
  }
};

exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.inquiry.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { customer: { select: { id: true, name: true, email: true } } }
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`inquiry_${id}`).emit("status_updated", updated);
      io.to("employees").emit("inquiry_status_updated", updated);
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    res.status(500).json({ error: "Failed to update inquiry status" });
  }
};
