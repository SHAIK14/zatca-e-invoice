// controllers/invoiceController.js
const ZatcaController = require("./ZatcaController");
let cachedInvoiceData = null;
exports.processInvoiceData = async (req, res) => {
  try {
    const invoiceData = req.body;
    // console.log("Received invoice data:", invoiceData);
    // console.log("Received invoice data:", invoiceData);

    const updatedInvoiceLines = invoiceData.InvoiceLine.map((line, index) => {
      const priceAmount = parseFloat(line.Price.PriceAmount);
      const quantity = parseFloat(line.InvoicedQuantity.quantity);
      const taxPercent = parseFloat(
        line.Item.ClassifiedTaxCategory.Percent || 0
      );
      const discountAmount = parseFloat(line.DiscountAmount || 0);

      if (!isNaN(priceAmount) && !isNaN(quantity)) {
        const lineExtensionAmount = priceAmount * quantity;
        line.LineExtensionAmount = lineExtensionAmount.toFixed(2);

        if (line.LineType === "Discount") {
          const discountedLineExtensionAmount =
            lineExtensionAmount - discountAmount;
          line.LineExtensionAmount = discountedLineExtensionAmount.toFixed(2);
        }

        if (!isNaN(taxPercent)) {
          const taxAmount =
            (parseFloat(line.LineExtensionAmount) * taxPercent) / 100;
          line.TaxTotal.TaxAmount = taxAmount.toFixed(2);

          const roundingAmount =
            parseFloat(line.LineExtensionAmount) + taxAmount;
          line.TaxTotal.RoundingAmount = roundingAmount.toFixed(2);
        }
      }

      if (line.LineType === "Exemption") {
        line.Item.ClassifiedTaxCategory.ID = "E";
      } else if (line.LineType === "Export" || line.LineType === "GCC") {
        line.Item.ClassifiedTaxCategory.ID = "Z";
      } else if (taxPercent === 15) {
        line.Item.ClassifiedTaxCategory.ID = "S";
      }

      return line;
    });

    const totalLineExtensionAmount = updatedInvoiceLines.reduce(
      (acc, line) => acc + parseFloat(line.LineExtensionAmount || 0),
      0
    );

    const totalTaxAmount = updatedInvoiceLines.reduce(
      (acc, line) => acc + parseFloat(line.TaxTotal.TaxAmount || 0),
      0
    );

    const taxInclusiveAmount = totalLineExtensionAmount + totalTaxAmount;
    const legalMonetaryTotal = {
      LineExtensionAmount: totalLineExtensionAmount.toFixed(2),
      TaxExclusiveAmount: totalLineExtensionAmount.toFixed(2),
      TaxInclusiveAmount: taxInclusiveAmount.toFixed(2),
      AllowanceTotalAmount: "0",
      PayableAmount: taxInclusiveAmount.toFixed(2),
    };

    const taxCategories = updatedInvoiceLines.map(
      (line) => line.Item.ClassifiedTaxCategory
    );
    const hasMixedTaxCategories =
      taxCategories.some((category) => category.ID === "E") &&
      (taxCategories.some((category) => category.ID === "S") ||
        taxCategories.some((category) => category.ID === "Z"));

    const updatedInvoiceLineWithTaxIDs = updatedInvoiceLines.map((line) => {
      if (
        hasMixedTaxCategories &&
        (line.Item.ClassifiedTaxCategory.Percent === "0" ||
          line.Item.ClassifiedTaxCategory.ID === "Z")
      ) {
        return {
          ...line,
          Item: {
            ...line.Item,
            ClassifiedTaxCategory: {
              ...line.Item.ClassifiedTaxCategory,
              ID: "O",
            },
          },
        };
      } else if (
        !hasMixedTaxCategories &&
        line.Item.ClassifiedTaxCategory.Percent === "0"
      ) {
        return {
          ...line,
          Item: {
            ...line.Item,
            ClassifiedTaxCategory: {
              ...line.Item.ClassifiedTaxCategory,
              ID: "E",
            },
          },
        };
      }
      return line;
    });

    const taxTotalTaxID = hasMixedTaxCategories
      ? "O"
      : taxCategories.length > 0
      ? taxCategories[0].ID
      : "";

    const taxTotalData = {
      TaxAmount: totalTaxAmount.toFixed(2),
      TaxSubtotal: {
        TaxableAmount: totalLineExtensionAmount.toFixed(2),
        TaxCategory: {
          ID: taxTotalTaxID,
          Percent: hasMixedTaxCategories ? "0" : taxCategories[0].Percent,
          TaxScheme: {
            ID: "VAT",
          },
        },
      },
    };

    const updatedInvoiceData = {
      ...invoiceData,
      TaxTotal: [taxTotalData],
      LegalMonetaryTotal: legalMonetaryTotal,
      InvoiceLine: updatedInvoiceLineWithTaxIDs,
    };
    cachedInvoiceData = updatedInvoiceData;
    console.log("cachedInvoiceData", cachedInvoiceData);
    res.json(updatedInvoiceData);
  } catch (error) {
    console.error("Error processing invoice data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the invoice data" });
  }
};
