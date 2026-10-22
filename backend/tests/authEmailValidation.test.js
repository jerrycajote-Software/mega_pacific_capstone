const assert = require("assert");
const { forgotPassword, register, login } = require("../controllers/authController");

async function runAuthEmailValidationTests() {
  console.log("Running Auth Controller Email Validation tests...");

  // Helper to mock Express req and res
  function createMockRes() {
    return {
      statusCode: null,
      responseData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.responseData = data;
        return this;
      }
    };
  }

  // Test 1: forgotPassword with "jerrcajote"
  {
    const req = { body: { email: "jerrcajote" } };
    const res = createMockRes();
    await forgotPassword(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(
      res.responseData.error,
      "Please enter a complete email address including domain (@gmail.com)."
    );
    console.log("PASS: forgotPassword strictly rejects 'jerrcajote' with 400 status");
  }

  // Test 2: forgotPassword with "jerrcajote@gmail"
  {
    const req = { body: { email: "jerrcajote@gmail" } };
    const res = createMockRes();
    await forgotPassword(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(
      res.responseData.error,
      "Invalid email domain. Did you mean @gmail.com?"
    );
    console.log("PASS: forgotPassword rejects 'jerrcajote@gmail' missing TLD");
  }

  // Test 3: forgotPassword with "jerr@gmail.com" (< 6 chars for Gmail)
  {
    const req = { body: { email: "jerr@gmail.com" } };
    const res = createMockRes();
    await forgotPassword(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(
      res.responseData.error,
      "Gmail usernames must be at least 6 characters long."
    );
    console.log("PASS: forgotPassword rejects short fake Gmail usernames");
  }

  // Test 4: forgotPassword with disposable domain "test@test.com"
  {
    const req = { body: { email: "test@test.com" } };
    const res = createMockRes();
    await forgotPassword(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(
      res.responseData.error,
      "Disposable or test email addresses are not allowed. Please enter an active, realistic email."
    );
    console.log("PASS: forgotPassword rejects disposable/test domains");
  }

  // Test 5: register with "jerrcajote"
  {
    const req = {
      body: {
        name: "Jerry Cajote",
        email: "jerrcajote",
        password: "ValidPassword123!"
      }
    };
    const res = createMockRes();
    await register(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(
      res.responseData.error,
      "Please enter a complete email address including domain (@gmail.com)."
    );
    console.log("PASS: register strictly rejects fake/invalid emails with 400 status");
  }

  // Test 6: login with "jerrcajote"
  {
    const req = {
      body: {
        email: "jerrcajote",
        password: "ValidPassword123!"
      }
    };
    const res = createMockRes();
    await login(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(
      res.responseData.error,
      "Please enter a complete email address including domain (@gmail.com)."
    );
    console.log("PASS: login rejects fake/invalid email with 400 status");
  }

  console.log("ALL AUTH CONTROLLER EMAIL VALIDATION TESTS PASSED!");
}

runAuthEmailValidationTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
