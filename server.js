const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const qr = require("qr-image");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");
require("dotenv").config();  // Load environment variables

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://talha300:talha300@employeeinfo.jqmbcew.mongodb.net/employeeinfo?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Employee Schema
const employeeSchema = new mongoose.Schema({
  empNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  laptopName: String,
  laptopMemory: String,
  laptopProcessor: String,
  laptopPassword: String,  // New field
  domainPassword: String,  // New field
  description: String,
});

const Employee = mongoose.model("Employee", employeeSchema);

// Google Sheets API setup
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// Load credentials from environment variables
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  },
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

// Your Google Sheet ID
const SPREADSHEET_ID = "18HGUK-1OVanQtKeXiDq8XimFZKjqB4zh-k4b_dpsVxg"; // Replace with your Google Sheet ID
const SHEET_NAME = "Sheet3"; // Replace with your specific sheet name if it's not "Sheet1"

// Route to add employee, generate QR code, and store data in Google Sheets
app.post("/addEmployee", async (req, res) => {
  try {
    const { empNo, name, laptopName, laptopMemory, laptopProcessor, laptopPassword, domainPassword, description } = req.body;

    if (!empNo || !name) {
      return res.status(400).json({ message: "Employee Number and Name are required" });
    }

    const existingEmployee = await Employee.findOne({ empNo });
    if (existingEmployee) {
      return res.status(409).json({ message: "Employee already exists" });
    }

    const employee = new Employee({
      empNo,
      name,
      laptopName,
      laptopMemory,
      laptopProcessor,
      laptopPassword,   // New field
      domainPassword,   // New field
      description,
    });
    
    await employee.save();


    // Format the data as plain text
    const qrTextData = `
      Employee Number: ${empNo}
      Name: ${name}
      Laptop Name: ${laptopName}
      Laptop Memory: ${laptopMemory}
      Laptop Processor: ${laptopProcessor}
      Description: ${description}
    `;

    // Generate QR code with plain text
    const qrCodeImage = qr.imageSync(qrTextData, { type: "png" });
    const qrCodeBase64 = `data:image/png;base64,${qrCodeImage.toString("base64")}`;

    // Store data in Google Sheets
    const values = [[empNo, name, laptopName, laptopMemory, laptopProcessor, laptopPassword, domainPassword, description]];

    const resource = {
      values,
    };

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`, // Adjust the range to include all columns you are updating
      valueInputOption: "RAW",
      resource,
    });

    res.json({ qrCodeUrl: qrCodeBase64, employee });
  } catch (err) {
    console.error("Error handling request:", err);
    res.status(500).json({ message: err.message });
  }
});

// Serve the index.html file when accessing the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
