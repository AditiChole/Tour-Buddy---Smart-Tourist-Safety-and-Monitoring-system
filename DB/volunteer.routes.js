const express = require("express");

const volunteerController = require("../controllers/volunteer.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const {
  createVolunteerValidator,
  updateVolunteerValidator,
  volunteerIdValidator,
  assignVolunteerValidator,
  assignmentStatusValidator
} = require("../validators/volunteer.validator");

const router = express.Router();

// Routes for volunteer and assignment features.
router.post("/", protect, authorize("admin"), createVolunteerValidator, validate, volunteerController.createVolunteer);
router.get("/", protect, authorize("admin", "volunteer"), volunteerController.getVolunteers);
router.post("/assign", protect, authorize("admin", "volunteer"), assignVolunteerValidator, validate, volunteerController.assignVolunteer);
router.get("/assignments", protect, authorize("admin", "volunteer"), volunteerController.getAssignments);
router.put("/assignments/:id/status", protect, authorize("admin", "volunteer"), assignmentStatusValidator, validate, volunteerController.updateAssignmentStatus);
router.get("/:id", protect, authorize("admin", "volunteer"), volunteerIdValidator, validate, volunteerController.getVolunteerById);
router.put("/:id", protect, authorize("admin"), volunteerIdValidator, updateVolunteerValidator, validate, volunteerController.updateVolunteer);

module.exports = router;
