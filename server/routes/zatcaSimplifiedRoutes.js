const express = require("express");
const router = express.Router();
const zatcaSimplifiedController = require("../controllers/ZatcaSimplifiedController");
const authMiddleware = require("../middleware/authMiddleware");
router.post(
  "/submit-simplified-form-data",
  authMiddleware,
  zatcaSimplifiedController.submitFormData
);
module.exports = router;
