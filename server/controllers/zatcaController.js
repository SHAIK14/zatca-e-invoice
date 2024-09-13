// controllers/ZatcaController.js
const InvoiceForm = require("../models/InvoiceForm");
const axios = require("axios");
const xml2js = require("xml2js");
const QRCode = require("qrcode");
const {
  generateXMLFile,
  removeXMLHeader,
  generateHashKey,
  utf8_to_b64,
} = require("../utils/zatcaUtils");

const { processInvoiceData } = require("../utils/apiDataUtils");
const { generatePDF } = require("../utils/pdfGenerator");
const { convertToPDFA3 } = require("../utils/pdfA3Converter");

exports.submitFormData = async (req, res) => {
  try {
    let invoiceData;

    if (req.body.formData) {
      // Data received from the form
      invoiceData = req.body.formData;
    } else if (req.body.invoiceData) {
      // Data received from the API
      invoiceData = await processInvoiceData(req.body.invoiceData);
    } else {
      return res.status(400).json({ error: "Invalid request data" });
    }

    if (!invoiceData.Mode) {
      return res.status(400).json({ error: "Mode is required" });
    }
    console.log("Received invoice data in the controllerfile:", invoiceData);

    // const mode = invoiceData.Mode;
    invoiceData = preprocessInvoiceData(invoiceData);

    console.log("Preprocessed invoice data:", invoiceData);

    // console.log("mode in the controller file:", mode);
    const xmlData = await generateXMLFile(invoiceData);
    const xmlDataWithoutHeader = removeXMLHeader(xmlData);
    const hashKey = await generateHashKey(xmlDataWithoutHeader);

    // console.log("in controller xmldata:", xmlData);
    const { UUID } = invoiceData;
    console.log("UUIDin the controller file:", UUID);
    // console.log("in controller hashKey :", hashKey);

    const xmlBase64 = await utf8_to_b64(xmlData);
    // console.log("XML Base64 inthe controller file:", xmlBase64);

    const payload = {
      invoiceHash: hashKey,
      uuid: UUID,
      invoice: xmlBase64,
    };

    const username =
      "TUlJRCtEQ0NBNStnQXdJQkFnSVRZd0FBRklNUlpYVEdUb3hBNkFBQkFBQVVnekFLQmdncWhrak9QUVFEQWpCaU1SVXdFd1lLQ1pJbWlaUHlMR1FCR1JZRmJHOWpZV3d4RXpBUkJnb0praWFKay9Jc1pBRVpGZ05uYjNZeEZ6QVZCZ29Ka2lhSmsvSXNaQUVaRmdkbGVIUm5ZWHAwTVJzd0dRWURWUVFERXhKUVJWcEZTVTVXVDBsRFJWTkRRVEV0UTBFd0hoY05NalF3TVRNeE1UQXdPVE01V2hjTk1qWXdNVE14TVRBeE9UTTVXakJkTVFzd0NRWURWUVFHRXdKVFFURVpNQmNHQTFVRUNoTVFVMjlzZFhScGIyNXpJR0o1SUZOVVF6RVRNQkVHQTFVRUN4TUtNekF3TURBd01UVTNNakVlTUJ3R0ExVUVBeE1WVUZKRldrRlVRMEV0UTI5a1pTMVRhV2R1YVc1bk1GWXdFQVlIS29aSXpqMENBUVlGSzRFRUFBb0RRZ0FFVmMxeGt5WXNJYWd5TEFQWTR0SjlFUzBDTEN0VVdiZ0JTR0g0eWZmRi9FZlhEUCswV0d6WURCekI0SGVINGNFRWY3ZE9JelRYRGZXOXZRL09aNTlXdzZPQ0Fqb3dnZ0kyTUlHTUJnTlZIUkVFZ1lRd2dZR2tmekI5TVNFd0h3WURWUVFFREJneExWTnZiSHd5TFRFeU0zd3pMVE13TURBd01ERTFOekl4SHpBZEJnb0praWFKay9Jc1pBRUJEQTh6TURBd01EQXhOVGN5TVRBd01ETXhEVEFMQmdOVkJBd01CREV3TURBeEZqQVVCZ05WQkJvTURVOXNZWGxoTENCU2FYbGhaR2d4RURBT0JnTlZCQThNQjFSbGJHVmpiMjB3SFFZRFZSME9CQllFRkpJalUwT3ZIK3JCVlF5UXFlMjlsM0ZVK2d1a01COEdBMVVkSXdRWU1CYUFGS3BZT0lPcGxpVk42bFI2dVpRSDQxZFErRHZvTUlIT0JnZ3JCZ0VGQlFjQkFRU0J3VENCdmpDQnV3WUlLd1lCQlFVSE1BS0dnYTVzWkdGd09pOHZMME5PUFZCRldrVkpUbFpQU1VORlUwTkJNUzFEUVN4RFRqMUJTVUVzUTA0OVVIVmliR2xqSlRJd1MyVjVKVEl3VTJWeWRtbGpaWE1zUTA0OVUyVnlkbWxqWlhNc1EwNDlRMjl1Wm1sbmRYSmhkR2x2Yml4RVF6MWxlSFI2WVhSallTeEVRejFuYjNZc1JFTTliRzlqWVd3L1kwRkRaWEowYVdacFkyRjBaVDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05sY25ScFptbGpZWFJwYjI1QmRYUm9iM0pwZEhrd0RnWURWUjBQQVFIL0JBUURBZ2VBTUR3R0NTc0dBUVFCZ2pjVkJ3UXZNQzBHSlNzR0FRUUJnamNWQ0lHR3FCMkUwUHNTaHUyZEpJZk8reG5Ud0ZWbWdaellMWVBseFYwQ0FXUUNBUkF3SFFZRFZSMGxCQll3RkFZSUt3WUJCUVVIQXdJR0NDc0dBUVVGQndNRE1DY0dDU3NHQVFRQmdqY1ZDZ1FhTUJnd0NnWUlLd1lCQlFVSEF3SXdDZ1lJS3dZQkJRVUhBd013Q2dZSUtvWkl6ajBFQXdJRFJ3QXdSQUlnWmFBOWFFL2dPWnFEbTg4RTIvZllPcEUzam5TSjZIODdvSmFiSE1TTXFxUUNJRklDcDNwNHNFWU9mdzVETkZPemhwYXVTS2xRL1ZNWnpEdGN3VGtKcFFOeQ==";
    //updated
    const password = "OJZmCftMVdiv4HyeFU5/Zj+52P6FmtuEskYi64LTHKo=";
    const apiUrl =
      "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/invoices/clearance/single";

    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const headers = {
      accept: "application/json",
      "accept-language": "en",
      Authorization: `Basic ${auth}`,
      "Accept-Version": "V2",
      "Content-Type": "application/json",
    };
    //https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/invoices/reporting/single

    // https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/invoices/clearance/single"
    const response = await axios.post(apiUrl, payload, { headers });
    console.log("response from api: ", response.data);
    if (response.data.validationResults) {
      const { infoMessages, warningMessages, errorMessages, status } =
        response.data.validationResults;

      // console.log("Validation Results:");
      // console.log("Info Messages:", infoMessages);
      // console.log("Warning Messages:", warningMessages);
      // console.log("Error Messages:", errorMessages);
      // console.log("Status:", status);

      if (status === "ERROR") {
        return res.status(400).json({
          error: "Validation failed",
          validationResults: response.data.validationResults,
        });
      }
    }

    const clearedInvoiceXml = Buffer.from(
      response.data.clearedInvoice,
      "base64"
    ).toString("utf-8");
    // console.log("clearedInvoiceXml:", clearedInvoiceXml);

    xml2js.parseString(clearedInvoiceXml, (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while parsing the XML" });
      }

      const qrData = result.Invoice["cac:AdditionalDocumentReference"].find(
        (ref) => ref["cbc:ID"][0] === "QR"
      )["cac:Attachment"][0]["cbc:EmbeddedDocumentBinaryObject"][0]._;
      // console.log("QRDATA:", qrData);
      QRCode.toDataURL(qrData, async (err, url) => {
        if (err) {
          console.error("Error generating QR code:", err);
          return res
            .status(500)
            .json({ error: "An error occurred while generating the QR code" });
        }
        const pdfBuffer = await generatePDF(invoiceData, url);

        // // Convert PDF buffer to base64
        // const pdfBase64 = pdfBuffer.toString("base64");
        const options = {
          author: "Zatca",
          title: `Invoice ${invoiceData.ID}`,
        };
        const pdfA3Buffer = await convertToPDFA3(
          pdfBuffer,
          clearedInvoiceXml,
          options
        );

        try {
          // Generate PDF/A-3

          const invoiceForm = new InvoiceForm({
            ProfileID: invoiceData.ProfileID,
            ID: invoiceData.ID,
            UUID: invoiceData.UUID,
            Mode: invoiceData.Mode,
            IssueDate: invoiceData.IssueDate,
            IssueTime: invoiceData.IssueTime,
            InvoiceTypeCode: invoiceData.InvoiceTypeCode,
            DocumentCurrencyCode: invoiceData.DocumentCurrencyCode,
            TaxCurrencyCode: invoiceData.TaxCurrencyCode,
            LineCountNumeric: invoiceData.LineCountNumeric,
            AdditionalDocumentReference:
              invoiceData.AdditionalDocumentReference,
            AccountingSupplierParty: invoiceData.AccountingSupplierParty,
            AccountingCustomerParty: invoiceData.AccountingCustomerParty,
            Delivery: invoiceData.Delivery,
            PaymentMeans: invoiceData.PaymentMeans,
            TaxTotal: invoiceData.TaxTotal,
            LegalMonetaryTotal: invoiceData.LegalMonetaryTotal,
            InvoiceLine: invoiceData.InvoiceLine,
            base64XML: xmlBase64,
            hashKey: hashKey,
            responseData: response.data,
            clearanceStatus: response.data.clearanceStatus,
            clearanceInvoice: response.data.clearedInvoice,
            decodedClearanceInvoice: clearedInvoiceXml,
            qrCode: url,
            submissionStatus: "SUBMITTED",
            user: req.user._id,
            pdfData: pdfA3Buffer.toString("base64"),
          });

          await invoiceForm.save();
          console.log(`Invoice ${invoiceForm.ID} saved with SUBMITTED status`);
        } catch (error) {
          console.error("Error saving invoice form:", error);
          res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json({
          invoicedata: invoiceData,
          message: "Data sent to API successfully",
          responseData: response.data,

          clearedInvoiceXml: clearedInvoiceXml,
          qrCodeUrl: url,
          clearanceStatus: response.data.clearanceStatus,
          pdf: pdfA3Buffer.toString("base64"),
        });
      });
    });
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    if (error.response && error.response.data.validationResults) {
      const { infoMessages, warningMessages, errorMessages, status } =
        error.response.data.validationResults;

      console.log("Validation Results:");
      console.log("Info Messages:", infoMessages);
      console.log("Warning Messages:", warningMessages);
      console.log("Error Messages:", errorMessages);
      console.log("Status:", status);
    }
    res.status(error.response ? error.response.status : 500).json({
      error: error.response
        ? error.response.data
        : "An error occurred while sending data to API",
    });
  }
};
function preprocessInvoiceData(data) {
  // Ensure dates are in the correct format
  if (data.IssueDate) {
    data.IssueDate = new Date(data.IssueDate).toISOString().split("T")[0];
  }
  if (data.Delivery && data.Delivery.ActualDeliveryDate) {
    data.Delivery.ActualDeliveryDate = new Date(
      data.Delivery.ActualDeliveryDate
    )
      .toISOString()
      .split("T")[0];
  }

  // Ensure VAT number is correct
  if (
    data.AccountingSupplierParty &&
    data.AccountingSupplierParty.PartyTaxScheme
  ) {
    data.AccountingSupplierParty.PartyTaxScheme.CompanyID = "300000157210003"; // Replace with your actual VAT number
  }

  // Add any other necessary preprocessing steps

  return data;
}
