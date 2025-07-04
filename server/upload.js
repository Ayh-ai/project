// upload.js
import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import xlsx from "xlsx";

//todo  Industry-specific column patterns for better matching
const industryPatterns = {
  retail: {
    patterns: [
      {
        names: ["order_id", "orderid", "order id", "id", "order_number"],
        target: "order_id",
        category: "identifier",
      },
      {
        names: ["order_date", "orderdate", "date", "purchase_date", "buy_date"],
        target: "order_Date",
        category: "temporal",
      },
      {
        names: ["product_name", "productname", "product", "item", "item_name"],
        target: "ProductName",
        category: "product",
      },
      {
        names: ["category", "product_category", "type", "product_type"],
        target: "Category",
        category: "classification",
      },
      {
        names: ["quantity", "qty", "amount", "count"],
        target: "Quantity",
        category: "numeric",
      },
      {
        names: ["unit_price", "unitprice", "price", "cost", "price_per_unit"],
        target: "UnitPrice",
        category: "financial",
      },
      {
        names: ["total_sales", "totalsales", "total", "total_amount"],
        target: "TotalSales",
        category: "financial",
      },
      {
        names: ["customer_name", "customername", "client_name", "name"],
        target: "customer_name",
        category: "customer",
      },
      {
        names: ["customer_email", "customeremail", "email", "client_email"],
        target: "customer_email",
        category: "customer",
      },
      {
        names: ["gender", "sex", "customer_gender"],
        target: "Gender",
        category: "demographic",
      },
      {
        names: ["service_rating", "servicerating", "rating", "satisfaction"],
        target: "ServiceRating",
        category: "feedback",
      },
    ],
  },
  restaurants: {
    patterns: [
      {
        names: ["order_id", "orderid", "order id", "id"],
        target: "Order ID",
        category: "identifier",
      },
      {
        names: ["order_date", "orderdate", "date"],
        target: "Order Date",
        category: "temporal",
      },
      {
        names: ["food_name", "foodname", "dish", "item", "meal"],
        target: "Food Name",
        category: "product",
      },
      {
        names: ["food_type", "foodtype", "category", "cuisine"],
        target: "Food Type",
        category: "classification",
      },
      {
        names: ["price", "cost", "amount"],
        target: "Price",
        category: "financial",
      },
      {
        names: ["quantity", "qty", "count"],
        target: "Quantity",
        category: "numeric",
      },
      {
        names: ["size", "portion", "serving"],
        target: "Size",
        category: "specification",
      },
      {
        names: ["total_amount", "totalamount", "total", "bill"],
        target: "Total Amount",
        category: "financial",
      },
    ],
  },
  hotels: {
    patterns: [
      {
        names: ["checkout_date", "checkoutdate", "checkout", "departure"],
        target: "CheckOutDate",
        category: "temporal",
      },
      {
        names: ["room_type", "roomtype", "room", "accommodation"],
        target: "RoomType",
        category: "specification",
      },
      {
        names: ["nights_stayed", "nightsstayed", "nights", "duration"],
        target: "NightsStayed",
        category: "numeric",
      },
      {
        names: ["booking_source", "bookingsource", "source", "platform"],
        target: "BookingSource",
        category: "classification",
      },
      {
        names: ["price_per_night", "pricepernight", "nightly_rate", "rate"],
        target: "PricePerNight",
        category: "financial",
      },
      {
        names: ["total_price", "totalprice", "total", "bill"],
        target: "TotalPrice",
        category: "financial",
      },
      {
        names: ["status", "booking_status", "reservation_status"],
        target: "Status",
        category: "classification",
      },
      {
        names: ["customer_rating", "customerrating", "rating", "review"],
        target: "CustomerRating",
        category: "feedback",
      },
      {
        names: ["guest_count", "guestcount", "guests", "occupancy"],
        target: "GuestCount",
        category: "numeric",
      },
      {
        names: ["payment_method", "paymentmethod", "payment"],
        target: "PaymentMethod",
        category: "classification",
      },
      {
        names: ["cancellation_reason", "cancellationreason", "cancel_reason"],
        target: "CancellationReason",
        category: "classification",
      },
      {
        names: ["total_rooms", "totalrooms", "rooms"],
        target: "TotalRooms",
        category: "numeric",
      },
    ],
  },
  manufacturing: {
    patterns: [
      {
        names: [
          "production_date",
          "productiondate",
          "date",
          "manufacture_date",
        ],
        target: "Production Date",
        category: "temporal",
      },
      {
        names: ["production_line", "productionline", "line", "line_number"],
        target: "Production Line Number",
        category: "identifier",
      },
      {
        names: ["product_name", "productname", "product", "item"],
        target: "Product Name",
        category: "product",
      },
      {
        names: [
          "production_quantity",
          "productionquantity",
          "quantity",
          "units",
        ],
        target: "Production Quantity",
        category: "numeric",
      },
      {
        names: ["defective_units", "defectiveunits", "defects", "bad_units"],
        target: "Defective Units",
        category: "quality",
      },
      {
        names: ["operating_time", "operatingtime", "runtime", "hours"],
        target: "Operating Time (Hours)",
        category: "temporal",
      },
      {
        names: ["stops", "number_of_stops", "breakdowns"],
        target: "Number of Stops",
        category: "numeric",
      },
      {
        names: ["downtime", "total_downtime", "downtime_minutes"],
        target: "Total Downtime (Minutes)",
        category: "temporal",
      },
      {
        names: ["cost_per_unit", "costperunit", "unit_cost"],
        target: "Production Cost per Unit",
        category: "financial",
      },
      {
        names: ["raw_materials", "rawmaterials", "materials"],
        target: "Raw Materials Used (kg)",
        category: "materials",
      },
      {
        names: ["operator_name", "operatorname", "operator", "worker"],
        target: "Operator Name",
        category: "personnel",
      },
      {
        names: ["notes", "comments", "remarks"],
        target: "Notes",
        category: "additional",
      },
    ],
  },
  logistics: {
    patterns: [
      {
        names: ["shipment_id", "shipmentid", "tracking", "tracking_id"],
        target: "Shipment ID",
        category: "identifier",
      },
      {
        names: ["order_date", "orderdate", "ship_date"],
        target: "Order Date",
        category: "temporal",
      },
      {
        names: ["delivery_date", "deliverydate", "delivered"],
        target: "Delivery Date",
        category: "temporal",
      },
      {
        names: ["expected_delivery", "expecteddelivery", "eta"],
        target: "Expected Delivery Date",
        category: "temporal",
      },
      {
        names: ["shipment_status", "shipmentstatus", "status"],
        target: "Shipment Status",
        category: "classification",
      },
      {
        names: ["vehicle_id", "vehicleid", "truck", "vehicle"],
        target: "Vehicle ID",
        category: "identifier",
      },
      {
        names: ["driver_id", "driverid", "driver"],
        target: "Driver ID",
        category: "identifier",
      },
      {
        names: ["vehicle_type", "vehicletype", "truck_type"],
        target: "Vehicle Type",
        category: "classification",
      },
      {
        names: ["fuel_consumption", "fuelconsumption", "fuel"],
        target: "Fuel Consumption (L)",
        category: "resource",
      },
      {
        names: ["distance", "total_distance", "km"],
        target: "Total Distance (km)",
        category: "numeric",
      },
      {
        names: ["breakdown_count", "breakdowncount", "breakdowns"],
        target: "Breakdown Count",
        category: "numeric",
      },
      {
        names: ["shipping_cost", "shippingcost", "transport_cost"],
        target: "Shipping Cost",
        category: "financial",
      },
      {
        names: ["fuel_cost", "fuelcost"],
        target: "Fuel Cost",
        category: "financial",
      },
      {
        names: ["operating_cost", "operatingcost", "total_cost"],
        target: "Total Operating Cost",
        category: "financial",
      },
      {
        names: ["revenue", "revenue_per_shipment"],
        target: "Revenue per Shipment",
        category: "financial",
      },
      {
        names: ["customer_id", "customerid", "client_id"],
        target: "Customer ID",
        category: "identifier",
      },
      {
        names: ["customer_location", "customerlocation", "destination"],
        target: "Customer Location",
        category: "location",
      },
      {
        names: ["delivery_time", "deliverytime", "time_taken"],
        target: "Delivery Time (Minutes)",
        category: "temporal",
      },
      {
        names: ["customer_rating", "customerrating", "rating"],
        target: "Customer Rating",
        category: "feedback",
      },
      {
        names: ["delay_reason", "delayreason", "delay"],
        target: "Delay Reason",
        category: "classification",
      },
      {
        names: ["delay_duration", "delayduration", "delay_minutes"],
        target: "Delay Duration (Minutes)",
        category: "temporal",
      },
      {
        names: ["stops", "number_of_stops"],
        target: "Number of Stops",
        category: "numeric",
      },
    ],
  },
  hr: {
    patterns: [
      {
        names: ["employee_id", "employeeid", "emp_id", "id"],
        target: "Employee ID",
        category: "identifier",
      },
      {
        names: ["name", "employee_name", "full_name"],
        target: "Name",
        category: "personal",
      },
      {
        names: ["department", "dept", "division"],
        target: "Department",
        category: "organizational",
      },
      {
        names: ["job_title", "jobtitle", "position", "role"],
        target: "Job Title",
        category: "organizational",
      },
      {
        names: ["hire_date", "hiredate", "start_date", "joining_date"],
        target: "Hire Date",
        category: "temporal",
      },
      {
        names: ["contract_type", "contracttype", "employment_type"],
        target: "Contract Type",
        category: "classification",
      },
      {
        names: ["monthly_salary", "monthlysalary", "salary", "wage"],
        target: "Monthly Salary",
        category: "financial",
      },
      {
        names: ["performance_rating", "performancerating", "rating"],
        target: "Performance Rating",
        category: "evaluation",
      },
      {
        names: ["absences", "absence_days", "sick_days"],
        target: "Absences (Days)",
        category: "attendance",
      },
      {
        names: ["training_hours", "traininghours", "training"],
        target: "Training Hours",
        category: "development",
      },
    ],
  },
  finance: {
    patterns: [
      {
        names: ["transaction_id", "transactionid", "txn_id", "id"],
        target: "Transaction ID",
        category: "identifier",
      },
      {
        names: ["date", "transaction_date", "txn_date"],
        target: "Date",
        category: "temporal",
      },
      {
        names: ["category", "type", "transaction_type"],
        target: "Category",
        category: "classification",
      },
      {
        names: ["amount", "value", "sum"],
        target: "Amount",
        category: "financial",
      },
      {
        names: ["payment_method", "paymentmethod", "method"],
        target: "Payment Method",
        category: "classification",
      },
      {
        names: ["account_balance", "accountbalance", "balance"],
        target: "Account Balance",
        category: "financial",
      },
      {
        names: ["revenue", "income", "earnings"],
        target: "Revenue",
        category: "financial",
      },
      {
        names: ["expenses", "costs", "expenditure"],
        target: "Expenses",
        category: "financial",
      },
      {
        names: ["profit", "net_profit", "gain"],
        target: "Profit",
        category: "financial",
      },
      {
        names: ["tax_rate", "taxrate", "tax_percentage"],
        target: "Tax Rate (%)",
        category: "financial",
      },
      {
        names: ["tax_amount", "taxamount", "tax"],
        target: "Tax Amount",
        category: "financial",
      },
      {
        names: ["net_profit", "netprofit", "final_profit"],
        target: "Net Profit",
        category: "financial",
      },
      {
        names: ["department", "dept", "division"],
        target: "Department",
        category: "organizational",
      },
      {
        names: ["approval_status", "approvalstatus", "status"],
        target: "Approval Status",
        category: "classification",
      },
    ],
  },
  operations: {
    patterns: [
      {
        names: ["project_name", "projectname", "project"],
        target: "Project Name",
        category: "project",
      },
      {
        names: ["task_name", "taskname", "task"],
        target: "Task Name",
        category: "task",
      },
      {
        names: ["assigned_employee", "assignedemployee", "assignee"],
        target: "Assigned Employee",
        category: "personnel",
      },
      {
        names: ["task_start_date", "taskstartdate", "start_date"],
        target: "Task Start Date",
        category: "temporal",
      },
      {
        names: ["task_due_date", "taskduedate", "due_date"],
        target: "Task Due Date",
        category: "temporal",
      },
      {
        names: ["task_status", "taskstatus", "status"],
        target: "Task Status",
        category: "classification",
      },
      {
        names: ["task_progress", "taskprogress", "progress"],
        target: "Task Progress (%)",
        category: "progress",
      },
      {
        names: ["task_priority", "taskpriority", "priority"],
        target: "Task Priority",
        category: "classification",
      },
      {
        names: ["hours_allocated", "hoursallocated", "planned_hours"],
        target: "Work Hours Allocated",
        category: "resource",
      },
      {
        names: ["hours_spent", "hoursspent", "actual_hours"],
        target: "Work Hours Spent",
        category: "resource",
      },
      {
        names: ["quality_score", "qualityscore", "quality"],
        target: "Task Quality Score",
        category: "evaluation",
      },
      {
        names: [
          "completion_satisfaction",
          "completionsatisfaction",
          "satisfaction",
        ],
        target: "Task Completion Satisfaction",
        category: "evaluation",
      },
    ],
  },
};

