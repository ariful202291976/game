const { getDB } = require("../config/db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { sentOtpModel } = require("../models/authModel");

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

// Generate and send OTP
async function sendOtp(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP

  // Set up Nodemailer transporter
  // const transporter = nodemailer.createTransport({
  //   service: "gmail", // Use Gmail as the email provider
  //   auth: {
  //     user: "ariful00892@gmail.com", // Replace with your Gmail address
  //     pass: "yiuh sagk rndf bjxe", // Replace with the generated App Password
  //   },
  // });

  // const mailOptions = {
  //   from: "ariful00892@gmail.com",
  //   to: email,
  //   subject: "Stock Simultation: OTP Code",
  //   text: `Your OTP code is: ${otp}`,
  // };

  // return new Promise((resolve, reject) => {
  //   transporter.sendMail(mailOptions, (err, info) => {
  //     if (err) {
  //       console.error("Error sending OTP:", err.message);
  //       return reject(err); // Reject the promise on error
  //     }
  //     // console.log("OTP sent:", info.response);
  //     resolve(otp); // Resolve with the OTP
  //   });
  // });

  const result = await sentOtpModel(email, otp);
  return otp;
}

async function verifyOtp(req, res) {
  const { otp } = req.body;

  // Retrieve OTP and email from session
  const sessionOtp = req.session.otp;
  const sessionEmail = req.session.email;

  if (!sessionOtp || !sessionEmail) {
    return res
      .status(400)
      .json({ error: "Session expired. Please try again." });
  }

  if (otp == sessionOtp) {
    // Clear OTP from session after successful verification
    delete req.session.otp;

    return res.status(200).json({
      message: "OTP verified successfully. Proceed to reset your password.",
    });
  } else {
    return res.status(401).json({ error: "Invalid OTP. Please try again." });
  }
}

async function resetPassword(req, res) {
  const { password } = req.body; // Get passwords from request body
  const email = req.session.email; // Retrieve email from session

  if (!email) {
    return res
      .status(400)
      .json({ error: "Session expired. Please try again." });
  }

  try {
    const db = getDB(); // Get database connection

    // Update the user's password in the database
    const updatedUser = await db.collection("users").findOneAndUpdate(
      { email },
      { $set: { password } }, // Directly set the new password
      { returnDocument: "after" } // Return the updated document
    );

    if (updatedUser) {
      // Clear session data after successful password reset
      req.session.destroy();

      return res.status(200).json({
        message: "Password reset successfully. You can now log in.",
      });
    } else {
      return res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.error("Error resetting password:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  sendOtp,
  verifyOtp,
  resetPassword,
};
