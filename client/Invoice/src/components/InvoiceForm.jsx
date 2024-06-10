import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
// import { btoa } from "b64-lite";
import axios from "axios";
// import jsonData from "./invoice.json";

// import axios from "axios";
const InvoiceForm = () => {
  // const { id } = useParams();
  const location = useLocation();
  const selectedInvoice = location.state?.invoice;
  const [formData, setFormData] = useState({
    ProfileID: "reporting:1.0",
    ID: "2024032399", //2024032399
    UUID: generateUUID(),
    Mode: "",
    IssueDate: "",
    IssueTime: "",
    InvoiceTypeCode: "388",
    DocumentCurrencyCode: "SAR",
    TaxCurrencyCode: "SAR",
    LineCountNumeric: "1",
    AdditionalDocumentReference: [
      {
        ID: "ICV",
        UUID: "2024032399",
        Attachment: {
          EmbeddedDocumentBinaryObject: "",
          mimeCode: "text/plain",
        },
      },
      {
        ID: "PIH",
        Attachment: {
          EmbeddedDocumentBinaryObject:
            "0Zo763bM1hsJy8hQs787ih3eMpirhj83Ljnerfpbx7Y=",
          mimeCode: "text/plain",
        },
      },
    ],
    AccountingSupplierParty: {
      PartyIdentification: { ID: "1010183482" },
      PostalAddress: {
        StreetName: "Al Olaya Olaya Street",
        BuildingNumber: "7235",
        PlotIdentification: "325",
        CitySubdivisionName: "Al Olaya Olaya",
        CityName: "Riyadh",
        PostalZone: "12244",
        CountrySubentity: "Riyadh Region",
        Country: { IdentificationCode: "SA" },
      },
      PartyTaxScheme: {
        CompanyID: "300000157210003", //300000157210003--399999999900003
        TaxScheme: { ID: "VAT" },
      },
      PartyLegalEntity: {
        RegistrationName: "Solutions By STC",
      },
    },
    AccountingCustomerParty: {
      PartyIdentification: { ID: "4030232477" },
      PostalAddress: {
        StreetName: "7524",
        BuildingNumber: "1234",
        PlotIdentification: "3675",
        CitySubdivisionName: "Mecca Al Mokarama",
        CityName: "Riyad",
        PostalZone: "12244",
        CountrySubentity: "Riyadh Region",
        Country: { IdentificationCode: "SA" },
      },
      PartyTaxScheme: { TaxScheme: { ID: "VAT" } },
      PartyLegalEntity: {
        RegistrationName: "فرع شركة سيرفكورب سكوير بي تي اي ليمتد",
      },
    },
    Delivery: { ActualDeliveryDate: "" },
    PaymentMeans: { PaymentMeansCode: "" },
    TaxTotal: [
      {
        TaxAmount: "",
        TaxSubtotal: {
          TaxableAmount: "",
          TaxCategory: { ID: "", Percent: "", TaxScheme: { ID: "VAT" } },
        },
      },
    ],
    LegalMonetaryTotal: {
      LineExtensionAmount: "",
      TaxExclusiveAmount: "",
      TaxInclusiveAmount: "",
      AllowanceTotalAmount: "",
      PayableAmount: "",
    },
    InvoiceLine: [
      {
        ID: "",
        InvoicedQuantity: { quantity: "" },
        LineExtensionAmount: "",
        DiscountAmount: "",
        LineType: "",
        TaxTotal: {
          TaxAmount: "",
          RoundingAmount: "",
        },
        Item: {
          Name: "",
          ClassifiedTaxCategory: {
            ID: "",
            Percent: "",
            TaxScheme: { ID: "VAT" },
          },
        },
        Price: { PriceAmount: "" },
      },
    ],
  });
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [qrCodeUrl, setQRCodeUrl] = useState("");
  const [clearanceStatus, setClearanceStatus] = useState(null);
  // const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "IssueDate") {
      const dateObj = new Date(value);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      formattedValue = `${year}-${month}-${day}`;
    } else if (name === "IssueTime") {
      const timeObj = new Date(`1970-01-01T${value}`);
      const hours = String(timeObj.getHours()).padStart(2, "0");
      const minutes = String(timeObj.getMinutes()).padStart(2, "0");
      const seconds = String(timeObj.getSeconds()).padStart(2, "0");
      formattedValue = `${hours}:${minutes}:${seconds}`;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }));
  };
  function generateUUID() {
    return uuidv4().toUpperCase();
  }

  // const handleChangeAdditional = (e, index, key) => {
  //   const { value } = e.target;
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     AdditionalDocumentReference: prevFormData.AdditionalDocumentReference.map(
  //       (item, i) => {
  //         if (i === index) {
  //           if (key === "Attachment") {
  //             return {
  //               ...item,
  //               [key]: {
  //                 ...item[key],
  //                 EmbeddedDocumentBinaryObject: value,
  //               },
  //             };
  //           }
  //           return { ...item, [key]: value };
  //         }
  //         return item;
  //       }
  //     ),
  //   }));
  // };

  // const handleAccountingSupplierPartyChange = (
  //   parentField,
  //   childField,
  //   value
  // ) => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     AccountingSupplierParty: {
  //       ...prevData.AccountingSupplierParty,
  //       [parentField]: {
  //         ...prevData.AccountingSupplierParty[parentField],
  //         [childField]: value,
  //       },
  //     },
  //   }));
  // };
  const handleTaxTotalChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      TaxTotal: [
        {
          ...prevData.TaxTotal[0],
          [field]: value,
        },
      ],
    }));
  };
  const handleLegalMonetaryTotalChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      LegalMonetaryTotal: {
        ...prevData.LegalMonetaryTotal,
        [field]: value,
      },
    }));
  };

  const addInvoiceLine = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      InvoiceLine: [
        ...prevFormData.InvoiceLine,
        {
          ID: "",
          InvoicedQuantity: { quantity: "" },
          LineExtensionAmount: "",
          TaxTotal: {
            TaxAmount: "",
            RoundingAmount: "",
          },
          Item: {
            Name: "",
            ClassifiedTaxCategory: {
              ID: "",
              Percent: "",
              TaxScheme: { ID: "VAT" },
            },
          },
          Price: { PriceAmount: "" },
        },
      ],
    }));
  };
  const handleInvoiceLineChange = (index, field, value) => {
    setFormData((prevFormData) => {
      const updatedInvoiceLine = [...prevFormData.InvoiceLine];
      const updatedLine = { ...updatedInvoiceLine[index] };

      const discountLineExists = updatedInvoiceLine.some(
        (line) => line.LineType === "Discount"
      );

      if (field === "LineType" && value === "Discount" && discountLineExists) {
        alert("Only one discount line is allowed.");
        return prevFormData;
      }

      // const hasItemOrExemption = updatedInvoiceLine.some(
      //   (line) => line.LineType === "Item" || line.LineType === "Exemption"
      // );
      // const hasExportOrGCC = updatedInvoiceLine.some(
      //   (line) => line.LineType === "Export" || line.LineType === "GCC"
      // );

      // if (
      //   field === "LineType" &&
      //   ((hasItemOrExemption &&
      //     (value === "Export" || value === "GCC" || value === "Zero")) ||
      //     (hasExportOrGCC && value === "Exemption"))
      // ) {
      //   alert("Invalid combination of line types.");
      //   return prevFormData;
      // }

      if (field.includes(".")) {
        const fieldArray = field.split(".");
        let nestedObject = updatedLine;
        for (let i = 0; i < fieldArray.length - 1; i++) {
          nestedObject = nestedObject[fieldArray[i]];
        }
        nestedObject[fieldArray[fieldArray.length - 1]] = value;
      } else {
        updatedLine[field] = value;
      }

      const priceAmount = parseFloat(updatedLine.Price.PriceAmount);
      const quantity = parseFloat(updatedLine.InvoicedQuantity.quantity);
      const taxPercent = parseFloat(
        updatedLine.Item.ClassifiedTaxCategory.Percent || 0
      );
      const discountAmount = parseFloat(updatedLine.DiscountAmount || 0);

      if (!isNaN(priceAmount) && !isNaN(quantity)) {
        const lineExtensionAmount = priceAmount * quantity;
        updatedLine.LineExtensionAmount = lineExtensionAmount.toFixed(2);

        if (updatedLine.LineType === "Discount") {
          const discountedLineExtensionAmount =
            lineExtensionAmount - discountAmount;
          updatedLine.LineExtensionAmount =
            discountedLineExtensionAmount.toFixed(2);
        }

        if (!isNaN(taxPercent)) {
          const taxAmount =
            (updatedLine.LineExtensionAmount * taxPercent) / 100;
          updatedLine.TaxTotal.TaxAmount = taxAmount.toFixed(2);

          const roundingAmount =
            parseFloat(updatedLine.LineExtensionAmount) + taxAmount;
          updatedLine.TaxTotal.RoundingAmount = roundingAmount.toFixed(2);
        }
      }

      if (field === "LineType") {
        if (value === "Item") {
          updatedLine.Item.ClassifiedTaxCategory.ID = "S";
          updatedLine.Item.ClassifiedTaxCategory.Percent = 15;
        } else if (value === "Exemption") {
          updatedLine.Item.ClassifiedTaxCategory.ID = "E";
          updatedLine.Item.ClassifiedTaxCategory.Percent = 0;
        } else if (value === "Export" || value === "GCC") {
          updatedLine.Item.ClassifiedTaxCategory.ID = "Z";
          updatedLine.Item.ClassifiedTaxCategory.Percent = 0;
        } else if (value === "Zero") {
          updatedLine.Item.ClassifiedTaxCategory.ID = "E";
          updatedLine.Item.ClassifiedTaxCategory.Percent = 0;
        }
      }

      updatedInvoiceLine[index] = updatedLine;

      const hasMixedTaxCategories =
        updatedInvoiceLine.some((line) => line.LineType === "Exemption") &&
        (updatedInvoiceLine.some((line) => line.LineType === "Item") ||
          updatedInvoiceLine.some(
            (line) => line.LineType === "Export" || line.LineType === "GCC"
          ));

      const updatedInvoiceLineWithTaxIDs = updatedInvoiceLine.map((line) => {
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
                    (line) =>
                      line.Item.ClassifiedTaxCategory.ID === taxTotalTaxID
                  )?.Item.ClassifiedTaxCategory.Percent || "0",
            TaxScheme: {
              ID: "VAT",
            },
          },
        },
      };

      return {
        ...prevFormData,
        LegalMonetaryTotal: legalMonetaryTotal,
        InvoiceLine: updatedInvoiceLineWithTaxIDs,
        TaxTotal: [taxTotalData],
      };
    });
  };
  const removeInvoiceLine = (index) => {
    setFormData((prevFormData) => {
      const updatedInvoiceLine = [...prevFormData.InvoiceLine];
      updatedInvoiceLine.splice(index, 1);
      return { ...prevFormData, InvoiceLine: updatedInvoiceLine };
    });
  };
  // const removeInvoiceLine = (index) => {
  //   setFormData((prevFormData) => {
  //     const updatedInvoiceLine = [...prevFormData.InvoiceLine];
  //     updatedInvoiceLine.splice(index, 1);

  //     const taxCategories = updatedInvoiceLine.map(
  //       (line) => line.Item.ClassifiedTaxCategory
  //     );
  //     const hasMixedTaxCategories =
  //       taxCategories.some((category) => category.ID === "E") &&
  //       (taxCategories.some((category) => category.ID === "S") ||
  //         taxCategories.some((category) => category.ID === "Z"));

  //     const updatedInvoiceLineWithTaxIDs = updatedInvoiceLine.map((line) => {
  //       if (
  //         !hasMixedTaxCategories &&
  //         (line.Item.ClassifiedTaxCategory.Percent === "0" ||
  //           line.Item.ClassifiedTaxCategory.ID === "Z")
  //       ) {
  //         return {
  //           ...line,
  //           Item: {
  //             ...line.Item,
  //             ClassifiedTaxCategory: {
  //               ...line.Item.ClassifiedTaxCategory,
  //               ID: line.Item.ClassifiedTaxCategory.ID === "Z" ? "Z" : "E",
  //               // ID: "E",
  //             },
  //           },
  //         };
  //       }
  //       return line;
  //     });

  //     const totalLineExtensionAmount = updatedInvoiceLineWithTaxIDs.reduce(
  //       (acc, line) => acc + parseFloat(line.LineExtensionAmount || 0),
  //       0
  //     );

  //     const totalTaxAmount = updatedInvoiceLineWithTaxIDs.reduce(
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
  //           Percent: hasMixedTaxCategories
  //             ? "0"
  //             : taxCategories[0]?.Percent || "",
  //           TaxScheme: {
  //             ID: "VAT",
  //           },
  //         },
  //       },
  //     };

  //     return {
  //       ...prevFormData,
  //       LegalMonetaryTotal: legalMonetaryTotal,
  //       InvoiceLine: updatedInvoiceLineWithTaxIDs,
  //       TaxTotal: [taxTotalData],
  //     };
  //   });
  // };

  useEffect(() => {
    if (selectedInvoice) {
      setFormData(selectedInvoice);
      if (selectedInvoice.clearanceStatus === "CLEARED") {
        setIsReadOnly(true);
      }
    }
  }, [selectedInvoice]);
  const handleSave = async () => {
    try {
      if (
        !formData.IssueDate ||
        !formData.Delivery.ActualDeliveryDate ||
        !formData.PaymentMeans.PaymentMeansCode
      ) {
        alert("Please fill in issuedate,Delivey,paymentcode fields.");
        return;
      }
      //http://localhost:5000/invoice-form/save
      const response = await axios.post(
        "https://zatca-e-invoice-1.onrender.com/invoice-form/save",
        formData
      );
      console.log("Form data saved successfully:", response.data);
      alert("Form saved successfully!");
    } catch (error) {
      console.error("Error saving form data:", error);
      alert("Error saving form. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    try {
      if (
        !formData.IssueDate ||
        !formData.Delivery.ActualDeliveryDate ||
        !formData.PaymentMeans.PaymentMeansCode
      ) {
        alert("Please fill in all mandatory fields.");
        return;
      }
      const data = {
        formData: formData,
      };
      const token = localStorage.getItem("token");
      // Create new invoice
      const response = await axios.post(
        "https://zatca-e-invoice-1.onrender.com/submit-form-data",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add the token to the headers
          },
        }
      );
      console.log("Response from backend:", response.data);

      // Handle the QR code response
      const qrCodeUrl = response.data.qrCodeUrl;
      const clearanceStatus = response.data.clearanceStatus;
      console.log(qrCodeUrl);
      setQRCodeUrl(qrCodeUrl);
      setClearanceStatus(clearanceStatus);
      alert(
        "Invoice generated successfully! Check the QR code and status at the top."
      );
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      console.log("Form data submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting form data:", error);
      if (error.response) {
        alert(`Error: ${error.response.data}`);
      } else {
        alert("An error occurred while sending data to API");
      }
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ZATCA Invoice Form</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-6">
        {/* General Information */}
        <div className="col-span-4 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">General Info</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    ID
                  </label>
                  <input
                    type="text"
                    name="ID"
                    value={formData.ID}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Mode
                  </label>
                  <select
                    name="Mode"
                    value={formData.Mode || "Standard"}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Simplified">Simplified</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    name="IssueDate"
                    value={formData.IssueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Issue Time
                  </label>
                  <input
                    type="time"
                    name="IssueTime"
                    value={formData.IssueTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Invoice Type
                  </label>
                  <select
                    name="InvoiceTypeCode"
                    value={formData.InvoiceTypeCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  >
                    <option value="388">Standard - 388</option>
                    <option value="381">Credit - 381</option>
                    <option value="383">Debit - 383</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Document Currency
                  </label>
                  <select
                    name="DocumentCurrencyCode"
                    value={formData.DocumentCurrencyCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  >
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Tax Currency
                  </label>
                  <select
                    name="TaxCurrencyCode"
                    value={formData.TaxCurrencyCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  >
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-start">
              {/* QR Code */}
              <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-start h-full border-2 border-gray-300 ">
                <h2 className="text-xl font-bold mb-4">Status</h2>
                {clearanceStatus === "CLEARED" ? (
                  <div className="text-center">
                    <p className="text-green-500 font-bold text-xl mb-4">
                      Cleared
                    </p>
                    {qrCodeUrl && (
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="max-w-full mx-auto"
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-40 h-40 bg-gray-200 mx-auto"></div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Customer Information */}
        <div className="col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Customer Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Party ID
              </label>
              <input
                type="text"
                value={formData.AccountingCustomerParty.PartyIdentification.ID}
                className="w-full px-3 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Street
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress.StreetName
                }
                className="w-full px-3 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Building No.
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress.BuildingNumber
                }
                className="w-full px-3 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">City</label>
              <input
                type="text"
                value={formData.AccountingCustomerParty.PostalAddress.CityName}
                className="w-full px-3 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress.PostalZone
                }
                className="w-full px-3 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Country
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress.Country
                    .IdentificationCode
                }
                className="w-full px-3 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none"
                readOnly
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Registration Name
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PartyLegalEntity
                    .RegistrationName
                }
                className="w-full px-3 py-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Delivery and Payment */}
        <div className="col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Delivery & Payment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                value={formData.Delivery.ActualDeliveryDate}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    Delivery: {
                      ...prevData.Delivery,
                      ActualDeliveryDate: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Payment Means
              </label>
              <input
                type="text"
                value={formData.PaymentMeans.PaymentMeansCode}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    PaymentMeans: {
                      ...prevData.PaymentMeans,
                      PaymentMeansCode: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Legal Monetary Total */}
        <div className="col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Legal Monetary Total</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Line Extension Amount
              </label>
              <input
                type="text"
                value={formData.LegalMonetaryTotal.LineExtensionAmount}
                onChange={(e) =>
                  handleLegalMonetaryTotalChange(
                    "LineExtensionAmount",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Tax Exclusive Amount
              </label>
              <input
                type="text"
                value={formData.LegalMonetaryTotal.TaxExclusiveAmount}
                onChange={(e) =>
                  handleLegalMonetaryTotalChange(
                    "TaxExclusiveAmount",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Tax Inclusive Amount
              </label>
              <input
                type="text"
                value={formData.LegalMonetaryTotal.TaxInclusiveAmount}
                onChange={(e) =>
                  handleLegalMonetaryTotalChange(
                    "TaxInclusiveAmount",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Allowance Total Amount
              </label>
              <input
                type="text"
                value={formData.LegalMonetaryTotal.AllowanceTotalAmount}
                onChange={(e) =>
                  handleLegalMonetaryTotalChange(
                    "AllowanceTotalAmount",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Payable Amount
              </label>
              <input
                type="text"
                value={formData.LegalMonetaryTotal.PayableAmount}
                onChange={(e) =>
                  handleLegalMonetaryTotalChange(
                    "PayableAmount",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tax Total */}
        <div className="col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Tax Total</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Tax Amount
              </label>
              <input
                type="text"
                value={formData.TaxTotal[0].TaxAmount}
                onChange={(e) =>
                  handleTaxTotalChange("TaxAmount", e.target.value)
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Taxable Amount
              </label>
              <input
                type="text"
                value={formData.TaxTotal[0].TaxSubtotal.TaxableAmount}
                onChange={(e) =>
                  handleTaxTotalChange("TaxSubtotal", {
                    ...formData.TaxTotal[0].TaxSubtotal,
                    TaxableAmount: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Tax Category ID
              </label>
              <input
                type="text"
                value={formData.TaxTotal[0].TaxSubtotal.TaxCategory.ID}
                onChange={(e) =>
                  handleTaxTotalChange("TaxSubtotal", {
                    ...formData.TaxTotal[0].TaxSubtotal,
                    TaxCategory: {
                      ...formData.TaxTotal[0].TaxSubtotal.TaxCategory,
                      ID: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Tax Category Percent
              </label>
              <input
                type="text"
                value={formData.TaxTotal[0].TaxSubtotal.TaxCategory.Percent}
                onChange={(e) =>
                  handleTaxTotalChange("TaxSubtotal", {
                    ...formData.TaxTotal[0].TaxSubtotal,
                    TaxCategory: {
                      ...formData.TaxTotal[0].TaxSubtotal.TaxCategory,
                      Percent: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Tax Scheme ID
              </label>
              <input
                type="text"
                value={
                  formData.TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID
                }
                onChange={(e) =>
                  handleTaxTotalChange("TaxSubtotal", {
                    ...formData.TaxTotal[0].TaxSubtotal,
                    TaxCategory: {
                      ...formData.TaxTotal[0].TaxSubtotal.TaxCategory,
                      TaxScheme: {
                        ...formData.TaxTotal[0].TaxSubtotal.TaxCategory
                          .TaxScheme,
                        ID: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Invoice Line */}
        {/* Invoice Line */}
        <div className="col-span-4 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Invoice Line</h2>
          <table className="w-full text-left table-collapse">
            <thead>
              <tr>
                <th className="text-sm font-medium text-gray-700 p-2 bg-gray-100">
                  Type
                </th>
                <th className="text-sm font-medium text-gray-700 p-2 bg-gray-100">
                  ID
                </th>
                <th className="text-sm font-medium text-gray-700 p-2 bg-gray-100">
                  Price
                </th>
                <th className="text-sm font-medium text-gray-700 p-2 bg-gray-100">
                  Quantity
                </th>
                <th className="text-sm font-medium text-gray-700 p-2 bg-gray-100">
                  Line Amount
                </th>
                <th className="text-sm font-medium text-gray-700 p-2 bg-gray-100">
                  Tax %
                </th>
                <th className="text-sm font-medium text-gray-700 p-2 bg-gray-100">
                  Tax Amount
                </th>
                <th className="text-sm font-medium text-gray-700 p-2 bg-gray-100">
                  Item Name
                </th>
                <th className="text-sm font-medium text-gray-700 p-2 bg-gray-100">
                  Discount
                </th>
                <th className="text-sm font-medium text-gray-700 p-2 bg-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.InvoiceLine.map((line, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="p-2 border-t">
                    <select
                      value={line.LineType}
                      onChange={(e) =>
                        handleInvoiceLineChange(
                          index,
                          "LineType",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Item">Item</option>
                      <option value="Discount">Discount</option>
                      <option value="Exemption">Exemption</option>
                      <option value="Export">Export</option>
                      <option value="GCC">GCC</option>
                      <option value="Zero">Zero</option>
                    </select>
                  </td>
                  <td className="p-2 border-t">
                    <input
                      type="text"
                      value={line.ID}
                      onChange={(e) =>
                        handleInvoiceLineChange(index, "ID", e.target.value)
                      }
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                    />
                  </td>
                  <td className="p-2 border-t">
                    <input
                      type="text"
                      value={line.Price.PriceAmount}
                      onChange={(e) =>
                        handleInvoiceLineChange(
                          index,
                          "Price.PriceAmount",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                    />
                  </td>
                  <td className="p-2 border-t">
                    <input
                      type="text"
                      value={line.InvoicedQuantity.quantity}
                      onChange={(e) =>
                        handleInvoiceLineChange(index, "InvoicedQuantity", {
                          ...line.InvoicedQuantity,
                          quantity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                    />
                  </td>
                  <td className="p-2 border-t">
                    <input
                      type="text"
                      value={line.LineExtensionAmount}
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none "
                    />
                  </td>
                  <td className="p-2 border-t">
                    <select
                      value={line.Item.ClassifiedTaxCategory.Percent}
                      onChange={(e) =>
                        handleInvoiceLineChange(
                          index,
                          "Item.ClassifiedTaxCategory.Percent",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                      required
                    >
                      <option value="">Select Tax %</option>
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="15">15%</option>
                    </select>
                  </td>
                  <td className="p-2 border-t">
                    <input
                      type="text"
                      value={line.TaxTotal.TaxAmount}
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none "
                    />
                  </td>
                  <td className="p-2 border-t">
                    <input
                      type="text"
                      value={line.Item.Name}
                      onChange={(e) =>
                        handleInvoiceLineChange(
                          index,
                          "Item.Name",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                      required
                    />
                  </td>
                  <td className="p-2 border-t">
                    {line.LineType === "Discount" && (
                      <input
                        type="text"
                        value={line.DiscountAmount}
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "DiscountAmount",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                      />
                    )}
                  </td>
                  <td className="p-2 border-t">
                    {!isReadOnly && (
                      <button
                        onClick={() => removeInvoiceLine(index)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                        disabled={formData.InvoiceLine.length === 1}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isReadOnly && (
            <button
              type="button"
              onClick={addInvoiceLine}
              className="mt-4 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
              disabled={
                !formData.InvoiceLine.every(
                  (line) =>
                    line.LineType &&
                    line.Item.ClassifiedTaxCategory.Percent &&
                    line.Item.Name
                )
              }
            >
              Add Line
            </button>
          )}
        </div>
        {/* QR Code */}

        {/* Submit and Save Buttons */}
        <div className="col-span-4 flex justify-end">
          {!isReadOnly && (
            <>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none mr-2"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none"
              >
                Save
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
