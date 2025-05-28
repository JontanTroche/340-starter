/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
console.log("Starting server.js...");

/* ***********************
 * Require Statements
 *************************/
console.log("Loading dependencies...");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities");

console.log("Dependencies loaded successfully.");

/* ***********************
 * View Engine and Templates
 *************************/
console.log("Configuring view engine...");
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root
console.log("View engine configured.");

/* ***********************
 * Routes
 *************************/
console.log("Setting up routes...");
app.use(static);

// Index route (ruta estática para prueba)
app.get("/", (req, res) => {
  console.log("Handling request to root route...");
  res.send("¡Hola, mundo! Esto es una prueba desde Render.");
});

// Inventory routes
app.use("/inv", inventoryRoute);

// Error 500 route
app.get("/error/500", async (req, res, next) => {
  next({ status: 500, message: "Oh no! There was a crash. Maybe try a different route?", title: "Server Error" });
});

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

console.log("Routes set up successfully.");

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  console.log("Entering error handler...");
  const nav = [
    { name: "Home", link: "/" },
    { name: "Inventory", link: "/inv" }
  ]; // Navegación estática
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.render("errors/errors", {
    title: err.title || err.status || 'Server Error',
    message: err.message,
    nav
  });
});

console.log("Error handler set up.");

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;
const host = '0.0.0.0';

console.log(`Attempting to start server on ${host}:${port}...`);

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});

console.log("Server startup initiated.");