const express = require("express");

const userController = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const { updateRoleValidator } = require("../validators/user.validator");

const router = express.Router();

// Admin routes for user management.
router.get("/", protect, authorize("admin"), userController.getUsers);
router.put("/:id/role", protect, authorize("admin"), updateRoleValidator, validate, userController.updateUserRole);

module.exports = router;
