const Address = require("../models/Address");

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching addresses" });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const newAddress = new Address({
      ...req.body,
      user: req.user._id,
    });
    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: "Error adding address" });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting address" });
  }
};
exports.getSelectedAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      user: req.user._id,
      isSelected: true,
    });
    if (!address) {
      return res.status(404).json({ message: "No selected address found" });
    }
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: "Error fetching selected address" });
  }
};
exports.selectAddress = async (req, res) => {
  try {
    await Address.updateMany({ user: req.user._id }, { isSelected: false });
    await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isSelected: true },
      { new: true }
    );
    res.json({ message: "Address selected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error selecting address" });
  }
};
