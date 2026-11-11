const prisma = require("../config/db");
const storageService = require("../services/storageService");

const FAQ_KNOWLEDGE_BASE = {
  "can i preview my roof design before purchasing":
    "Yes! Our website has a 3D roofing design feature that allows you to preview your chosen roofing material, change its color, and view the roof from different angles.",
  "what roofing material is best for residential houses":
    "The best roofing material depends on your house design, budget, and personal preference. Mega S-Rib and Mega HI-Rib are good options for modern residential houses, while Hermosa Tile is suitable for homeowners who prefer a tile-style appearance.",
  "are your roofing materials durable and weather-resistant":
    "Yes. Our metal roofing materials are designed to provide durability and protection against different weather conditions, including rain and sunlight. However, their performance depends on the material specifications, coating, proper installation, and maintenance.",
  "which thickness of roofing is best for a normal house":
    "The recommended thickness depends on your roof design, location, and structural requirements. For residential houses, you can consider common roofing thicknesses such as 0.40 mm and 0.50 mm. We recommend consulting our sales staff to choose the appropriate thickness for your project.",
  "what is the standard size of your roofing sheets":
    "Roofing sheets can be customized based on the required length of your roof. The width depends on the roofing profile, while the length is usually determined by your roof measurements. You may contact our sales staff to confirm the available dimensions."
};

const getAutomatedAnswer = (text) => {
  if (!text || typeof text !== "string") return null;
  const normalized = text.trim().toLowerCase().replace(/[?!.,]/g, "");
  for (const [question, answer] of Object.entries(FAQ_KNOWLEDGE_BASE)) {
    if (normalized === question) {
      return answer;
    }
  }
  return null;
};

exports.createInquiry = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { subject, initialMessage, image, automatedAnswer } = req.body;

    let contentToStore = initialMessage || '';
    if (image) {
      const storedImageUrl = await storageService.uploadBase64Image(image, "chat");
      contentToStore = JSON.stringify({
        text: initialMessage || '',
        image: storedImageUrl
      });
    }

    const matchedAnswer = automatedAnswer || getAutomatedAnswer(initialMessage);

    const messagesToCreate = [
      {
        senderId: customerId,
        content: contentToStore,
      }
    ];

    if (matchedAnswer) {
      const staffUser = await prisma.user.findFirst({
        where: { role: { in: ["sales", "admin", "super_admin", "superadmin"] } },
        select: { id: true }
      });
      if (staffUser) {
        messagesToCreate.push({
          senderId: staffUser.id,
          content: matchedAnswer
        });
      }
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        customerId,
        subject,
        messages: {
          create: messagesToCreate,
        },
      },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                role: true,
                customerProfile: { select: { name: true, avatarUrl: true } },
                salesProfile: { select: { name: true } },
                adminProfile: { select: { name: true } }
              }
            }
          }
        },
        customer: { select: { id: true, email: true } }
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to("sales").to("saless").emit("new_inquiry", inquiry);
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
    const { id } = req.params; 
    const { content, image, automatedAnswer } = req.body;

    let contentToStore = content || '';
    if (image) {
      const storedImageUrl = await storageService.uploadBase64Image(image, "chat");
      contentToStore = JSON.stringify({
        text: content || '',
        image: storedImageUrl
      });
    }

    const message = await prisma.message.create({
      data: {
        inquiryId: parseInt(id),
        senderId,
        content: contentToStore,
      },
      include: {
        sender: {
          select: {
            id: true,
            role: true,
            customerProfile: { select: { name: true, avatarUrl: true } },
            salesProfile: { select: { name: true } },
            adminProfile: { select: { name: true } }
          }
        },
      },
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`inquiry_${id}`).emit("new_message", message);
      io.to("sales").to("saless").emit("inquiry_updated", { inquiryId: id, message });
    }

    const matchedAnswer = automatedAnswer || getAutomatedAnswer(content);
    if (matchedAnswer) {
      const staffUser = await prisma.user.findFirst({
        where: { role: { in: ["sales", "admin", "super_admin", "superadmin"] } },
        select: { id: true }
      });
      if (staffUser) {
        const botMessage = await prisma.message.create({
          data: {
            inquiryId: parseInt(id),
            senderId: staffUser.id,
            content: matchedAnswer,
          },
          include: {
            sender: {
              select: {
                id: true,
                role: true,
                customerProfile: { select: { name: true, avatarUrl: true } },
                salesProfile: { select: { name: true } },
                adminProfile: { select: { name: true } }
              }
            },
          },
        });

        if (io) {
          io.to(`inquiry_${id}`).emit("new_message", botMessage);
          io.to("sales").to("saless").emit("inquiry_updated", { inquiryId: id, message: botMessage });
        }

        return res.status(201).json([message, botMessage]);
      }
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
          include: { sender: { select: { id: true, role: true } } },
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
        customer: {
          select: {
            id: true,
            email: true,
            customerProfile: {
              select: {
                name: true,
                avatarUrl: true,
                contactNumber: true,
                city: true,
                province: true,
              }
            }
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                role: true,
                customerProfile: { select: { name: true, avatarUrl: true } },
                salesProfile: { select: { name: true } },
                adminProfile: { select: { name: true } }
              }
            }
          },
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
        customer: {
          select: {
            id: true,
            email: true,
            customerProfile: {
              select: {
                name: true,
                avatarUrl: true,
                contactNumber: true,
                city: true,
                province: true,
              }
            }
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                role: true,
                customerProfile: { select: { name: true, avatarUrl: true } },
                salesProfile: { select: { name: true } },
                adminProfile: { select: { name: true } }
              }
            }
          },
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
      include: { customer: { select: { id: true, email: true } } }
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`inquiry_${id}`).emit("status_updated", updated);
      io.to("sales").to("saless").emit("inquiry_status_updated", updated);
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    res.status(500).json({ error: "Failed to update inquiry status" });
  }
};
