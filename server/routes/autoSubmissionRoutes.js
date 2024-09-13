// routes/autoSubmissionRoutes.js

const express = require("express");
const router = express.Router();
const autoSubmissionController = require("../controllers/autoSubmissionController");
const authMiddleware = require("../middleware/authMiddleware");

// Start auto-submission job
router.post(
  "/start",
  authMiddleware,
  autoSubmissionController.startAutoSubmission
);

// Stop auto-submission job
router.post(
  "/stop",
  authMiddleware,
  autoSubmissionController.stopAutoSubmission
);

// Trigger manual submission
router.post(
  "/manual",
  authMiddleware,
  autoSubmissionController.manualSubmission
);

// Get pending invoices
router.get(
  "/pending",
  authMiddleware,
  autoSubmissionController.getPendingInvoicesCount
);
router.get(
  "/schedule",
  authMiddleware,
  autoSubmissionController.getSubmissionSchedule
);
module.exports = router;
