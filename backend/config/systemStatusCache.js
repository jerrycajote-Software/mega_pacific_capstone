const prisma = require("./db");

let statuses = {
  admin_portal_status: "online",
  sales_portal_status: "online",
  customer_portal_status: "online",
};

const refreshCache = async () => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ["admin_portal_status", "sales_portal_status", "customer_portal_status"],
        },
      },
    });
    settings.forEach((s) => {
      statuses[s.key] = s.value;
    });
    console.log("System status cache refreshed:", statuses);
  } catch (error) {
    console.error("Error refreshing system status cache:", error);
  }
};

// Initial load
refreshCache();

const getStatuses = () => {
  return statuses;
};

module.exports = {
  refreshCache,
  getStatuses,
};
