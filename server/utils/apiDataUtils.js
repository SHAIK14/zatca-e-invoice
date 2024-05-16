// // utils/apiDataUtils.js
// utils/apiDataUtils.js

// utils/apiDataUtils.js

exports.processInvoiceData = async (invoiceData) => {
  try {
    const {
      INVOICE_ID,
      UUID,
      IssueDate,
      IssueTime,
      currency,
      lastHashKey,
      AccountingSupplierParty,
      AccountingCustomerParty,
      PaymentMeansCode,
      InvoiceLine,
    } = invoiceData.RequestBody;

    const updatedInvoiceLines = InvoiceLine.map((line, index) => {
      const priceAmount = parseFloat(line.PriceAmount);
      const quantity = parseFloat(line.InvoicedQuantity);
      const discountAmount = parseFloat(line.DiscountAmount || 0);

      if (!isNaN(priceAmount) && !isNaN(quantity)) {
        const lineExtensionAmount = priceAmount * quantity;
        line.LineExtensionAmount = lineExtensionAmount.toFixed(2);

        if (line.LineType === "Discount") {
          const discountedLineExtensionAmount =
            lineExtensionAmount - discountAmount;
          line.LineExtensionAmount = discountedLineExtensionAmount.toFixed(2);
        }

        const taxPercent = parseFloat(line.Precentage || 0);
        if (!isNaN(taxPercent)) {
          const taxAmount =
            (parseFloat(line.LineExtensionAmount) * taxPercent) / 100;
          line.TaxTotal = {
            TaxAmount: taxAmount.toFixed(2),
            RoundingAmount: (
              parseFloat(line.LineExtensionAmount) + taxAmount
            ).toFixed(2),
          };
        }
      }

      line.Item = {
        Name: line.Name,
        ClassifiedTaxCategory: {
          ID:
            line.LineType === "Item"
              ? "S"
              : line.LineType === "Exemption"
              ? "E"
              : line.LineType === "Export" || line.LineType === "GCC"
              ? "Z"
              : line.LineType === "Zero"
              ? "E"
              : "",
          Percent: line.Precentage,
          TaxScheme: { ID: "VAT" },
        },
      };

      line.InvoicedQuantity = {
        quantity: line.InvoicedQuantity,
      };

      line.Price = {
        PriceAmount: line.PriceAmount,
      };

      return line;
    });

    const discountLineExists = updatedInvoiceLines.some(
      (line) => line.LineType === "Discount"
    );

    const hasMixedTaxCategories =
      updatedInvoiceLines.some(
        (line) => line.Item.ClassifiedTaxCategory.ID === "E"
      ) &&
      (updatedInvoiceLines.some(
        (line) => line.Item.ClassifiedTaxCategory.ID === "S"
      ) ||
        updatedInvoiceLines.some(
          (line) => line.Item.ClassifiedTaxCategory.ID === "Z"
        ));

    const updatedInvoiceLineWithTaxIDs = updatedInvoiceLines.map((line) => {
      if (hasMixedTaxCategories && line.LineType === "Exemption") {
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
      }
      return line;
    });

    const totalLineExtensionAmount = updatedInvoiceLineWithTaxIDs.reduce(
      (acc, line) => acc + parseFloat(line.LineExtensionAmount || 0),
      0
    );

    const totalTaxAmount = updatedInvoiceLineWithTaxIDs.reduce(
      (acc, line) => acc + parseFloat(line.TaxTotal?.TaxAmount || 0),
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

    const discountLine = updatedInvoiceLineWithTaxIDs.find(
      (line) => line.LineType === "Discount"
    );
    const discountTaxID = discountLine
      ? discountLine.Item.ClassifiedTaxCategory.ID
      : "";

    const taxTotalTaxID = hasMixedTaxCategories
      ? "O"
      : discountTaxID
      ? discountTaxID
      : updatedInvoiceLineWithTaxIDs.some(
          (line) => line.LineType === "Export" || line.LineType === "GCC"
        )
      ? "Z"
      : updatedInvoiceLineWithTaxIDs.some((line) => line.LineType === "Item")
      ? "S"
      : updatedInvoiceLineWithTaxIDs.some(
          (line) => line.LineType === "Exemption"
        )
      ? "E"
      : "";

    const taxTotalData = {
      TaxAmount: totalTaxAmount.toFixed(2),
      TaxSubtotal: {
        TaxableAmount: totalLineExtensionAmount.toFixed(2),
        TaxCategory: {
          ID: taxTotalTaxID,
          Percent:
            taxTotalTaxID === "Z"
              ? "0"
              : updatedInvoiceLineWithTaxIDs.find(
                  (line) => line.Item.ClassifiedTaxCategory.ID === taxTotalTaxID
                )?.Item.ClassifiedTaxCategory.Percent || "0",
          TaxScheme: {
            ID: "VAT",
          },
        },
      },
    };

    const updatedInvoiceData = {
      ProfileID: "reporting:1.0",
      ID: INVOICE_ID,
      UUID: UUID,
      IssueDate: IssueDate,
      IssueTime: IssueTime,
      InvoiceTypeCode: "388",
      DocumentCurrencyCode: currency,
      TaxCurrencyCode: currency,
      LineCountNumeric: InvoiceLine.length.toString(),
      AdditionalDocumentReference: [
        {
          ID: "ICV",
          UUID: INVOICE_ID,
          Attachment: {
            EmbeddedDocumentBinaryObject: "",
            mimeCode: "text/plain",
          },
        },
        {
          ID: "PIH",
          Attachment: {
            EmbeddedDocumentBinaryObject: lastHashKey,
            mimeCode: "text/plain",
          },
        },
      ],
      AccountingSupplierParty: {
        PartyIdentification: {
          ID: AccountingSupplierParty[0].ID,
        },
        PostalAddress: {
          StreetName: AccountingSupplierParty[0].StreetName,
          BuildingNumber: AccountingSupplierParty[0].BuildingNumber,
          PlotIdentification: AccountingSupplierParty[0].PlotIdentification,
          CitySubdivisionName: AccountingSupplierParty[0].CitySubdivisionName,
          CityName: AccountingSupplierParty[0].CityName,
          PostalZone: AccountingSupplierParty[0].PostalZone,
          CountrySubentity: AccountingSupplierParty[0].CountrySubentity,
          Country: {
            IdentificationCode: AccountingSupplierParty[0].Country,
          },
        },
        PartyTaxScheme: {
          CompanyID: AccountingSupplierParty[0].ID,
          TaxScheme: {
            ID: "VAT",
          },
        },
        PartyLegalEntity: {
          RegistrationName: AccountingSupplierParty[0].RegistrationName,
        },
      },
      AccountingCustomerParty: {
        PartyIdentification: {
          ID: AccountingCustomerParty[0].ID,
        },
        PostalAddress: {
          StreetName: AccountingCustomerParty[0].StreetName,
          BuildingNumber: AccountingCustomerParty[0].BuildingNumber,
          PlotIdentification: AccountingCustomerParty[0].PlotIdentification,
          CitySubdivisionName: AccountingCustomerParty[0].CitySubdivisionName,
          CityName: AccountingCustomerParty[0].CityName,
          PostalZone: AccountingCustomerParty[0].PostalZone,
          CountrySubentity: AccountingCustomerParty[0].CountrySubentity,
          Country: {
            IdentificationCode: AccountingCustomerParty[0].Country,
          },
        },
        PartyTaxScheme: {
          TaxScheme: {
            ID: "VAT",
          },
        },
        PartyLegalEntity: {
          RegistrationName: AccountingCustomerParty[0].RegistrationName,
        },
      },
      Delivery: {
        ActualDeliveryDate: IssueDate,
      },
      PaymentMeans: {
        PaymentMeansCode: PaymentMeansCode,
      },
      TaxTotal: [taxTotalData],
      LegalMonetaryTotal: legalMonetaryTotal,
      InvoiceLine: updatedInvoiceLineWithTaxIDs,
    };

    // console.log("Updated invoice data:", updatedInvoiceData);

    return updatedInvoiceData;
  } catch (error) {
    console.error("Error processing invoice data:", error);
    throw error;
  }
};
