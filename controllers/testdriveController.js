const testdriveModel = require("../models/testdrive-model");
const utilities = require("../utilities");
const invModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");

const testdriveCont = {};

/* ***************************
 * Build test drive request view
 * ************************** */
testdriveCont.buildTestDrive = async function (req, res, next) {
  let nav = res.locals.nav;
  
  // Debug logging
  console.log("buildTestDrive - res.locals.loggedin:", res.locals.loggedin);
  console.log("buildTestDrive - res.locals.accountData:", res.locals.accountData);
  
  // Obtener user_id desde res.locals.accountData (establecido por checkJWTToken)
  const user_id = res.locals.accountData?.account_id || null;
  
  console.log("buildTestDrive - user_id:", user_id);
  
  if (!user_id) {
    req.flash("notice", "Please log in to schedule a test drive.");
    return res.redirect("/account/login");
  }

  try {
    const inventoryList = await utilities.buildInventoryList();
    res.render("testdrive/request", {
      title: "Schedule a Test Drive",
      nav,
      inventoryList,
      errors: null,
      name: "",
      phone: "",
      email: "",
      test_date: "",
    });
  } catch (error) {
    console.error("Error in buildTestDrive:", error);
    req.flash("notice", "Error loading test drive form.");
    res.redirect("/");
  }
};

/* ***************************
 * Validation rules for test drive request
 * ************************** */
testdriveCont.testDriveRules = () => {
  return [
    body("inv_id")
      .notEmpty()
      .withMessage("Please select a vehicle.")
      .isNumeric()
      .withMessage("Vehicle selection must be valid."),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long.")
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Name can only contain letters and spaces."),
    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone is required.")
      .matches(/^\+?[\d\s-]{10,15}$/)
      .withMessage("Phone must be a valid number (10-15 digits)."),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Must provide a valid email."),
    body("test_date")
      .notEmpty()
      .withMessage("Test date is required.")
      .isISO8601()
      .toDate()
      .withMessage("Must provide a valid date.")
      .custom((value) => {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        
        if (selectedDate < today) {
          throw new Error("Test date cannot be in the past.");
        }
        return true;
      }),
  ];
};

/* ***************************
 * Middleware to check test drive data
 * ************************** */
testdriveCont.checkTestDriveData = async (req, res, next) => {
  console.log('\n=== VALIDATION CHECK ===');
  console.log('req.body:', req.body);
  
  const errors = validationResult(req);
  
  console.log('Validation errors:', errors.array());
  console.log('Has errors:', !errors.isEmpty());
  
  if (!errors.isEmpty()) {
    console.log('❌ VALIDATION FAILED - Rendering form with errors');
    
    let nav = res.locals.nav;
    const inventoryList = await utilities.buildInventoryList();
    
    // Render the form again with errors - NO RETURN aquí
    res.render("testdrive/request", {
      title: "Schedule a Test Drive",
      nav,
      inventoryList,
      errors: errors.array().map(err => err.msg),
      name: req.body.name || "",
      phone: req.body.phone || "",
      email: req.body.email || "",
      test_date: req.body.test_date || "",
    });
    return; // Return DESPUÉS de render
  }
  
  console.log('✅ VALIDATION PASSED - Proceeding to addTestDrive');
  console.log('====================\n');
  next();
};

/* ***************************
 * Process test drive request
 * ************************** */
testdriveCont.addTestDrive = async function (req, res, next) {
  let nav = res.locals.nav;
  const user_id = res.locals.accountData?.account_id;
  
  // Debug logging
  console.log('\n=== ADD TESTDRIVE DEBUG ===');
  console.log('user_id:', user_id);
  console.log('req.body:', req.body);
  console.log('========================\n');
  
  const { inv_id, name, phone, email, test_date } = req.body;

  // Validación adicional
  if (!user_id) {
    console.log('❌ No user_id found');
    req.flash("notice", "User authentication failed. Please log in again.");
    return res.redirect("/account/login");
  }

  if (!inv_id || !name || !phone || !email || !test_date) {
    console.log('❌ Missing required fields');
    req.flash("notice", "All fields are required.");
    const inventoryList = await utilities.buildInventoryList();
    return res.render("testdrive/request", {
      title: "Schedule a Test Drive",
      nav,
      inventoryList,
      errors: null,
      name: name || "",
      phone: phone || "",
      email: email || "",
      test_date: test_date || "",
    });
  }

  try {
    console.log('🚀 Calling testdriveModel.addTestDrive with:', {
      user_id, inv_id, name, phone, email, test_date
    });
    
    const result = await testdriveModel.addTestDrive(user_id, inv_id, name, phone, email, test_date);
    
    console.log('✅ Database result:', result);
    
    if (result) {
      req.flash("success", "Test drive successfully scheduled!");
      res.redirect("/");
    } else {
      throw new Error("Failed to schedule test drive - no result returned");
    }
  } catch (error) {
    console.error("❌ Error in addTestDrive:", error);
    req.flash("notice", "Sorry, the test drive request failed: " + error.message);
    const inventoryList = await utilities.buildInventoryList();
    res.status(501).render("testdrive/request", {
      title: "Schedule a Test Drive",
      nav,
      inventoryList,
      errors: null,
      name: name || "",
      phone: phone || "",
      email: email || "",
      test_date: test_date || "",
    });
  }
};

module.exports = testdriveCont;