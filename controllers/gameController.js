const {
  createGameModel,
  getOngoingGamesModel,
} = require("../models/gameModel");

const createNewGame = async (req, res) => {
  const { gameName, startDateTime, endDateTime } = req.body;

  const newGame = {
    gameName,
    startDateTime: new Date(startDateTime),
    endDateTime: new Date(endDateTime),
    status: "True", // Default status
  };

  // Set a toast message for success
  req.session.gameSuccess = "Game created successfully!"; // Toast message

  try {
    const game = await createGameModel(newGame);
    res.redirect("/admin/dashboard"); // Redirect to the games list page
  } catch (err) {
    console.error("Error creating game:", err);
    res.status(500).send("Internal Server Error");
  }
};

const getAllOngoingGames = async (req, res) => {
  try {
    const games = await getOngoingGamesModel();
    console.log("game", games);
    // res.render("admin/dashboard", { games });
    res.render("adminDashboard", {
      title: "Admin Dashboard",
      user: req.session.user,
      // stats,
      game: games,
    });
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  createNewGame,
  getAllOngoingGames,
};
