const assert = require("assert");
const { validateRealisticEmail, DISPOSABLE_OR_FAKE_DOMAINS, DOMAIN_TYPO_MAP } = require("../utils/emailValidator");

function runEmailValidatorTests() {
  console.log("Running comprehensive Realistic Email Validator unit tests...");

  // 1. Missing or empty email
  assert.strictEqual(validateRealisticEmail("").isValid, false);
  assert.strictEqual(validateRealisticEmail(null).isValid, false);
  assert.strictEqual(validateRealisticEmail(undefined).isValid, false);
  assert.strictEqual(validateRealisticEmail("   ").isValid, false);
  console.log("PASS: Empty/null/undefined rejected");

  // 2. Spaces in email
  assert.strictEqual(validateRealisticEmail("user name@gmail.com").isValid, false);
  assert.strictEqual(validateRealisticEmail("username@gm ail.com").isValid, false);
  console.log("PASS: Spaces rejected");

  // 3. User request screenshot scenario: "jerrcajote"
  const jerrcajoteResult = validateRealisticEmail("jerrcajote");
  assert.strictEqual(jerrcajoteResult.isValid, false);
  assert.strictEqual(
    jerrcajoteResult.error,
    "Please enter a complete email address including domain (@gmail.com)."
  );
  console.log("PASS: Unadorned username 'jerrcajote' strictly rejected with helpful guidance");

  // 4. Incomplete addresses
  assert.strictEqual(validateRealisticEmail("jerrcajote@").isValid, false);
  assert.strictEqual(validateRealisticEmail("@gmail.com").isValid, false);
  assert.strictEqual(validateRealisticEmail("user@domain@another.com").isValid, false);
  console.log("PASS: Incomplete or multiple '@' addresses rejected");

  // 5. Missing TLD or single letter TLD
  assert.strictEqual(validateRealisticEmail("jerrcajote@gmail").isValid, false);
  assert.strictEqual(validateRealisticEmail("user@domain.c").isValid, false);
  assert.strictEqual(validateRealisticEmail("user@domain.123").isValid, false);
  console.log("PASS: Missing or invalid TLDs rejected");

  // 6. Common provider typos
  const typoGmail = validateRealisticEmail("jerrcajote@gamil.com");
  assert.strictEqual(typoGmail.isValid, false);
  assert.strictEqual(typoGmail.error, "Invalid email domain. Did you mean @gmail.com?");
  assert.strictEqual(typoGmail.suggestion, "jerrcajote@gmail.com");

  const typoYahoo = validateRealisticEmail("jerrcajote@yaho.com");
  assert.strictEqual(typoYahoo.isValid, false);
  assert.strictEqual(typoYahoo.error, "Invalid email domain. Did you mean @yahoo.com?");

  const typoHotmail = validateRealisticEmail("jerrcajote@hotmial.com");
  assert.strictEqual(typoHotmail.isValid, false);
  assert.strictEqual(typoHotmail.error, "Invalid email domain. Did you mean @hotmail.com?");

  const typoOutlook = validateRealisticEmail("jerrcajote@outlok.com");
  assert.strictEqual(typoOutlook.isValid, false);
  assert.strictEqual(typoOutlook.error, "Invalid email domain. Did you mean @outlook.com?");
  console.log("PASS: Typos in major domains (Gmail, Yahoo, Hotmail, Outlook) detected and rejected");

  // 7. Gmail specific username rules
  const shortGmail = validateRealisticEmail("jerr@gmail.com"); // 4 chars
  assert.strictEqual(shortGmail.isValid, false);
  assert.strictEqual(shortGmail.error, "Gmail usernames must be at least 6 characters long.");

  const invalidCharGmail = validateRealisticEmail("jerr_cajote@gmail.com"); // underscore not allowed in Gmail
  assert.strictEqual(invalidCharGmail.isValid, false);
  assert.strictEqual(invalidCharGmail.error, "Gmail usernames may only contain letters, numbers, and periods.");

  const consecutiveDotsGmail = validateRealisticEmail("jerr..cajote@gmail.com");
  assert.strictEqual(consecutiveDotsGmail.isValid, false);
  assert.strictEqual(consecutiveDotsGmail.error, "Email address cannot contain consecutive periods.");

  const leadingDotGmail = validateRealisticEmail(".jerrcajote@gmail.com");
  assert.strictEqual(leadingDotGmail.isValid, false);
  assert.strictEqual(leadingDotGmail.error, "Email username cannot start or end with a period.");

  const trailingDotGmail = validateRealisticEmail("jerrcajote.@gmail.com");
  assert.strictEqual(trailingDotGmail.isValid, false);
  assert.strictEqual(trailingDotGmail.error, "Email username cannot start or end with a period.");
  console.log("PASS: Gmail username constraints (6-30 chars, alphanumeric + periods only, dot rules) enforced");

  // 8. Fake or disposable domains
  assert.strictEqual(validateRealisticEmail("someone@test.com").isValid, false);
  assert.strictEqual(validateRealisticEmail("someone@example.com").isValid, false);
  assert.strictEqual(validateRealisticEmail("someone@fake.com").isValid, false);
  assert.strictEqual(validateRealisticEmail("someone@mailinator.com").isValid, false);
  assert.strictEqual(validateRealisticEmail("someone@tempmail.com").isValid, false);
  assert.strictEqual(validateRealisticEmail("someone@10minutemail.com").isValid, false);
  console.log("PASS: Disposable and obvious test domains blocked");

  // 9. Valid realistic emails
  const validGmail = validateRealisticEmail("jerrycajote9@gmail.com");
  assert.strictEqual(validGmail.isValid, true);
  assert.strictEqual(validGmail.error, null);

  const validGmailWithDot = validateRealisticEmail("jerr.cajote@gmail.com");
  assert.strictEqual(validGmailWithDot.isValid, true);

  const validCompany = validateRealisticEmail("sales@megapacific.com");
  assert.strictEqual(validCompany.isValid, true);

  const validPhDomain = validateRealisticEmail("customer.service@store.ph");
  assert.strictEqual(validPhDomain.isValid, true);

  const validMultiLevel = validateRealisticEmail("jerry.cajote@corp.megapacific.com.ph");
  assert.strictEqual(validMultiLevel.isValid, true);

  console.log("PASS: Legitimate and realistic emails accepted");
  console.log("ALL EMAIL VALIDATION TESTS PASSED SUCCESSFULLY!");
}

runEmailValidatorTests();
