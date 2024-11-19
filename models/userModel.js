// models/User.js
const { ObjectId } = require("mongodb");
const { connectDB, getDB } = require("../config/db");

/**
 * User Schema.
 *
 * @typedef {Object} User
 * @property {ObjectId} _id - Unique identifier for the user.
 * @property {string} name - Full name of the user.
 * @property {string} email - User's email, must be unique.
 * @property {string} password - User's password.
 * @property {string} role - Role of the user, either "user" or "admin".
 * @property {number} startingCash - Starting cash for trading (only for regular users).
 * @property {Array<Object>} portfolio - List of stocks owned by the user.
 */

/**
 * Validates a user object.
 * @param {User} user - The user object to validate.
 * @param {string} confirmPassword - The password confirmation to validate against the user's password.
 * @returns {Object} Contains `valid` (boolean) and `errors` (array).
 */
function validateUser(user, confirmPassword) {
  const errors = [];

  if (!user.name || typeof user.name !== "string")
    errors.push("Name is required and must be a string.");
  if (!user.email || typeof user.email !== "string")
    errors.push("Email is required and must be a string.");
  if (!user.password || typeof user.password !== "string")
    errors.push("Password is required and must be a string.");
  if (user.password !== confirmPassword) errors.push("Passwords do not match.");
  if (user.role !== "user" && user.role !== "admin")
    errors.push("Role must be either 'user' or 'admin'.");

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Inserts a new user or admin in the database.
 * @param {User} user - The user object to insert.
 * @param {string} confirmPassword - The password confirmation for the user.
 * @returns {Promise<Object>} The inserted user document.
 */
async function insertUser(user, confirmPassword) {
  const { valid, errors } = validateUser(user, confirmPassword);
  if (!valid) throw new Error(errors.join(" "));

  const db = await connectDB();

  // Default starting cash and portfolio for regular users only
  if (user.role === "user") {
    user.startingCash = 10000;
    user.portfolio = [];
  }

  return await db.collection("users").insertOne(user);
}

/**
 * Initializes the admin account if it does not already exist.
 *
 * @returns {Promise<Object>} The initialized admin document.
 */
async function initializeAdmin() {
  const db = getDB(); // Get the database instance
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword)
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables."
    );

  const existingAdmin = await db
    .collection("users")
    .findOne({ email: adminEmail, role: "admin" });

  if (!existingAdmin) {
    const adminUser = {
      _id: new ObjectId(),
      name: "Admin",
      email: adminEmail,
      password: adminPassword, // Store directly without encryption as per requirements
      role: "admin",
    };

    await db.collection("users").insertOne(adminUser);
    return adminUser;
  }

  return existingAdmin;
}

/**
 * Retrieves a user's profile information from the database.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - The user's profile information.
 */
async function getUserProfileModel(userId) {
  const db = getDB();
  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    return user;
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    throw error;
  }
}

// Get the user's portfolio
async function getUserPortfolioModel(userId) {
  const db = getDB();
  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    return user; // assuming portfolio is a field in the user document
  } catch (error) {
    console.error("Error retrieving user portfolio:", error);
    throw error;
  }
}

/**
 * Fetches all users from the database.
 * @returns {Promise<Array>} - A promise that resolves to an array of users.
 */
async function getAllUsersModel() {
  const db = getDB();
  try {
    // Fetch users where role is not "admin"
    const users = await db
      .collection("users")
      .find({ role: { $ne: "admin" } })
      .toArray();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

module.exports = {
  validateUser,
  insertUser,
  initializeAdmin,
  getUserProfileModel,
  getUserPortfolioModel,
  getAllUsersModel,
};
