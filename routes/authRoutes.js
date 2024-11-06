// routes/authRoutes.js
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { getAdminDashboardStats } = require("../controllers/adminController");
const router = express.Router();

/**
 * Middleware to ensure access for admin only.
 * @function ensureAdmin
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @description Allows access only if the user role is admin; otherwise, sends a 403 status.
 */
function ensureAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") {
    next();
  } else {
    res.status(403).send("Access denied");
  }
}

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

/**
 * Admin dashboard route (protected).
 * @name get/admin/dashboard
 * @function
 * @memberof module:routes/authRoutes
 * @description Only accessible to admin users.
 */
router.get("/admin/dashboard", ensureAdmin, async (req, res) => {
  try {
    const stats = await getAdminDashboardStats(); // Get the stats for the dashboard

    // Render the dashboard with the stats and the user data
    res.render("adminDashboard", {
      title: "Admin Dashboard",
      user: req.session.user,
      stats,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).send("Internal Server Error");
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
