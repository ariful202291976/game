// controllers/adminController.js
const { getDB } = require("../config/db");

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

module.exports = { getAdminDashboardStats };
