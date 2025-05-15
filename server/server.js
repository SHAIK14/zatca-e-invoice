const express = require("express");
const bodyParser = require("body-parser");

const cors = require("cors");

const connectDB = require("./config/db");

const invoiceFormRoutes = require("./routes/invoiceFormRoutes.js");
const authRoutes = require("./routes/authRoutes");
const zatcaRoutes = require("./routes/zatcaRoutes");
const zatcaSimplifiedRoutes = require("./routes/zatcaSimplifiedRoutes");
const addressRoutes = require("./routes/addressRoutes");
const autoSubmissionRoutes = require("./routes/autoSubmissionRoutes");

const invoiceIdRoutes = require("./routes/invoiceIdRoutes");

require("dotenv").config();

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());

app.use(cors());

app.use("/", zatcaRoutes);
app.use("/", zatcaSimplifiedRoutes);
app.use("/invoice-form", invoiceFormRoutes);
app.use("/auth", authRoutes);
app.use("/", addressRoutes);
app.use("/auto-submit", autoSubmissionRoutes);
app.use("/id", invoiceIdRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
