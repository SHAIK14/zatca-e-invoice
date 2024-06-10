// routes/invoiceFormRoutes.js
const express = require("express");
const router = express.Router();
const invoiceDataController = require("../controllers/invoiceDataController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/submit", authMiddleware, invoiceDataController.saveInvoiceForm);
router.post("/save", authMiddleware, invoiceDataController.saveInvoiceFormData);
router.get("/search", authMiddleware, invoiceDataController.searchInvoices);
router.put("/update/:id", authMiddleware, invoiceDataController.updateInvoice);

module.exports = router;
