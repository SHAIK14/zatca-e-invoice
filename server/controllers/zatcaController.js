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

    const xmlData = generateXMLFile(invoiceData);
    console.log(xmlData);
    const xmlDataWithoutHeader = removeXMLHeader(xmlData);

    const hashKey = await generateHashKey(xmlDataWithoutHeader);
    console.log("Hash Key:", hashKey);

    const { UUID } = invoiceData;
    console.log("UUID:", UUID);

    const xmlBase64 = await utf8_to_b64(xmlData);
    console.log("XML Base64:", xmlBase64);

    const payload = {
      invoiceHash: hashKey,
      uuid: UUID,
      invoice: xmlBase64,
    };

    const username =
      "TUlJRCtEQ0NBNStnQXdJQkFnSVRZd0FBRklNUlpYVEdUb3hBNkFBQkFBQVVnekFLQmdncWhrak9QUVFEQWpCaU1SVXdFd1lLQ1pJbWlaUHlMR1FCR1JZRmJHOWpZV3d4RXpBUkJnb0praWFKay9Jc1pBRVpGZ05uYjNZeEZ6QVZCZ29Ka2lhSmsvSXNaQUVaRmdkbGVIUm5ZWHAwTVJzd0dRWURWUVFERXhKUVJWcEZTVTVXVDBsRFJWTkRRVEV0UTBFd0hoY05NalF3TVRNeE1UQXdPVE01V2hjTk1qWXdNVE14TVRBeE9UTTVXakJkTVFzd0NRWURWUVFHRXdKVFFURVpNQmNHQTFVRUNoTVFVMjlzZFhScGIyNXpJR0o1SUZOVVF6RVRNQkVHQTFVRUN4TUtNekF3TURBd01UVTNNakVlTUJ3R0ExVUVBeE1WVUZKRldrRlVRMEV0UTI5a1pTMVRhV2R1YVc1bk1GWXdFQVlIS29aSXpqMENBUVlGSzRFRUFBb0RRZ0FFVmMxeGt5WXNJYWd5TEFQWTR0SjlFUzBDTEN0VVdiZ0JTR0g0eWZmRi9FZlhEUCswV0d6WURCekI0SGVINGNFRWY3ZE9JelRYRGZXOXZRL09aNTlXdzZPQ0Fqb3dnZ0kyTUlHTUJnTlZIUkVFZ1lRd2dZR2tmekI5TVNFd0h3WURWUVFFREJneExWTnZiSHd5TFRFeU0zd3pMVE13TURBd01ERTFOekl4SHpBZEJnb0praWFKay9Jc1pBRUJEQTh6TURBd01EQXhOVGN5TVRBd01ETXhEVEFMQmdOVkJBd01CREV3TURBeEZqQVVCZ05WQkJvTURVOXNZWGxoTENCU2FYbGhaR2d4RURBT0JnTlZCQThNQjFSbGJHVmpiMjB3SFFZRFZSME9CQllFRkpJalUwT3ZIK3JCVlF5UXFlMjlsM0ZVK2d1a01COEdBMVVkSXdRWU1CYUFGS3BZT0lPcGxpVk42bFI2dVpRSDQxZFErRHZvTUlIT0JnZ3JCZ0VGQlFjQkFRU0J3VENCdmpDQnV3WUlLd1lCQlFVSE1BS0dnYTVzWkdGd09pOHZMME5PUFZCRldrVkpUbFpQU1VORlUwTkJNUzFEUVN4RFRqMUJTVUVzUTA0OVVIVmliR2xqSlRJd1MyVjVKVEl3VTJWeWRtbGpaWE1zUTA0OVUyVnlkbWxqWlhNc1EwNDlRMjl1Wm1sbmRYSmhkR2x2Yml4RVF6MWxlSFI2WVhSallTeEVRejFuYjNZc1JFTTliRzlqWVd3L1kwRkRaWEowYVdacFkyRjBaVDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05sY25ScFptbGpZWFJwYjI1QmRYUm9iM0pwZEhrd0RnWURWUjBQQVFIL0JBUURBZ2VBTUR3R0NTc0dBUVFCZ2pjVkJ3UXZNQzBHSlNzR0FRUUJnamNWQ0lHR3FCMkUwUHNTaHUyZEpJZk8reG5Ud0ZWbWdaellMWVBseFYwQ0FXUUNBUkF3SFFZRFZSMGxCQll3RkFZSUt3WUJCUVVIQXdJR0NDc0dBUVVGQndNRE1DY0dDU3NHQVFRQmdqY1ZDZ1FhTUJnd0NnWUlLd1lCQlFVSEF3SXdDZ1lJS3dZQkJRVUhBd013Q2dZSUtvWkl6ajBFQXdJRFJ3QXdSQUlnWmFBOWFFL2dPWnFEbTg4RTIvZllPcEUzam5TSjZIODdvSmFiSE1TTXFxUUNJRklDcDNwNHNFWU9mdzVETkZPemhwYXVTS2xRL1ZNWnpEdGN3VGtKcFFOeQ==";
    const password = "OJZmCftMVdiv4HyeFU5/Zj+52P6FmtuEskYi64LTHKo=";
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const headers = {
      accept: "application/json",
      "accept-language": "en",
      Authorization: `Basic ${auth}`,
      "Accept-Version": "V2",
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/invoices/clearance/single",
      payload,
      { headers }
    );
    console.log("response from api: ", response.data);

    const clearedInvoiceXml = Buffer.from(
      response.data.clearedInvoice,
      "base64"
    ).toString("utf-8");
    console.log("clearedInvoiceXml:", clearedInvoiceXml);

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
      console.log("QRDATA:", qrData);
      QRCode.toDataURL(qrData, async (err, url) => {
        if (err) {
          console.error("Error generating QR code:", err);
          return res
            .status(500)
            .json({ error: "An error occurred while generating the QR code" });
        }
        try {
          const invoiceForm = new InvoiceForm({
            ProfileID: invoiceData.ProfileID,
            ID: invoiceData.ID,
            UUID: invoiceData.UUID,
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
          });

          await invoiceForm.save();

          res.status(200).json({
            message: "Data sent to API successfully",
            responseData: response.data,
            clearedInvoiceXml: clearedInvoiceXml,
            qrCodeUrl: url,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
        }
      });
    });
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      error: error.response
        ? error.response.data
        : "An error occurred while sending data to API",
    });
  }
};

