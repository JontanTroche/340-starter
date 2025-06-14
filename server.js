/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const utilities = require("./utilities");
const session = require("express-session");
const pool = require('./database/');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

/* ***********************
 * View Engine and Templates (ANTES de middlewares)
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Middleware - ORDEN CORRECTO
 * ************************/

// 1. PRIMERO: Body parsers (CRÍTICO - debe ir antes que todo)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 2. Cookie parser
app.use(cookieParser());

// 3. Session middleware
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

// 4. JWT Token middleware
app.use(utilities.checkJWTToken);

// 5. Debug middleware general (DESPUÉS de parsers)
app.use((req, res, next) => {
  console.log(`Debug - Method: ${req.method}, URL: ${req.url}`);
  if (req.method === 'POST') {
    console.log("Debug - Content-Type:", req.get('Content-Type'));
    console.log("Debug - req.body:", req.body);
    console.log("Debug - Body keys:", Object.keys(req.body || {}));
  }
  next();
});

// 6. JWT Debug middleware
app.use((req, res, next) => {
  console.log("=== JWT DEBUG ===");
  console.log("req.cookies.jwt exists:", !!req.cookies.jwt);
  console.log("res.locals.loggedin:", res.locals.loggedin);
  console.log("res.locals.accountData:", res.locals.accountData);
  console.log("================");
  next();
});

// 7. Nav middleware
app.use(async (req, res, next) => {
  if (!res.locals.nav) {
    console.log("Setting nav for request");
    try {
      res.locals.nav = await utilities.getNav(req, res, next);
    } catch (error) {
      console.error("Error setting nav:", error);
      res.locals.nav = "<ul><li><a href='/'>Home</a></li></ul>";
    }
  }
  next();
});

// 8. Flash messages middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = req.flash();
  console.log("Flash messages set to:", res.locals.messages);
  next();
});

/* ***********************
 * Routes - AL FINAL
 *************************/
app.use(static);

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute);

// Account routes
app.use("/account", accountRoute);

// Test drive route - UN SOLO DEBUG MIDDLEWARE
const testdriveRoute = require("./routes/testdriveRoute");
app.use('/testdrive', (req, res, next) => {
  if (req.method === 'POST') {
    console.log('\n=== TESTDRIVE POST DEBUG ===');
    console.log('URL:', req.url);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body:', req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    console.log('Body values:', Object.values(req.body || {}));
    console.log('Content-Length:', req.get('Content-Length'));
    console.log('Account ID:', res.locals.accountData?.account_id);
    console.log('============================\n');
  }
  next();
});
app.use("/testdrive", testdriveRoute);

// Test route
app.get("/test-route", (req, res) => res.send("Test route is working!"));

// Error 500 route
app.get("/error/500", async (req, res, next) => {
  next({ status: 500, message: "Oh no! There was a crash. Maybe try a different route?", title: "Server Error" });
});

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  const nav = res.locals.nav || await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.render("errors/errors", {
    title: err.title || err.status || 'Server Error',
    message: err.message,
    nav
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;
const host = '0.0.0.0';

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});