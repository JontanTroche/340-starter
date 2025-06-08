const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
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

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

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
    hashedPassword
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


/* ****************************************
 *  Process login request
 * ************************************ */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process logout request
* *************************************** */
async function logoutAccount(req, res) {
  res.clearCookie("jwt")
  res.redirect("/")
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  
  // Verificar que el usuario solo pueda editar su propia cuenta
  if (res.locals.accountData.account_id !== account_id) {
    req.flash("notice", "You can only update your own account information.")
    return res.redirect("/account/")
  }
  
  res.render("account/update", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_id: res.locals.accountData.account_id,
    account_firstname: res.locals.accountData.account_firstname,
    account_lastname: res.locals.accountData.account_lastname,
    account_email: res.locals.accountData.account_email,
  })
}

/* ****************************************
*  Process Account Information Update
* *************************************** */
async function updateAccountInfo(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  // Verificar que el usuario solo pueda editar su propia cuenta
  if (res.locals.accountData.account_id !== parseInt(account_id)) {
    req.flash("notice", "You can only update your own account information.")
    return res.redirect("/account/")
  }

  // Server-side validation
  let errors = [];
  if (!account_firstname || account_firstname.trim().length < 2) {
    errors.push("First name must be at least 2 characters long.");
  }
  if (!account_lastname || account_lastname.trim().length < 2) {
    errors.push("Last name must be at least 2 characters long.");
  }
  if (!account_email || account_email.trim() === "" || !/^\S+@\S+\.\S+$/.test(account_email)) {
    errors.push("A valid email is required.");
  }

  if (errors.length > 0) {
    req.flash("error", errors.join(" "));
    res.status(400).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: errors,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }

  const updateResult = await accountModel.updateAccountInfo(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult) {
    req.flash("notice", "Account information updated successfully.");
    res.redirect("/account/");
  } else {
    req.flash("notice", "Sorry, the account update failed.");
    res.status(501).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

/* ****************************************
*  Process Account Information Update
* *************************************** */
async function updateAccountInfo(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  // Verificar que el usuario solo pueda editar su propia cuenta
  if (res.locals.accountData.account_id !== parseInt(account_id)) {
    req.flash("notice", "You can only update your own account information.")
    return res.redirect("/account/")
  }

  const updateResult = await accountModel.updateAccountInfo(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult) {
    // Obtener los datos actualizados de la cuenta
    const updatedAccountData = await accountModel.getAccountById(account_id)
    
    // Actualizar el JWT con la nueva información
    const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    
    req.flash("notice", "Account information updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.status(501).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
*  Process Password Update
* *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  // Verificar que el usuario solo pueda editar su propia cuenta
  if (res.locals.accountData.account_id !== parseInt(account_id)) {
    req.flash("notice", "You can only update your own account information.")
    return res.redirect("/account/")
  }

  // Hash the password
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password update.')
    return res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_id: res.locals.accountData.account_id,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
    })
  }

  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

  if (updateResult) {
    req.flash("notice", "Password updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_id: res.locals.accountData.account_id,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount, buildAccountManagement, logoutAccount, buildAccountUpdate, updateAccountInfo, updatePassword }