// models/InvoiceForm.js
const mongoose = require("mongoose");

const InvoiceFormSchema = new mongoose.Schema({
  ProfileID: String,
  ID: String,
  UUID: String,
  Mode: String,
  IssueDate: Date,
  IssueTime: String,
  InvoiceTypeCode: String,
  DocumentCurrencyCode: String,
  TaxCurrencyCode: String,
  LineCountNumeric: Number,
  AdditionalDocumentReference: [
    {
      ID: String,
      UUID: String,
      Attachment: {
        EmbeddedDocumentBinaryObject: String,
        mimeCode: String,
      },
    },
  ],
  AccountingSupplierParty: {
    PartyIdentification: { ID: String },
    PostalAddress: {
      StreetName: String,
      BuildingNumber: String,
      PlotIdentification: String,
      CitySubdivisionName: String,
      CityName: String,
      PostalZone: String,
      CountrySubentity: String,
      Country: { IdentificationCode: String },
    },
    PartyTaxScheme: {
      CompanyID: String,
      TaxScheme: { ID: String },
    },
    PartyLegalEntity: { RegistrationName: String },
  },
  AccountingCustomerParty: {
    PartyIdentification: { ID: String },
    PostalAddress: {
      StreetName: String,
      BuildingNumber: String,
      PlotIdentification: String,
      CitySubdivisionName: String,
      CityName: String,
      PostalZone: String,
      CountrySubentity: String,
      Country: { IdentificationCode: String },
    },
    PartyTaxScheme: { TaxScheme: { ID: String } },
    PartyLegalEntity: { RegistrationName: String },
  },
  Delivery: { ActualDeliveryDate: Date },
  PaymentMeans: { PaymentMeansCode: String },
  TaxTotal: [
    {
      TaxAmount: Number,
      TaxSubtotal: {
        TaxableAmount: Number,
        TaxCategory: {
          ID: String,
          Percent: Number,
          TaxScheme: { ID: String },
        },
      },
    },
  ],
  LegalMonetaryTotal: {
    LineExtensionAmount: Number,
    TaxExclusiveAmount: Number,
    TaxInclusiveAmount: Number,
    AllowanceTotalAmount: Number,
    PayableAmount: Number,
  },
  InvoiceLine: [
    {
      ID: String,
      InvoicedQuantity: { quantity: Number },
      LineExtensionAmount: Number,
      DiscountAmount: Number,
      LineType: String,
      TaxTotal: {
        TaxAmount: Number,
        RoundingAmount: Number,
      },
      Item: {
        Name: String,
        ClassifiedTaxCategory: {
          ID: String,
          Percent: Number,
          TaxScheme: { ID: String },
        },
      },
      Price: { PriceAmount: Number },
    },
  ],
  base64XML: String,
  hashKey: String,
  responseData: Object,
  clearanceStatus: String,
  clearanceInvoice: String,
  decodedClearanceInvoice: String,
  qrCode: String,
  submissionStatus: {
    type: String,
    enum: ["PENDING_SUBMISSION", "SUBMITTED", "FAILED"],
    default: "PENDING_SUBMISSION",
  },
  scheduledSubmissionTime: Date,
  pdfData: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
// Add this to your InvoiceForm model file or run in MongoDB
InvoiceFormSchema.index({ user: 1, IssueDate: -1 });
InvoiceFormSchema.index({ user: 1, clearanceStatus: 1 });
InvoiceFormSchema.index({ user: 1, ID: 1 });

module.exports = mongoose.model("InvoiceForm", InvoiceFormSchema);
