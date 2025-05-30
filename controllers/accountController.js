const utilities = require("../utilities");
const accountModel = require("../models/account-model");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body



  // server-side validation
  let errors = [];
  if (!account_firstname || account_firstname.trim() === "") {
    errors.push("Please provide a first name.");
  }
  if (!account_lastname || account_lastname.trim() === "") {
    errors.push("Please provide a last name.");
  }
  if (!account_email || account_email.trim() === "" || !/^\S+@\S+\.\S+$/.test(account_email)) {
    errors.push("A valid email is required.");
  }
  if (!account_password || account_password.trim() === "" || !/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{12,}$/.test(account_password)) {
    errors.push("Password does not meet requirements.");
  }

  if (errors.length > 0) {
    req.flash("error", errors.join(" "));
    res.status(400).render("account/register", {
      title: "Registration",
      nav,
      errors: errors,
    });
    return;
  }
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.redirect("/account/register");
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount }