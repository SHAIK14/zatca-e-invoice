// routes/zatcaRoutes.js
const express = require("express");
const router = express.Router();
const zatcaController = require("../controllers/zatcaController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/submit-form-data",
  authMiddleware,
  zatcaController.submitFormData
);

module.exports = router;
