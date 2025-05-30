const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
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
  let nav = await utilities.getNav();

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
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  });
};

/* ***************************
 * Build new Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
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
  let nav = await utilities.getNav();
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
    const updatedNav = await utilities.getNav();
    req.flash("notice", `Successfully added ${classification_name} classification.`);
    res.render("inventory/management", {
      title: "Inventory Management",
      nav: updatedNav,
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

module.exports = invCont;