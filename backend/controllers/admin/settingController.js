const prisma = require("../../config/db");

const getSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.status(200).json({ data: settings });
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ error: "Failed to get settings." });
  }
};

const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value, description } = req.body;
  
  if (!value) {
    return res.status(400).json({ error: "Value is required." });
  }

  try {
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description }
    });
    res.status(200).json({ data: setting, message: "Setting updated successfully." });
  } catch (error) {
    console.error("Update Setting Error:", error);
    res.status(500).json({ error: "Failed to update setting." });
  }
};

module.exports = { getSettings, updateSetting };
