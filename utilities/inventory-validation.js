const utilities = require(".");
const { body, validationResult } = require("express-validator");

const invValidate = {};

invValidate.addClassificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .notEmpty()
            .withMessage("Classification name is required.")
            .isAlpha()
            .withMessage("Name must contain only alphabetic characters."),
    ];
};

invValidate.checkClassificationData = async (req,res, next) => {
    const classification_name = req.body?.classification_name || "";
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("inventory/add-classification", {
            errors: errors.array().map(err => err.msg),
            title: "Add New Classification",
            nav,
            classification_name,
        });
        return;
    }
    next();
};


module.exports = invValidate;
