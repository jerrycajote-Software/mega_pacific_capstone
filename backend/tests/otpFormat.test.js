const assert = require("assert");
const { generateOtp, formatOtp, verifyOtpMatch, OTP_PREFIXES } = require("../utils/otpHelper");

const runOtpFormatTests = () => {
  console.log("Starting OTP Format and Domain Separation Verification...");

  // 1. Generation format tests
  const regOtp = generateOtp('REG');
  assert.match(regOtp, /^REG-\d{6}$/, "Registration OTP must follow REG-###### format");
  console.log(`PASS: Registration OTP generated properly: ${regOtp}`);

  const logOtp = generateOtp('LOG');
  assert.match(logOtp, /^LOG-\d{6}$/, "Login OTP must follow LOG-###### format");
  console.log(`PASS: Login OTP generated properly: ${logOtp}`);

  const rstOtp = generateOtp('RST');
  assert.match(rstOtp, /^RST-\d{6}$/, "Password Reset OTP must follow RST-###### format");
  console.log(`PASS: Reset OTP generated properly: ${rstOtp}`);

  // 2. Exact match tests
  assert.strictEqual(verifyOtpMatch("REG-123456", "REG-123456", "REG"), true);
  assert.strictEqual(verifyOtpMatch("LOG-654321", "LOG-654321", "LOG"), true);
  assert.strictEqual(verifyOtpMatch("RST-789012", "RST-789012", "RST"), true);
  console.log("PASS: Exact matches with correct prefixes verify successfully.");

  // 3. Case-insensitivity tests
  assert.strictEqual(verifyOtpMatch("REG-123456", "reg-123456", "REG"), true);
  assert.strictEqual(verifyOtpMatch("log-654321", "LOG-654321", "LOG"), true);
  assert.strictEqual(verifyOtpMatch("rst-789012", "RST-789012", "RST"), true);
  console.log("PASS: Case insensitivity handled correctly.");

  // 4. Raw 6-digit input auto-resolution tests
  assert.strictEqual(verifyOtpMatch("REG-123456", "123456", "REG"), true);
  assert.strictEqual(verifyOtpMatch("LOG-654321", "654321", "LOG"), true);
  assert.strictEqual(verifyOtpMatch("RST-789012", "789012", "RST"), true);
  assert.strictEqual(verifyOtpMatch("123456", "REG-123456", "REG"), true);
  console.log("PASS: Raw 6-digit numbers resolve seamlessly to the expected prefix.");

  // 5. Cross-domain rejection tests (CRITICAL SECURITY)
  // A login OTP must NOT verify as registration OTP
  assert.strictEqual(verifyOtpMatch("REG-123456", "LOG-123456", "REG"), false);
  // A reset OTP must NOT verify as login OTP
  assert.strictEqual(verifyOtpMatch("LOG-123456", "RST-123456", "LOG"), false);
  // A registration OTP must NOT verify as reset OTP
  assert.strictEqual(verifyOtpMatch("RST-123456", "REG-123456", "RST"), false);
  console.log("PASS: Cross-domain OTP spoofing is strictly rejected.");

  // 6. Formatting helper tests
  assert.strictEqual(formatOtp("123456", "REG"), "REG-123456");
  assert.strictEqual(formatOtp("reg-123456", "REG"), "REG-123456");
  assert.strictEqual(formatOtp("123456", "LOG"), "LOG-123456");
  assert.strictEqual(formatOtp("123456", "RST"), "RST-123456");
  console.log("PASS: formatOtp formats correctly.");

  console.log("All OTP Format tests completed successfully! 100% assertions passed.");
};

runOtpFormatTests();
