// utils/pdfGenerator.js
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Add this line to support Arabic text
const arabicFont = fs.readFileSync("./fonts/NotoSansArabic-Regular.ttf");

const generatePDF = (invoiceData, qrCodeUrl) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Register Arabic font
    doc.registerFont("Arabic", arabicFont);

    addQRCode(doc, qrCodeUrl);
    addHeader(doc);
    addPartyInfo(doc, invoiceData);
    addInvoiceDetails(doc, invoiceData);
    addItemsTable(doc, invoiceData);
    addTotals(doc, invoiceData);

    doc.end();
  });
};

const addQRCode = (doc, qrCodeUrl) => {
  doc.image(qrCodeUrl, doc.page.width - 150, 50, { width: 100 });
};

const addHeader = (doc) => {
  doc.fontSize(18).text("Tax Invoice", { align: "center" });
  doc.moveDown(2);
};

const addPartyInfo = (doc, invoiceData) => {
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Seller Information", { underline: true });
  doc.font("Helvetica").fontSize(10);
  doc.text(
    `Name: ${invoiceData.AccountingSupplierParty.PartyLegalEntity.RegistrationName}`
  );
  doc.text(
    `Address: ${invoiceData.AccountingSupplierParty.PostalAddress.StreetName}, ${invoiceData.AccountingSupplierParty.PostalAddress.BuildingNumber}`
  );
  doc.text(
    `City: ${invoiceData.AccountingSupplierParty.PostalAddress.CityName}`
  );
  doc.text(
    `Postal Code: ${invoiceData.AccountingSupplierParty.PostalAddress.PostalZone}`
  );
  doc.text(
    `Country: ${invoiceData.AccountingSupplierParty.PostalAddress.Country.IdentificationCode}`
  );
  doc.text(
    `VAT No.: ${invoiceData.AccountingSupplierParty.PartyTaxScheme.CompanyID}`
  );

  doc.moveDown();

  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Buyer Information", { underline: true });
  doc.font("Arabic").fontSize(10);
  doc.text(
    `Name: ${invoiceData.AccountingCustomerParty.PartyLegalEntity.RegistrationName}`
  );
  doc.font("Helvetica").fontSize(10);
  doc.text(
    `Address: ${invoiceData.AccountingCustomerParty.PostalAddress.StreetName}, ${invoiceData.AccountingCustomerParty.PostalAddress.BuildingNumber}`
  );
  doc.text(
    `City: ${invoiceData.AccountingCustomerParty.PostalAddress.CityName}`
  );
  doc.text(
    `Postal Code: ${invoiceData.AccountingCustomerParty.PostalAddress.PostalZone}`
  );
  doc.text(
    `Country: ${invoiceData.AccountingCustomerParty.PostalAddress.Country.IdentificationCode}`
  );
  doc.text(
    `VAT No.: ${invoiceData.AccountingCustomerParty.PartyIdentification.ID}`
  );

  doc.moveDown(2);
};

const addInvoiceDetails = (doc, invoiceData) => {
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Invoice Details", { underline: true });
  doc.font("Helvetica").fontSize(10);
  doc.text(`Invoice Number: ${invoiceData.ID}`);
  doc.text(`Invoice Date: ${invoiceData.IssueDate}`);
  doc.text(`Invoice Time: ${invoiceData.IssueTime}`);
  doc.text(`Delivery Date: ${invoiceData.Delivery.ActualDeliveryDate}`);
  doc.text(`Payment Method: ${invoiceData.PaymentMeans.PaymentMeansCode}`);

  doc.moveDown(2);
};