//=----------------------------------------------------------------------
// // controllers/ZatcaController.js

// const InvoiceForm = require("../models/InvoiceForm");

// const axios = require("axios");
// const xml2js = require("xml2js");
// const QRCode = require("qrcode");
// const {
//   generateXMLFile,
//   removeXMLHeader,
//   generateHashKey,
//   utf8_to_b64,
// } = require("../utils/zatcaUtils");

// exports.submitFormData = async (req, res) => {
//   const { formData } = req.body;
//   console.log("Received data from frontend:", formData);

//   try {
//     const xmlData = generateXMLFile(formData);
//     console.log(xmlData);
//     const xmlDataWithoutHeader = removeXMLHeader(xmlData);

//     const hashKey = await generateHashKey(xmlDataWithoutHeader);
//     console.log("Hash Key:", hashKey);

//     const { UUID } = formData;
//     console.log("UUID:", UUID);

//     const xmlBase64 = await utf8_to_b64(xmlData);
//     console.log("XML Base64:", xmlBase64);

//     const payload = {
//       invoiceHash: hashKey,
//       uuid: UUID,
//       invoice: xmlBase64,
//     };

//     const username =
//       "TUlJRCtEQ0NBNStnQXdJQkFnSVRZd0FBRklNUlpYVEdUb3hBNkFBQkFBQVVnekFLQmdncWhrak9QUVFEQWpCaU1SVXdFd1lLQ1pJbWlaUHlMR1FCR1JZRmJHOWpZV3d4RXpBUkJnb0praWFKay9Jc1pBRVpGZ05uYjNZeEZ6QVZCZ29Ka2lhSmsvSXNaQUVaRmdkbGVIUm5ZWHAwTVJzd0dRWURWUVFERXhKUVJWcEZTVTVXVDBsRFJWTkRRVEV0UTBFd0hoY05NalF3TVRNeE1UQXdPVE01V2hjTk1qWXdNVE14TVRBeE9UTTVXakJkTVFzd0NRWURWUVFHRXdKVFFURVpNQmNHQTFVRUNoTVFVMjlzZFhScGIyNXpJR0o1SUZOVVF6RVRNQkVHQTFVRUN4TUtNekF3TURBd01UVTNNakVlTUJ3R0ExVUVBeE1WVUZKRldrRlVRMEV0UTI5a1pTMVRhV2R1YVc1bk1GWXdFQVlIS29aSXpqMENBUVlGSzRFRUFBb0RRZ0FFVmMxeGt5WXNJYWd5TEFQWTR0SjlFUzBDTEN0VVdiZ0JTR0g0eWZmRi9FZlhEUCswV0d6WURCekI0SGVINGNFRWY3ZE9JelRYRGZXOXZRL09aNTlXdzZPQ0Fqb3dnZ0kyTUlHTUJnTlZIUkVFZ1lRd2dZR2tmekI5TVNFd0h3WURWUVFFREJneExWTnZiSHd5TFRFeU0zd3pMVE13TURBd01ERTFOekl4SHpBZEJnb0praWFKay9Jc1pBRUJEQTh6TURBd01EQXhOVGN5TVRBd01ETXhEVEFMQmdOVkJBd01CREV3TURBeEZqQVVCZ05WQkJvTURVOXNZWGxoTENCU2FYbGhaR2d4RURBT0JnTlZCQThNQjFSbGJHVmpiMjB3SFFZRFZSME9CQllFRkpJalUwT3ZIK3JCVlF5UXFlMjlsM0ZVK2d1a01COEdBMVVkSXdRWU1CYUFGS3BZT0lPcGxpVk42bFI2dVpRSDQxZFErRHZvTUlIT0JnZ3JCZ0VGQlFjQkFRU0J3VENCdmpDQnV3WUlLd1lCQlFVSE1BS0dnYTVzWkdGd09pOHZMME5PUFZCRldrVkpUbFpQU1VORlUwTkJNUzFEUVN4RFRqMUJTVUVzUTA0OVVIVmliR2xqSlRJd1MyVjVKVEl3VTJWeWRtbGpaWE1zUTA0OVUyVnlkbWxqWlhNc1EwNDlRMjl1Wm1sbmRYSmhkR2x2Yml4RVF6MWxlSFI2WVhSallTeEVRejFuYjNZc1JFTTliRzlqWVd3L1kwRkRaWEowYVdacFkyRjBaVDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05sY25ScFptbGpZWFJwYjI1QmRYUm9iM0pwZEhrd0RnWURWUjBQQVFIL0JBUURBZ2VBTUR3R0NTc0dBUVFCZ2pjVkJ3UXZNQzBHSlNzR0FRUUJnamNWQ0lHR3FCMkUwUHNTaHUyZEpJZk8reG5Ud0ZWbWdaellMWVBseFYwQ0FXUUNBUkF3SFFZRFZSMGxCQll3RkFZSUt3WUJCUVVIQXdJR0NDc0dBUVVGQndNRE1DY0dDU3NHQVFRQmdqY1ZDZ1FhTUJnd0NnWUlLd1lCQlFVSEF3SXdDZ1lJS3dZQkJRVUhBd013Q2dZSUtvWkl6ajBFQXdJRFJ3QXdSQUlnWmFBOWFFL2dPWnFEbTg4RTIvZllPcEUzam5TSjZIODdvSmFiSE1TTXFxUUNJRklDcDNwNHNFWU9mdzVETkZPemhwYXVTS2xRL1ZNWnpEdGN3VGtKcFFOeQ==";
//     const password = "OJZmCftMVdiv4HyeFU5/Zj+52P6FmtuEskYi64LTHKo=";
//     const auth = Buffer.from(`${username}:${password}`).toString("base64");

