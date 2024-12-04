const { getDB } = require("../config/db");

/**
 * Registers a new user.
 * @function registerUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function registerUser(req, res) {
  const { name, email, password, confirmPassword } = req.body;
  console.log(name);
  // Basic validation
  if (!name || !email || !password || password !== confirmPassword) {
    return res.status(400).send("Invalid input or passwords do not match.");
  }

  try {
    const db = getDB();

    // Check if the email already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already in use.");
    }

    // Insert the user into the database without password hashing
    const newUser = {
      name,
      email,
      password,
      role: "user", // Default role
      // portfolio: { cash: 0 }, // Starting cash for players
      cash: 0,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);
    req.session.user = {
      id: result.insertedId,
      role: newUser.role,
      name: newUser.name,
    };
    req.session.loginSuccess = "Welcome, " + newUser.name + "!"; // Toast message
    res.redirect("/user/portfolio"); // Redirect to login after successful registration
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Logs in a user or admin without hashed password comparison.
 * @function loginUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const db = getDB();

    // Find the user by email
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid email or password.");
    }

    // Verify the password (direct comparison, since we're not using bcrypt)
    if (password !== user.password) {
      return res.status(400).send("Invalid email or password.");
    }

    // Set session user and a success message for the toast
    req.session.user = { id: user._id, role: user.role, name: user.name };
    req.session.loginSuccess = "Welcome , " + user.name + "!"; // Toast message

    // Redirect based on role
    if (user.role === "admin") {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/user/portfolio"); // User dashboard
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

/**
 * Logs out the user by destroying their session.
 * @function logoutUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
function logoutUser(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout Error:", err);
      return res.status(500).send("An error occurred during logout.");
    }
    res.redirect("/auth/login"); // Redirect to login page after logging out
  });
}

module.exports = { registerUser, loginUser, logoutUser };
