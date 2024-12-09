// controllers/adminController.js
const { getDB } = require("../config/db");
const {
  getAllUsersModel,
  toggleUserStatusModel,
} = require("../models/userModel");

/**
 * Retrieves statistics and the current game for the admin dashboard.
 * @function getAdminDashboardStats
 * @returns {Object} An object containing dashboard stats and the ongoing game (if any).
 */
async function getAdminDashboardStats() {
  const db = getDB();

  try {
    // Retrieve statistics for the dashboard as needed
    const userCount = await db.collection("users").countDocuments();
    const stockCount = await db.collection("stocks").countDocuments();

    // Retrieve the ongoing game (assuming a game with "active" status exists)
    const game = await db.collection("games").findOne({ status: "active" });

    return {
      userCount,
      stockCount,
      game, // Return the game data
    };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    throw error;
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await getAllUsersModel(); // Fetch all users from the database
    // console.log("users", users);
    res.render("manageUsers", { title: "Manage Users", users });
  } catch (error) {
    console.error("Error displaying manage users page:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function toggleUserStatus(req, res) {
  const userId = req.params.userId;
  // console.log("id", userId);
  try {
    // Call the model function to update the user's status
    const result = await toggleUserStatusModel(userId);
    if (result.modifiedCount > 0) {
      console.log(`User status updated for userId: ${userId}`);
    }
    res.redirect("/admin/users"); // Redirect back to the Manage Users page
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { getAdminDashboardStats, getAllUsers, toggleUserStatus };
