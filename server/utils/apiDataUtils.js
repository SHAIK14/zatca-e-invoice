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
      const taxPercent = parseFloat(line.Precentage || 0);
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
          ID: line.TaxCode,
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

    const totalLineExtensionAmount = updatedInvoiceLines.reduce(
      (acc, line) => acc + parseFloat(line.LineExtensionAmount || 0),
      0
    );

    const totalTaxAmount = updatedInvoiceLines.reduce(
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

    console.log("Updated invoice data:", updatedInvoiceData);

    return updatedInvoiceData;
  } catch (error) {
    console.error("Error processing invoice data:", error);
    throw error;
  }
};
//-----------------------------------------------------
// exports.processInvoiceData = async (invoiceData) => {
//   try {
//     const updatedInvoiceLines = invoiceData.InvoiceLine.map((line, index) => {
//       const priceAmount = parseFloat(line.Price.PriceAmount);
//       const quantity = parseFloat(line.InvoicedQuantity.quantity);
//       const taxPercent = parseFloat(
//         line.Item.ClassifiedTaxCategory.Percent || 0
//       );
//       const discountAmount = parseFloat(line.DiscountAmount || 0);

//       if (!isNaN(priceAmount) && !isNaN(quantity)) {
//         const lineExtensionAmount = priceAmount * quantity;
//         line.LineExtensionAmount = lineExtensionAmount.toFixed(2);

//         if (line.LineType === "Discount") {
//           const discountedLineExtensionAmount =
//             lineExtensionAmount - discountAmount;
//           line.LineExtensionAmount = discountedLineExtensionAmount.toFixed(2);
//         }

//         if (!isNaN(taxPercent)) {
//           const taxAmount =
//             (parseFloat(line.LineExtensionAmount) * taxPercent) / 100;
//           line.TaxTotal.TaxAmount = taxAmount.toFixed(2);

//           const roundingAmount =
//             parseFloat(line.LineExtensionAmount) + taxAmount;
//           line.TaxTotal.RoundingAmount = roundingAmount.toFixed(2);
//         }
//       }

//       if (line.LineType === "Exemption") {
//         line.Item.ClassifiedTaxCategory.ID = "E";
//       } else if (line.LineType === "Export" || line.LineType === "GCC") {
//         line.Item.ClassifiedTaxCategory.ID = "Z";
//       } else if (taxPercent === 15) {
//         line.Item.ClassifiedTaxCategory.ID = "S";
//       }

//       return line;
//     });

//     const totalLineExtensionAmount = updatedInvoiceLines.reduce(
//       (acc, line) => acc + parseFloat(line.LineExtensionAmount || 0),
//       0
//     );

//     const totalTaxAmount = updatedInvoiceLines.reduce(
//       (acc, line) => acc + parseFloat(line.TaxTotal.TaxAmount || 0),
//       0
//     );

//     const taxInclusiveAmount = totalLineExtensionAmount + totalTaxAmount;
//     const legalMonetaryTotal = {
//       LineExtensionAmount: totalLineExtensionAmount.toFixed(2),
//       TaxExclusiveAmount: totalLineExtensionAmount.toFixed(2),
//       TaxInclusiveAmount: taxInclusiveAmount.toFixed(2),
//       AllowanceTotalAmount: "0",
//       PayableAmount: taxInclusiveAmount.toFixed(2),
//     };

//     const taxCategories = updatedInvoiceLines.map(
//       (line) => line.Item.ClassifiedTaxCategory
//     );
//     const hasMixedTaxCategories =
//       taxCategories.some((category) => category.ID === "E") &&
//       (taxCategories.some((category) => category.ID === "S") ||
//         taxCategories.some((category) => category.ID === "Z"));

//     const updatedInvoiceLineWithTaxIDs = updatedInvoiceLines.map((line) => {
//       if (
//         hasMixedTaxCategories &&
//         (line.Item.ClassifiedTaxCategory.Percent === "0" ||
//           line.Item.ClassifiedTaxCategory.ID === "Z")
//       ) {
//         return {
//           ...line,
//           Item: {
//             ...line.Item,
//             ClassifiedTaxCategory: {
//               ...line.Item.ClassifiedTaxCategory,
//               ID: "O",
//             },
//           },
//         };
//       } else if (
//         !hasMixedTaxCategories &&
//         line.Item.ClassifiedTaxCategory.Percent === "0"
//       ) {
//         return {
//           ...line,
//           Item: {
//             ...line.Item,
//             ClassifiedTaxCategory: {
//               ...line.Item.ClassifiedTaxCategory,
//               ID: "E",
//             },
//           },
//         };
//       }
//       return line;
//     });

//     const taxTotalTaxID = hasMixedTaxCategories
//       ? "O"
//       : taxCategories.length > 0
//       ? taxCategories[0].ID
//       : "";

//     const taxTotalData = {
//       TaxAmount: totalTaxAmount.toFixed(2),
//       TaxSubtotal: {
//         TaxableAmount: totalLineExtensionAmount.toFixed(2),
//         TaxCategory: {
//           ID: taxTotalTaxID,
//           Percent: hasMixedTaxCategories ? "0" : taxCategories[0].Percent,
//           TaxScheme: {
//             ID: "VAT",
//           },
//         },
//       },
//     };

//     const updatedInvoiceData = {
//       ...invoiceData,
//       TaxTotal: [taxTotalData],
//       LegalMonetaryTotal: legalMonetaryTotal,
//       InvoiceLine: updatedInvoiceLineWithTaxIDs,
//     };
//     console.log("updatedinvoicedata:", updatedInvoiceData);

//     return updatedInvoiceData;
//   } catch (error) {
//     console.error("Error processing invoice data:", error);
//     throw error;
//   }
// };
