// models/gameModel.js

const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

/**
 * Creates a new game session.
 * @param {Object} gameData - Game details including duration and other configurations.
 * @returns {Promise<Object>} - Returns the newly created game document.
 */
async function createGame(gameData) {
  const db = getDB();
  const newGame = {
    ...gameData,
    createdAt: new Date(),
    isActive: true,
    players: [],
  };
  const result = await db.collection("games").insertOne(newGame);
  return result.ops[0];
}

/**
 * Ends the game by updating its status and calculating the winner.
 * @param {string} gameId - The ID of the game to end.
 * @param {string} winnerId - The ID of the winning user.
 * @returns {Promise<Object>} - Returns the updated game document with the winner.
 */
async function endGame(gameId, winnerId) {
  const db = getDB();
  return db
    .collection("games")
    .findOneAndUpdate(
      { _id: new ObjectId(gameId) },
      { $set: { isActive: false, winner: winnerId, endedAt: new Date() } },
      { returnDocument: "after" }
    );
}

/**
 * Retrieves the active game session.
 * @returns {Promise<Object|null>} - Returns the active game document or null if no active game.
 */
async function getActiveGame() {
  const db = getDB();
  return db.collection("games").findOne({ isActive: true });
}

module.exports = { createGame, endGame, getActiveGame };
