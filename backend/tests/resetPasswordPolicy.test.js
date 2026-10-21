const assert = require("assert");
const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { resetPassword, login } = require("../controllers/authController");

const runResetPasswordPolicyVerification = async () => {
  console.log("Starting Reset Password Policy Automated Verification...");

  const testEmail = "reset_policy_test_customer@megapacific.test";
  const oldPassword = "InitialSecurePass123!";
  const newPasswordSame = "InitialSecurePass123!";
  const newPasswordDifferent = "NewStrongReplacementPass456#";
  const validOtp = "998877";

  let testUser = null;

  try {
    // Step 1: Create or reset test user with known password
    const hashedPassword = await bcrypt.hash(oldPassword, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    testUser = await prisma.user.upsert({
      where: { email: testEmail },
      update: {
        password: hashedPassword,
        role: "customer",
        isEmailVerified: true,
        resetOtpCode: validOtp,
        resetOtpExpiresAt: otpExpiresAt,
      },
      create: {
        email: testEmail,
        password: hashedPassword,
        role: "customer",
        isEmailVerified: true,
        resetOtpCode: validOtp,
        resetOtpExpiresAt: otpExpiresAt,
        customerProfile: {
          create: {
            name: "Reset Password Policy Test User",
            contactNumber: "0917-000-1111"
          }
        }
      }
    });

    console.log("PASS: Test customer initialized with previous password.");

    // Step 2: Attempt reset with the SAME password
    let samePasswordStatus = null;
    let samePasswordResponse = null;

    const mockReqSame = {
      body: {
        email: testEmail,
        otp: validOtp,
        newPassword: newPasswordSame
      }
    };

    const mockResSame = {
      status: (code) => {
        samePasswordStatus = code;
        return {
          json: (data) => {
            samePasswordResponse = data;
          }
        };
      }
    };

    await resetPassword(mockReqSame, mockResSame);

    assert.strictEqual(samePasswordStatus, 400, "Resetting with identical password must return HTTP 400");
    assert.strictEqual(
      samePasswordResponse.error,
      "New password cannot be the same as your previous password. Please choose a different password.",
      "Error message must clearly inform user that previous password cannot be reused"
    );
    console.log("PASS: Rejection verified when new password matches forgotten/previous password.");

    // Step 3: Verify user password in database has NOT been changed
    const userAfterRejectedReset = await prisma.user.findUnique({ where: { email: testEmail } });
    const isOldPasswordStillValid = await bcrypt.compare(oldPassword, userAfterRejectedReset.password);
    assert.strictEqual(isOldPasswordStillValid, true, "Previous password must remain intact after rejected reset");
    assert.strictEqual(userAfterRejectedReset.resetOtpCode, validOtp, "Reset OTP should remain available after password rejection");
    console.log("PASS: Database state preserved after rejected reset attempt.");

    // Step 4: Attempt reset with a DIFFERENT password
    let differentPasswordStatus = null;
    let differentPasswordResponse = null;

    const mockReqDiff = {
      body: {
        email: testEmail,
        otp: validOtp,
        newPassword: newPasswordDifferent
      }
    };

    const mockResDiff = {
      status: (code) => {
        differentPasswordStatus = code;
        return {
          json: (data) => {
            differentPasswordResponse = data;
          }
        };
      }
    };

    await resetPassword(mockReqDiff, mockResDiff);

    assert.strictEqual(differentPasswordStatus, 200, "Resetting with different password must return HTTP 200");
    assert.ok(
      differentPasswordResponse.message.includes("Password has been reset successfully"),
      "Success message must confirm password reset"
    );
    console.log("PASS: Reset succeeds when new password is different from previous password.");

    // Step 5: Verify DB state after successful reset
    const userAfterSuccess = await prisma.user.findUnique({ where: { email: testEmail } });
    assert.strictEqual(userAfterSuccess.resetOtpCode, null, "Reset OTP must be cleared");
    assert.strictEqual(userAfterSuccess.resetOtpExpiresAt, null, "Reset OTP expiry must be cleared");

    const isNewPasswordActive = await bcrypt.compare(newPasswordDifferent, userAfterSuccess.password);
    assert.strictEqual(isNewPasswordActive, true, "New password must match stored hash");

    const isOldPasswordObsolete = await bcrypt.compare(oldPassword, userAfterSuccess.password);
    assert.strictEqual(isOldPasswordObsolete, false, "Old password must no longer match stored hash");
    console.log("PASS: Database updated with new hash and reset OTP cleared.");

    // Step 6: Verify login works with new password and fails with old password
    let loginOldStatus = null;
    let loginOldResponse = null;
    await login(
      { body: { email: testEmail, password: oldPassword }, ip: "127.0.0.1", headers: {}, app: { get: () => null } },
      { status: (code) => { loginOldStatus = code; return { json: (d) => { loginOldResponse = d; } }; } }
    );
    assert.strictEqual(loginOldStatus, 401, "Login with old password must fail with HTTP 401");

    // First attempt with new password triggers customer login OTP
    let loginNewStatus = null;
    let loginNewResponse = null;
    await login(
      { body: { email: testEmail, password: newPasswordDifferent }, ip: "127.0.0.1", headers: {}, app: { get: () => null } },
      { status: (code) => { loginNewStatus = code; return { json: (d) => { loginNewResponse = d; } }; } }
    );
    assert.strictEqual(loginNewStatus, 200, "Login credentials must be verified");
    assert.strictEqual(loginNewResponse.requiresOtp, true, "Customer login requires OTP verification");

    // Retrieve generated login OTP from DB to complete 2FA
    const userForLogin = await prisma.user.findUnique({ where: { email: testEmail } });
    let login2FAStatus = null;
    let login2FAResponse = null;
    await login(
      { body: { email: testEmail, password: newPasswordDifferent, otp: userForLogin.otpCode }, ip: "127.0.0.1", headers: {}, app: { get: () => null } },
      { status: (code) => { login2FAStatus = code; return { json: (d) => { login2FAResponse = d; } }; } }
    );
    assert.strictEqual(login2FAStatus, 200, "2FA login with new password must succeed with HTTP 200");
    assert.ok(login2FAResponse.token, "Login must issue a valid JWT token");
    console.log("PASS: Login verified with new password and 2FA OTP.");

    console.log("\nALL RESET PASSWORD POLICY CHECKS PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("TEST FAILED:", error);
    process.exitCode = 1;
  } finally {
    if (testUser?.id) {
      await prisma.userSession.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.customerProfile.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
      console.log("Test cleanup completed.");
    }
    await prisma.$disconnect();
  }
};

runResetPasswordPolicyVerification();
