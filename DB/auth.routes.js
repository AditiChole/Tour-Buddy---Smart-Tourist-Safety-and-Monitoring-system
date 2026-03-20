const express = require("express");

const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");
const {
  registerValidator,
  loginValidator,
  updateProfileValidator
} = require("../validators/auth.validator");

const router = express.Router();

// Routes for register, login, and self account actions.
router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.get("/me", protect, authController.getMe);
router.put("/update-profile", protect, updateProfileValidator, validate, authController.updateProfile);
router.delete("/delete-account", protect, authController.deleteAccount);

module.exports = router;
