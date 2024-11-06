/**
 * @file Entry point of the application that connects to the database
 *       and starts the server.
 * @requires module:app
 * @requires module:config/db
 */

const app = require("./app");
const { connectDB } = require("./config/db");
const { initializeAdmin } = require("./models/userModel");

// Port number the server will listen on
const PORT = process.env.PORT || 3001;

/**
 * Connect to the database and start the server.
 * If the database connection is successful, the server starts listening on the specified port.
 * Otherwise, logs an error to the console.
 */
// connectDB()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Server running at http://localhost:${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error("Failed to connect to the database:", error);
//   });

// const express = require("express");
// const { connectDB } = require("./config/db");

// const app = express();
// const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Initialize admin account after connecting to the database
    await initializeAdmin();
    console.log("Admin account initialized");

    app.listen(PORT, () => {
      console.log("Server running at http://localhost:" + PORT);
    });
  } catch (error) {
    console.error("Failed to initialize admin account:", error);
  }
})();
