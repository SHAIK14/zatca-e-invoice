// controllers/invoiceDataController.js
const InvoiceForm = require("../models/InvoiceForm");

exports.saveInvoiceForm = async (req, res) => {
  try {
    const formData = req.body;
    const invoiceForm = await InvoiceForm.create(formData);
    res.status(201).json(invoiceForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//from the client side
exports.saveInvoiceFormData = async (req, res) => {
  try {
    const formData = req.body;

    formData.user = req.user._id;
    const invoiceForm = new InvoiceForm(formData);
    await invoiceForm.save();
    res.status(200).json({ message: "Form data saved successfully" });
  } catch (error) {
    console.error("Error saving form data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while saving the form data" });
  }
};
exports.searchInvoices = async (req, res) => {
  try {
    const { invoiceLine } = req.query;
    const userId = req.user._id;

    // console.log(
    //   "Searching for invoices. User ID:",
    //   userId,
    //   "Invoice Line:",
    //   invoiceLine
    // );

    let invoices;
    if (invoiceLine) {
      invoices = await InvoiceForm.find({
        ID: invoiceLine,
        user: userId,
      });
    } else {
      invoices = await InvoiceForm.find({ user: userId });
    }

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error searching invoices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFormData = req.body;

    const updatedInvoice = await InvoiceForm.findOneAndUpdate(
      { ID: id },
      { $set: updatedFormData },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res
      .status(200)
      .json({ message: "Invoice updated successfully", updatedInvoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