const addItemsTable = (doc, invoiceData) => {
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Invoice Items", { underline: true });
  doc.moveDown();

  const table = {
    headers: [
      "Item",
      "Description",
      "Qty",
      "Unit Price",
      "Net Amount",
      "VAT Amount",
      "Total",
    ],
    rows: [],
  };

  invoiceData.InvoiceLine.forEach((item) => {
    const totalAmount =
      parseFloat(item.LineExtensionAmount) +
      parseFloat(item.TaxTotal.TaxAmount);
    table.rows.push([
      item.ID,
      item.Item.Name,
      item.InvoicedQuantity.quantity,
      item.Price.PriceAmount,
      item.LineExtensionAmount,
      item.TaxTotal.TaxAmount,
      totalAmount.toFixed(2),
    ]);
  });

  // Draw the table
  doc.font("Helvetica").fontSize(10);
  const startX = 50;
  const startY = doc.y;
  const cellPadding = 5;
  const cellWidth = (doc.page.width - 100) / table.headers.length;
  const cellHeight = 20;

  // Draw headers
  doc.font("Helvetica-Bold");
  table.headers.forEach((header, i) => {
    doc.text(
      header,
      startX + i * cellWidth + cellPadding,
      startY + cellPadding,
      {
        width: cellWidth - 2 * cellPadding,
        align: "center",
      }
    );
  });

  // Draw rows
  doc.font("Helvetica");
  table.rows.forEach((row, rowIndex) => {
    const y = startY + cellHeight + rowIndex * cellHeight;
    row.forEach((cell, cellIndex) => {
      doc.text(
        cell.toString(),
        startX + cellIndex * cellWidth + cellPadding,
        y + cellPadding,
        {
          width: cellWidth - 2 * cellPadding,
          align: "center",
        }
      );
    });
  });

  // Draw lines
  doc.lineWidth(1);
  // Horizontal lines
  for (let i = 0; i <= table.rows.length + 1; i++) {
    doc
      .moveTo(startX, startY + i * cellHeight)
      .lineTo(
        startX + cellWidth * table.headers.length,
        startY + i * cellHeight
      )
      .stroke();
  }
  // Vertical lines
  for (let i = 0; i <= table.headers.length; i++) {
    doc
      .moveTo(startX + i * cellWidth, startY)
      .lineTo(
        startX + i * cellWidth,
        startY + (table.rows.length + 1) * cellHeight
      )
      .stroke();
  }

  doc.moveDown(table.rows.length + 2);
};

const addTotals = (doc, invoiceData) => {
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text("Totals", { underline: true });
  doc.font("Helvetica").fontSize(10);

  const startX = 300;
  const startY = doc.y;
  const lineHeight = 20;

  doc.text("Total Amount (excl. VAT):", startX, startY);
  doc.text(
    `${invoiceData.LegalMonetaryTotal.TaxExclusiveAmount} ${invoiceData.DocumentCurrencyCode}`,
    480,
    startY,
    { align: "right" }
  );

  doc.text("Total VAT Amount:", startX, startY + lineHeight);
  doc.text(
    `${invoiceData.TaxTotal[0].TaxAmount} ${invoiceData.DocumentCurrencyCode}`,
    480,
    startY + lineHeight,
    { align: "right" }
  );

  doc.text("Discount:", startX, startY + 2 * lineHeight);
  doc.text(
    `${invoiceData.LegalMonetaryTotal.AllowanceTotalAmount} ${invoiceData.DocumentCurrencyCode}`,
    480,
    startY + 2 * lineHeight,
    { align: "right" }
  );

  doc.font("Helvetica-Bold");
  doc.text("Total Amount (incl. VAT):", startX, startY + 3 * lineHeight);
  doc.text(
    `${invoiceData.LegalMonetaryTotal.TaxInclusiveAmount} ${invoiceData.DocumentCurrencyCode}`,
    480,
    startY + 3 * lineHeight,
    { align: "right" }
  );

  doc.text("Payable Amount:", startX, startY + 4 * lineHeight);
  doc.text(
    `${invoiceData.LegalMonetaryTotal.PayableAmount} ${invoiceData.DocumentCurrencyCode}`,
    480,
    startY + 4 * lineHeight,
    { align: "right" }
  );

  doc.moveDown(2);
};

module.exports = { generatePDF };
