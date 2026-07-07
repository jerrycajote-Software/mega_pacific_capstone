const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
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
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
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
