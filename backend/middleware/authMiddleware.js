const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

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
    
    // Check single-session constraint for admin/employee
    if (decoded.role === "admin" || decoded.role === "employee") {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { sessionToken: true }
      });
      if (!user || user.sessionToken !== decoded.sessionToken) {
        return res.status(401).json({ error: "Session expired. Logged in from another device." });
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
  });
};

const verifyEmployee = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === "employee" || req.user.role === "admin")) {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Employee privileges required." });
    }
  });
};

module.exports = { verifyToken, verifyAdmin, verifyEmployee };
