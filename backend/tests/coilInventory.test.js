const assert = require("assert");
const { addCoil, getCoils, getCoilSummary } = require("../controllers/logistic/coilController");
const prisma = require("../config/db");

async function runCoilTests() {
  console.log("Running Coil Inventory Thickness & Color Tests...");

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

  const testThickness = "0.75mm";

  
  await prisma.coilInventory.deleteMany({
    where: { thickness: testThickness }
  });

  
  {
    const req = {
      user: { role: "logistic", userId: 37 },
      body: {
        color: "Saipan Brown"
      }
    };
    const res = createMockRes();
    await addCoil(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.responseData.error.includes("thickness gauge is required"));
    console.log("PASS: Missing thickness gauge rejected with 400");
  }

  
  {
    const req = {
      user: { role: "logistic", userId: 37 },
      body: {
        thickness: "0.75mm",
        color: "Neon Pink"
      }
    };
    const res = createMockRes();
    await addCoil(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.responseData.error.includes("None of the selected colors matched"));
    console.log("PASS: Invalid color rejected with 400");
  }

  
  {
    const req = {
      user: { role: "logistic", userId: 37 },
      body: {
        thickness: "0.75", 
        color: "Marshall Dark Gray",
        coilCount: 3,
        minAlertCount: 1
      }
    };
    const res = createMockRes();
    await addCoil(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.responseData.success, true);
    assert.strictEqual(res.responseData.data.length, 1);
    assert.strictEqual(res.responseData.data[0].thickness, "0.75mm");
    assert.strictEqual(res.responseData.data[0].color, "Marshall Dark Gray");
    assert.strictEqual(res.responseData.data[0].coilCount, 3);
    console.log("PASS: New coil thickness (0.75mm) created with color Marshall Dark Gray");
  }

  
  {
    const req = {
      user: { role: "logistic", userId: 37 },
      body: {
        thickness: "0.75mm",
        color: "Marshall Dark Gray",
        coilCount: 1
      }
    };
    const res = createMockRes();
    await addCoil(req, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.responseData.success, false);
    assert.ok(res.responseData.error.includes("already exist"));
    console.log("PASS: Duplicate thickness + color addition rejected with 409 Conflict");
  }

  
  {
    const req = {
      user: { role: "logistic", userId: 37 },
      body: {
        thickness: "0.75mm",
        colors: ["Saipan Brown", "Tongan Red"],
        coilCount: 2
      }
    };
    const res = createMockRes();
    await addCoil(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.responseData.data.length, 2);
    console.log("PASS: Batch addition of 2 colors for thickness 0.75mm succeeded");
  }

  
  await prisma.coilInventory.deleteMany({
    where: { thickness: testThickness }
  });

  console.log("ALL COIL INVENTORY TESTS PASSED (100%)!");
}

runCoilTests().catch((err) => {
  console.error("Coil test error:", err);
  process.exit(1);
});
