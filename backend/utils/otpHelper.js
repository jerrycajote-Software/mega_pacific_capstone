/**
 * OTP Helper
 * Handles generating, formatting, and verifying domain-specific OTPs for:
 * - Registration (REG-######)
 * - Login (LOG-######)
 * - Forgot Password / Reset (RST-######)
 */

const OTP_PREFIXES = {
  REGISTRATION: 'REG',
  LOGIN: 'LOG',
  RESET: 'RST'
};

const generateOtp = (type = 'REG') => {
  const prefix = String(type).toUpperCase();
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  return `${prefix}-${digits}`;
};

const formatOtp = (input, expectedPrefix) => {
  if (!input) return '';
  const trimmed = String(input).trim().toUpperCase();
  const prefix = String(expectedPrefix).toUpperCase();
  if (trimmed.startsWith(`${prefix}-`)) {
    return trimmed;
  }
  if (/^\d{6}$/.test(trimmed)) {
    return `${prefix}-${trimmed}`;
  }
  return trimmed;
};

const verifyOtpMatch = (storedOtp, inputOtp, expectedPrefix) => {
  if (!storedOtp || !inputOtp) return false;
  const s = String(storedOtp).trim().toUpperCase();
  const i = String(inputOtp).trim().toUpperCase();
  if (s === i) return true;

  const prefix = String(expectedPrefix).toUpperCase();
  // If stored has prefix and input is just 6 digits
  if (s === `${prefix}-${i}`) return true;
  // If input has prefix and stored is just 6 digits
  if (`${prefix}-${s}` === i) return true;

  return false;
};

module.exports = {
  OTP_PREFIXES,
  generateOtp,
  formatOtp,
  verifyOtpMatch
};
