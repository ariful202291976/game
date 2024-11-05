const { MongoClient } = require("mongodb");
require("dotenv").config();

let db;

/**
 * Connects to MongoDB using the URI from the environment variables.
 * Initializes the `db` variable for use throughout the application.
 * This function should be called once when starting the server.
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the connection is established.
 * @throws Will throw an error if the connection fails.
 */
async function connectDB() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    db = client.db("stockTradingApp"); // Ensure to set the correct database name here
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error; // Rethrow the error for handling in the calling function
  }
}

/**
 * Returns the MongoDB database instance.
 * Use this function in other modules to perform database operations.
 * @function
 * @returns {Object} The MongoDB database instance.
 * @throws Will throw an error if the database connection is not established.
 */
function getDB() {
  if (!db) {
    throw new Error("Database not connected. Please call connectDB first.");
  }
  return db;
}

module.exports = { connectDB, getDB };
