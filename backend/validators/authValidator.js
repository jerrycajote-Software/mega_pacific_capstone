/**
 * Auth Validator Middleware
 * Validates registration payloads and enforces password security policy on the server side.
 */

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

const REQUIRED_REGISTER_FIELDS = [
  { key: 'name',          label: 'Full name' },
  { key: 'email',         label: 'Email address' },
  { key: 'password',      label: 'Password' },
  { key: 'contactNumber', label: 'Contact number' },
  { key: 'address',       label: 'Address' },
  { key: 'city',          label: 'City / Municipality' },
  { key: 'province',      label: 'Province' },
  { key: 'zipCode',       label: 'Zip code' },
];

/**
 * Middleware: validateRegister
 * - Checks all required fields are present and non-empty.
 * - Enforces the password security policy.
 */
const validateRegister = (req, res, next) => {
  const body = req.body;

  // 1. Check required fields
  const missingFields = REQUIRED_REGISTER_FIELDS
    .filter(({ key }) => !body[key] || String(body[key]).trim() === '')
    .map(({ label }) => label);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Please complete all required fields: ${missingFields.join(', ')}.`,
      missingFields,
    });
  }

  // 2. Validate password policy
  const { password } = body;
  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      error:
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*).',
    });
  }

  next();
};

/**
 * Middleware: validateResetPassword
 * - Checks email, otp, and newPassword are present.
 * - Enforces the password security policy on the new password.
 */
const validateResetPassword = (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    return res.status(400).json({
      error:
        'New password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*).',
    });
  }

  next();
};

module.exports = { validateRegister, validateResetPassword };
