const utilities = require(".");
const { body, validationResult } = require("express-validator");

const invValidate = {};

// Validation rules for adding a new classification
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

// Middleware to check classification data
invValidate.checkClassificationData = async (req, res, next) => {
    const classification_name = req.body?.classification_name || "";
    let errors = validationResult(req);
    console.log("Validation errors in checkClassificationData:", errors.array()); // Depuración
    if (!errors.isEmpty()) {
        let nav = res.locals.nav || await utilities.getNav();
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

// Validation rules for adding a new inventory item
invValidate.addInventoryRules = () => {
    console.log("Applying addInventoryRules"); // Depuración
    return [
        body("classification_id")
            .notEmpty()
            .withMessage("Please select a classification."),
        body("inv_make")
            .trim()
            .notEmpty()
            .withMessage("Make is required.")
            .isLength({ min: 3 })
            .withMessage("Make must be at least 3 characters long.")
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage("Make can only contain letters and numbers."),
        body("inv_model")
            .trim()
            .notEmpty()
            .withMessage("Model is required.")
            .isLength({ min: 3 })
            .withMessage("Model must be at least 3 characters long.")
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage("Model can only contain letters and numbers."),
        body("inv_description")
            .trim()
            .notEmpty()
            .withMessage("Description is required."),
        body("inv_image")
            .optional({ checkFalsy: true })
            .customSanitizer((value) => {
                return value && value.trim() !== ""
                    ? value.trim()
                    : "/images/vehicles/no-image.png";
            })
            .matches(/^\/images\/vehicles\/[A-Za-z0-9-]+\.(png|jpg|jpeg)$/)
            .withMessage("Image path must be a valid path (e.g., /images/vehicles/filename.png)."),
        body("inv_thumbnail")
            .optional({ checkFalsy: true })
            .customSanitizer((value) => {
                return value && value.trim() !== ""
                    ? value.trim()
                    : "/images/vehicles/no-image-tn.png";
            })
            .matches(/^\/images\/vehicles\/[A-Za-z0-9-]+\-tn\.(png|jpg|jpeg)$/)
            .withMessage("Thumbnail path must be a valid path (e.g., /images/vehicles/filename-tn.png)."),
        body("inv_price")
            .notEmpty()
            .withMessage("Price is required.")
            .isFloat({ min: 0 })
            .withMessage("Price must be a positive number."),
        body("inv_year")
            .notEmpty()
            .withMessage("Year is required.")
            .isInt({ min: 1900, max: 2100 })
            .withMessage("Year must be between 1900 and 2100."),
        body("inv_miles")
            .notEmpty()
            .withMessage("Miles are required.")
            .isInt({ min: 0 })
            .withMessage("Miles must be a positive number."),
        body("inv_color")
            .trim()
            .notEmpty()
            .withMessage("Color is required.")
            .matches(/^[A-Za-z]+$/)
            .withMessage("Color can only contain letters."),
    ];
};

// Middleware to check inventory data
invValidate.checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req);
    console.log("Validation errors in checkInventoryData:", errors.array()); 
    if (!errors.isEmpty()) {
        console.log("Flashing errors:", errors.array().map(err => err.msg)); 
        req.flash("notice", errors.array().map(err => err.msg));
        req.session.formData = {
            classification_id: req.body.classification_id || "",
            inv_make: req.body.inv_make || "",
            inv_model: req.body.inv_model || "",
            inv_description: req.body.inv_description || "",
            inv_image: req.body.inv_image || "/images/vehicles/no-image.png",
            inv_thumbnail: req.body.inv_thumbnail || "/images/vehicles/no-image-tn.png",
            inv_price: req.body.inv_price || "",
            inv_year: req.body.inv_year || "",
            inv_miles: req.body.inv_miles || "",
            inv_color: req.body.inv_color || "",
        };
        return res.redirect("/inv/add-inventory");
    }
    next();
};

// Middleware to check inventory data for updates, redirecting to edit view on errors
invValidate.checkUpdateData = async (req, res, next) => {
    const {
        inv_id,
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
    } = req.body;
    const errors = validationResult(req);
    console.log("Validation errors in checkUpdateData:", errors.array());
    if (!errors.isEmpty()) {
        console.log("Flashing errors:", errors.array().map(err => err.msg));
        
        // Flash each error message individually
        errors.array().forEach(error => {
            req.flash("notice", error.msg);
        });
        
        // Redirect to edit page to show flash messages
        return res.redirect(`/inv/edit/${inv_id}`);
    }
    next();
};

module.exports = invValidate;