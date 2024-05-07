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
        CompanyID: "300000157210003",
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
  const [showAlert, setShowAlert] = useState(false);

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

  const handleChangeAdditional = (e, index, key) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      AdditionalDocumentReference: prevFormData.AdditionalDocumentReference.map(
        (item, i) => {
          if (i === index) {
            if (key === "Attachment") {
              return {
                ...item,
                [key]: {
                  ...item[key],
                  EmbeddedDocumentBinaryObject: value,
                },
              };
            }
            return { ...item, [key]: value };
          }
          return item;
        }
      ),
    }));
  };

  const handleAccountingSupplierPartyChange = (
    parentField,
    childField,
    value
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      AccountingSupplierParty: {
        ...prevData.AccountingSupplierParty,
        [parentField]: {
          ...prevData.AccountingSupplierParty[parentField],
          [childField]: value,
        },
      },
    }));
  };
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
        if (value === "Exemption") {
          updatedLine.Item.ClassifiedTaxCategory.ID = "E";
          // updatedLine.Item.ClassifiedTaxCategor.Percent = "0";
        } else if (value === "Export") {
          updatedLine.Item.ClassifiedTaxCategory.ID = "Z";
        } else if (value === "GCC") {
          updatedLine.Item.ClassifiedTaxCategory.ID = "Z";
        }
      }
      // if (field === "Item.ClassifiedTaxCategory.Percent") {
      //   if (value === "0") {
      //     updatedLine.Item.ClassifiedTaxCategory.ID = "E";
      //   } else if (value == "15") {
      //     updatedLine.Item.ClassifiedTaxCategory.ID = "S";
      //   }
      // }
      if (field === "Item.ClassifiedTaxCategory.Percent") {
        if (value === "15") {
          updatedLine.Item.ClassifiedTaxCategory.ID = "S";
        }
      }

      updatedInvoiceLine[index] = updatedLine;

      const totalLineExtensionAmount = updatedInvoiceLine.reduce(
        (acc, line) => acc + parseFloat(line.LineExtensionAmount || 0),
        0
      );

      const totalTaxAmount = updatedInvoiceLine.reduce(
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

      const taxCategories = updatedInvoiceLine.map(
        (line) => line.Item.ClassifiedTaxCategory
      );
      const hasMixedTaxCategories =
        taxCategories.some((category) => category.ID === "E") &&
        (taxCategories.some((category) => category.ID === "S") ||
          taxCategories.some((category) => category.ID === "Z"));

      // const updatedInvoiceLineWithTaxIDs = updatedInvoiceLine.map((line) => {
      //   if (
      //     hasMixedTaxCategories &&
      //     line.Item.ClassifiedTaxCategory.Percent === "0"
      //   ) {
      //     return {
      //       ...line,
      //       Item: {
      //         ...line.Item,
      //         ClassifiedTaxCategory: {
      //           ...line.Item.ClassifiedTaxCategory,
      //           ID: "O",
      //         },
      //       },
      //     };
      //   }
      //   return line;
      // });
      const updatedInvoiceLineWithTaxIDs = updatedInvoiceLine.map((line) => {
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
            // ID: hasMixedTaxCategories ? "O" : taxCategories[0].ID,
            ID: taxTotalTaxID,

            Percent: hasMixedTaxCategories ? "0" : taxCategories[0].Percent,
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

  // const removeInvoiceLine = (index) => {
  //   setFormData((prevFormData) => {
  //     const updatedInvoiceLine = [...prevFormData.InvoiceLine];
  //     updatedInvoiceLine.splice(index, 1);
  //     return { ...prevFormData, InvoiceLine: updatedInvoiceLine };
  //   });
  // };
  const removeInvoiceLine = (index) => {
    setFormData((prevFormData) => {
      const updatedInvoiceLine = [...prevFormData.InvoiceLine];
      updatedInvoiceLine.splice(index, 1);

      const taxCategories = updatedInvoiceLine.map(
        (line) => line.Item.ClassifiedTaxCategory
      );
      const hasMixedTaxCategories =
        taxCategories.some((category) => category.ID === "E") &&
        (taxCategories.some((category) => category.ID === "S") ||
          taxCategories.some((category) => category.ID === "Z"));

      const updatedInvoiceLineWithTaxIDs = updatedInvoiceLine.map((line) => {
        if (
          !hasMixedTaxCategories &&
          (line.Item.ClassifiedTaxCategory.Percent === "0" ||
            line.Item.ClassifiedTaxCategory.ID === "Z")
        ) {
          return {
            ...line,
            Item: {
              ...line.Item,
              ClassifiedTaxCategory: {
                ...line.Item.ClassifiedTaxCategory,
                ID: line.Item.ClassifiedTaxCategory.ID === "Z" ? "Z" : "E",
                // ID: "E",
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
            Percent: hasMixedTaxCategories
              ? "0"
              : taxCategories[0]?.Percent || "",
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
      const response = await axios.post(
        "http://localhost:5000/invoice-form/save",
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
      const data = {
        formData: formData,
      };

      // Create new invoice
      const response = await axios.post(
        "https://zatca-e-invoice-1.onrender.com/submit-form-data",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response from backend:", response.data);

      // Handle the QR code response
      const qrCodeUrl = response.data.qrCodeUrl;
      console.log(qrCodeUrl);
      setQRCodeUrl(qrCodeUrl);
      setShowAlert(true);

      console.log("Form data submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting form data:", error);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col ">
        {/* first section */}
        <div className="flex  border rounded-md shadow-md p-4 justify-around ml-10 mr-10 mb-5">
          <div className="flex flex-col w-1/2 pl-10">
            <label className="block mb-4">
              <span className="text-gray-700">ProfileID:</span>
              <input
                type="text"
                name="ProfileID"
                value={formData.ProfileID}
                onChange={handleChange}
                className="block mt-1 w-1/2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              ID:
              <input
                type="text"
                name="ID"
                value={formData.ID}
                onChange={handleChange}
                className="block mt-1 w-1/2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              UUID:
              <input
                type="text"
                name="UUID"
                value={formData.UUID}
                onChange={handleChange}
                className="block mt-1 w-1/2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>
            <label className="block mb-2">
              Issue Date:
              <input
                type="date"
                name="IssueDate"
                value={formData.IssueDate}
                onChange={handleChange}
                className="block  mt-1 p-2 border rounded-md"
              />
            </label>

            <label className="block mb-2">
              Issue Time:
              <input
                type="time"
                name="IssueTime"
                value={formData.IssueTime}
                onChange={handleChange}
                className="block  mt-1 p-2 border rounded-md"
              />
            </label>
          </div>
          <div className="flex flex-col w-1/2">
            <label className="block mb-2">
              Invoice Type Code:
              <input
                type="text"
                name="InvoiceTypeCode"
                value={formData.InvoiceTypeCode}
                onChange={handleChange}
                className="block mt-1 w-1/2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              Document Currency Code:
              <select
                name="DocumentCurrencyCode"
                value={formData.DocumentCurrencyCode}
                onChange={handleChange}
                className="block  mt-1 p-2 border rounded-md"
              >
                <option value="SAR">SAR</option>
                <option value="IND">IND</option>
                <option value="USA">USA</option>
              </select>
            </label>

            <label className="block mb-2">
              Tax Currency Code:
              <select
                name="TaxCurrencyCode"
                value={formData.TaxCurrencyCode}
                onChange={handleChange}
                className="block  mt-1 p-2 border rounded-md"
              >
                <option value="SAR">SAR</option>
                <option value="IND">IND</option>
                <option value="USA">USA</option>
              </select>
            </label>

            <label className="block mb-2">
              Line Count Numeric:
              <input
                type="text"
                name="LineCountNumeric"
                value={formData.LineCountNumeric}
                onChange={handleChange}
                className="block mt-1 w-1/2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>
          </div>
        </div>
        {/* AdditionalDocumentReference */}
        <div className="flex flex-col border rounded-md shadow-md p-4 justify-around ml-10 mr-10 mb-5">
          <label className="mb-2">Additional Document Reference:</label>
          {formData.AdditionalDocumentReference.map((item, index) => (
            <div key={index} className="flex mb-2 justify-between">
              <label className="block mr-2">
                ID:
                <input
                  type="text"
                  value={item.ID}
                  onChange={(e) => handleChangeAdditional(e, index, "ID")}
                  className="block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                />
              </label>
              {index === 0 && ( // Check if it's the first item
                <label className="block mr-2">
                  UUID:
                  <input
                    type="text"
                    value={item.UUID}
                    onChange={(e) => handleChangeAdditional(e, index, "UUID")}
                    className="block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                  />
                </label>
              )}
              {index === 1 && ( // Check if it's the second item
                <label className="block">
                  Embedded Document Binary Object:
                  <input
                    type="text"
                    value={item.Attachment?.EmbeddedDocumentBinaryObject}
                    onChange={(e) =>
                      handleChangeAdditional(e, index, "Attachment")
                    }
                    className="block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                  />
                </label>
              )}
            </div>
          ))}
        </div>

        {/*  AccountingSupplierParty */}
        <div className="flex  p-4 justify-between gap-8 ml-10 mr-10 mb-5">
          <h1>AccountingSupplierParty modified</h1>
        </div>
        <div className="flex border rounded-md shadow-md p-4 justify-between gap-8 ml-10 mr-10 mb-5">
          <div className="flex flex-col w-1/2 ">
            <label className="block mb-2">
              Party Identification ID:
              <input
                type="text"
                value={formData.AccountingSupplierParty.PartyIdentification.ID}
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PartyIdentification",
                    "ID",
                    e.target.value
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              Street Name:
              <input
                type="text"
                value={
                  formData.AccountingSupplierParty.PostalAddress.StreetName
                }
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PostalAddress",
                    "StreetName",
                    e.target.value
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              Building Number:
              <input
                type="text"
                value={
                  formData.AccountingSupplierParty.PostalAddress.BuildingNumber
                }
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PostalAddress",
                    "BuildingNumber",
                    e.target.value
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>
            <label className="block mb-2">
              Plot Identification:
              <input
                type="text"
                value={
                  formData.AccountingSupplierParty.PostalAddress
                    .PlotIdentification
                }
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PostalAddress",
                    "PlotIdentification",
                    e.target.value
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              City Subdivision Name:
              <input
                type="text"
                value={
                  formData.AccountingSupplierParty.PostalAddress
                    .CitySubdivisionName
                }
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PostalAddress",
                    "CitySubdivisionName",
                    e.target.value
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              City Name:
              <input
                type="text"
                value={formData.AccountingSupplierParty.PostalAddress.CityName}
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PostalAddress",
                    "CityName",
                    e.target.value
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>
          </div>
          <div className="flex flex-col w-1/2">
            <label className="block mb-2">
              Postal Zone:
              <input
                type="text"
                value={
                  formData.AccountingSupplierParty.PostalAddress.PostalZone
                }
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PostalAddress",
                    "PostalZone",
                    e.target.value
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              Country Subentity:
              <input
                type="text"
                value={
                  formData.AccountingSupplierParty.PostalAddress
                    .CountrySubentity
                }
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PostalAddress",
                    "CountrySubentity",
                    e.target.value
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              Country Identification Code:
              <input
                type="text"
                value={
                  formData.AccountingSupplierParty.PostalAddress.Country
                    .IdentificationCode
                }
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PostalAddress",
                    "Country",
                    {
                      IdentificationCode: e.target.value,
                    }
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>
            <label className="block mb-2">
              Party Tax Scheme Company ID:
              <input
                type="text"
                value={
                  formData.AccountingSupplierParty.PartyTaxScheme.CompanyID
                }
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PartyTaxScheme",
                    "CompanyID",
                    e.target.value
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              Party Tax Scheme ID:
              <input
                type="text"
                value={
                  formData.AccountingSupplierParty.PartyTaxScheme.TaxScheme.ID
                }
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PartyTaxScheme",
                    "TaxScheme",
                    { ID: e.target.value }
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>

            <label className="block mb-2">
              Party Legal Entity Registration Name:
              <input
                type="text"
                value={
                  formData.AccountingSupplierParty.PartyLegalEntity
                    .RegistrationName
                }
                onChange={(e) =>
                  handleAccountingSupplierPartyChange(
                    "PartyLegalEntity",
                    "RegistrationName",
                    e.target.value
                  )
                }
                className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
              />
            </label>
            {/* Add other fields here similarly */}
          </div>
        </div>
        {/*  AccountingcustomerParty modified*/}
        <div className="flex  p-4 justify-between gap-8 ml-10 mr-10 mb-5">
          <h1>AccountingcustomerParty modified</h1>
        </div>
        <div className="flex border rounded-md shadow-md p-4 justify-between gap-8 ml-10 mr-10 mb-5">
          <div className="flex flex-col w-1/2 ">
            <label className="block mb-2">Party Identification ID:</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PartyIdentification.ID}
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />

            <label className="block mb-2">Street Name:</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.StreetName}
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />

            <label className="block mb-2">Building Number:</label>
            <input
              type="text"
              value={
                formData.AccountingCustomerParty.PostalAddress.BuildingNumber
              }
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />

            <label className="block mb-2">Plot Identification:</label>
            <input
              type="text"
              value={
                formData.AccountingCustomerParty.PostalAddress
                  .PlotIdentification
              }
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />

            <label className="block mb-2">City Subdivision Name:</label>
            <input
              type="text"
              value={
                formData.AccountingCustomerParty.PostalAddress
                  .CitySubdivisionName
              }
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />

            <label className="block mb-2">City Name:</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.CityName}
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col w-1/2 ">
            <label className="block mb-2">Postal Zone:</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PostalAddress.PostalZone}
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />

            <label className="block mb-2">Country Subentity:</label>
            <input
              type="text"
              value={
                formData.AccountingCustomerParty.PostalAddress.CountrySubentity
              }
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />

            <label className="block mb-2">Country Identification Code:</label>
            <input
              type="text"
              value={
                formData.AccountingCustomerParty.PostalAddress.Country
                  .IdentificationCode
              }
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />

            <label className="block mb-2">Party Tax Scheme Company ID:</label>
            <input
              type="text"
              value={formData.AccountingCustomerParty.PartyTaxScheme.CompanyID}
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
            <label className="block mb-2">Party Tax Scheme ID:</label>
            <input
              type="text"
              value={
                formData.AccountingCustomerParty.PartyTaxScheme.TaxScheme.ID
              }
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />

            <label className="block mb-2">
              Party Legal Entity Registration Name:
            </label>
            <input
              type="text"
              value={
                formData.AccountingCustomerParty.PartyLegalEntity
                  .RegistrationName
              }
              readOnly
              className="block mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* total tax */}

        <div className="flex  border rounded-md shadow-md p-4 justify-around gap-8 ml-10 mr-10 mb-5">
          <div className="flex flex-col w-1/2 ">
            <label className="block mb-2">Actual Delivery Date:</label>
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
              className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Payment Means Code:</label>
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
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>
        </div>
        {/* second part of tax total */}
        <div className="flex  border rounded-md shadow-md p-4 justify-around gap-8 ml-10 mr-10 mb-5">
          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Tax Amount:</label>
            <input
              type="text"
              value={formData.TaxTotal[0].TaxAmount}
              onChange={(e) =>
                handleTaxTotalChange("TaxAmount", e.target.value)
              }
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Taxable Amount:</label>
            <input
              type="text"
              value={formData.TaxTotal[0].TaxSubtotal.TaxableAmount}
              onChange={(e) =>
                handleTaxTotalChange("TaxSubtotal", {
                  ...formData.TaxTotal[0].TaxSubtotal,
                  TaxableAmount: e.target.value,
                })
              }
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Tax Category ID:</label>
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
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Tax Category Percent:</label>
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
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Tax Scheme ID:</label>
            <input
              type="text"
              value={formData.TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID}
              onChange={(e) =>
                handleTaxTotalChange("TaxSubtotal", {
                  ...formData.TaxTotal[0].TaxSubtotal,
                  TaxCategory: {
                    ...formData.TaxTotal[0].TaxSubtotal.TaxCategory,
                    TaxScheme: {
                      ...formData.TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme,
                      ID: e.target.value,
                    },
                  },
                })
              }
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>
        </div>
        {/* LegalMonetary */}

        <div className="flex  border rounded-md shadow-md p-4 justify-around gap-8 ml-10 mr-10 mb-5">
          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Line Extension Amount:</label>
            <input
              type="text"
              value={formData.LegalMonetaryTotal.LineExtensionAmount}
              onChange={(e) =>
                handleLegalMonetaryTotalChange(
                  "LineExtensionAmount",
                  e.target.value
                )
              }
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Tax Exclusive Amount:</label>
            <input
              type="text"
              value={formData.LegalMonetaryTotal.TaxExclusiveAmount}
              onChange={(e) =>
                handleLegalMonetaryTotalChange(
                  "TaxExclusiveAmount",
                  e.target.value
                )
              }
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Tax Inclusive Amount:</label>
            <input
              type="text"
              value={formData.LegalMonetaryTotal.TaxInclusiveAmount}
              onChange={(e) =>
                handleLegalMonetaryTotalChange(
                  "TaxInclusiveAmount",
                  e.target.value
                )
              }
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Allowance Total Amount:</label>
            <input
              type="text"
              value={formData.LegalMonetaryTotal.AllowanceTotalAmount}
              onChange={(e) =>
                handleLegalMonetaryTotalChange(
                  "AllowanceTotalAmount",
                  e.target.value
                )
              }
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="block mb-2">Payable Amount:</label>
            <input
              type="text"
              value={formData.LegalMonetaryTotal.PayableAmount}
              onChange={(e) =>
                handleLegalMonetaryTotalChange("PayableAmount", e.target.value)
              }
              className="block mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
            />
          </div>
        </div>
        {/* Invoice line */}
        <div className="flex flex-col  border rounded-md shadow-md p-4 justify-around gap-8 ml-10 mr-10 mb-5">
          {formData.InvoiceLine.map((line, index) => (
            <div key={index} className="  w-full mb-4 gap-8">
              <div className="flex gap-5">
                <div className="flex flex-col w-1/2">
                  <label>Line Type:</label>
                  <select
                    value={line.LineType}
                    onChange={(e) =>
                      handleInvoiceLineChange(index, "LineType", e.target.value)
                    }
                    className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                  >
                    <option value="">Select Line Type</option>
                    <option value="Item">Item</option>
                    <option value="Discount">Discount</option>
                    <option value="Exemption">Exemption</option>
                    <option value="Export">Export</option>
                    <option value="GCC">GCC</option>
                    <option value="Zero">zero</option>
                  </select>
                  {line.LineType == "Discount" && (
                    <>
                      <label>Item ID:</label>
                      <input
                        type="text"
                        value={line.ID}
                        onChange={(e) =>
                          handleInvoiceLineChange(index, "ID", e.target.value)
                        }
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                      />
                      <label>Price Amount:</label>
                      <input
                        type="text"
                        value={line.Price.PriceAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Price.PriceAmount",
                            e.target.value
                          )
                        }
                      />
                      <label>Invoiced Quantity:</label>
                      <input
                        type="text"
                        value={line.InvoicedQuantity.quantity}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(index, "InvoicedQuantity", {
                            ...line.InvoicedQuantity,
                            quantity: e.target.value,
                          })
                        }
                      />
                      <label>Line Extension Amount:</label>
                      <input
                        type="text"
                        value={line.LineExtensionAmount}
                        className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "LineExtensionAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Item Tax Percent:</label>
                      <select
                        value={line.Item.ClassifiedTaxCategory.Percent}
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.ClassifiedTaxCategory.Percent",
                            e.target.value
                          )
                        }
                        className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                      >
                        <option value="">Select Tax %</option>
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="15">15%</option>
                      </select>

                      <label>Tax Amount:</label>
                      <input
                        type="text"
                        value={line.TaxTotal.TaxAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "TaxTotal.TaxAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Rounding Amount:</label>
                      <input
                        type="text"
                        value={line.TaxTotal.RoundingAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "TaxTotal.RoundingAmount",
                            e.target.value
                          )
                        }
                      />
                      <div className="flex flex-col">
                        <label>Item Name:</label>
                        <input
                          type="text"
                          value={line.Item.Name}
                          className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                          onChange={(e) =>
                            handleInvoiceLineChange(
                              index,
                              "Item.Name",
                              e.target.value
                            )
                          }
                        />

                        <label>Item Tax Category ID:</label>
                        <input
                          type="text"
                          value={line.Item.ClassifiedTaxCategory.ID}
                          className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                          onChange={(e) =>
                            handleInvoiceLineChange(
                              index,
                              "Item.ClassifiedTaxCategory.ID",
                              e.target.value
                            )
                          }
                        />

                        <label>Tax Scheme ID:</label>
                        <input
                          type="text"
                          value={line.Item.ClassifiedTaxCategory.TaxScheme.ID}
                          className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                          onChange={(e) =>
                            handleInvoiceLineChange(
                              index,
                              "Item.ClassifiedTaxCategory.TaxScheme.ID",
                              e.target.value
                            )
                          }
                        />
                        <label>Discount Amount:</label>
                        <input
                          type="text"
                          value={line.DiscountAmount || ""}
                          onChange={(e) =>
                            handleInvoiceLineChange(
                              index,
                              "DiscountAmount",
                              e.target.value
                            )
                          }
                          className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        />
                      </div>
                    </>
                  )}
                  {line.LineType == "Item" && (
                    <>
                      <label>Item ID:</label>
                      <input
                        type="text"
                        value={line.ID}
                        onChange={(e) =>
                          handleInvoiceLineChange(index, "ID", e.target.value)
                        }
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                      />
                      <label>Price Amount:</label>
                      <input
                        type="text"
                        value={line.Price.PriceAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Price.PriceAmount",
                            e.target.value
                          )
                        }
                      />
                      <label>Invoiced Quantity:</label>
                      <input
                        type="text"
                        value={line.InvoicedQuantity.quantity}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(index, "InvoicedQuantity", {
                            ...line.InvoicedQuantity,
                            quantity: e.target.value,
                          })
                        }
                      />
                      <label>Line Extension Amount:</label>
                      <input
                        type="text"
                        value={line.LineExtensionAmount}
                        className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "LineExtensionAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Item Tax Percent:</label>
                      <select
                        value={line.Item.ClassifiedTaxCategory.Percent}
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.ClassifiedTaxCategory.Percent",
                            e.target.value
                          )
                        }
                        className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                      >
                        <option value="">Select Tax %</option>
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="15">15%</option>
                      </select>

                      <label>Tax Amount:</label>
                      <input
                        type="text"
                        value={line.TaxTotal.TaxAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "TaxTotal.TaxAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Rounding Amount:</label>
                      <input
                        type="text"
                        value={line.TaxTotal.RoundingAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "TaxTotal.RoundingAmount",
                            e.target.value
                          )
                        }
                      />
                      <div className="flex flex-col">
                        <label>Item Name:</label>
                        <input
                          type="text"
                          value={line.Item.Name}
                          className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                          onChange={(e) =>
                            handleInvoiceLineChange(
                              index,
                              "Item.Name",
                              e.target.value
                            )
                          }
                        />

                        <label>Item Tax Category ID:</label>
                        <input
                          type="text"
                          value={line.Item.ClassifiedTaxCategory.ID}
                          className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                          onChange={(e) =>
                            handleInvoiceLineChange(
                              index,
                              "Item.ClassifiedTaxCategory.ID",
                              e.target.value
                            )
                          }
                        />

                        <label>Tax Scheme ID:</label>
                        <input
                          type="text"
                          value={line.Item.ClassifiedTaxCategory.TaxScheme.ID}
                          className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                          onChange={(e) =>
                            handleInvoiceLineChange(
                              index,
                              "Item.ClassifiedTaxCategory.TaxScheme.ID",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </>
                  )}
                  {line.LineType == "Exemption" && (
                    <>
                      <label>Item ID:</label>
                      <input
                        type="text"
                        value={line.ID}
                        onChange={(e) =>
                          handleInvoiceLineChange(index, "ID", e.target.value)
                        }
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                      />
                      <label>Price Amount:</label>
                      <input
                        type="text"
                        value={line.Price.PriceAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Price.PriceAmount",
                            e.target.value
                          )
                        }
                      />
                      <label>Invoiced Quantity:</label>
                      <input
                        type="text"
                        value={line.InvoicedQuantity.quantity}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(index, "InvoicedQuantity", {
                            ...line.InvoicedQuantity,
                            quantity: e.target.value,
                          })
                        }
                      />
                      <label>Line Extension Amount:</label>
                      <input
                        type="text"
                        value={line.LineExtensionAmount}
                        className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "LineExtensionAmount",
                            e.target.value
                          )
                        }
                      />
                      <label>Item Tax Percent:</label>
                      <select
                        value={line.Item.ClassifiedTaxCategory.Percent}
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.ClassifiedTaxCategory.Percent",
                            e.target.value
                          )
                        }
                        className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                      >
                        <option value="">Select Tax %</option>
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="15">15%</option>
                      </select>

                      <label>Tax Amount:</label>
                      <input
                        type="text"
                        value={line.TaxTotal.TaxAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "TaxTotal.TaxAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Rounding Amount:</label>
                      <input
                        type="text"
                        value={line.TaxTotal.RoundingAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "TaxTotal.RoundingAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Item Name:</label>
                      <input
                        type="text"
                        value={line.Item.Name}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.Name",
                            e.target.value
                          )
                        }
                      />

                      <label>Item Tax Category ID:</label>
                      <input
                        type="text"
                        value={line.Item.ClassifiedTaxCategory.ID}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.ClassifiedTaxCategory.ID",
                            e.target.value
                          )
                        }
                      />

                      <label>Tax Scheme ID:</label>
                      <input
                        type="text"
                        value={line.Item.ClassifiedTaxCategory.TaxScheme.ID}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.ClassifiedTaxCategory.TaxScheme.ID",
                            e.target.value
                          )
                        }
                      />
                    </>
                  )}
                  {line.LineType == "Export" && (
                    <>
                      <label>Item ID:</label>
                      <input
                        type="text"
                        value={line.ID}
                        onChange={(e) =>
                          handleInvoiceLineChange(index, "ID", e.target.value)
                        }
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                      />
                      <label>Price Amount:</label>
                      <input
                        type="text"
                        value={line.Price.PriceAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Price.PriceAmount",
                            e.target.value
                          )
                        }
                      />
                      <label>Invoiced Quantity:</label>
                      <input
                        type="text"
                        value={line.InvoicedQuantity.quantity}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(index, "InvoicedQuantity", {
                            ...line.InvoicedQuantity,
                            quantity: e.target.value,
                          })
                        }
                      />
                      <label>Line Extension Amount:</label>
                      <input
                        type="text"
                        value={line.LineExtensionAmount}
                        className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "LineExtensionAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Item Tax Percent:</label>
                      <select
                        value={line.Item.ClassifiedTaxCategory.Percent}
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.ClassifiedTaxCategory.Percent",
                            e.target.value
                          )
                        }
                        className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                      >
                        <option value="">Select Tax %</option>
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="15">15%</option>
                      </select>

                      <label>Tax Amount:</label>
                      <input
                        type="text"
                        value={line.TaxTotal.TaxAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "TaxTotal.TaxAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Rounding Amount:</label>
                      <input
                        type="text"
                        value={line.TaxTotal.RoundingAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "TaxTotal.RoundingAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Item Name:</label>
                      <input
                        type="text"
                        value={line.Item.Name}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.Name",
                            e.target.value
                          )
                        }
                      />

                      <label>Item Tax Category ID:</label>
                      <input
                        type="text"
                        value={line.Item.ClassifiedTaxCategory.ID}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.ClassifiedTaxCategory.ID",
                            e.target.value
                          )
                        }
                      />

                      <label>Tax Scheme ID:</label>
                      <input
                        type="text"
                        value={line.Item.ClassifiedTaxCategory.TaxScheme.ID}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.ClassifiedTaxCategory.TaxScheme.ID",
                            e.target.value
                          )
                        }
                      />
                    </>
                  )}
                  {line.LineType == "GCC" && (
                    <>
                      <label>Item ID:</label>
                      <input
                        type="text"
                        value={line.ID}
                        onChange={(e) =>
                          handleInvoiceLineChange(index, "ID", e.target.value)
                        }
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                      />
                      <label>Price Amount:</label>
                      <input
                        type="text"
                        value={line.Price.PriceAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Price.PriceAmount",
                            e.target.value
                          )
                        }
                      />
                      <label>Invoiced Quantity:</label>
                      <input
                        type="text"
                        value={line.InvoicedQuantity.quantity}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(index, "InvoicedQuantity", {
                            ...line.InvoicedQuantity,
                            quantity: e.target.value,
                          })
                        }
                      />
                      <label>Line Extension Amount:</label>
                      <input
                        type="text"
                        value={line.LineExtensionAmount}
                        className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "LineExtensionAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Item Tax Percent:</label>
                      <select
                        value={line.Item.ClassifiedTaxCategory.Percent}
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "Item.ClassifiedTaxCategory.Percent",
                            e.target.value
                          )
                        }
                        className="block mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                      >
                        <option value="">Select Tax %</option>
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="15">15%</option>
                      </select>

                      <label>Tax Amount:</label>
                      <input
                        type="text"
                        value={line.TaxTotal.TaxAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "TaxTotal.TaxAmount",
                            e.target.value
                          )
                        }
                      />

                      <label>Rounding Amount:</label>
                      <input
                        type="text"
                        value={line.TaxTotal.RoundingAmount}
                        className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                        onChange={(e) =>
                          handleInvoiceLineChange(
                            index,
                            "TaxTotal.RoundingAmount",
                            e.target.value
                          )
                        }
                      />
                      <div className="flex flex-col">
                        <label>Item Name:</label>
                        <input
                          type="text"
                          value={line.Item.Name}
                          className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                          onChange={(e) =>
                            handleInvoiceLineChange(
                              index,
                              "Item.Name",
                              e.target.value
                            )
                          }
                        />

                        <label>Item Tax Category ID:</label>
                        <input
                          type="text"
                          value={line.Item.ClassifiedTaxCategory.ID}
                          className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                          onChange={(e) =>
                            handleInvoiceLineChange(
                              index,
                              "Item.ClassifiedTaxCategory.ID",
                              e.target.value
                            )
                          }
                        />

                        <label>Tax Scheme ID:</label>
                        <input
                          type="text"
                          value={line.Item.ClassifiedTaxCategory.TaxScheme.ID}
                          className="block mt-1  px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:border-black-500 focus:ring focus:ring-black-500"
                          onChange={(e) =>
                            handleInvoiceLineChange(
                              index,
                              "Item.ClassifiedTaxCategory.TaxScheme.ID",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {!isReadOnly && (
                <button
                  onClick={() => removeInvoiceLine(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-3"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {!isReadOnly && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={addInvoiceLine}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Add Line
              </button>
            </div>
          )}
        </div>

        {/* button */}
        <div className="flex justify-center mt-4 gap-3">
          {!isReadOnly && (
            <>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                style={{ width: "200px" }}
              >
                {selectedInvoice ? "Update Invoice" : "Create Invoice"}
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                style={{ width: "200px" }}
                type="button"
                onClick={handleSave}
              >
                Save
              </button>
            </>
          )}
        </div>
        {/* <div className="flex justify-center mt-4 gap-3">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            style={{ width: "200px" }} // Adjust width as needed
          >
            {selectedInvoice ? "Update Invoice" : "Create Invoice"}
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            style={{ width: "200px" }}
            type="button"
            onClick={handleSave}
          >
            Save
          </button>
        </div> */}
      </form>
      {showAlert && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-6 rounded-lg shadow-lg z-10">
            <h3 className="text-xl font-bold mb-4">QR Code</h3>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="max-w-xs mx-auto mb-4"
            />
            <button
              onClick={() => setShowAlert(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;
