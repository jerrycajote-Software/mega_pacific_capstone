const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const { getStatuses } = require("../config/systemStatusCache");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("FATAL: JWT_SECRET environment variable is not set!");
      return res.status(500).json({ error: "Server configuration error." });
    }
    const decoded = jwt.verify(token, jwtSecret);
    
    if (["admin", "sales", "owner", "finance", "logistic"].includes(decoded.role)) {
      const session = await prisma.userSession.findUnique({
        where: { sessionToken: decoded.sessionToken },
        include: { user: true }
      });
      if (!session || !session.isActive) {
        return res.status(401).json({ error: "Session expired or logged out." });
      }
      if (session.user.status === 'suspended') {
        return res.status(403).json({ error: "account_suspended", message: "Your account has been disabled." });
      }

      await prisma.userSession.update({
        where: { id: session.id },
        data: { lastActive: new Date() }
      });
    } else {
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) return res.status(401).json({ error: "User not found." });
      if (user.status === 'suspended') {
        return res.status(403).json({ error: "account_suspended", message: "Your account has been disabled." });
      }
    }

    if (["admin", "sales", "customer", "finance", "logistic"].includes(decoded.role)) {
      const statuses = getStatuses();
      if (decoded.role === "admin" && statuses.admin_portal_status === "offline") {
        return res.status(503).json({ error: "maintenance", message: "Admin portal is under maintenance." });
      }
      if (decoded.role === "sales" && statuses.sales_portal_status === "offline") {
        return res.status(503).json({ error: "maintenance", message: "Sales portal is under maintenance." });
      }
      if (decoded.role === "customer" && statuses.customer_portal_status === "offline") {
        return res.status(503).json({ error: "maintenance", message: "Customer portal is under maintenance." });
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      
      console.warn(`JWT Verification Warning: Token expired at ${error.expiredAt}`);
    } else {
      console.error("JWT Verification Error:", error);
    }
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === "admin" || req.user.role === "superadmin" || req.user.role === "super_admin")) {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
  });
};

const verifyOwner = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === "owner") {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Owner privileges required." });
    }
  });
};

const verifySales = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === "sales" || req.user.role === "admin")) {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Sales privileges required." });
    }
  });
};

const verifySuperAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === "superadmin") {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Super Admin privileges required." });
    }
  });
};

const verifyFinance = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === "finance") {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Finance privileges required." });
    }
  });
};

const verifyLogistic = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === "logistic" || req.user.role === "admin" || req.user.role === "superadmin")) {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Logistic privileges required." });
    }
  });
};

const verifyStaff = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && ["admin", "superadmin", "owner", "sales", "logistic"].includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Staff privileges required." });
    }
  });
};

module.exports = { verifyToken, verifyAdmin, verifyOwner, verifySales, verifySuperAdmin, verifyFinance, verifyLogistic, verifyStaff };
