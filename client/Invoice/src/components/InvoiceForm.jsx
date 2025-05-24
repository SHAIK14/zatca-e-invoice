/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
// import { btoa } from "b64-lite";
import axios from "axios";
import AlertModal from "./AlertModal";
import * as XLSX from "xlsx";

// import axios from "axios";
const InvoiceForm = () => {
  // const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedInvoice = location.state?.invoice;
  const [formData, setFormData] = useState({
    ProfileID: "reporting:1.0",
    ID: "", //2024032399
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
      PartyIdentification: { ID: "" }, //1010183482
      PostalAddress: {
        StreetName: "", //Al Olaya Olaya Street
        BuildingNumber: "", //7235
        PlotIdentification: "", //325
        CitySubdivisionName: "", //Al Olaya Olaya
        CityName: "", //Riyadh
        PostalZone: "", //12244
        CountrySubentity: "", //Riyadh Region
        Country: { IdentificationCode: "" }, //SA
      },
      PartyTaxScheme: {
        CompanyID: "", //300000157210003--399999999900003
        TaxScheme: { ID: "VAT" },
      },
      PartyLegalEntity: {
        RegistrationName: "", //Solutions By STC
      },
    },
    AccountingCustomerParty: {
      PartyIdentification: { ID: "4030232477" }, //4030232477
      PostalAddress: {
        StreetName: "7524", //7524
        BuildingNumber: "7524", //7524
        PlotIdentification: "3675", //3675
        CitySubdivisionName: "Mecca Al Mokarama", //Mecca Al Mokarama
        CityName: "Riyad", //Riyad
        PostalZone: "12244", //12244
        CountrySubentity: " RiyadhRegion", //RiyadhRegion
        Country: { IdentificationCode: "SA" }, //SA
      },
      PartyTaxScheme: { TaxScheme: { ID: "VAT" } }, //VAT
      PartyLegalEntity: {
        RegistrationName: "فرع شركة سيرفكورب سكوير بي تي اي ليمتد", //فرع شركة سيرفكورب سكوير بي تي اي ليمتد
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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [importError, setImportError] = useState(null);
  const [showPdfButton, setShowPdfButton] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [clearedInvoiceXml, setClearedInvoiceXml] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showGetQRButton, setShowGetQRButton] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // const BASE_URL = `http://localhost:8000`;
  // const BASE_URL = `https://zatca-e-invoice-1.onrender.com`;

  const fetchUserAddress = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/addresses/selected`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user address:", error);
      return null;
    }
  }, [BASE_URL]);
  const goToAddressPage = () => {
    navigate("/addresses");
  };
  useEffect(() => {
    const loadAddress = async () => {
      const address = await fetchUserAddress();
      if (address) {
        setFormData((prevData) => ({
          ...prevData,
          AccountingSupplierParty: {
            PartyIdentification: { ID: address.partyIdentificationID || "" },
            PostalAddress: {
              StreetName: address.streetName || "",
              BuildingNumber: address.buildingNumber || "",
              PlotIdentification: address.plotIdentification || "",
              CitySubdivisionName: address.citySubdivisionName || "",
              CityName: address.cityName || "",
              PostalZone: address.postalZone || "",
              CountrySubentity: address.countrySubentity || "",
              Country: { IdentificationCode: address.country || "" },
            },
            PartyTaxScheme: {
              CompanyID: address.companyID || "",
              TaxScheme: { ID: "VAT" },
            },
            PartyLegalEntity: {
              RegistrationName: address.registrationName || "",
            },
          },
        }));
      } else {
        setIsAlertOpen(true);
      }
    };

    loadAddress();
  }, [fetchUserAddress]);
  const fetchInvoiceID = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/id/generate-invoice-id`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData((prevData) => ({
        ...prevData,
        ID: response.data.invoiceID,
      }));
    } catch (error) {
      console.error("Error fetching invoice ID:", error);
      // Handle error (e.g., show an alert to the user)
    }
  }, [BASE_URL]);

  useEffect(() => {
    if (!selectedInvoice && !formData.ID) {
      fetchInvoiceID();
    }
  }, [selectedInvoice, formData.ID, fetchInvoiceID]);
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

    setFormData((prevData) => {
      let updatedData = {
        ...prevData,
        [name]: formattedValue,
      };

      if (name === "Mode") {
        updatedData.AccountingSupplierParty = {
          ...prevData.AccountingSupplierParty,
          PartyTaxScheme: {
            ...prevData.AccountingSupplierParty.PartyTaxScheme,
            CompanyID:
              value === "Standard" ? "300000157210003" : "399999999900003",
          },
        };
        setShowGetQRButton(value === "Simplified");
        fetchInvoiceID();
      }

      return updatedData;
    });
  };
  function generateUUID() {
    return uuidv4().toUpperCase();
  }
  const handleCustomerChange = (field, value) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      const fieldParts = field.split(".");
      let currentObj = newData.AccountingCustomerParty;

      for (let i = 0; i < fieldParts.length - 1; i++) {
        currentObj = currentObj[fieldParts[i]];
      }

      currentObj[fieldParts[fieldParts.length - 1]] = value;

      return newData;
    });
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
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          console.log("data from the excel:", data);
          processImportedData(data);
          setImportError(null);
        } catch (error) {
          console.error("Error processing file:", error);
          setImportError(
            "Failed to process the uploaded file. Please ensure it's a valid Excel file."
          );
        }
      };
      reader.readAsBinaryString(file);
    }
  };
  const processImportedData = (data) => {
    const newInvoiceLines = data.map((row) => {
      const lineType = row.Type; // This line was correct

      let taxCategoryID, taxPercent;

      switch (lineType) {
        case "Item":
          taxCategoryID = "S";
          taxPercent = "15";
          break;
        case "Exemption":
        case "Zero":
          taxCategoryID = "E";
          taxPercent = "0";
          break;
        case "Export":
        case "GCC":
          taxCategoryID = "Z";
          taxPercent = "0";
          break;
        default:
          taxCategoryID = "";
          taxPercent = "";
      }

      return {
        LineType: lineType,
        ID: row.ID,
        Price: { PriceAmount: row.Price },
        InvoicedQuantity: { quantity: row.Quantity },
        Item: {
          Name: row["Item Name"],
          ClassifiedTaxCategory: {
            ID: taxCategoryID,
            Percent: taxPercent,
            TaxScheme: { ID: "VAT" },
          },
        },
        DiscountAmount: row["Discount Amount"] || "0",
        LineExtensionAmount: "",
        TaxTotal: {
          TaxAmount: "",
          RoundingAmount: "",
        },
      };
    });

    setFormData((prevData) => ({
      ...prevData,
      InvoiceLine: newInvoiceLines,
    }));

    // Use setTimeout to ensure state has updated before triggering calculations
    setTimeout(() => {
      newInvoiceLines.forEach((line, index) => {
        handleInvoiceLineChange(index, "LineType", line.LineType);
        handleInvoiceLineChange(
          index,
          "Price.PriceAmount",
          line.Price.PriceAmount
        );
        handleInvoiceLineChange(
          index,
          "InvoicedQuantity.quantity",
          line.InvoicedQuantity.quantity
        );
        handleInvoiceLineChange(index, "Item.Name", line.Item.Name);
        if (line.DiscountAmount) {
          handleInvoiceLineChange(index, "DiscountAmount", line.DiscountAmount);
        }
      });
    }, 0);
  };

  const addInvoiceLine = () => {
    if (!isReadOnly) {
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
    }
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

  useEffect(() => {
    if (selectedInvoice) {
      setFormData(selectedInvoice);
      setQRCodeUrl(selectedInvoice.qrCode);
      setClearanceStatus(
        selectedInvoice.clearanceStatus || selectedInvoice.reportingStatus
      );
      // Only set to read-only if the invoice is cleared or reported
      setIsReadOnly(
        selectedInvoice.clearanceStatus === "CLEARED" ||
          selectedInvoice.clearanceStatus === "REPORTED"
      );
      setIsEditing(true);
    }
  }, [selectedInvoice]);
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (
        !formData.IssueDate ||
        !formData.Delivery.ActualDeliveryDate ||
        !formData.PaymentMeans.PaymentMeansCode
      ) {
        alert("Please fill in issue date, Delivery, and payment code fields.");
        return;
      }

      const url = `${BASE_URL}/invoice-form/save`;
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Form data saved successfully:", response.data);
      alert("Form saved as draft successfully!");
    } catch (error) {
      console.error("Error saving form data:", error);
      alert("Error saving form. Please try again.");
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (
        !formData.IssueDate ||
        !formData.Delivery.ActualDeliveryDate ||
        !formData.PaymentMeans.PaymentMeansCode
      ) {
        alert("Please fill in issue date, Delivery, and payment code fields.");
        return;
      }
      const updatedFormData = {
        ...formData,
        UUID: formData.UUID || generateUUID(), // Ensure UUID is always set
      };

      const url = `${BASE_URL}/invoice-form/update/${formData.ID}`;
      const response = await axios.put(url, updatedFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Form data updated successfully:", response.data);
      alert("Form updated successfully!");
    } catch (error) {
      console.error("Error updating form data:", error);
      alert("Error updating form. Please try again.");
    }
  };

  const handleGetQR = async () => {
    try {
      if (!formData.AccountingSupplierParty.PartyIdentification.ID) {
        alert("Please add and select an address before generating QR code.");
        setIsAlertOpen(true);
        return;
      }

      const data = {
        formData: formData,
        action: "getQR",
      };
      const token = localStorage.getItem("token");
      const url = `${BASE_URL}/submit-simplified-form-data`;

      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response from backend in the handle qr:", response.data);

      const qrCodeUrl = response.data.qrCodeUrl;
      setQRCodeUrl(qrCodeUrl);
      setPdfData(response.data.pdf);
      setShowPdfButton(true);
      setClearanceStatus("PENDING_SUBMISSION");
      setIsReadOnly(true);

      alert("QR code and PDF generated successfully!");
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("An error occurred while generating QR code and PDF");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
 const invalidLines = formData.InvoiceLine.filter((line) => {
  return (
    !line.LineType ||
    (line.Item.ClassifiedTaxCategory.Percent !== 0 && !line.Item.ClassifiedTaxCategory.Percent) ||
    !line.Item.Name ||
    !line.Price.PriceAmount ||
    !line.InvoicedQuantity.quantity
  );
});

    if (invalidLines.length > 0) {
      alert(
        "Please complete all required fields in each line before submitting"
      );
      return;
    }
    // Validate calculations
    const hasInvalidCalculations = formData.InvoiceLine.some((line) => {
      const calculatedExtension =
        parseFloat(line.Price.PriceAmount) *
        parseFloat(line.InvoicedQuantity.quantity);
      return (
        Math.abs(calculatedExtension - parseFloat(line.LineExtensionAmount)) >
        0.01
      );
    });

    if (hasInvalidCalculations) {
      alert(
        "There are calculation discrepancies. Please review the line items."
      );
      return;
    }

    if (!formData.AccountingSupplierParty.PartyIdentification.ID) {
      alert("Please add and select an address before creating an invoice.");
      setIsAlertOpen(true);
      return;
    }
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
        action: "submit",
      };
      const token = localStorage.getItem("token");
      const url =
        formData.Mode === "Standard"
          ? `${BASE_URL}/submit-form-data`
          : `${BASE_URL}/submit-simplified-form-data`;
      // Create new invoice
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response from backend:", response.data);

      const qrCodeUrl = response.data.qrCodeUrl;
      console.log("qrCodeUrl in the client", qrCodeUrl);
      const clearanceStatus =
        response.data.clearanceStatus || response.data.reportingStatus;
      if (response.data.pdf) {
        setPdfData(response.data.pdf);
        setShowPdfButton(true);
      } else {
        console.error("PDF data not received from server");
        alert("PDF generation failed. Please try again.");
      }
      setQRCodeUrl(qrCodeUrl);
      setClearedInvoiceXml(response.data.clearedInvoiceXml);
      console.log("clearedxml in client:", response.data.clearedInvoiceXml);
      setClearanceStatus(clearanceStatus);

      setIsReadOnly(true);
      alert(
        `Invoice ${
          formData.Mode === "Standard" ? "cleared" : "reported"
        } successfully! Check the QR code and status at the top.`
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

  const handleDownloadPDF = () => {
    if (pdfData) {
      // Convert base64 to blob
      const byteCharacters = atob(pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      // Create download link
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice_${formData.ID}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } else {
      alert("PDF data is not available. Please try submitting the form again.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ZATCA Invoice Form</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            New Invoice
          </button>
          {showPdfButton && (
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              PDF
            </button>
          )}
        </div>
      </div>
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
                    value={formData.Mode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  >
                    <option value="" disabled>
                      Select Mode
                    </option>
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
                    value={
                      formData.IssueDate ? formData.IssueDate.split("T")[0] : ""
                    }
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
              <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-start h-full border-2 border-gray-300">
                <h2 className="text-xl font-bold mb-4">Status</h2>
                {clearanceStatus ? (
                  <div className="text-center">
                    <p
                      className={`font-bold text-xl mb-4 ${
                        clearanceStatus === "CLEARED"
                          ? "text-green-500"
                          : clearanceStatus === "REPORTED"
                          ? "text-blue-500"
                          : clearanceStatus === "PENDING_SUBMISSION"
                          ? "text-yellow-500"
                          : "text-gray-500"
                      }`}
                    >
                      {clearanceStatus === "PENDING_SUBMISSION"
                        ? "Pending Submission"
                        : clearanceStatus}
                    </p>
                    {qrCodeUrl && (
                      <img
                        src={
                          qrCodeUrl.startsWith("data:")
                            ? qrCodeUrl
                            : `data:image/png;base64,${qrCodeUrl}`
                        }
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
                onChange={(e) =>
                  handleCustomerChange("PartyIdentification.ID", e.target.value)
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Street Name
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress.StreetName
                }
                onChange={(e) =>
                  handleCustomerChange(
                    "PostalAddress.StreetName",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Building Number
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress.BuildingNumber
                }
                onChange={(e) =>
                  handleCustomerChange(
                    "PostalAddress.BuildingNumber",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Plot Identification
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress
                    .PlotIdentification
                }
                onChange={(e) =>
                  handleCustomerChange(
                    "PostalAddress.PlotIdentification",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                City Subdivision Name
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress
                    .CitySubdivisionName
                }
                onChange={(e) =>
                  handleCustomerChange(
                    "PostalAddress.CitySubdivisionName",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                City Name
              </label>
              <input
                type="text"
                value={formData.AccountingCustomerParty.PostalAddress.CityName}
                onChange={(e) =>
                  handleCustomerChange("PostalAddress.CityName", e.target.value)
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Postal Zone
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress.PostalZone
                }
                onChange={(e) =>
                  handleCustomerChange(
                    "PostalAddress.PostalZone",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Country Subentity
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress
                    .CountrySubentity
                }
                onChange={(e) =>
                  handleCustomerChange(
                    "PostalAddress.CountrySubentity",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Country Identification Code
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PostalAddress.Country
                    .IdentificationCode
                }
                onChange={(e) =>
                  handleCustomerChange(
                    "PostalAddress.Country.IdentificationCode",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Party Tax Scheme ID
              </label>
              <input
                type="text"
                value={
                  formData.AccountingCustomerParty.PartyTaxScheme.TaxScheme.ID
                }
                onChange={(e) =>
                  handleCustomerChange(
                    "PartyTaxScheme.TaxScheme.ID",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
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
                onChange={(e) =>
                  handleCustomerChange(
                    "PartyLegalEntity.RegistrationName",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
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
                value={
                  formData.Delivery.ActualDeliveryDate
                    ? formData.Delivery.ActualDeliveryDate.split("T")[0]
                    : ""
                }
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
                readOnly
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
                readOnly
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
                readOnly
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
                readOnly
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
                readOnly
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
                readOnly
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
                readOnly
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
                readOnly
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
                readOnly
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
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Invoice Line */}
        {/* Invoice Line */}
        <div className="col-span-4 bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Invoice Line</h2>
            {!isReadOnly && (
              <div className="flex items-center">
                <label className="flex items-center px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none cursor-pointer transition duration-300 ease-in-out">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Import Excel
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
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
              disabled={isReadOnly} // Only check if form is readonly
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
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-4 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none mr-2"
                >
                  Update Draft
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none mr-2"
                >
                  Save as Draft
                </button>
              )}
              {showGetQRButton && (
                <button
                  type="button"
                  onClick={handleGetQR}
                  className="px-4 py-2 text-white bg-purple-500 rounded-lg hover:bg-purple-600 focus:outline-none mr-2"
                >
                  Get QR
                </button>
              )}
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
              >
                Submit Invoice
              </button>
            </>
          )}
        </div>
      </form>
      <AlertModal
        isOpen={isAlertOpen}
        message="No selected address found. You need to add and select an address before creating an invoice."
        onConfirm={() => {
          setIsAlertOpen(false);
          goToAddressPage();
        }}
      />
      {importError && <div className="text-red-500 mt-2">{importError}</div>}
    </div>
  );
};

export default InvoiceForm;
