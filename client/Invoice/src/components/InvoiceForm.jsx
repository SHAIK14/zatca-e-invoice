/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import AlertModal from "./AlertModal";
import * as XLSX from "xlsx";
import InvoiceFormSections from "./InvoiceFormSections";
import InvoiceLineTable from "./InvoiceLineTable";

// New components
const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgColor = type === 'success' 
    ? 'bg-green-500' 
    : type === 'error' 
      ? 'bg-red-500' 
      : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50 flex items-center`}>
      {type === 'success' && (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      )}
      <div className="text-sm">{message}</div>
    </div>
  );
};

const LoadingOverlay = ({ isVisible, message = "Processing Invoice..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};

const InvoiceForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedInvoice = location.state?.invoice;
  
  // Initialize with current date and time
  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  };
  
  // New state for loading and notifications
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  
  const [formData, setFormData] = useState({
    ProfileID: "reporting:1.0",
    ID: "",
    UUID: generateUUID(),
    Mode: "",
    IssueDate: getCurrentDate(),
    IssueTime: getCurrentTime(),
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
      PartyIdentification: { ID: "" },
      PostalAddress: {
        StreetName: "",
        BuildingNumber: "",
        PlotIdentification: "",
        CitySubdivisionName: "",
        CityName: "",
        PostalZone: "",
        CountrySubentity: "",
        Country: { IdentificationCode: "" },
      },
      PartyTaxScheme: {
        CompanyID: "",
        TaxScheme: { ID: "VAT" },
      },
      PartyLegalEntity: {
        RegistrationName: "",
      },
    },
    AccountingCustomerParty: {
      PartyIdentification: { ID: "4030232477" },
      PostalAddress: {
        StreetName: "7524",
        BuildingNumber: "7524",
        PlotIdentification: "3675",
        CitySubdivisionName: "Mecca Al Mokarama",
        CityName: "Riyad",
        PostalZone: "12244",
        CountrySubentity: " RiyadhRegion",
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
        ID: "1",
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

  // Helper function to show notifications
  const showNotification = (type, message) => {
    setNotification({ type, message });
    // Notification will auto-dismiss from the component
  };
  
  // Helper function to clear notifications
  const clearNotification = () => {
    setNotification({ type: '', message: '' });
  };

  function generateUUID() {
    return uuidv4().toUpperCase();
  }

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
      showNotification('error', 'Failed to fetch invoice ID');
    }
  }, [BASE_URL]);

  useEffect(() => {
    if (!selectedInvoice && !formData.ID) {
      fetchInvoiceID();
    }
  }, [selectedInvoice, formData.ID, fetchInvoiceID]);

  useEffect(() => {
    if (selectedInvoice) {
      setFormData(selectedInvoice);
      setQRCodeUrl(selectedInvoice.qrCode);
      setClearanceStatus(
        selectedInvoice.clearanceStatus || selectedInvoice.reportingStatus
      );
      setIsReadOnly(
        selectedInvoice.clearanceStatus === "CLEARED" ||
          selectedInvoice.clearanceStatus === "REPORTED"
      );
      setIsEditing(true);
    }
  }, [selectedInvoice]);

  // Re-index invoice lines after add/remove
  const reindexInvoiceLines = (lines) => {
    return lines.map((line, index) => ({
      ...line,
      ID: (index + 1).toString()
    }));
  };

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
      setIsLoading(true); // Show loading while processing the file
      
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
          showNotification('success', 'Excel data imported successfully');
        } catch (error) {
          console.error("Error processing file:", error);
          setImportError(
            "Failed to process the uploaded file. Please ensure it's a valid Excel file."
          );
          showNotification('error', 'Failed to process Excel file');
        } finally {
          setIsLoading(false); // Hide loading when done
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const processImportedData = (data) => {
    const newInvoiceLines = data.map((row, index) => {
      const lineType = row.Type;

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
        ID: (index + 1).toString(), // Auto-increment ID
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
      setFormData((prevFormData) => {
        const newLine = {
          ID: (prevFormData.InvoiceLine.length + 1).toString(), // Auto-increment
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
        };
        
        return {
          ...prevFormData,
          InvoiceLine: [...prevFormData.InvoiceLine, newLine],
        };
      });
      
      showNotification('success', 'New line added');
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
        showNotification('error', 'Only one discount line is allowed');
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
      // Re-index the remaining lines
      const reindexedLines = reindexInvoiceLines(updatedInvoiceLine);
      return { ...prevFormData, InvoiceLine: reindexedLines };
    });
    showNotification('success', 'Line removed');
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (
        !formData.IssueDate ||
        !formData.Delivery.ActualDeliveryDate ||
        !formData.PaymentMeans.PaymentMeansCode
      ) {
        showNotification('error', 'Please fill in issue date, Delivery, and payment code fields.');
        setIsLoading(false);
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
      showNotification('success', 'Form saved as draft successfully!');
    } catch (error) {
      console.error("Error saving form data:", error);
      showNotification('error', 'Error saving form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (
        !formData.IssueDate ||
        !formData.Delivery.ActualDeliveryDate ||
        !formData.PaymentMeans.PaymentMeansCode
      ) {
        showNotification('error', 'Please fill in issue date, Delivery, and payment code fields.');
        setIsLoading(false);
        return;
      }
      const updatedFormData = {
        ...formData,
        UUID: formData.UUID || generateUUID(),
      };

      const url = `${BASE_URL}/invoice-form/update/${formData.ID}`;
      const response = await axios.put(url, updatedFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Form data updated successfully:", response.data);
      showNotification('success', 'Form updated successfully!');
    } catch (error) {
      console.error("Error updating form data:", error);
      showNotification('error', 'Error updating form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetQR = async () => {
    try {
      setIsLoading(true);
      if (!formData.AccountingSupplierParty.PartyIdentification.ID) {
        showNotification('error', 'Please add and select an address before generating QR code.');
        setIsAlertOpen(true);
        setIsLoading(false);
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

      showNotification('success', 'QR code and PDF generated successfully!');
      
      // No need to scroll as we're rearranging the layout
    } catch (error) {
      console.error("Error generating QR code:", error);
      showNotification('error', 'An error occurred while generating QR code and PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data before submission
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
      showNotification('error', 'Please complete all required fields in each line before submitting');
      return;
    }

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
      showNotification('error', 'There are calculation discrepancies. Please review the line items.');
      return;
    }

    if (!formData.AccountingSupplierParty.PartyIdentification.ID) {
      showNotification('error', 'Please add and select an address before creating an invoice.');
      setIsAlertOpen(true);
      return;
    }
    console.log("Form submitted:", formData);

    try {
      setIsLoading(true);
      
      if (
        !formData.IssueDate ||
        !formData.Delivery.ActualDeliveryDate ||
        !formData.PaymentMeans.PaymentMeansCode
      ) {
        showNotification('error', 'Please fill in all mandatory fields.');
        setIsLoading(false);
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
        showNotification('error', 'PDF generation failed. Please try again.');
      }
      
      setQRCodeUrl(qrCodeUrl);
      setClearedInvoiceXml(response.data.clearedInvoiceXml);
      console.log("clearedxml in client:", response.data.clearedInvoiceXml);
      setClearanceStatus(clearanceStatus);
      setIsReadOnly(true);
      
      showNotification('success', `Invoice ${
          formData.Mode === "Standard" ? "cleared" : "reported"
        } successfully!`);

      console.log("Form data submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting form data:", error);
      if (error.response) {
        showNotification('error', `Error: ${error.response.data}`);
      } else {
        showNotification('error', 'An error occurred while sending data to API');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      setIsLoading(true);
      
      if (pdfData) {
        const byteCharacters = atob(pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `invoice_${formData.ID}.pdf`;
        link.click();
        window.URL.revokeObjectURL(link.href);
        
        showNotification('success', 'PDF downloaded successfully');
      } else {
        showNotification('error', 'PDF data is not available. Please try submitting the form again.');
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showNotification('error', 'Failed to download PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading} />
      
      {/* Notification */}
      <Notification 
        type={notification.type}
        message={notification.message}
        onClose={clearNotification}
      />
      
      {/* Header */}
      <div className="flex justify-between items-center px-2 py-1 bg-white shadow-sm">
        <h1 className="text-lg font-bold">ZATCA Invoice Form</h1>
        <div className="flex space-x-1">
          <button
            onClick={() => window.location.reload()}
            className="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
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
              className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
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

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden p-1">
        {/* Upper Section: General Info, Customer Info, Status */}
        <div className="grid grid-cols-12 gap-1 mb-1">
          {/* General Info */}
          <div className="col-span-5 bg-white shadow rounded p-2">
            <h2 className="text-sm font-bold mb-1">General Info</h2>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="block text-gray-700 text-xs font-medium">ID</label>
                <input
                  type="text"
                  name="ID"
                  value={formData.ID}
                  onChange={handleChange}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Mode</label>
                <select
                  name="Mode"
                  value={formData.Mode}
                  onChange={handleChange}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                >
                  <option value="" disabled>Select Mode</option>
                  <option value="Standard">Standard</option>
                  <option value="Simplified">Simplified</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Issue Date</label>
                <input
                  type="date"
                  name="IssueDate"
                  value={formData.IssueDate ? formData.IssueDate.split("T")[0] : ""}
                  onChange={handleChange}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Issue Time</label>
                <input
                  type="time"
                  name="IssueTime"
                  value={formData.IssueTime}
                  onChange={handleChange}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Invoice Type</label>
                <select
                  name="InvoiceTypeCode"
                  value={formData.InvoiceTypeCode}
                  onChange={handleChange}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                >
                  <option value="388">Standard - 388</option>
                  <option value="381">Credit - 381</option>
                  <option value="383">Debit - 383</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Doc Currency</label>
                <select
                  name="DocumentCurrencyCode"
                  value={formData.DocumentCurrencyCode}
                  onChange={handleChange}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                >
                  <option value="SAR">SAR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 text-xs font-medium">Tax Currency</label>
                <select
                  name="TaxCurrencyCode"
                  value={formData.TaxCurrencyCode}
                  onChange={handleChange}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                >
                  <option value="SAR">SAR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="col-span-5 bg-white shadow rounded p-2">
            <h2 className="text-sm font-bold mb-1">Customer Info</h2>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="block text-gray-700 text-xs font-medium">Party ID</label>
                <input
                  type="text"
                  value={formData.AccountingCustomerParty.PartyIdentification.ID}
                  onChange={(e) => handleCustomerChange("PartyIdentification.ID", e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Registration</label>
                <input
                  type="text"
                  value={formData.AccountingCustomerParty.PartyLegalEntity.RegistrationName}
                  onChange={(e) => handleCustomerChange("PartyLegalEntity.RegistrationName", e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Street</label>
                <input
                  type="text"
                  value={formData.AccountingCustomerParty.PostalAddress.StreetName}
                  onChange={(e) => handleCustomerChange("PostalAddress.StreetName", e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Building</label>
                <input
                  type="text"
                  value={formData.AccountingCustomerParty.PostalAddress.BuildingNumber}
                  onChange={(e) => handleCustomerChange("PostalAddress.BuildingNumber", e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">City</label>
                <input
                  type="text"
                  value={formData.AccountingCustomerParty.PostalAddress.CityName}
                  onChange={(e) => handleCustomerChange("PostalAddress.CityName", e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Country</label>
                <input
                  type="text"
                  value={formData.AccountingCustomerParty.PostalAddress.Country.IdentificationCode}
                  onChange={(e) => handleCustomerChange("PostalAddress.Country.IdentificationCode", e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Plot ID</label>
                <input
                  type="text"
                  value={formData.AccountingCustomerParty.PostalAddress.PlotIdentification}
                  onChange={(e) => handleCustomerChange("PostalAddress.PlotIdentification", e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Postal Zone</label>
                <input
                  type="text"
                  value={formData.AccountingCustomerParty.PostalAddress.PostalZone}
                  onChange={(e) => handleCustomerChange("PostalAddress.PostalZone", e.target.value)}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Status and Delivery & Payment */}
          <div className="col-span-2 space-y-1">
            {/* Status */}
            <div className="bg-white shadow rounded p-2">
              <h2 className="text-sm font-bold mb-1">Status</h2>
              <div className="flex flex-col items-center">
                {clearanceStatus ? (
                  <>
                    <div className={`inline-block px-2 py-0.5 rounded-full text-xs mb-1 font-medium ${
                      clearanceStatus === "CLEARED" ? "bg-green-100 text-green-800" :
                      clearanceStatus === "REPORTED" ? "bg-blue-100 text-blue-800" :
                      clearanceStatus === "PENDING_SUBMISSION" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {clearanceStatus === "PENDING_SUBMISSION" ? "Pending" : clearanceStatus}
                    </div>
                    {qrCodeUrl && (
                      <img
                        src={qrCodeUrl.startsWith("data:") ? qrCodeUrl : `data:image/png;base64,${qrCodeUrl}`}
                        alt="QR Code"
                        className="h-16 w-16 object-contain"
                      />
                    )}
                  </>
                ) : (
                  <div className="w-16 h-16 bg-gray-200"></div>
                )}
              </div>
            </div>
            
            {/* Delivery & Payment */}
            <div className="bg-white shadow rounded p-2">
              <h2 className="text-sm font-bold mb-1">Delivery & Payment</h2>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Delivery Date</label>
                <input
                  type="date"
                  value={formData.Delivery.ActualDeliveryDate ? formData.Delivery.ActualDeliveryDate.split("T")[0] : ""}
                  onChange={(e) => setFormData(prevData => ({
                    ...prevData,
                    Delivery: { ...prevData.Delivery, ActualDeliveryDate: e.target.value }
                  }))}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                  required
                />
              </div>
              <div className="mt-1">
                <label className="block text-gray-700 text-xs font-medium">Payment Code</label>
                <input
                  type="text"
                  value={formData.PaymentMeans.PaymentMeansCode}
                  onChange={(e) => setFormData(prevData => ({
                    ...prevData,
                    PaymentMeans: { ...prevData.PaymentMeans, PaymentMeansCode: e.target.value }
                  }))}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Middle Section: Legal Monetary Total and Tax Total */}
        <div className="grid grid-cols-12 gap-1 mb-1">
          {/* Legal Monetary Total */}
          <div className="col-span-6 bg-white shadow rounded p-2">
            <h2 className="text-sm font-bold mb-1">Legal Monetary Total</h2>
            <div className="grid grid-cols-3 gap-1">
              <div>
                <label className="block text-gray-700 text-xs font-medium">Line Extension</label>
                <input
                  type="text"
                  value={formData.LegalMonetaryTotal.LineExtensionAmount}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Tax Exclusive</label>
                <input
                  type="text"
                  value={formData.LegalMonetaryTotal.TaxExclusiveAmount}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Tax Inclusive</label>
                <input
                  type="text"
                  value={formData.LegalMonetaryTotal.TaxInclusiveAmount}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Allowance</label>
                <input
                  type="text"
                  value={formData.LegalMonetaryTotal.AllowanceTotalAmount}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 text-xs font-medium">Payable Amount</label>
                <input
                  type="text"
                  value={formData.LegalMonetaryTotal.PayableAmount}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>
          
          {/* Tax Total */}
          <div className="col-span-6 bg-white shadow rounded p-2">
            <h2 className="text-sm font-bold mb-1">Tax Total</h2>
            <div className="grid grid-cols-3 gap-1">
              <div>
                <label className="block text-gray-700 text-xs font-medium">Tax Amount</label>
                <input
                  type="text"
                  value={formData.TaxTotal[0].TaxAmount}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Taxable Amount</label>
                <input
                  type="text"
                  value={formData.TaxTotal[0].TaxSubtotal.TaxableAmount}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Tax Category</label>
                <input
                  type="text"
                  value={formData.TaxTotal[0].TaxSubtotal.TaxCategory.ID}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-medium">Tax %</label>
                <input
                  type="text"
                  value={formData.TaxTotal[0].TaxSubtotal.TaxCategory.Percent}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 text-xs font-medium">Tax Scheme</label>
                <input
                  type="text"
                  value={formData.TaxTotal[0].TaxSubtotal.TaxCategory.TaxScheme.ID}
                  className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Invoice Lines Table - Scrollable */}
        <div className="bg-white shadow rounded p-2 flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-sm font-bold">Invoice Lines</h2>
            {!isReadOnly && (
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={addInvoiceLine}
                  className="px-2 py-0.5 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
                >
                  Add Line
                </button>
                <label className="flex items-center px-2 py-0.5 text-xs text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
          
          {importError && <div className="text-red-500 text-xs mb-1">{importError}</div>}
          
          <div className="flex-1 overflow-auto border rounded min-h-0">
            <table className="w-full text-left table-fixed">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="text-xs font-medium text-gray-700 p-1 border-b w-20">Type</th>
                  <th className="text-xs font-medium text-gray-700 p-1 border-b w-10">ID</th>
                  <th className="text-xs font-medium text-gray-700 p-1 border-b w-16">Price</th>
                  <th className="text-xs font-medium text-gray-700 p-1 border-b w-12">Qty</th>
                  <th className="text-xs font-medium text-gray-700 p-1 border-b w-20">Line Amt</th>
                  <th className="text-xs font-medium text-gray-700 p-1 border-b w-14">Tax %</th>
                  <th className="text-xs font-medium text-gray-700 p-1 border-b w-16">Tax Amt</th>
                  <th className="text-xs font-medium text-gray-700 p-1 border-b">Item Name</th>
                  <th className="text-xs font-medium text-gray-700 p-1 border-b w-16">Discount</th>
                  <th className="text-xs font-medium text-gray-700 p-1 border-b w-14">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.InvoiceLine.map((line, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-1 border-b">
                      <select
                        value={line.LineType}
                        onChange={(e) => handleInvoiceLineChange(index, "LineType", e.target.value)}
                        className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                        required
                        disabled={isReadOnly}
                      >
                        <option value="">Select</option>
                        <option value="Item">Item</option>
                        <option value="Discount">Discount</option>
                        <option value="Exemption">Exemption</option>
                        <option value="Export">Export</option>
                        <option value="GCC">GCC</option>
                        <option value="Zero">Zero</option>
                      </select>
                    </td>
                    <td className="p-1 border-b">
                      <input
                        type="text"
                        value={line.ID}
                        className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                        readOnly
                      />
                    </td>
                    <td className="p-1 border-b">
                      <input
                        type="text"
                        value={line.Price.PriceAmount}
                        onChange={(e) => handleInvoiceLineChange(index, "Price.PriceAmount", e.target.value)}
                        className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                        disabled={isReadOnly}
                      />
                    </td>
                    <td className="p-1 border-b">
                      <input
                        type="text"
                        value={line.InvoicedQuantity.quantity}
                        onChange={(e) => handleInvoiceLineChange(index, "InvoicedQuantity", {
                          ...line.InvoicedQuantity,
                          quantity: e.target.value
                        })}
                        className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                        disabled={isReadOnly}
                      />
                    </td>
                    <td className="p-1 border-b">
                      <input
                        type="text"
                        value={line.LineExtensionAmount}
                        className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                        readOnly
                      />
                    </td>
                    <td className="p-1 border-b">
                      <select
                        value={line.Item.ClassifiedTaxCategory.Percent}
                        onChange={(e) => handleInvoiceLineChange(index, "Item.ClassifiedTaxCategory.Percent", e.target.value)}
                        className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                        required
                        disabled={isReadOnly}
                      >
                        <option value="">Select</option>
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="15">15%</option>
                      </select>
                    </td>
                    <td className="p-1 border-b">
                      <input
                        type="text"
                        value={line.TaxTotal.TaxAmount}
                        className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded bg-gray-100"
                        readOnly
                      />
                    </td>
                    <td className="p-1 border-b">
                      <input
                        type="text"
                        value={line.Item.Name}
                        onChange={(e) => handleInvoiceLineChange(index, "Item.Name", e.target.value)}
                        className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                        required
                        disabled={isReadOnly}
                      />
                    </td>
                    <td className="p-1 border-b">
                      {line.LineType === "Discount" && (
                        <input
                          type="text"
                          value={line.DiscountAmount}
                          onChange={(e) => handleInvoiceLineChange(index, "DiscountAmount", e.target.value)}
                          className="w-full px-1 py-0.5 text-xs text-gray-700 border rounded focus:outline-none"
                          disabled={isReadOnly}
                        />
                      )}
                    </td>
                    <td className="p-1 border-b">
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeInvoiceLine(index)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
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
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-1 flex justify-end space-x-1">
          {!isReadOnly && (
            <>
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-2 py-1 text-xs text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none"
                >
                  Update Draft
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none"
                >
                  Save as Draft
                </button>
              )}
              {showGetQRButton && (
                <button
                  type="button"
                  onClick={handleGetQR}
                  className="px-2 py-1 text-xs text-white bg-purple-500 rounded hover:bg-purple-600 focus:outline-none"
                >
                  Get QR
                </button>
              )}
              <button
                type="submit"
                className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
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
    </div>
  );
};

export default InvoiceForm;
                     