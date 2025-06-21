// utils/aiColumnMapping.ts
import { read, utils } from "xlsx";

export interface ColumnMapping {
  originalName: string;
  suggestedName: string;
  confidence: number;
  category: string;
}

export interface MappingResult {
  mappings: ColumnMapping[];
  unmappedColumns: string[];
  industryType: string;
  confidence: number;
}

// Industry-specific column patterns for better matching
export const industryPatterns = {
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

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, "");
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (s1 === s2) return 1.0;

  const matrix = Array(s2.length + 1)
    .fill(null)
    .map(() => Array(s1.length + 1).fill(null));

  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0
    ? 1.0
    : (maxLength - matrix[s2.length][s1.length]) / maxLength;
}

// Detect industry type based on column names
function detectIndustryType(headers: string[]): {
  industry: string;
  confidence: number;
} {
  const industryScores: { [key: string]: number } = {};

  Object.keys(industryPatterns).forEach((industry) => {
    let score = 0;
    const patterns =
      industryPatterns[industry as keyof typeof industryPatterns].patterns;

    headers.forEach((header) => {
      const bestMatch = patterns.reduce((best, pattern) => {
        const maxSimilarity = Math.max(
          ...pattern.names.map((name) => calculateSimilarity(header, name))
        );
        return maxSimilarity > best ? maxSimilarity : best;
      }, 0);

      score += bestMatch;
    });

    industryScores[industry] = score / headers.length;
  });

  const bestIndustry = Object.keys(industryScores).reduce((a, b) =>
    industryScores[a] > industryScores[b] ? a : b
  );

  return {
    industry: bestIndustry,
    confidence: industryScores[bestIndustry],
  };
}

export function mapColumnsWithAI(
  headers: string[],
  industryHint?: string
): MappingResult {
  const detectedIndustry = industryHint || detectIndustryType(headers).industry;
  const patterns =
    industryPatterns[detectedIndustry as keyof typeof industryPatterns]
      ?.patterns || [];

  const mappings: ColumnMapping[] = [];
  const unmappedColumns: string[] = [];

  headers.forEach((header) => {
    let bestMatch = { target: "", confidence: 0, category: "" };

    patterns.forEach((pattern) => {
      const similarities = pattern.names.map((name) =>
        calculateSimilarity(header, name)
      );
      const maxSimilarity = Math.max(...similarities);

      if (maxSimilarity > bestMatch.confidence && maxSimilarity > 0.6) {
        bestMatch = {
          target: pattern.target,
          confidence: maxSimilarity,
          category: pattern.category,
        };
      }
    });

    if (bestMatch.confidence > 0.6) {
      mappings.push({
        originalName: header,
        suggestedName: bestMatch.target,
        confidence: bestMatch.confidence,
        category: bestMatch.category,
      });
    } else {
      unmappedColumns.push(header);
    }
  });

  const overallConfidence =
    mappings.length > 0
      ? mappings.reduce((sum, m) => sum + m.confidence, 0) / mappings.length
      : 0;

  return {
    mappings,
    unmappedColumns,
    industryType: detectedIndustry,
    confidence: overallConfidence,
  };
}

// Updated file validation function
export const validateAndMapColumns = async (
  file: File,
  industryHint?: string
): Promise<{
  success: boolean;
  mappingResult?: MappingResult;
  headers?: string[];
  error?: string;
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: "array" });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const headers = utils.sheet_to_json(firstSheet, {
          header: 1,
        })[0] as string[];

        const normalizedHeaders = headers
          .map((header) =>
            typeof header === "string" ? header.trim() : String(header).trim()
          )
          .filter((header) => header !== "");

        if (normalizedHeaders.length === 0) {
          resolve({
            success: false,
            error: "No valid headers found in the file",
          });
          return;
        }

        const mappingResult = mapColumnsWithAI(normalizedHeaders, industryHint);

        resolve({
          success: true,
          mappingResult,
          headers: normalizedHeaders,
        });
      } catch (error) {
        resolve({
          success: false,
          error: "Error reading file: " + (error as Error).message,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: "Error reading file",
      });
    };

    reader.readAsArrayBuffer(file);
  });
};
