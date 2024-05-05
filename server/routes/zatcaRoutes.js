const express = require("express");
const router = express.Router();
const zatcaController = require("../controllers/ZatcaController");

router.post("/submit-form-data", zatcaController.submitFormData);

module.exports = router;
