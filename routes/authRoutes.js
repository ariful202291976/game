// routes/authRoutes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");
const router = express.Router();

/**
 * Renders the registration page.
 * @name get/register
 * @function
 * @memberof module:routes/authRoutes
 */
router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

/**
 * Handles user registration (for regular users).
 * @name post/register
 * @function
 * @memberof module:routes/authRoutes
 */
// router.post("/register", registerUser);
router.post("/register", async (req, res) => {
  try {
    await registerUser(req, res);
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).send("An error occurred during registration.");
  }
});

/**
 * Renders the login page.
 * @name get/login
 * @function
 * @memberof module:routes/authRoutes
 */
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

/**
 * Handles user or admin login.
 * @name post/login
 * @function
 * @memberof module:routes/authRoutes
 */
// router.post("/login", loginUser);
router.post("/login", async (req, res) => {
  try {
    await loginUser(req, res);
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).send("An error occurred during login.");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout Error:", err);
      return res.status(500).send("An error occurred during logout.");
    }
    res.redirect("/auth/login"); // Redirect to login page after logging out
  });
});

router.get("/forgot-password", (req, res) => {
  res.render("forgotPassword", { title: "Forgot Password" });
});

// Step 1: Forgot Password - Send OTP
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const otp = await sendOtp(email);
  if (otp) {
    req.session.email = email; // Save email in session
    req.session.otp = otp; // Save OTP in session for verification
    res.redirect("/auth/verify-otp");
  } else {
    res.status(400).send("Failed to send OTP. Please try again.");
  }
});

router.get("/verify-otp", (req, res) => {
  res.render("verifyOtp", { title: "Verify OTP" });
});

router.post("/verify-otp", async (req, res) => {
  try {
    await verifyOtp(req, res);
  } catch (error) {
    console.error("Otp Error:", error.message);
    res.status(500).send("An error occurred.");
  }
});

router.get("/reset-password", (req, res) => {
  res.render("resetPassword", { title: "Reset Password" });
});

router.post("/reset-password", async (req, res) => {
  try {
    await resetPassword(req, res);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
