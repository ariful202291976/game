const express = require("express");
const {
  getUserProfile,
  getUserPortfolio,
} = require("../controllers/userController");
const router = express.Router();

// portfolio page content
router.get("/portfolio", async (req, res) => {
  try {
    await getUserPortfolio(req, res);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// marketplace page content
router.get("/marketplace", (req, res) => {
  res.render("marketplace", { title: "Marketplace" });
});

// profile page content
router.get("/profile", async (req, res) => {
  try {
    await getUserProfile(req, res);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
