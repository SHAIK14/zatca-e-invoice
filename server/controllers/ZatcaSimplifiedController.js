const InvoiceForm = require("../models/InvoiceForm");

const { generateXMLFile } = require("../utils/zatcaSimplifiedUtils.js");
const { processInvoiceData } = require("../utils/apiDataUtils");
const { generateQRCodeData } = require("../utils/qrCodeUtils");
const crypto = require("crypto");
const xmlFormatter = require("xml-formatter");
const axios = require("axios");
let { ublTemplate } = require("../utils/ublTemplate.js");
const { qrTemplate } = require("../utils/qrTemplate.js");
const QRCode = require("qrcode");
const { generatePDF } = require("../utils/pdfGenerator");
const { convertToPDFA3 } = require("../utils/pdfA3Converter");

const privateKeyPEM = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIBCne7+Bvv/deGEav/IIfjv4oQ3/MPBkBPc8WARzvBAGoAcGBSuBBAAK
oUQDQgAEtuWOfvi6Nq8mxtd0Pu4XFMDoE3aCNZGnzFni3ALSdLe9fbtbrxI9f4vY
qKfdaeOYzrM56+Iz3QC6vQAnxjrm5A==
-----END EC PRIVATE KEY-----`;

const certificatePEM = `-----BEGIN CERTIFICATE-----
MIID3jCCA4SgAwIBAgITEQAAOAPF90Ajs/xcXwABAAA4AzAKBggqhkjOPQQDAjBi
MRUwEwYKCZImiZPyLGQBGRYFbG9jYWwxEzARBgoJkiaJk/IsZAEZFgNnb3YxFzAV
BgoJkiaJk/IsZAEZFgdleHRnYXp0MRswGQYDVQQDExJQUlpFSU5WT0lDRVNDQTQt
Q0EwHhcNMjQwMTExMDkxOTMwWhcNMjkwMTA5MDkxOTMwWjB1MQswCQYDVQQGEwJT
QTEmMCQGA1UEChMdTWF4aW11bSBTcGVlZCBUZWNoIFN1cHBseSBMVEQxFjAUBgNV
BAsTDVJpeWFkaCBCcmFuY2gxJjAkBgNVBAMTHVRTVC04ODY0MzExNDUtMzk5OTk5
OTk5OTAwMDAzMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEoWCKa0Sa9FIErTOv0uAk
C1VIKXxU9nPpx2vlf4yhMejy8c02XJblDq7tPydo8mq0ahOMmNo8gwni7Xt1KT9U
eKOCAgcwggIDMIGtBgNVHREEgaUwgaKkgZ8wgZwxOzA5BgNVBAQMMjEtVFNUfDIt
VFNUfDMtZWQyMmYxZDgtZTZhMi0xMTE4LTliNTgtZDlhOGYxMWU0NDVmMR8wHQYK
CZImiZPyLGQBAQwPMzk5OTk5OTk5OTAwMDAzMQ0wCwYDVQQMDAQxMTAwMREwDwYD
VQQaDAhSUlJEMjkyOTEaMBgGA1UEDwwRU3VwcGx5IGFjdGl2aXRpZXMwHQYDVR0O
BBYEFEX+YvmmtnYoDf9BGbKo7ocTKYK1MB8GA1UdIwQYMBaAFJvKqqLtmqwskIFz
VvpP2PxT+9NnMHsGCCsGAQUFBwEBBG8wbTBrBggrBgEFBQcwAoZfaHR0cDovL2Fp
YTQuemF0Y2EuZ292LnNhL0NlcnRFbnJvbGwvUFJaRUludm9pY2VTQ0E0LmV4dGdh
enQuZ292LmxvY2FsX1BSWkVJTlZPSUNFU0NBNC1DQSgxKS5jcnQwDgYDVR0PAQH/
BAQDAgeAMDwGCSsGAQQBgjcVBwQvMC0GJSsGAQQBgjcVCIGGqB2E0PsShu2dJIfO
+xnTwFVmh/qlZYXZhD4CAWQCARIwHQYDVR0lBBYwFAYIKwYBBQUHAwMGCCsGAQUF
BwMCMCcGCSsGAQQBgjcVCgQaMBgwCgYIKwYBBQUHAwMwCgYIKwYBBQUHAwIwCgYI
KoZIzj0EAwIDSAAwRQIhALE/ichmnWXCUKUbca3yci8oqwaLvFdHVjQrveI9uqAb
AiA9hC4M8jgMBADPSzmd2uiPJA6gKR3LE03U75eqbC/rXA==
-----END CERTIFICATE-----`;
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

    // console.log("invoiceData in the controller:", invoiceData);
    const { UUID } = invoiceData;
    console.log("UUID in the controller file:", UUID);

    const hashTemplateXML = await generateXMLFile(invoiceData);
    // console.log(" before the test xmldata:", xmlData);

    const formattedXml = xmlFormatter(hashTemplateXML, {
      indentation: "  ",
      collapseContent: true,
      lineSeparator: "\n",
    });

    // console.log("formattedXml", formattedXml);

    const removeXMLHeader = (xmlData) => {
      const startIndex = xmlData.indexOf("<Invoice");
      return xmlData.substring(startIndex);
    };

    const cleanedXML = removeXMLHeader(formattedXml);

    // console.log("Cleaned XML:", cleanedXML);

    //-----------------step-1---------------//
    const hashHex = crypto
      .createHash("sha256")
      .update(cleanedXML, "utf8")
      .digest("hex");
    console.log("hashhex:", hashHex);

    const hashBuffer = Buffer.from(hashHex, "hex");

    const hashBase64 = hashBuffer.toString("base64");

    console.log("base64", hashBase64);
    //-------------------step-2-------------------//
    const sign = crypto.createSign("SHA256");
    sign.update(Buffer.from(hashHex, "hex"));
    sign.end();

    const privateKey = crypto.createPrivateKey(privateKeyPEM);
    const signature = sign.sign(privateKey, "base64");
    console.log("Digital Signature:", signature);

    //-----------step-3------------------//
    const cleanCertificate = (cert) => {
      // Remove the PEM header and footer
      const cleanedCert = cert
        .replace(/-----BEGIN CERTIFICATE-----/g, "")
        .replace(/-----END CERTIFICATE-----/g, "")
        .replace(/\s+/g, "");
      return cleanedCert;
    };
    const hashCertificate = (cert) => {
      const hash = crypto.createHash("sha256");
      hash.update(cert);
      return hash.digest("hex");
    };

    const cleanedCertificate = cleanCertificate(certificatePEM);

    const hashedCertificatehex = hashCertificate(cleanedCertificate);

    console.log("Hashed Certificate (hex):", hashedCertificatehex);
    const hashBase64cert = btoa(hashedCertificatehex);

    console.log("base64", hashBase64cert);

    //-------------------------step-4--------------------------//

    const getCurrentTimestamp = () => {
      const now = new Date();

      const date = now.toISOString().split("T")[0];

      const time = now.toTimeString().split(" ")[0];

      return `${date}T${time}`;
    };

    const timestamp = getCurrentTimestamp();
    console.log("timestamp in the controller:", timestamp);

    //-------------------------------step-5------------------------//

    const template = `<xades:SignedProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Id="xadesSignedProperties">
                                    <xades:SignedSignatureProperties>
                                        <xades:SigningTime>${timestamp}</xades:SigningTime>
                                        <xades:SigningCertificate>
                                            <xades:Cert>
                                                <xades:CertDigest>
                                                    <ds:DigestMethod xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                                                    <ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${hashBase64cert}</ds:DigestValue>
                                                </xades:CertDigest>
                                                <xades:IssuerSerial>
                                                    <ds:X509IssuerName xmlns:ds="http://www.w3.org/2000/09/xmldsig#">CN=PRZEINVOICESCA4-CA, DC=extgazt, DC=gov, DC=local</ds:X509IssuerName>
                                                    <ds:X509SerialNumber xmlns:ds="http://www.w3.org/2000/09/xmldsig#">379112742831380471835263969587287663520528387</ds:X509SerialNumber>
                                                </xades:IssuerSerial>
                                            </xades:Cert>
                                        </xades:SigningCertificate>
                                    </xades:SignedSignatureProperties>
                                </xades:SignedProperties>`;

    // Usage
    // console.log("template after assigning values:", template);
    const signedporperitieshex = hashCertificate(template);
    console.log("signedporperitieshex:", signedporperitieshex);
    const SignedPropertiesHash = btoa(signedporperitieshex);
    console.log("SignedPropertiesHash:", SignedPropertiesHash);

    //-------------------------step-6------------replace----//
    let modifiedTemplate = ublTemplate;
    modifiedTemplate = modifiedTemplate.replace(
      "SET_CERTIFICATE_HASH",
      hashBase64cert
    );
    modifiedTemplate = modifiedTemplate.replace("SET_TIME", timestamp);
    modifiedTemplate = modifiedTemplate.replace("SET_INVOICE_HASH", hashBase64);
    modifiedTemplate = modifiedTemplate.replace(
      "SET_SIGNED_PROPERTIES_HASH",
      SignedPropertiesHash
    );
    modifiedTemplate = modifiedTemplate.replace(
      "SET_SIGNATURE_VALUE",
      signature
    );

    // console.log("updated template ubl:", modifiedTemplate);

    //------------------QRCODE--------------------//

    const qrCodeData = generateQRCodeData(
      invoiceData,
      hashBase64,
      signature,
      certificatePEM
    );
    console.log("qrCodeData in controller :", qrCodeData);
    const modifiedQrtemplate = qrTemplate.replace("SET_QR", qrCodeData);
    // console.log("modifiedQrtemplate:", modifiedQrtemplate);

    //--------------final-----------------//

    const invoiceTagIndex = formattedXml.indexOf("<Invoice");
    const closingBracketIndex = formattedXml.indexOf(">", invoiceTagIndex);
    const insertIndex = closingBracketIndex + 1;

    const supplierPartyIndex = formattedXml.indexOf(
      "<cac:AccountingSupplierParty>"
    );

    const simplifiedXML =
      formattedXml.slice(0, insertIndex) +
      modifiedTemplate +
      formattedXml.slice(insertIndex, supplierPartyIndex) +
      modifiedQrtemplate +
      formattedXml.slice(supplierPartyIndex);

    console.log("Simplified XML:", simplifiedXML);
    //----------singed xml base64------------//
    const xmlbase64 = async function utf8_to_b64(str) {
      return Buffer.from(str, "utf8").toString("base64");
    };
    const signedxmlbase64 = await xmlbase64(simplifiedXML);

    console.log("signedxmlbase64:", signedxmlbase64);

    //-----------------API--------------------------//
    const payload = {
      invoiceHash: hashBase64,
      uuid: UUID,
      invoice: signedxmlbase64,
    };
    console.log("playload", payload);
    const username =
      "TUlJRDNqQ0NBNFNnQXdJQkFnSVRFUUFBT0FQRjkwQWpzL3hjWHdBQkFBQTRBekFLQmdncWhrak9QUVFEQWpCaU1SVXdFd1lLQ1pJbWlaUHlMR1FCR1JZRmJHOWpZV3d4RXpBUkJnb0praWFKay9Jc1pBRVpGZ05uYjNZeEZ6QVZCZ29Ka2lhSmsvSXNaQUVaRmdkbGVIUm5ZWHAwTVJzd0dRWURWUVFERXhKUVVscEZTVTVXVDBsRFJWTkRRVFF0UTBFd0hoY05NalF3TVRFeE1Ea3hPVE13V2hjTk1qa3dNVEE1TURreE9UTXdXakIxTVFzd0NRWURWUVFHRXdKVFFURW1NQ1FHQTFVRUNoTWRUV0Y0YVcxMWJTQlRjR1ZsWkNCVVpXTm9JRk4xY0hCc2VTQk1WRVF4RmpBVUJnTlZCQXNURFZKcGVXRmthQ0JDY21GdVkyZ3hKakFrQmdOVkJBTVRIVlJUVkMwNE9EWTBNekV4TkRVdE16azVPVGs1T1RrNU9UQXdNREF6TUZZd0VBWUhLb1pJemowQ0FRWUZLNEVFQUFvRFFnQUVvV0NLYTBTYTlGSUVyVE92MHVBa0MxVklLWHhVOW5QcHgydmxmNHloTWVqeThjMDJYSmJsRHE3dFB5ZG84bXEwYWhPTW1Obzhnd25pN1h0MUtUOVVlS09DQWdjd2dnSURNSUd0QmdOVkhSRUVnYVV3Z2FLa2daOHdnWnd4T3pBNUJnTlZCQVFNTWpFdFZGTlVmREl0VkZOVWZETXRaV1F5TW1ZeFpEZ3RaVFpoTWkweE1URTRMVGxpTlRndFpEbGhPR1l4TVdVME5EVm1NUjh3SFFZS0NaSW1pWlB5TEdRQkFRd1BNems1T1RrNU9UazVPVEF3TURBek1RMHdDd1lEVlFRTURBUXhNVEF3TVJFd0R3WURWUVFhREFoU1VsSkVNamt5T1RFYU1CZ0dBMVVFRHd3UlUzVndjR3g1SUdGamRHbDJhWFJwWlhNd0hRWURWUjBPQkJZRUZFWCtZdm1tdG5Zb0RmOUJHYktvN29jVEtZSzFNQjhHQTFVZEl3UVlNQmFBRkp2S3FxTHRtcXdza0lGelZ2cFAyUHhUKzlObk1Ic0dDQ3NHQVFVRkJ3RUJCRzh3YlRCckJnZ3JCZ0VGQlFjd0FvWmZhSFIwY0RvdkwyRnBZVFF1ZW1GMFkyRXVaMjkyTG5OaEwwTmxjblJGYm5KdmJHd3ZVRkphUlVsdWRtOXBZMlZUUTBFMExtVjRkR2RoZW5RdVoyOTJMbXh2WTJGc1gxQlNXa1ZKVGxaUFNVTkZVME5CTkMxRFFTZ3hLUzVqY25Rd0RnWURWUjBQQVFIL0JBUURBZ2VBTUR3R0NTc0dBUVFCZ2pjVkJ3UXZNQzBHSlNzR0FRUUJnamNWQ0lHR3FCMkUwUHNTaHUyZEpJZk8reG5Ud0ZWbWgvcWxaWVhaaEQ0Q0FXUUNBUkl3SFFZRFZSMGxCQll3RkFZSUt3WUJCUVVIQXdNR0NDc0dBUVVGQndNQ01DY0dDU3NHQVFRQmdqY1ZDZ1FhTUJnd0NnWUlLd1lCQlFVSEF3TXdDZ1lJS3dZQkJRVUhBd0l3Q2dZSUtvWkl6ajBFQXdJRFNBQXdSUUloQUxFL2ljaG1uV1hDVUtVYmNhM3ljaThvcXdhTHZGZEhWalFydmVJOXVxQWJBaUE5aEM0TThqZ01CQURQU3ptZDJ1aVBKQTZnS1IzTEUwM1U3NWVxYkMvclhBPT0=";
    const password = "CkYsEXfV8c1gFHAtFWoZv73pGMvh/Qyo4LzKM2h/8Hg=";
    const apiUrl =
      "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/invoices/reporting/single";
    const auth = Buffer.from(`${username}:${password}`).toString("base64");
    const headers = {
      accept: "application/json",
      "accept-language": "en",
      Authorization: `Basic ${auth}`,
      "Accept-Version": "V2",
      "Content-Type": "application/json",
    };
    try {
      const response = await axios.post(apiUrl, payload, { headers });
      console.log("API Response:", JSON.stringify(response.data, null, 2));

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
            reportingStatus: response.data.reportingStatus,
          });
        }
      }

      if (response.data.validationResults.status === "PASS") {
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);
        const pdfBuffer = await generatePDF(invoiceData, qrCodeDataUrl);

        const options = {
          author: "Zatca",
          title: `Invoice ${invoiceData.ID}`,
        };
        const pdfA3Buffer = await convertToPDFA3(
          pdfBuffer,
          simplifiedXML,
          options
        );
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
            base64XML: signedxmlbase64,
            hashKey: hashBase64,
            responseData: response.data,
            clearanceStatus: response.data.reportingStatus,
            clearanceInvoice: simplifiedXML,
            decodedClearanceInvoice: "", // Left blank as per your instruction
            qrCode: qrCodeDataUrl,
            user: req.user._id,
          });

          await invoiceForm.save();
          console.log("Invoice saved to database");
        } catch (dbError) {
          console.error("Error saving to database:", dbError);
          // Continue with the response even if database save fails
        }

        return res.status(200).json({
          invoicedata: invoiceData,
          message: "Invoice submitted successfully",
          validationResults: response.data.validationResults,
          reportingStatus: response.data.reportingStatus,
          qrCodeUrl: qrCodeDataUrl,
          clearanceStatus: response.data.reportingStatus,
          pdf: pdfA3Buffer.toString("base64"),
        });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Error calling ZATCA API:");
        console.error("Status Code:", error.response.status);
        console.error("Validation Results:");

        const { validationResults, reportingStatus } = error.response.data;

        if (validationResults) {
          console.error(
            "Info Messages:",
            JSON.stringify(validationResults.infoMessages, null, 2)
          );
          console.error(
            "Warning Messages:",
            JSON.stringify(validationResults.warningMessages, null, 2)
          );
          console.error(
            "Error Messages:",
            JSON.stringify(validationResults.errorMessages, null, 2)
          );
          console.error("Status:", validationResults.status);
        }

        console.error("Reporting Status:", reportingStatus);

        return res.status(error.response.status).json({
          error: "ZATCA API Validation Error",
          validationResults: validationResults,
          reportingStatus: reportingStatus,
        });
      } else {
        console.error("Error calling ZATCA API:", error.message);
        return res.status(500).json({
          error: "Error calling ZATCA API",
          message: error.message,
        });
      }
    }
  } catch (error) {
    console.error("Error in submitFormData:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
