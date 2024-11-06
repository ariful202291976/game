const { getDB } = require("../config/db");

async function getAdminDashboardStats() {
  const db = getDB();

  // Fetch stats such as the total number of users, active games, and transactions
  const totalUsers = await db.collection("users").countDocuments();
  //   const totalGames = await db.collection("games").countDocuments();
  //   const totalTransactions = await db
  //     .collection("transactions")
  //     .countDocuments();

  return {
    totalUsers,
    // totalGames,
    // totalTransactions,
  };
}

module.exports = { getAdminDashboardStats };
