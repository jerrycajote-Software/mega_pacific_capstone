const express = require("express");
const { register, login, getProfile, updateProfile, verifyOtp, resendOtp, forgotPassword, resetPassword } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { validateRegister, validateResetPassword } = require("../validators/authValidator");
const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

module.exports = router;
