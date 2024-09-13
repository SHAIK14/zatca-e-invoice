// controllers/invoiceIdController.js

const InvoiceForm = require("../models/InvoiceForm"); // Adjust the path as needed

const generateUniqueInvoiceID = async () => {
  const today = new Date();
  const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "");

  // Find the latest invoice for today
  const latestInvoice = await InvoiceForm.findOne({
    ID: new RegExp(`^${datePrefix}`),
  }).sort({ ID: -1 });

  let series = "01";
  if (latestInvoice) {
    const latestSeries = parseInt(latestInvoice.ID.slice(-2));
    series = (latestSeries + 1).toString().padStart(2, "0");
  }

  return `${datePrefix}${series}`;
};

exports.getNewInvoiceID = async (req, res) => {
  try {
    const newInvoiceID = await generateUniqueInvoiceID();
    res.json({ invoiceID: newInvoiceID });
  } catch (error) {
    console.error("Error generating invoice ID:", error);
    res.status(500).json({ error: "Failed to generate invoice ID" });
  }
};
