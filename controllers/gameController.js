const { getDB } = require("../config/db");
const {
  createGameModel,
  getOngoingGamesModel,
  fetchActiveGames,
} = require("../models/gameModel");
const { ObjectId } = require("mongodb");

const createNewGame = async (req, res) => {
  const { gameName, startDateTime, endDateTime, startingCash } = req.body;

  const newGame = {
    gameName,
    startDateTime: new Date(startDateTime),
    endDateTime: new Date(endDateTime),
    startingCash: parseInt(startingCash, 10),
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
    // console.log("game", games);
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

/**
 * Fetches all available games and renders the available games page.
 * @function getAvailableGames
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function getAvailableGames(req, res) {
  try {
    const games = await fetchActiveGames(); // Call the model function
    res.render("joinGame", { games });
  } catch (error) {
    console.error("Error fetching available games:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Handles joining a game.
 * @function joinGame
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function joinGame(req, res) {
  try {
    const db = getDB();
    const userId = req.session.user?.id;
    const { gameId } = req.body;

    // Fetch game details
    const game = await db
      .collection("games")
      .findOne({ _id: new ObjectId(gameId) });
    console.log(game);

    // if (!game) {
    //   req.session.toast = {
    //     type: "error",
    //     message: "Game not found.",
    //   };
    //   return res.redirect("/games");
    // }

    // Check if the user has already joined this game
    const existingEntry = await db.collection("gameParticipants").findOne({
      gameId: new ObjectId(gameId),
      userId: new ObjectId(userId),
    });

    if (existingEntry) {
      console.log(existingEntry);
      req.session.toast = {
        type: "info",
        message: "You have already joined this game!",
      };
      return res.redirect("/stocks");
    }

    // Add the user to the gameParticipants collection
    await db.collection("gameParticipants").insertOne({
      gameId: new ObjectId(gameId),
      userId: new ObjectId(userId),
      joinedAt: new Date(),
    });

    // Update the user's cash and add game info to their profile
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: { cash: game.startingCash },
        $addToSet: {
          joinedGames: {
            gameId: new ObjectId(gameId),
            gameName: game.gameName,
            joinedAt: new Date(),
          },
        },
      }
    );

    req.session.toast = {
      type: "success",
      message: `You successfully joined the game: ${game.gameName}! Starting cash: ${game.startingCash}.`,
    };

    res.redirect("/stocks"); // Redirect back to the available games page
  } catch (error) {
    console.error("Error joining the game:", error);
    req.session.toast = {
      type: "error",
      message: "Failed to join the game. Please try again.",
    };
    res.redirect("/games");
  }
}

module.exports = {
  createNewGame,
  getAllOngoingGames,
  getAvailableGames,
  joinGame,
};
