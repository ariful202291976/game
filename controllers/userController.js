// controllers/userController.js
const {
  getUserProfileModel,
  getUserPortfolioModel,
} = require("../models/userModel");

/**
 * Renders the user's profile page.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function getUserProfile(req, res) {
  const userId = req.session.user?.id; // Get user ID from session

  if (!userId) {
    return res.redirect("/auth/login"); // Redirect if user is not logged in
  }

  try {
    const user = await getUserProfileModel(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("userProfile", {
      title: "Profile",
      user,
    });
  } catch (error) {
    console.error("Error rendering user profile:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Get user portfolio and render it on the portfolio page
async function getUserPortfolio(req, res) {
  const userId = req.session.user?.id; // Get user ID from session

  try {
    const user = await getUserProfileModel(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("userPortfolio", {
      title: "Portfolio",
      user,
    });
  } catch (error) {
    console.error("Error displaying portfolio:", error);
    res.status(500).send("Error loading portfolio");
  }
}

module.exports = { getUserProfile, getUserPortfolio };
