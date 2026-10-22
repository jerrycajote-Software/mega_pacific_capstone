const assert = require("assert");
const { createAccount } = require("../controllers/admin/accountController");

async function runDuplicateAccountTests() {
  console.log("Running Singleton Role & Duplicate Account Rejection Tests...");

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

  // Test 1: Attempting to create a second Admin account is rejected under Singleton Policy
  {
    const req = {
      user: { role: "super_admin", userId: 48 },
      body: {
        name: "Second Admin",
        email: "brandnewadmin@megapacific.com",
        password: "Password123!",
        role: "admin"
      }
    };
    const res = createMockRes();
    await createAccount(req, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.responseData.success, false);
    assert.strictEqual(res.responseData.code, "SINGLETON_ROLE_LIMIT_REACHED");
    assert.ok(res.responseData.error.includes("Only one account can exist for Admin"));
    console.log("PASS: Creating a second Admin account is rejected (Only 1 allowed)");
  }

  // Test 2: Attempting to create a second Owner account is rejected under Singleton Policy
  {
    const req = {
      user: { role: "super_admin", userId: 48 },
      body: {
        name: "Second Owner",
        email: "brandnewowner@megapacific.com",
        password: "Password123!",
        role: "owner"
      }
    };
    const res = createMockRes();
    await createAccount(req, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.responseData.success, false);
    assert.strictEqual(res.responseData.code, "SINGLETON_ROLE_LIMIT_REACHED");
    assert.ok(res.responseData.error.includes("Only one account can exist for Owner"));
    console.log("PASS: Creating a second Owner account is rejected (Only 1 allowed)");
  }

  // Test 3: Attempting to create a second Sales account is rejected under Singleton Policy
  {
    const req = {
      user: { role: "super_admin", userId: 48 },
      body: {
        name: "Second Sales",
        email: "brandnewsales@megapacific.com",
        password: "Password123!",
        role: "sales"
      }
    };
    const res = createMockRes();
    await createAccount(req, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.responseData.success, false);
    assert.strictEqual(res.responseData.code, "SINGLETON_ROLE_LIMIT_REACHED");
    assert.ok(res.responseData.error.includes("Only one account can exist for Sales"));
    console.log("PASS: Creating a second Sales account is rejected (Only 1 allowed)");
  }

  // Test 4: Attempting to create a second Logistics account is rejected under Singleton Policy
  {
    const req = {
      user: { role: "super_admin", userId: 48 },
      body: {
        name: "Second Logistic",
        email: "brandnewlogistic@megapacific.com",
        password: "Password123!",
        role: "logistic"
      }
    };
    const res = createMockRes();
    await createAccount(req, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.responseData.success, false);
    assert.strictEqual(res.responseData.code, "SINGLETON_ROLE_LIMIT_REACHED");
    assert.ok(res.responseData.error.includes("Only one account can exist for Logistics"));
    console.log("PASS: Creating a second Logistics account is rejected (Only 1 allowed)");
  }

  // Test 5: Attempting to create a second Finance account is rejected under Singleton Policy
  {
    const req = {
      user: { role: "super_admin", userId: 48 },
      body: {
        name: "Second Finance",
        email: "brandnewfinance@megapacific.com",
        password: "Password123!",
        role: "finance"
      }
    };
    const res = createMockRes();
    await createAccount(req, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.responseData.success, false);
    assert.strictEqual(res.responseData.code, "SINGLETON_ROLE_LIMIT_REACHED");
    assert.ok(res.responseData.error.includes("Only one account can exist for Finance"));
    console.log("PASS: Creating a second Finance account is rejected (Only 1 allowed)");
  }

  // Test 6: Attempting to provision a Super Admin account is strictly forbidden with 403
  {
    const req = {
      user: { role: "super_admin", userId: 48 },
      body: {
        name: "Second Super Admin",
        email: "superadmin2@megapacific.com",
        password: "Password123!",
        role: "super_admin"
      }
    };
    const res = createMockRes();
    await createAccount(req, res);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.responseData.success, false);
    assert.ok(res.responseData.error.includes("Super Admin accounts are reserved exclusively"));
    console.log("PASS: Super Admin creation is forbidden with 403 status");
  }

  // Test 7: Duplicate email check (case-insensitive & whitespace trimmed)
  {
    const req = {
      user: { role: "super_admin", userId: 48 },
      body: {
        name: "Duplicate Email Check",
        email: "  ADMIN@MEGAPACIFIC.COM  ",
        password: "Password123!",
        role: "admin"
      }
    };
    const res = createMockRes();
    await createAccount(req, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.responseData.success, false);
    console.log("PASS: Case-insensitive & trimmed duplicate email is rejected with 409 status");
  }

  console.log("ALL SINGLETON ROLE & DUPLICATE REJECTION TESTS PASSED (100%)!");
}

runDuplicateAccountTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
