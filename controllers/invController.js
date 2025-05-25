const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 * Build inventory by inv_id view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryById(inv_id)
  let nav = await utilities.getNav()

  if (!data) {
    req.flash("notice", "Sorry, no vehicle found with that ID.")
    return res.redirect("/")
  }

  let detailDisplay = '<div id="vehicle-detail">'
  detailDisplay += `<img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model} on CSE Motors">`
  detailDisplay += '<div class="vehicle-info">'
  detailDisplay += `<h1>${data.inv_make} ${data.inv_model}</h1>`
  detailDisplay += `<p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(data.inv_price)}</p>`
  detailDisplay += `<p><strong>Description:</strong> ${data.inv_description}</p>`
  detailDisplay += `<p><strong>Color:</strong> ${data.inv_color}</p>`
  detailDisplay += `<p><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</p>`
  detailDisplay += '</div>'
  detailDisplay += '</div>'

  res.render("./inventory/inv-detail", {
    title: `${data.inv_make} ${data.inv_model} Details`,
    nav,
    detailDisplay,
  })
}


module.exports = invCont