dotenv.config();

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads/' directory exists
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename by prepending a timestamp
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// File filter to allow only specified spreadsheet types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".csv", ".xls", ".xlsx"];
  const ext = path.extname(file.originalname).toLowerCase(); // Convert to lowercase for consistent checking
  if (allowedTypes.includes(ext)) {
    cb(null, true); // Accept the file
  } else {
    // Reject the file with an error message
    cb(
      new Error("Invalid file type. Only .csv, .xls, .xlsx are allowed!"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Helper function to remove columns from data
const removeColumnsFromData = (data, columnsToDelete) => {
  if (!Array.isArray(data) || data.length === 0) return data;

  return data.map((row) => {
    const newRow = { ...row };
    columnsToDelete.forEach((column) => {
      delete newRow[column];
    });
    return newRow;
  });
};

// Helper function to apply column mapping
const applyColumnMapping = (data, columnMapping) => {
  if (!Array.isArray(data) || data.length === 0) return data;

  return data.map((row) => {
    const newRow = {};
    Object.keys(row).forEach((oldKey) => {
      const newKey = columnMapping[oldKey] || oldKey;
      newRow[newKey] = row[oldKey];
    });
    return newRow;
  });
};

// POST /api/upload route to handle file uploads and analysis
router.post("/upload", upload.single("file"), async (req, res) => {
  let filePath; // Declare filePath here to ensure it's accessible in the finally block for cleanup

  try {
    if (!req.file) {
      // No file was uploaded
      return res.status(400).json({ message: "No file uploaded!" });
    }

    filePath = path.join("uploads", req.file.filename);
    console.log("File uploaded to:", filePath);

    // Read the uploaded file using xlsx
    const workbook = xlsx.readFile(filePath);
    // Assuming we're interested in the first sheet for analysis
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet data to a CSV string. This is generally a good
    // format for sending tabular data to LLMs as it preserves structure.
    const csvData = xlsx.utils.sheet_to_csv(sheet);

    // Construct the prompt for the Gemini API
    // Provide clear instructions and structure for the desired output
    const prompt = `You are a financial analyst specializing in small business data.
        Analyze the following spreadsheet data, provided in CSV format, and identify key trends,
        potential issues, and opportunities. Provide actionable advice and clear recommendations
        for the small business owner.

        --- CSV Data ---
        ${csvData}
        --- End CSV Data ---

        Please structure your analysis into distinct sections:
        1. Executive Summary: A brief overview of the key findings.
        2. Key Financial Metrics & Trends: Highlight important numbers and trends observed in the data.
        3. Strengths and Opportunities: What's working well and where can the business grow?
        4. Weaknesses and Risks: What are the challenges and potential threats?
        5. Actionable Recommendations: Specific steps the business owner can take.
        `;

    console.log(
      "Prompt sent to Gemini (first 500 characters):",
      prompt.substring(0, 500) + "..."
    );

    // Call the Gemini API to generate content
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCxdJ8VnlRcvSQBEPRJ9NEMqcfmr7j0NcQ`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    console.log("Gemini API response status:", geminiRes.status);

    // Extract the advice from the Gemini API response
    const advice =
      geminiRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Gemini did not return advice.";

    console.log(
      "Advice received (first 200 characters):",
      advice.substring(0, 200) + "..."
    );

    // Send a success response back to the client
    res.status(200).json({
      message: "File uploaded and analyzed successfully!",
      filename: req.file.filename, // Optionally send back the filename
      advice, // The analysis and advice from Gemini
    });
  } catch (err) {
    console.error("Upload or analysis failed:", err);

    // More detailed error handling for Axios specific errors (e.g., API issues)
    if (axios.isAxiosError(err)) {
      console.error(
        "Axios error details (response data):",
        err.response?.data || err.message
      );
      res.status(err.response?.status || 500).json({
        message: "Gemini API call failed",
        error: err.response?.data || err.message, // Send specific API error details if available
      });
    } else {
      // General error handling for other issues (e.g., file parsing, multer issues)
      res
        .status(500)
        .json({ message: "Upload or analysis failed", error: err.message });
    }
  } finally {
    // IMPORTANT: Always delete the uploaded file to prevent disk space issues
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting uploaded file:", unlinkErr);
        } else {
          console.log("Uploaded file deleted successfully:", filePath);
        }
      });
    }
  }
});

router.post("/correct-data", upload.single("file"), async (req, res) => {
  let filePath;
  console.log("Starting data correction process");

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const { industry = "general" } = req.body;
    filePath = path.join("uploads", req.file.filename);

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    const columnNames = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

    if (!columnNames.length) {
      return res.status(400).json({
        message: "No columns found in uploaded file.",
        mappings: [],
        unmappedColumns: [],
      });
    }

    // Get first 5-10 rows as sample data for AI context
    const sampleData = jsonData.slice(0, Math.min(10, jsonData.length));

    // Get industry patterns
    const patternList = industryPatterns[industry]?.patterns || [];
    const patternInfo = patternList.map(
      (p) => `- **${p.target}**: Matches → ${p.names.join(", ")}`
    );

    // Enhanced prompt with sample data
    const prompt = `
You are a data mapping specialist. Analyze the column names and sample data to map them to standardized names for the ${industry.toUpperCase()} industry.

### AVAILABLE STANDARD PATTERNS FOR ${industry.toUpperCase()}:
${
  patternInfo.join("\n") || "(No specific patterns available for this industry)"
}

### COLUMN NAMES TO MAP:
${JSON.stringify(columnNames, null, 2)}

### SAMPLE DATA (first few rows):
${JSON.stringify(sampleData, null, 2)}

### TASK:
1. Analyze each column name and its sample data
2. Match to the most appropriate standard pattern from the list above
3. If no good match exists, return null for that column
4. Consider data content, not just column names

### RESPONSE FORMAT:
Return ONLY a valid JSON array with this exact structure:
[
  {
    "originalName": "original_column_name",
    "suggestedName": "StandardizedName",
    "confidence": "high|medium|low",
    "reason": "brief explanation of why this mapping was chosen"
  }
]

### EXAMPLE:
[
  {
    "originalName": "ord_id",
    "suggestedName": "Order ID",
    "confidence": "high",
    "reason": "Clearly matches order identifier pattern"
  },
  {
    "originalName": "weird_column",
    "suggestedName": null,
    "confidence": "low",
    "reason": "No clear match found in available patterns"
  }
]

IMPORTANT: Return ONLY the JSON array, no explanations or markdown formatting.`;

    // Call AI service
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCxdJ8VnlRcvSQBEPRJ9NEMqcfmr7j0NcQ`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    let aiResponse = [];
    let rawResponse = "";

    try {
      rawResponse =
        geminiRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("Raw AI Response:", rawResponse);

      // Clean the response - remove markdown formatting if present
      let cleanedResponse = rawResponse.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse
          .replace(/```json\s*/, "")
          .replace(/```\s*$/, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/```\s*/, "")
          .replace(/```\s*$/, "");
      }

      aiResponse = JSON.parse(cleanedResponse);

      if (!Array.isArray(aiResponse)) {
        throw new Error("AI response is not an array");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response was:", rawResponse);

      // Fallback: create basic mapping
      aiResponse = columnNames.map((col) => ({
        originalName: col,
        suggestedName: null,
        confidence: "low",
        reason: "AI parsing failed, manual mapping required",
      }));
    }

    // Process the AI response to match frontend expectations
    const mappings = [];
    const unmappedColumns = [];

    aiResponse.forEach((item) => {
      if (item.suggestedName && item.suggestedName !== null) {
        mappings.push({
          originalName: item.originalName,
          suggestedName: item.suggestedName,
          confidence: item.confidence || "medium",
          reason: item.reason || "AI suggested mapping",
        });
      } else {
        unmappedColumns.push(item.originalName);
      }
    });

    // Ensure all columns are accounted for
    columnNames.forEach((col) => {
      const found = aiResponse.find((item) => item.originalName === col);
      if (!found) {
        unmappedColumns.push(col);
      }
    });

    // Response structure that matches frontend expectations
    const response = {
      message: "Column mapping completed successfully!",
      originalFilename: req.file.originalname,
      totalColumns: columnNames.length,
      mappedColumns: mappings.length,
      unmappedColumns: unmappedColumns.length,
      industry: industry,
      mappings: mappings,
      unmappedColumns: unmappedColumns,
      sampleDataProvided: sampleData.length > 0,
    };

    console.log("Mapping completed:", {
      total: columnNames.length,
      mapped: mappings.length,
      unmapped: unmappedColumns.length,
    });

    res.status(200).json(response);
  } catch (err) {
    console.error("Data correction failed:", err);
    res.status(500).json({
      message: "Column mapping failed",
      error: err.message,
      mappings: [],
      unmappedColumns: [],
      debug: {
        hasFile: !!req.file,
        industry: req.body?.industry || "not provided",
      },
    });
  } finally {
    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting uploaded file:", unlinkErr);
        } else {
          console.log("Uploaded file cleaned up successfully");
        }
      });
    }
  }
});

function validateIndustryPatterns(industry) {
  const validIndustries = Object.keys(industryPatterns);
  return validIndustries.includes(industry) ? industry : "general";
}
