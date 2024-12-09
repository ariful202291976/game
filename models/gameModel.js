// models/gameModel.js
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

/**
 * Creates a new game document in the database.
 * @param {Object} gameData - Data for the new game.
 * @returns {Promise<Object>} - The created game document.
 */
async function createGameModel(gameData) {
  const db = getDB();
  return await db.collection("games").insertOne(gameData);
  // const result = await db.collection("games").insertOne(gameData);
  // return result.ops[0];
}

/**
 * Finds a game by its ID.
 * @param {string} gameId - The ID of the game to find.
 * @returns {Promise<Object|null>} - The game document or null if not found.
 */
async function findGameById(gameId) {
  const db = getDB();
  return await db.collection("games").findOne({ _id: new ObjectId(gameId) });
}

/**
 * Gets all ongoing games.
 * @returns {Promise<Array>} - An array of ongoing game documents.
 */
async function getOngoingGamesModel() {
  const db = getDB();
  const currentTime = new Date();
  return await db
    .collection("games")
    .find({
      status: true,
      endDateTime: { $gte: currentTime }, // Only fetch games with endDateTime >= current time
    })
    .toArray();
}

/**
 * Fetches all games with the status "True" from the database.
 * @function fetchActiveGames
 * @returns {Promise<Array>} - Array of active game objects.
 */
async function fetchActiveGames() {
  try {
    const db = getDB();
    const currentTime = new Date();
    return await db
      .collection("games")
      .find({
        status: true,
        endDateTime: { $gte: currentTime }, // Only fetch games with endDateTime >= current time
      })
      .toArray();
  } catch (error) {
    console.error("Error fetching active games from the database:", error);
    throw error; // Pass the error back to the controller
  }
}

/**
 * Updates the status and other details of a game.
 * @param {string} gameId - The ID of the game to update.
 * @param {Object} updateData - Data to update in the game document.
 * @returns {Promise<Object|null>} - The updated game document or null if not found.
 */
async function updateGameStatus(gameId, updateData) {
  const db = getDB();
  const result = await db
    .collection("games")
    .findOneAndUpdate(
      { _id: new ObjectId(gameId) },
      { $set: updateData },
      { returnOriginal: false }
    );
  return result.value;
}

module.exports = {
  createGameModel,
  findGameById,
  getOngoingGamesModel,
  fetchActiveGames,
  updateGameStatus,
};
