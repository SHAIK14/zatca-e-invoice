// routes/invoiceRoutes.js

const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

router.post("/process", invoiceController.processInvoiceData);

module.exports = router;
