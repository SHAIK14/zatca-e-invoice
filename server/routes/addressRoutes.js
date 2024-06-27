const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/addresses", authMiddleware, addressController.getAddresses);
router.post("/addresses", authMiddleware, addressController.addAddress);
router.delete(
  "/addresses/:id",
  authMiddleware,
  addressController.deleteAddress
);
router.put(
  "/addresses/:id/select",
  authMiddleware,
  addressController.selectAddress
);
router.get(
  "/addresses/selected",
  authMiddleware,
  addressController.getSelectedAddress
);
module.exports = router;
