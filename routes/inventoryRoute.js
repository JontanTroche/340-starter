// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Public Routes
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by inv_id view
router.get("/detail/:invId", invController.buildByInvId);

// Admin Routes
// Route to build inventory management view
router.get("/",
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildManagement));

// Route to build and process new classification view
router.get("/add-classification", 
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildAddClassification));

router.post("/add-classification", 
    utilities.checkLogin,
    utilities.checkAccountType,
    invValidate.addClassificationRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));

// Route to build and process new inventory view
router.get("/add-inventory", 
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildAddInventory));
router.post("/add-inventory", 
    utilities.checkLogin,
    utilities.checkAccountType,
    invValidate.addInventoryRules(), invValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));

// Route to get inventory items by classification_id (AJAX)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to build edit inventory view
router.get("/edit/:inv_id", 
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildEditInventory));

// Route to process inventory update
router.post("/update/", 
    utilities.checkLogin,
    utilities.checkAccountType,
    invValidate.addInventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory));

// Route to build delete inventory confirmation view
router.get("/delete/:inv_id", 
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildDeleteInventory));

// Route to process inventory deletion
router.post("/delete/", 
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.deleteInventory));

module.exports = router;