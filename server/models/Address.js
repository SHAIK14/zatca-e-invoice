const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  partyIdentificationID: String,
  streetName: String,
  buildingNumber: String,
  plotIdentification: String,
  citySubdivisionName: String,
  cityName: String,
  postalZone: String,
  countrySubentity: String,
  country: String,
  companyID: String,
  registrationName: String,
  isSelected: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Address", AddressSchema);
