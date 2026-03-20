const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const volunteerService = require("../services/volunteer.service");

// This controller handles volunteer and assignment APIs.
exports.createVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.createVolunteer(req.body);
  return sendResponse(res, 201, true, "Volunteer created successfully", volunteer);
});

exports.getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await volunteerService.getVolunteers();
  return sendResponse(res, 200, true, "Volunteers fetched successfully", volunteers);
});

exports.getVolunteerById = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.getVolunteerById(req.params.id);
  return sendResponse(res, 200, true, "Volunteer fetched successfully", volunteer);
});

exports.updateVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.updateVolunteer(req.params.id, req.body);
  return sendResponse(res, 200, true, "Volunteer updated successfully", volunteer);
});

exports.assignVolunteer = asyncHandler(async (req, res) => {
  const assignment = await volunteerService.assignVolunteer({
    ...req.body,
    assignedBy: req.user.userId
  });
  return sendResponse(res, 201, true, "Volunteer assigned successfully", assignment);
});

exports.getAssignments = asyncHandler(async (req, res) => {
  const assignments = await volunteerService.getAssignments();
  return sendResponse(res, 200, true, "Volunteer assignments fetched successfully", assignments);
});

exports.updateAssignmentStatus = asyncHandler(async (req, res) => {
  const assignment = await volunteerService.updateAssignmentStatus(req.params.id, req.body.status);
  return sendResponse(res, 200, true, "Assignment status updated successfully", assignment);
});
