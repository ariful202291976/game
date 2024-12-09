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
    status: true, // Default status
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
    console.log(games);
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
    // console.log(game);

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

async function getGames(req, res) {
  const db = getDB();
  const role = req.session.user?.role;

  try {
    // Fetch all games
    const games = await db.collection("games").find({}).toArray();

    // Render the game selection page
    res.render("gameSelection", { games, role });
  } catch (error) {
    console.error("Error fetching games:", error.message);
    res.status(500).send("Internal server error");
  }
}

async function getLeaderboard(req, res) {
  const db = getDB();
  const { gameId } = req.query; // Get gameId from query string
  const role = req.session.user?.role;

  if (!gameId) {
    return res.status(400).send("Game ID is required.");
  }

  // Fetch game details
  const game = await db
    .collection("games")
    .findOne({ _id: new ObjectId(gameId) });

  try {
    // Fetch participants and join with users collection
    const participants = await db
      .collection("gameParticipants")
      .aggregate([
        { $match: { gameId: new ObjectId(gameId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 0,
            name: "$userDetails.name",
            email: "$userDetails.email",
            cash: "$userDetails.cash",
          },
        },
        { $sort: { cash: -1 } },
      ])
      .toArray();

    res.render("leaderboard", {
      participants,
      gameId,
      role,
      endDateTime: game.endDateTime,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error.message);
    res.status(500).send("Internal server error");
  }
}

module.exports = {
  createNewGame,
  getAllOngoingGames,
  getAvailableGames,
  joinGame,
  getGames,
  getLeaderboard,
};
