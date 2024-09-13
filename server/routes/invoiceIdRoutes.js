// routes/invoiceIdRoutes.js

const express = require("express");
const router = express.Router();
const invoiceIdController = require("../controllers/invoiceIdController");
const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/generate-invoice-id",
  authMiddleware,
  invoiceIdController.getNewInvoiceID
);

module.exports = router;
