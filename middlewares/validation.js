import {body, validationResult } from "express-validator";

// Validation Middleware
const validateRegistration = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter"),
    body("phoneNumber").optional().matches(/^\d+$/).withMessage("Phone number must contain only digits"),
    body("sellerType")
      .isIn(["seller", "business"])
      .withMessage("Seller type must be either 'seller' or 'business'"),
    body("city")
      .notEmpty()
      .withMessage("City is required")
      .isAlpha("en-US", { ignore: " " })
      .withMessage("City must contain only alphabets")
      .isLength({ max: 30 })
      .withMessage("City must be at most 30 characters long"),
  ];

  const validateLogin = [
    body("email").isEmail().withMessage("Invalid email format")
  ];

  const validateUpdateSeller = [
    body("name")
      .optional()
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Name must contain only alphabets")
      .isLength({min:1, max: 30 })
      .withMessage("Name must be at most 30 characters long"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email format"),
    body("phoneNumber")
      .optional()
      .matches(/^\d+$/)
      .withMessage("Phone number must contain only digits"),
    body("sellerType")
      .optional()
      .isIn(["seller", "business"])
      .withMessage("Seller type must be either 'seller' or 'business'"),
    body("city")
      .optional()
      .isAlpha("en-US", { ignore: " " })
      .withMessage("City must contain only alphabets")
      .isLength({ max: 30 })
      .withMessage("City must be at most 30 characters long"),
    body("area")
      .optional()
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Area must contain only alphabets")
      .isLength({ max: 30 })
      .withMessage("Area must be at most 30 characters long"),
    body("street")
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage("Street number must be a number between 1 and 10000"),
    body("houseNumber")
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage("House number must be a number between 1 and 10000"),
    body("nearestLandmark")
      .optional()
      .isString()
      .withMessage("Nearest landmark must be a string")
      .isLength({ max: 50 })
      .withMessage("Nearest landmark must be at most 50 characters long"),
  ];

  const validateUploadPhone = [
    body("brand")
      .notEmpty()
      .withMessage("Brand is required")
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Brand must contain only alphabets")
      .isLength({ max: 30 })
      .withMessage("Brand must be at most 30 characters long"),
  body("model")
  .notEmpty()
  .withMessage("Model is required")
  .isLength({ max: 30 })
  .withMessage("Model must be at most 30 characters long"),
    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price must be a number")
      .isFloat({ min: 1000, max: 1000000 })
      .withMessage("Price must be between 2000 and 2000000"),
    body("imei")
      .notEmpty()
      .withMessage("IMEI is required")
      .matches(/^\d{15}$/)
      .withMessage("IMEI must be exactly 15 digits"),
    body("color")
      .notEmpty()
      .withMessage("Color is required")
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Color must contain only alphabets")
      .isLength({ max: 30 })
      .withMessage("Color must be at most 30 characters long"),
    // body("image")
    //   .optional()
    //   .withMessage("Image is required")
  ];

  // Admin validation
  const validateAdminRegistration = [
    body("name").notEmpty().isAlpha("en-US", { ignore: " " }).isLength({min:1, max: 30 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter")
  ];

  // Order validation
const validateOrder = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("phoneNumber").notEmpty().matches(/^\d+$/).withMessage("Phone number must contain only digits"),
    body("city").notEmpty().isAlpha("en-US", { ignore: " " }).withMessage("City is required"),
    body("area").notEmpty().isAlpha("en-US", { ignore: " " }).withMessage("Area is required"),
    body("street").notEmpty().isInt({ min: 1, max: 10000 }).withMessage("Street number must be a number between 1 and 10000"),
    body("houseNumber").notEmpty().isInt({ min: 1, max: 10000 }).withMessage("House number must be a number between 1 and 10000"),
    body("nearestLandmark").notEmpty().isString().withMessage("Nearest landmark must be a string"),
    body("items").isArray({ min: 1 }).withMessage("Items must be an array with at least one item"),
    body("paymentMethod").isIn(["cod", "payfast"]).withMessage("Payment method must be either 'cod' or 'payfast'")
]
export {
  validateAdminRegistration,
  validateRegistration, 
  validateLogin, 
  validateUpdateSeller, 
  validateUploadPhone,
  validateOrder
};