//     const headers = {
//       accept: "application/json",
//       "accept-language": "en",
//       Authorization: `Basic ${auth}`,
//       "Accept-Version": "V2",
//       "Content-Type": "application/json",
//     };

//     const response = await axios.post(
//       "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/invoices/clearance/single",
//       payload,
//       { headers }
//     );
//     console.log("response from api: ", response.data);

//     const clearedInvoiceXml = Buffer.from(
//       response.data.clearedInvoice,
//       "base64"
//     ).toString("utf-8");
//     console.log("clearedInvoiceXml:", clearedInvoiceXml);

//     xml2js.parseString(clearedInvoiceXml, (err, result) => {
//       if (err) {
//         console.error("Error parsing XML:", err);
//         return res
//           .status(500)
//           .json({ error: "An error occurred while parsing the XML" });
//       }

//       const qrData = result.Invoice["cac:AdditionalDocumentReference"].find(
//         (ref) => ref["cbc:ID"][0] === "QR"
//       )["cac:Attachment"][0]["cbc:EmbeddedDocumentBinaryObject"][0]._;
//       console.log("QRDATA:", qrData);
//       QRCode.toDataURL(qrData, async (err, url) => {
//         if (err) {
//           console.error("Error generating QR code:", err);
//           return res
//             .status(500)
//             .json({ error: "An error occurred while generating the QR code" });
//         }
//         try {
//           const invoiceForm = new InvoiceForm({
//             ProfileID: formData.ProfileID,
//             ID: formData.ID,
//             UUID: formData.UUID,
//             IssueDate: formData.IssueDate,
//             IssueTime: formData.IssueTime,
//             InvoiceTypeCode: formData.InvoiceTypeCode,
//             DocumentCurrencyCode: formData.DocumentCurrencyCode,
//             TaxCurrencyCode: formData.TaxCurrencyCode,
//             LineCountNumeric: formData.LineCountNumeric,
//             AdditionalDocumentReference: formData.AdditionalDocumentReference,
//             AccountingSupplierParty: formData.AccountingSupplierParty,
//             AccountingCustomerParty: formData.AccountingCustomerParty,
//             Delivery: formData.Delivery,
//             PaymentMeans: formData.PaymentMeans,
//             TaxTotal: formData.TaxTotal,
//             LegalMonetaryTotal: formData.LegalMonetaryTotal,
//             InvoiceLine: formData.InvoiceLine,
//             base64XML: xmlBase64,
//             hashKey: hashKey,
//             responseData: response.data,
//             clearanceStatus: response.data.clearanceStatus,
//             clearanceInvoice: response.data.clearedInvoice,
//             decodedClearanceInvoice: clearedInvoiceXml,
//             qrCode: url,
//           });

//           await invoiceForm.save();

//           res.status(200).json({
//             message: "Data sent to API successfully",
//             responseData: response.data,
//             clearedInvoiceXml: clearedInvoiceXml,
//             qrCodeUrl: url,
//           });
//         } catch (error) {
//           console.error(error);
//           res.status(500).json({ message: "Internal server error" });
//         }
//       });
//     });
//   } catch (error) {
//     console.error(
//       "Error:",
//       error.response ? error.response.data : error.message
//     );
//     res.status(error.response ? error.response.status : 500).json({
//       error: error.response
//         ? error.response.data
//         : "An error occurred while sending data to API",
//     });
//   }
// };
