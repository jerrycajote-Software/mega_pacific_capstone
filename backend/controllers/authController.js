const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user (primarily for setting up the first admin)
const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "customer",
      },
    });
    res.status(201).json({ message: "User created successfully", userId: user.id });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Failed to register user. Email might already exist." });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if user is admin if they are accessing admin side
    // (We can enforce this in middleware later, but good to check here too)

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contactNumber: true,
        address: true,
        cityProvince: true,
        zipCode: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactNumber, address, cityProvince, zipCode } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        contactNumber,
        address,
        cityProvince,
        zipCode
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contactNumber: true,
        address: true,
        cityProvince: true,
        zipCode: true
      }
    });
    res.status(200).json({ data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

module.exports = { register, login, getProfile, updateProfile };
