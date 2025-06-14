const express = require("express");
const router = new express.Router();
const testdriveController = require("../controllers/testdriveController");
const utilities = require("../utilities");
const { testDriveRules, checkTestDriveData } = testdriveController;

// Ruta GET para mostrar el formulario de test drive
router.get(
  "/request",
  (req, res, next) => {
    console.log("GET /request - res.locals.loggedin:", res.locals.loggedin);
    console.log("GET /request - res.locals.accountData:", res.locals.accountData);
    next();
  },
  utilities.checkLogin,
  utilities.handleErrors(testdriveController.buildTestDrive)
);

// Ruta POST para procesar el formulario de test drive
router.post(
  "/request",
  (req, res, next) => {
    console.log("POST /request - res.locals.loggedin:", res.locals.loggedin);
    console.log("POST /request - res.locals.accountData:", res.locals.accountData);
    next();
  },
  utilities.checkLogin,
  testDriveRules(),
  checkTestDriveData,
  utilities.handleErrors(testdriveController.addTestDrive)
);

module.exports = router;