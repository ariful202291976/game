// routes/authRoutes.js
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
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
router.post("/register", registerUser);

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
router.post("/login", loginUser);

/**
 * Admin dashboard route (protected).
 * @name get/admin/dashboard
 * @function
 * @memberof module:routes/authRoutes
 * @description Only accessible to admin users.
 */
router.get("/admin/dashboard", ensureAdmin, (req, res) => {
  res.render("adminDashboard", { title: "Admin Dashboard" });
});

module.exports = router;
