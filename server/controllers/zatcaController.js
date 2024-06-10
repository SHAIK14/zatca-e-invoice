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
const {
  generateXMLFile: generateSimplifiedXMLFile,
} = require("../utils/zatcaSimplifiedUtils");
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
    console.log("invoiceData", invoiceData);
    const mode = invoiceData.Mode;

    console.log("mode in the controller file:", mode);

    let xmlData;
    let hashKey;
    if (mode === "Simplified") {
      // Generate XML and hash key for simplified mode
      const { xmlData: simplifiedXmlData, xmlHash: simplifiedHashKey } =
        await generateSimplifiedXMLFile(invoiceData);
      xmlData = simplifiedXmlData;

      hashKey = simplifiedHashKey;
    } else {
      // Generate XML and hash key for standard mode
      xmlData = await generateXMLFile(invoiceData);
      const xmlDataWithoutHeader = removeXMLHeader(xmlData);
      hashKey = await generateHashKey(xmlDataWithoutHeader);
    }
    console.log("in controller xmldata:", xmlData);
    console.log("in controller hashKey :", hashKey);
    // const xmlDataWithoutHeader = removeXMLHeader(xmlData);

    // const hashKey = await generateHashKey(xmlDataWithoutHeader);
    // console.log("Hash Key in the controllerfile:", hashKey);

    const xmlBase64 = await utf8_to_b64(xmlData);
    console.log("XML Base64 inthe controller file:", xmlBase64);
    const { UUID } = invoiceData;
    console.log("UUIDin the controller file:", UUID);

    const payload = {
      invoiceHash: hashKey,
      uuid: UUID,
      invoice: xmlBase64,
    };

    // const username =
    //   "TUlJRCtEQ0NBNStnQXdJQkFnSVRZd0FBRklNUlpYVEdUb3hBNkFBQkFBQVVnekFLQmdncWhrak9QUVFEQWpCaU1SVXdFd1lLQ1pJbWlaUHlMR1FCR1JZRmJHOWpZV3d4RXpBUkJnb0praWFKay9Jc1pBRVpGZ05uYjNZeEZ6QVZCZ29Ka2lhSmsvSXNaQUVaRmdkbGVIUm5ZWHAwTVJzd0dRWURWUVFERXhKUVJWcEZTVTVXVDBsRFJWTkRRVEV0UTBFd0hoY05NalF3TVRNeE1UQXdPVE01V2hjTk1qWXdNVE14TVRBeE9UTTVXakJkTVFzd0NRWURWUVFHRXdKVFFURVpNQmNHQTFVRUNoTVFVMjlzZFhScGIyNXpJR0o1SUZOVVF6RVRNQkVHQTFVRUN4TUtNekF3TURBd01UVTNNakVlTUJ3R0ExVUVBeE1WVUZKRldrRlVRMEV0UTI5a1pTMVRhV2R1YVc1bk1GWXdFQVlIS29aSXpqMENBUVlGSzRFRUFBb0RRZ0FFVmMxeGt5WXNJYWd5TEFQWTR0SjlFUzBDTEN0VVdiZ0JTR0g0eWZmRi9FZlhEUCswV0d6WURCekI0SGVINGNFRWY3ZE9JelRYRGZXOXZRL09aNTlXdzZPQ0Fqb3dnZ0kyTUlHTUJnTlZIUkVFZ1lRd2dZR2tmekI5TVNFd0h3WURWUVFFREJneExWTnZiSHd5TFRFeU0zd3pMVE13TURBd01ERTFOekl4SHpBZEJnb0praWFKay9Jc1pBRUJEQTh6TURBd01EQXhOVGN5TVRBd01ETXhEVEFMQmdOVkJBd01CREV3TURBeEZqQVVCZ05WQkJvTURVOXNZWGxoTENCU2FYbGhaR2d4RURBT0JnTlZCQThNQjFSbGJHVmpiMjB3SFFZRFZSME9CQllFRkpJalUwT3ZIK3JCVlF5UXFlMjlsM0ZVK2d1a01COEdBMVVkSXdRWU1CYUFGS3BZT0lPcGxpVk42bFI2dVpRSDQxZFErRHZvTUlIT0JnZ3JCZ0VGQlFjQkFRU0J3VENCdmpDQnV3WUlLd1lCQlFVSE1BS0dnYTVzWkdGd09pOHZMME5PUFZCRldrVkpUbFpQU1VORlUwTkJNUzFEUVN4RFRqMUJTVUVzUTA0OVVIVmliR2xqSlRJd1MyVjVKVEl3VTJWeWRtbGpaWE1zUTA0OVUyVnlkbWxqWlhNc1EwNDlRMjl1Wm1sbmRYSmhkR2x2Yml4RVF6MWxlSFI2WVhSallTeEVRejFuYjNZc1JFTTliRzlqWVd3L1kwRkRaWEowYVdacFkyRjBaVDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05sY25ScFptbGpZWFJwYjI1QmRYUm9iM0pwZEhrd0RnWURWUjBQQVFIL0JBUURBZ2VBTUR3R0NTc0dBUVFCZ2pjVkJ3UXZNQzBHSlNzR0FRUUJnamNWQ0lHR3FCMkUwUHNTaHUyZEpJZk8reG5Ud0ZWbWdaellMWVBseFYwQ0FXUUNBUkF3SFFZRFZSMGxCQll3RkFZSUt3WUJCUVVIQXdJR0NDc0dBUVVGQndNRE1DY0dDU3NHQVFRQmdqY1ZDZ1FhTUJnd0NnWUlLd1lCQlFVSEF3SXdDZ1lJS3dZQkJRVUhBd013Q2dZSUtvWkl6ajBFQXdJRFJ3QXdSQUlnWmFBOWFFL2dPWnFEbTg4RTIvZllPcEUzam5TSjZIODdvSmFiSE1TTXFxUUNJRklDcDNwNHNFWU9mdzVETkZPemhwYXVTS2xRL1ZNWnpEdGN3VGtKcFFOeQ==";
    // //updated
    // const password = "OJZmCftMVdiv4HyeFU5/Zj+52P6FmtuEskYi64LTHKo=";
    let username, password, apiUrl;

    if (mode === "Standard") {
      username =
        "TUlJRCtEQ0NBNStnQXdJQkFnSVRZd0FBRklNUlpYVEdUb3hBNkFBQkFBQVVnekFLQmdncWhrak9QUVFEQWpCaU1SVXdFd1lLQ1pJbWlaUHlMR1FCR1JZRmJHOWpZV3d4RXpBUkJnb0praWFKay9Jc1pBRVpGZ05uYjNZeEZ6QVZCZ29Ka2lhSmsvSXNaQUVaRmdkbGVIUm5ZWHAwTVJzd0dRWURWUVFERXhKUVJWcEZTVTVXVDBsRFJWTkRRVEV0UTBFd0hoY05NalF3TVRNeE1UQXdPVE01V2hjTk1qWXdNVE14TVRBeE9UTTVXakJkTVFzd0NRWURWUVFHRXdKVFFURVpNQmNHQTFVRUNoTVFVMjlzZFhScGIyNXpJR0o1SUZOVVF6RVRNQkVHQTFVRUN4TUtNekF3TURBd01UVTNNakVlTUJ3R0ExVUVBeE1WVUZKRldrRlVRMEV0UTI5a1pTMVRhV2R1YVc1bk1GWXdFQVlIS29aSXpqMENBUVlGSzRFRUFBb0RRZ0FFVmMxeGt5WXNJYWd5TEFQWTR0SjlFUzBDTEN0VVdiZ0JTR0g0eWZmRi9FZlhEUCswV0d6WURCekI0SGVINGNFRWY3ZE9JelRYRGZXOXZRL09aNTlXdzZPQ0Fqb3dnZ0kyTUlHTUJnTlZIUkVFZ1lRd2dZR2tmekI5TVNFd0h3WURWUVFFREJneExWTnZiSHd5TFRFeU0zd3pMVE13TURBd01ERTFOekl4SHpBZEJnb0praWFKay9Jc1pBRUJEQTh6TURBd01EQXhOVGN5TVRBd01ETXhEVEFMQmdOVkJBd01CREV3TURBeEZqQVVCZ05WQkJvTURVOXNZWGxoTENCU2FYbGhaR2d4RURBT0JnTlZCQThNQjFSbGJHVmpiMjB3SFFZRFZSME9CQllFRkpJalUwT3ZIK3JCVlF5UXFlMjlsM0ZVK2d1a01COEdBMVVkSXdRWU1CYUFGS3BZT0lPcGxpVk42bFI2dVpRSDQxZFErRHZvTUlIT0JnZ3JCZ0VGQlFjQkFRU0J3VENCdmpDQnV3WUlLd1lCQlFVSE1BS0dnYTVzWkdGd09pOHZMME5PUFZCRldrVkpUbFpQU1VORlUwTkJNUzFEUVN4RFRqMUJTVUVzUTA0OVVIVmliR2xqSlRJd1MyVjVKVEl3VTJWeWRtbGpaWE1zUTA0OVUyVnlkbWxqWlhNc1EwNDlRMjl1Wm1sbmRYSmhkR2x2Yml4RVF6MWxlSFI2WVhSallTeEVRejFuYjNZc1JFTTliRzlqWVd3L1kwRkRaWEowYVdacFkyRjBaVDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05sY25ScFptbGpZWFJwYjI1QmRYUm9iM0pwZEhrd0RnWURWUjBQQVFIL0JBUURBZ2VBTUR3R0NTc0dBUVFCZ2pjVkJ3UXZNQzBHSlNzR0FRUUJnamNWQ0lHR3FCMkUwUHNTaHUyZEpJZk8reG5Ud0ZWbWdaellMWVBseFYwQ0FXUUNBUkF3SFFZRFZSMGxCQll3RkFZSUt3WUJCUVVIQXdJR0NDc0dBUVVGQndNRE1DY0dDU3NHQVFRQmdqY1ZDZ1FhTUJnd0NnWUlLd1lCQlFVSEF3SXdDZ1lJS3dZQkJRVUhBd013Q2dZSUtvWkl6ajBFQXdJRFJ3QXdSQUlnWmFBOWFFL2dPWnFEbTg4RTIvZllPcEUzam5TSjZIODdvSmFiSE1TTXFxUUNJRklDcDNwNHNFWU9mdzVETkZPemhwYXVTS2xRL1ZNWnpEdGN3VGtKcFFOeQ==";
      //updated
      password = "OJZmCftMVdiv4HyeFU5/Zj+52P6FmtuEskYi64LTHKo=";
      apiUrl =
        "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/invoices/clearance/single";
    } else if (mode === "Simplified") {
      username =
        "TUlJRDNqQ0NBNFNnQXdJQkFnSVRFUUFBT0FQRjkwQWpzL3hjWHdBQkFBQTRBekFLQmdncWhrak9QUVFEQWpCaU1SVXdFd1lLQ1pJbWlaUHlMR1FCR1JZRmJHOWpZV3d4RXpBUkJnb0praWFKay9Jc1pBRVpGZ05uYjNZeEZ6QVZCZ29Ka2lhSmsvSXNaQUVaRmdkbGVIUm5ZWHAwTVJzd0dRWURWUVFERXhKUVVscEZTVTVXVDBsRFJWTkRRVFF0UTBFd0hoY05NalF3TVRFeE1Ea3hPVE13V2hjTk1qa3dNVEE1TURreE9UTXdXakIxTVFzd0NRWURWUVFHRXdKVFFURW1NQ1FHQTFVRUNoTWRUV0Y0YVcxMWJTQlRjR1ZsWkNCVVpXTm9JRk4xY0hCc2VTQk1WRVF4RmpBVUJnTlZCQXNURFZKcGVXRmthQ0JDY21GdVkyZ3hKakFrQmdOVkJBTVRIVlJUVkMwNE9EWTBNekV4TkRVdE16azVPVGs1T1RrNU9UQXdNREF6TUZZd0VBWUhLb1pJemowQ0FRWUZLNEVFQUFvRFFnQUVvV0NLYTBTYTlGSUVyVE92MHVBa0MxVklLWHhVOW5QcHgydmxmNHloTWVqeThjMDJYSmJsRHE3dFB5ZG84bXEwYWhPTW1Obzhnd25pN1h0MUtUOVVlS09DQWdjd2dnSURNSUd0QmdOVkhSRUVnYVV3Z2FLa2daOHdnWnd4T3pBNUJnTlZCQVFNTWpFdFZGTlVmREl0VkZOVWZETXRaV1F5TW1ZeFpEZ3RaVFpoTWkweE1URTRMVGxpTlRndFpEbGhPR1l4TVdVME5EVm1NUjh3SFFZS0NaSW1pWlB5TEdRQkFRd1BNems1T1RrNU9UazVPVEF3TURBek1RMHdDd1lEVlFRTURBUXhNVEF3TVJFd0R3WURWUVFhREFoU1VsSkVNamt5T1RFYU1CZ0dBMVVFRHd3UlUzVndjR3g1SUdGamRHbDJhWFJwWlhNd0hRWURWUjBPQkJZRUZFWCtZdm1tdG5Zb0RmOUJHYktvN29jVEtZSzFNQjhHQTFVZEl3UVlNQmFBRkp2S3FxTHRtcXdza0lGelZ2cFAyUHhUKzlObk1Ic0dDQ3NHQVFVRkJ3RUJCRzh3YlRCckJnZ3JCZ0VGQlFjd0FvWmZhSFIwY0RvdkwyRnBZVFF1ZW1GMFkyRXVaMjkyTG5OaEwwTmxjblJGYm5KdmJHd3ZVRkphUlVsdWRtOXBZMlZUUTBFMExtVjRkR2RoZW5RdVoyOTJMbXh2WTJGc1gxQlNXa1ZKVGxaUFNVTkZVME5CTkMxRFFTZ3hLUzVqY25Rd0RnWURWUjBQQVFIL0JBUURBZ2VBTUR3R0NTc0dBUVFCZ2pjVkJ3UXZNQzBHSlNzR0FRUUJnamNWQ0lHR3FCMkUwUHNTaHUyZEpJZk8reG5Ud0ZWbWgvcWxaWVhaaEQ0Q0FXUUNBUkl3SFFZRFZSMGxCQll3RkFZSUt3WUJCUVVIQXdNR0NDc0dBUVVGQndNQ01DY0dDU3NHQVFRQmdqY1ZDZ1FhTUJnd0NnWUlLd1lCQlFVSEF3TXdDZ1lJS3dZQkJRVUhBd0l3Q2dZSUtvWkl6ajBFQXdJRFNBQXdSUUloQUxFL2ljaG1uV1hDVUtVYmNhM3ljaThvcXdhTHZGZEhWalFydmVJOXVxQWJBaUE5aEM0TThqZ01CQURQU3ptZDJ1aVBKQTZnS1IzTEUwM1U3NWVxYkMvclhBPT0=";
      //updated
      password = "CkYsEXfV8c1gFHAtFWoZv73pGMvh/Qyo4LzKM2h/8Hg=";
      apiUrl =
        "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/invoices/reporting/single";
    } else {
      return res
        .status(400)
        .json({ error: "Invalid mode. Supported modes: standard, simplified" });
    }
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

      console.log("Validation Results:");
      console.log("Info Messages:", infoMessages);
      console.log("Warning Messages:", warningMessages);
      console.log("Error Messages:", errorMessages);
      console.log("Status:", status);

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
      // console.log("QRDATA:", qrData);
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
            user: req.user._id,
          });

          await invoiceForm.save();
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
