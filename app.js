const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
// Uncomment as needed
// const stockRoutes = require("./routes/stockRoutes");
// const portfolioRoutes = require("./routes/portfolioRoutes");
// const adminRoutes = require("./routes/adminRoutes");
const { initializeAdmin } = require("./models/userModel");
const ejsLayouts = require("express-ejs-layouts");

dotenv.config();
connectDB();

const app = express();

app.use(express.json()); // For JSON bodies
app.use(express.urlencoded({ extended: true })); // For form-urlencoded bodies

// Set up sessions for login
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
  })
);
// Enable express-ejs-layouts
app.use(ejsLayouts);

// Middleware to set `user` in `res.locals`
// app.use((req, res, next) => {
//   res.locals.user = req.session.user || null;
//   next();
// });
// app.js or server.js
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.loginSuccess = req.session.loginSuccess || null;

  // Clear the message after it has been passed
  req.session.loginSuccess = null;

  next();
});

initializeAdmin()
  .then(() => console.log("Admin account initialized."))
  .catch((err) => console.error("Failed to initialize admin account:", err));

// Set EJS as the view engine and specify the views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layout"); // Set default layout to 'layout.ejs'

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });
// Root route that renders the index page
app.get("/", (req, res) => {
  res.render("index", {
    title: "Welcome to the Stock Trading Simulation Game",
  });
});

// Routes
app.use("/auth", authRoutes);

// Uncomment these routes as needed
// app.use("/stock", stockRoutes);
// app.use("/portfolio", portfolioRoutes);
// app.use("/admin", adminRoutes);

module.exports = app;
