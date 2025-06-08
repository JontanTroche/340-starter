const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = res.locals.nav;
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    });
};

/* ***************************
 * Build inventory by inv_id view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
    const inv_id = req.params.invId;
    const data = await invModel.getInventoryById(inv_id);
    let nav = res.locals.nav;

    if (!data) {
        req.flash("notice", "Sorry, no vehicle found with that ID.");
        return res.redirect("/");
    }

    let detailDisplay = '<div id="vehicle-detail">';
    detailDisplay += `<img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model} on CSE Motors">`;
    detailDisplay += '<div class="vehicle-info">';
    detailDisplay += `<h1>${data.inv_make} ${data.inv_model}</h1>`;
    detailDisplay += `<p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(data.inv_price)}</p>`;
    detailDisplay += `<p><strong>Description:</strong> ${data.inv_description}</p>`;
    detailDisplay += `<p><strong>Color:</strong> ${data.inv_color}</p>`;
    detailDisplay += `<p><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</p>`;
    detailDisplay += '</div>';
    detailDisplay += '</div>';

    res.render("./inventory/inv-detail", {
        title: `${data.inv_make} ${data.inv_model} Details`,
        nav,
        detailDisplay,
    });
};

/* ***************************
 * Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
    let nav = res.locals.nav;
    const classificationSelect = await utilities.buildClassificationList();

    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        classificationSelect,
        errors: null,
    });
};

/* ***************************
 * Build new Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = res.locals.nav;
    console.log("Rendering: inventory/add-classification"); // Depuración
    res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        classification_name: "",
    });
};

/* ***************************
 *  Process the addition of a new classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
    let nav = res.locals.nav;
    const classification_name = req.body?.classification_name || "";

    if (!classification_name) {
        req.flash("notice", "Classification name is missing.");
        res.status(400).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null,
            classification_name: "",
        });
        return;
    }

    const result = await invModel.addClassification(classification_name);

    if (result) {
        req.flash("notice", `Successfully added ${classification_name} classification.`);
        res.render("inventory/management", {
            title: "Inventory Management",
            nav,
            errors: null,
        });
    } else {
        req.flash("notice", "Sorry, the classification addition failed.");
        res.status(501).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null,
            classification_name,
        });
    }
};

/* ***************************
 * Build new Inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
    const nav = res.locals.nav;
    const classificationList = await utilities.buildClassificationList();
    const formData = req.session.formData || {
        classification_id: "",
        inv_make: "",
        inv_model: "",
        inv_description: "",
        inv_image: "/images/vehicles/no-image.png",
        inv_thumbnail: "/images/vehicles/no-image-tn.png",
        inv_price: "",
        inv_year: "",
        inv_miles: "",
        inv_color: "",
    };

    delete req.session.formData;
    res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: null,
        classification_id: formData.classification_id,
        inv_make: formData.inv_make,
        inv_model: formData.inv_model,
        inv_description: formData.inv_description,
        inv_image: formData.inv_image,
        inv_thumbnail: formData.inv_thumbnail,
        inv_price: formData.inv_price,
        inv_year: formData.inv_year,
        inv_miles: formData.inv_miles,
        inv_color: formData.inv_color,
    });
};

/* ***************************
 *  Process the addition of a new vehicle
 * ************************** */
invCont.addInventory = async function (req, res, next) {
    const nav = res.locals.nav;
    const {
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
    } = req.body;

    const result = await invModel.addInventory(
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
    );

    const classificationList = await utilities.buildClassificationList(classification_id);

    if (result) {
        req.flash("notice", `Successfully added ${inv_make} ${inv_model} to the inventory.`);
        const classificationSelect = await utilities.buildClassificationList();
        res.render("inventory/management", {
            title: "Inventory Management",
            nav,
            classificationSelect,
            errors: null,
        });
    } else {
        req.flash("notice", "Sorry, the vehicle addition failed.");
        res.status(501).render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationList,
            classification_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color
        });
    }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 *************************** */
invCont.buildEditInventory = async function (req, res, next) {
  console.log("Debug - Entering buildEditInventory for inv_id:", req.params.inv_id); // Depuración
  const inv_id = parseInt(req.params.inv_id);
  let nav = res.locals.nav;
  try {
    const itemData = await invModel.getInventoryById(inv_id);
    console.log("Debug - itemData from getInventoryById:", itemData); // Depuración
    if (!itemData) {
      console.log("Debug - No vehicle found for inv_id:", inv_id); // Depuración
      req.flash("notice", "Sorry, no vehicle found with that ID.");
      return res.redirect("/inv/");
    }
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    console.log("Debug - Generated itemName:", itemName); // Depuración
    console.log("Debug - Rendering with title:", "Edit " + itemName); // Depuración
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    console.error("Error in buildEditInventory:", error);
    req.flash("notice", "Error loading vehicle data.");
    res.redirect("/inv/");
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body;
    const updateResult = await invModel.updateInventory(
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    );

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model;
        req.flash("notice", `The ${itemName} was successfully updated.`);
        res.redirect("/inv/");
    } else {
        const classificationSelect = await utilities.buildClassificationList(classification_id);
        const itemName = `${inv_make} ${inv_model}`;
        req.flash("notice", "Sorry, the insert failed.");
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        });
    }
};

/* ***************************
 *  Build delete inventory confirmation view
 *************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  console.log("Debug - Entering buildDeleteInventory for inv_id:", req.params.inv_id); // Depuración
  const inv_id = parseInt(req.params.inv_id);
  let nav = res.locals.nav;
  try {
    const itemData = await invModel.getInventoryById(inv_id);
    console.log("Debug - itemData from getInventoryById:", itemData); // Depuración
    if (!itemData) {
      console.log("Debug - No vehicle found for inv_id:", inv_id); // Depuración
      req.flash("notice", "Sorry, no vehicle found with that ID.");
      return res.redirect("/inv/");
    }
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    console.log("Debug - Generated itemName:", itemName); // Depuración
    console.log("Debug - Rendering with title:", "Delete " + itemName); // Depuración
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    });
  } catch (error) {
    console.error("Error in buildDeleteInventory:", error);
    req.flash("notice", "Error loading vehicle data.");
    res.redirect("/inv/");
  }
};

/* ***************************
 *  Process Delete Inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const inv_id = parseInt(req.body.inv_id);
    
    const deleteResult = await invModel.deleteInventory(inv_id);

    if (deleteResult) {
        req.flash("notice", "The vehicle was successfully deleted.");
        res.redirect("/inv/");
    } else {
        req.flash("notice", "Sorry, the delete failed.");
        res.redirect(`/inv/delete/${inv_id}`);
    }
};

module.exports = invCont;