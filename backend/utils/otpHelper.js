
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
  if (s === `${prefix}-${i}`) return true;
  if (`${prefix}-${s}` === i) return true;

  return false;
};

module.exports = {
  OTP_PREFIXES,
  generateOtp,
  formatOtp,
  verifyOtpMatch
};
