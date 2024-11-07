// routes/authRoutes.js
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
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

module.exports = router;
