// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.post('/register', regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

//Process the login request
router.post(
  "/login", 
  regValidate.loginRules(), 
  regValidate.checkLoginData, 
  utilities.handleErrors(accountController.loginAccount)
);

router.get("/logout", utilities.handleErrors(accountController.logoutAccount));

//Update account
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate));

// Routes for processing account updates
router.post("/update-info", 
  utilities.checkLogin, 
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo));
router.post("/update-password", 
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.checkLogin, utilities.handleErrors(accountController.updatePassword));

module.exports = router;