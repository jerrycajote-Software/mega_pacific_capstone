

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*~]).{8,}$/;

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


const validateRegister = (req, res, next) => {
  const body = req.body;

  const missingFields = REQUIRED_REGISTER_FIELDS
    .filter(({ key }) => !body[key] || String(body[key]).trim() === '')
    .map(({ label }) => label);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Please complete all required fields: ${missingFields.join(', ')}.`,
      missingFields,
    });
  }

  const { password, contactNumber } = body;
  const cleanContact = String(contactNumber || '').trim();
  if (!/^09[0-9]{9}$/.test(cleanContact)) {
    return res.status(400).json({
      error: 'Contact number must be an 11-digit Philippine mobile number starting with 09 (e.g. 09171234567).',
    });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      error:
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*~).',
    });
  }

  next();
};


const validateResetPassword = (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
  }

  if (!PASSWORD_REGEX.test(newPassword)) {
    return res.status(400).json({
      error:
        'New password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*~).',
    });
  }

  next();
};

module.exports = { validateRegister, validateResetPassword };
