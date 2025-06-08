// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by inv_id view
router.get("/detail/:invId", invController.buildByInvId);

// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to build and process new classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.post("/add-classification", invValidate.addClassificationRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));

// Route to build and process new inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post("/add-inventory", invValidate.addInventoryRules(), invValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));

// Route to get inventory items by classification_id (AJAX)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.handleErrors(invController.buildEditInventory));

// Route to process inventory update
router.post("/update/", 
    invValidate.addInventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory));

// Route to build delete inventory confirmation view
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteInventory));

// Route to process inventory deletion
router.post("/delete/", utilities.handleErrors(invController.deleteInventory));

module.exports = router;