const assert = require("assert");
const prisma = require("../config/db");
const { rejectOrder } = require("../controllers/sales/orderController");
const { getRefunds, getRefundStats, processRefund } = require("../controllers/finance/refundController");
const { getSalesDashboardStats } = require("../controllers/sales/dashboardController");

const runRefundSystemVerification = async () => {
  console.log("Starting Refund System Automated Verification Suite...");

  let testUser = null;
  let testFinanceUser = null;
  let testOrder = null;

  try {
    testUser = await prisma.user.upsert({
      where: { email: "refund_test_customer@megapacific.test" },
      update: {},
      create: {
        email: "refund_test_customer@megapacific.test",
        password: "hashed_dummy_password",
        role: "customer",
        customerProfile: {
          create: {
            name: "Test Customer for Refund",
            contactNumber: "0917-888-9999"
          }
        }
      }
    });

    testFinanceUser = await prisma.user.upsert({
      where: { email: "refund_test_finance@megapacific.test" },
      update: {},
      create: {
        email: "refund_test_finance@megapacific.test",
        password: "hashed_dummy_password",
        role: "finance",
        financeProfile: {
          create: {
            name: "Audit Finance Staff",
            contactNumber: "0918-111-2222"
          }
        }
      }
    });

    console.log("PASS: Test users setup successfully.");

    let baselineStats = null;
    await getSalesDashboardStats({}, {
      status: () => ({ json: (d) => { baselineStats = d.data; } })
    });

    testOrder = await prisma.order.create({
      data: {
        userId: testUser.id,
        total: 12000.0,
        status: "pending",
        paymentStatus: "50% Downpayment Paid",
        paymentMode: "Cash on Delivery (50% Downpayment via GCash (0917-888-9999), 50% on Delivery)",
        fulfillmentType: "Delivery",
        customerName: "Test Customer for Refund",
        customerEmail: testUser.email,
        shippingAddress: "123 Test Industrial Way",
        shippingCity: "Imus",
        shippingProvince: "Cavite"
      }
    });

    assert.strictEqual(testOrder.status, "pending");
    assert.strictEqual(testOrder.total, 12000.0);
    console.log(`PASS: Test order created (#ORD-${testOrder.id}) with total ₱12,000 and 50% downpayment.`);

    let salesMockResponse = null;
    let salesStatusCode = null;

    const mockSalesReq = {
      params: { id: testOrder.id.toString() },
      body: { reason: "Out of raw marshall coils for specific profile" },
      app: {
        get: (key) => {
          if (key === "io") {
            return {
              emit: (event, payload) => {
                console.log(`[Socket Mock] Emitted '${event}' for Order ${payload?.orderId || payload?.orderNumber}`);
              }
            };
          }
          return null;
        }
      }
    };

    const mockSalesRes = {
      status: (code) => {
        salesStatusCode = code;
        return {
          json: (data) => {
            salesMockResponse = data;
          }
        };
      }
    };

    await rejectOrder(mockSalesReq, mockSalesRes);

    assert.strictEqual(salesStatusCode, 200, "Sales rejection should return HTTP 200");
    assert.strictEqual(salesMockResponse.success, true, "Response success should be true");
    assert.strictEqual(salesMockResponse.data.status, "rejected", "Order status must transition to 'rejected'");
    assert.strictEqual(salesMockResponse.data.paymentStatus, "refund_pending", "Payment status must be 'refund_pending'");

    
    const createdRefund = await prisma.refund.findUnique({
      where: { orderId: testOrder.id }
    });

    assert.ok(createdRefund, "Refund record must exist in DB");
    assert.strictEqual(createdRefund.status, "pending", "Initial refund status must be 'pending'");
    assert.strictEqual(createdRefund.amount, 6000.0, "Refund amount must be exactly 50% downpayment (₱6,000)");
    assert.ok(createdRefund.paymentMethod.includes("GCash"), "Payment method must preserve customer's GCash details");
    assert.strictEqual(createdRefund.reason, "Out of raw marshall coils for specific profile");
    console.log("PASS: Sales rejection successfully recorded refund of ₱6,000 in DB with status 'pending'.");

    let postRejectionStats = null;
    await getSalesDashboardStats({}, {
      status: () => ({ json: (d) => { postRejectionStats = d.data; } })
    });

    assert.strictEqual(
      postRejectionStats.totals.rawRevenue,
      baselineStats.totals.rawRevenue,
      "Gross revenue in sales dashboard must NOT include the rejected order"
    );
    assert.strictEqual(
      postRejectionStats.totals.orders,
      baselineStats.totals.orders,
      "Gross revenue order volume must NOT count rejected order"
    );
    console.log("PASS: Gross revenue and active order count correctly exclude rejected order.");

    let financeListRes = null;
    const mockFinanceReq = {
      query: { status: "pending" }
    };
    const mockFinanceRes = {
      status: () => ({
        json: (data) => {
          financeListRes = data;
        }
      })
    };

    await getRefunds(mockFinanceReq, mockFinanceRes);
    assert.ok(financeListRes.success, "Finance getRefunds should succeed");
    const foundRefund = financeListRes.data.find(r => r.rawOrderId === testOrder.id);
    assert.ok(foundRefund, "Pending refund must be listed in Finance refunds view");
    assert.strictEqual(foundRefund.amount, 6000.0);
    console.log("PASS: Finance view retrieves the pending refund request.");

    let financeStatsRes = null;
    await getRefundStats({}, { status: () => ({ json: (d) => { financeStatsRes = d; } }) });
    assert.ok(financeStatsRes.success, "Finance stats should succeed");
    assert.ok(financeStatsRes.data.pendingCount >= 1, "Stats should show at least 1 pending refund");
    console.log(`PASS: Finance stats calculated (Pending count: ${financeStatsRes.data.pendingCount}).`);

    let processResData = null;
    let processStatusCode = null;

    const mockProcessReq = {
      params: { id: createdRefund.id.toString() },
      body: {
        transactionReference: "GCASH-TEST-REF-992144",
        returnMethod: "GCash (0917-888-9999)",
        amount: 6000.0,
        notes: "Processed via GCash merchant business dashboard"
      },
      user: { id: testFinanceUser.id },
      app: {
        get: (key) => {
          if (key === "io") {
            return {
              to: (room) => ({
                emit: (event, payload) => {
                  console.log(`[Socket Mock] Emitted '${event}' to room '${room}' with amount ₱${payload?.amount}`);
                }
              }),
              emit: (event, payload) => {
                console.log(`[Socket Mock] Emitted broadcast '${event}' for Order ${payload?.orderId}`);
              }
            };
          }
          return null;
        }
      }
    };

    const mockProcessRes = {
      status: (code) => {
        processStatusCode = code;
        return {
          json: (data) => {
            processResData = data;
          }
        };
      }
    };

    await processRefund(mockProcessReq, mockProcessRes);

    assert.strictEqual(processStatusCode, 200, "Processing refund should return HTTP 200");
    assert.strictEqual(processResData.success, true);

    const updatedRefundInDb = await prisma.refund.findUnique({
      where: { id: createdRefund.id }
    });
    assert.strictEqual(updatedRefundInDb.status, "completed", "Refund status in DB must be 'completed'");
    assert.strictEqual(updatedRefundInDb.transactionReference, "GCASH-TEST-REF-992144");
    assert.ok(updatedRefundInDb.refundedAt !== null, "refundedAt timestamp must be set");

    const updatedOrderInDb = await prisma.order.findUnique({
      where: { id: testOrder.id }
    });
    assert.strictEqual(updatedOrderInDb.paymentStatus, "refunded", "Order paymentStatus must be 'refunded'");

    const expenseEntry = await prisma.expense.findFirst({
      where: { description: { contains: `#ORD-${String(testOrder.id).padStart(3, "0")}` } }
    });
    assert.ok(expenseEntry, "Expense audit entry must be generated");
    assert.strictEqual(expenseEntry.amount, 6000.0);
    assert.strictEqual(expenseEntry.category, "Refund");
    console.log("PASS: Refund processed, Order paymentStatus updated to 'refunded', and Expense audit entry logged.");

    let secondProcessStatusCode = null;
    let secondProcessRes = null;
    await processRefund(mockProcessReq, {
      status: (code) => {
        secondProcessStatusCode = code;
        return { json: (d) => { secondProcessRes = d; } };
      }
    });
    assert.strictEqual(secondProcessStatusCode, 400, "Reprocessing a completed refund must return HTTP 400");
    console.log("PASS: Re-processing prevention guard enforced successfully.");

    console.log("\nALL REFUND SYSTEM CHECKS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exitCode = 1;
  } finally {

    if (testOrder?.id) {
      await prisma.expense.deleteMany({
        where: { description: { contains: `#ORD-${String(testOrder.id).padStart(3, "0")}` } }
      }).catch(() => {});
      await prisma.refund.deleteMany({ where: { orderId: testOrder.id } }).catch(() => {});
      await prisma.order.delete({ where: { id: testOrder.id } }).catch(() => {});
    }
    if (testUser?.id) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    if (testFinanceUser?.id) {
      await prisma.user.delete({ where: { id: testFinanceUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
    console.log("Test cleanup completed.");
  }
};

runRefundSystemVerification();
