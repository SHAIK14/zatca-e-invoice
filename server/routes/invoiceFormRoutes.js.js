const express = require("express");
const router = express.Router();
const invoiceDataController = require("../controllers/invoiceDataController");
const authMiddleware = require("../middleware/authMiddleware");

// Invoice form submission and saving
router.post("/submit", authMiddleware, invoiceDataController.saveInvoiceForm);
router.post("/save", authMiddleware, invoiceDataController.saveInvoiceFormData);

// Invoice search and retrieval
router.get("/search", authMiddleware, invoiceDataController.searchInvoices);
router.get("/recent", authMiddleware, invoiceDataController.getRecentInvoices);
router.get("/stats", authMiddleware, invoiceDataController.getInvoiceStats);
router.get("/:id", authMiddleware, invoiceDataController.getInvoiceById);
router.get("/:id/pdf", authMiddleware, invoiceDataController.downloadInvoicePdf);

// Invoice update
router.put("/update/:id", authMiddleware, invoiceDataController.updateInvoice);

module.exports = router;