const express = require("express");
const { getAllOngoingGames } = require("../controllers/gameController");
const { createNewGame } = require("../controllers/gameController");
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
 * Admin dashboard route (protected).
 * @name get/admin/dashboard
 * @function
 * @memberof module:routes/authRoutes
 * @description Only accessible to admin users.
 */
// routes/adminRoutes.js
router.get("/dashboard", ensureAdmin, async (req, res) => {
  try {
    await getAllOngoingGames(req, res);
    // const games = await getAllOngoingGames();
    // console.log("Stats game data:", games);

    // res.render("adminDashboard", {
    //   title: "Admin Dashboard",
    //   user: req.session.user,
    //   stats,
    //   game: games,
    // });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Manage Users page content
router.get("/users", ensureAdmin, (req, res) => {
  res.render("manageUsers", { title: "Manage Users" });
});

// Manage Stocks page content
router.get("/stocks", ensureAdmin, (req, res) => {
  res.render("manageStocks", { title: "Manage Stocks" });
});

// Leaderboard page content
router.get("/leaderboard", ensureAdmin, (req, res) => {
  res.render("leaderboard", { title: "Leaderboard" });
});

//create new game
router.get("/create-game", ensureAdmin, (req, res) => {
  res.render("createGame", {
    title: "Create New Game",
  });
});

// post new game
router.post("/create-game", ensureAdmin, async (req, res) => {
  const { gameName, startDateTime, endDateTime } = req.body;

  // Here, you can implement the logic to store the game in your database.
  // For now, let's log the values to the console:
  console.log("Game Name:", gameName);
  console.log("Start Date and Time:", startDateTime);
  console.log("End Date and Time:", endDateTime);

  try {
    await createNewGame(req, res);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("An error occurred during game creation.");
  }

  // Redirect to the admin dashboard or another page after creating the game
  // res.redirect("/admin/dashboard");
});

module.exports = router;
