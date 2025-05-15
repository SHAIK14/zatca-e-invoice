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
    const { 
      invoiceLine, 
      page = 1, 
      limit = 10,
      sortField = "IssueDate",
      sortOrder = "desc",
      status
    } = req.query;
    
    const userId = req.user._id;
    
    // Convert page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build filter query
    const filter = { user: userId };
    
    if (invoiceLine) {
      filter.ID = { $regex: invoiceLine, $options: "i" };
    }
    
    if (status) {
      filter.clearanceStatus = status;
    }
    
    // Create sort object
    const sort = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;
    
    // FIXED: Instead of mixing inclusion and exclusion, use only inclusion
    const projection = {
      ID: 1,
      UUID: 1,
      IssueDate: 1,
      DocumentCurrencyCode: 1,
      clearanceStatus: 1,
      "TaxTotal": 1,
      "LegalMonetaryTotal": 1,
      // Removed pdfData exclusion
    };
    
    console.time('invoice-search');
    
    // Execute query with pagination
    const invoices = await InvoiceForm.find(filter, projection)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Get total count for pagination
    const totalCount = await InvoiceForm.countDocuments(filter);
    
    console.timeEnd('invoice-search');
    
    if (invoices.length === 0 && pageNum === 1) {
      return res.status(404).json({ message: "No invoices found" });
    }
    
    res.status(200).json({
      invoices,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
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

// Get recent invoices for dashboard
exports.getRecentInvoices = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find 5 most recent invoices
    const recentInvoices = await InvoiceForm.find({ user: userId })
      .sort({ IssueDate: -1, createdAt: -1 })
      .limit(5)
      .select('ID UUID IssueDate clearanceStatus LegalMonetaryTotal.PayableAmount')
      .lean();
      
    res.status(200).json(recentInvoices);
  } catch (error) {
    console.error("Error fetching recent invoices:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get invoice statistics for dashboard
exports.getInvoiceStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get statistics in a single aggregation pipeline
    const stats = await InvoiceForm.aggregate([
      { $match: { user: userId } },
      {
        $facet: {
          // Total count
          totalCount: [{ $count: "count" }],
          // Count by status
          statusCounts: [
            { $group: { _id: "$clearanceStatus", count: { $sum: 1 } } }
          ],
          // Sum of payable amounts by status
          amountsByStatus: [
            { 
              $group: { 
                _id: "$clearanceStatus", 
                total: { $sum: "$LegalMonetaryTotal.PayableAmount" } 
              } 
            }
          ]
        }
      }
    ]);
    
    // Format the results
    const totalCount = stats[0].totalCount.length > 0 ? stats[0].totalCount[0].count : 0;
    
    // Convert status counts to an object
    const statusCounts = {};
    stats[0].statusCounts.forEach(item => {
      statusCounts[item._id || "PENDING"] = item.count;
    });
    
    // Convert amounts by status to an object
    const amountsByStatus = {};
    stats[0].amountsByStatus.forEach(item => {
      amountsByStatus[item._id || "PENDING"] = item.total;
    });
    
    res.status(200).json({
      total: totalCount,
      byStatus: statusCounts,
      amountsByStatus
    });
  } catch (error) {
    console.error("Error fetching invoice statistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const invoice = await InvoiceForm.findOne({
      ID: id,
      user: userId
    }).lean();
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Download PDF for an invoice
exports.downloadInvoicePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Only fetch the PDF data field
    const invoice = await InvoiceForm.findOne(
      { ID: id, user: userId },
      { pdfData: 1 }
    ).lean();
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    
    if (!invoice.pdfData) {
      return res.status(404).json({ message: "PDF not available for this invoice" });
    }
    
    res.status(200).json({ pdfData: invoice.pdfData });
  } catch (error) {
    console.error("Error downloading invoice PDF:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};