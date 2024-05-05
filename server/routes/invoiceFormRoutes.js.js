// routes/invoiceFormRoutes.js
const express = require("express");
const router = express.Router();
const invoiceDataController = require("../controllers/invoiceDataController");

router.post("/submit", invoiceDataController.saveInvoiceForm);
router.post("/save", invoiceDataController.saveInvoiceFormData);
router.get("/search", invoiceDataController.searchInvoices);
router.put("/update/:id", invoiceDataController.updateInvoice);

module.exports = router;
