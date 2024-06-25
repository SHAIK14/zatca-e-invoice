// server.js

const express = require("express");
const bodyParser = require("body-parser");

const cors = require("cors");

const connectDB = require("./config/db");

const invoiceFormRoutes = require("./routes/invoiceFormRoutes.js");
const authRoutes = require("./routes/authRoutes");
const zatcaRoutes = require("./routes/zatcaRoutes");
const zatcaSimplifiedRoutes = require("./routes/zatcaSimplifiedRoutes");
require("dotenv").config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON request body
app.use(bodyParser.json());

// Enable CORS
app.use(cors());
// const username =
//   "TUlJRCtEQ0NBNStnQXdJQkFnSVRZd0FBRklNUlpYVEdUb3hBNkFBQkFBQVVnekFLQmdncWhrak9QUVFEQWpCaU1SVXdFd1lLQ1pJbWlaUHlMR1FCR1JZRmJHOWpZV3d4RXpBUkJnb0praWFKay9Jc1pBRVpGZ05uYjNZeEZ6QVZCZ29Ka2lhSmsvSXNaQUVaRmdkbGVIUm5ZWHAwTVJzd0dRWURWUVFERXhKUVJWcEZTVTVXVDBsRFJWTkRRVEV0UTBFd0hoY05NalF3TVRNeE1UQXdPVE01V2hjTk1qWXdNVE14TVRBeE9UTTVXakJkTVFzd0NRWURWUVFHRXdKVFFURVpNQmNHQTFVRUNoTVFVMjlzZFhScGIyNXpJR0o1SUZOVVF6RVRNQkVHQTFVRUN4TUtNekF3TURBd01UVTNNakVlTUJ3R0ExVUVBeE1WVUZKRldrRlVRMEV0UTI5a1pTMVRhV2R1YVc1bk1GWXdFQVlIS29aSXpqMENBUVlGSzRFRUFBb0RRZ0FFVmMxeGt5WXNJYWd5TEFQWTR0SjlFUzBDTEN0VVdiZ0JTR0g0eWZmRi9FZlhEUCswV0d6WURCekI0SGVINGNFRWY3ZE9JelRYRGZXOXZRL09aNTlXdzZPQ0Fqb3dnZ0kyTUlHTUJnTlZIUkVFZ1lRd2dZR2tmekI5TVNFd0h3WURWUVFFREJneExWTnZiSHd5TFRFeU0zd3pMVE13TURBd01ERTFOekl4SHpBZEJnb0praWFKay9Jc1pBRUJEQTh6TURBd01EQXhOVGN5TVRBd01ETXhEVEFMQmdOVkJBd01CREV3TURBeEZqQVVCZ05WQkJvTURVOXNZWGxoTENCU2FYbGhaR2d4RURBT0JnTlZCQThNQjFSbGJHVmpiMjB3SFFZRFZSME9CQllFRkpJalUwT3ZIK3JCVlF5UXFlMjlsM0ZVK2d1a01COEdBMVVkSXdRWU1CYUFGS3BZT0lPcGxpVk42bFI2dVpRSDQxZFErRHZvTUlIT0JnZ3JCZ0VGQlFjQkFRU0J3VENCdmpDQnV3WUlLd1lCQlFVSE1BS0dnYTVzWkdGd09pOHZMME5PUFZCRldrVkpUbFpQU1VORlUwTkJNUzFEUVN4RFRqMUJTVUVzUTA0OVVIVmliR2xqSlRJd1MyVjVKVEl3VTJWeWRtbGpaWE1zUTA0OVUyVnlkbWxqWlhNc1EwNDlRMjl1Wm1sbmRYSmhkR2x2Yml4RVF6MWxlSFI2WVhSallTeEVRejFuYjNZc1JFTTliRzlqWVd3L1kwRkRaWEowYVdacFkyRjBaVDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05sY25ScFptbGpZWFJwYjI1QmRYUm9iM0pwZEhrd0RnWURWUjBQQVFIL0JBUURBZ2VBTUR3R0NTc0dBUVFCZ2pjVkJ3UXZNQzBHSlNzR0FRUUJnamNWQ0lHR3FCMkUwUHNTaHUyZEpJZk8reG5Ud0ZWbWdaellMWVBseFYwQ0FXUUNBUkF3SFFZRFZSMGxCQll3RkFZSUt3WUJCUVVIQXdJR0NDc0dBUVVGQndNRE1DY0dDU3NHQVFRQmdqY1ZDZ1FhTUJnd0NnWUlLd1lCQlFVSEF3SXdDZ1lJS3dZQkJRVUhBd013Q2dZSUtvWkl6ajBFQXdJRFJ3QXdSQUlnWmFBOWFFL2dPWnFEbTg4RTIvZllPcEUzam5TSjZIODdvSmFiSE1TTXFxUUNJRklDcDNwNHNFWU9mdzVETkZPemhwYXVTS2xRL1ZNWnpEdGN3VGtKcFFOeQ==";
// const password = "OJZmCftMVdiv4HyeFU5/Zj+52P6FmtuEskYi64LTHKo=";
// const auth = Buffer.from(`${username}:${password}`).toString("base64");
// // console.log(auth);
// // Route to handle POST request from frontend
// app.post("/submit-form-data", async (req, res) => {
//   const { invoiceHash, uuid, invoice } = req.body;

//   // Log received data
//   console.log("Received data from frontend:");
//   //   console.log("Invoice Hash:", invoiceHash);
//   //   console.log("UUID:", uuid);
//   //   console.log("Invoice:", invoice);

//   try {
//     const payload = {
//       invoiceHash,
//       uuid,
//       invoice,
//     };
//     console.log(payload);

//     // Define headers
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

//     console.log("Response from API:", response.data);

//     const clearedInvoiceXml = Buffer.from(
//       response.data.clearedInvoice,
//       "base64"
//     ).toString("utf-8");
//     // console.log("clearedInvoiceXml:", clearedInvoiceXml);
//     // Parse the XML
//     xml2js.parseString(clearedInvoiceXml, (err, result) => {
//       if (err) {
//         console.error("Error parsing XML:", err);
//         return res
//           .status(500)
//           .json({ error: "An error occurred while parsing the XML" });
//       }

//       // Extract the QR ID
//       const qrData = result.Invoice["cac:AdditionalDocumentReference"].find(
//         (ref) => ref["cbc:ID"][0] === "QR"
//       )["cac:Attachment"][0]["cbc:EmbeddedDocumentBinaryObject"][0]._;
//       console.log("QRDATA:", qrData);
//       // Generate the QR code image
//       QRCode.toDataURL(qrData, (err, url) => {
//         if (err) {
//           console.error("Error generating QR code:", err);
//           return res
//             .status(500)
//             .json({ error: "An error occurred while generating the QR code" });
//         }

//         res.status(200).json({
//           message: "Data sent to API successfully",
//           responseData: response.data,
//           clearedInvoiceXml: clearedInvoiceXml,
//           qrCodeUrl: url,
//         });
//       });
//     });
//   } catch (error) {
//     console.error(
//       "Error:",
//       error.response ? error.response.data : error.message
//     );

//     console.error(
//       "Error:",
//       error.response ? error.response.data : error.message
//     );
//     // Send error response back to frontend
//     res.status(error.response ? error.response.status : 500).json({
//       error: error.response
//         ? error.response.data
//         : "An error occurred while sending data to API",
//     });
//   }
// });
app.use("/", zatcaRoutes);
app.use("/", zatcaSimplifiedRoutes);
app.use("/invoice-form", invoiceFormRoutes);
app.use("/auth", authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
