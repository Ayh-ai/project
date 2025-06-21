import { read, utils } from "xlsx";

export interface FinanceData {
  "Transaction ID": string;
  Date: string;
  Category: string;
  Amount: number;
  "Payment Method": string;
  "Account Balance": number;
  Revenue: number;
  Expenses: number;
  Profit: number;
  "Tax Rate (%)": number;
  "Tax Amount": number;
  "Net Profit": number;
  Department: string;
  "Approval Status": string;
}

export interface DepartmentMetrics {
  department: string;
  revenue: number;
  expenses: number;
  profitMargin: number;
  netProfitMargin: number;
  taxEfficiency: number;
  approvalRate: number;
}

export interface ProcessedFinanceData {
  // Key Performance Metrics
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  netProfitMargin: number;
  averageTaxRate: number;
  totalTaxAmount: number;
  approvalRate: number;

  // Trend Data
  revenueTrend: { [key: string]: number };
  expensesTrend: { [key: string]: number };
  profitTrend: { [key: string]: number };
  netProfitTrend: { [key: string]: number };
  balanceTrend: { [key: string]: number };

  // Payment Analysis
  paymentMethodDistribution: { [key: string]: number };
  categoryDistribution: { [key: string]: number };

  // Department Analysis
  departmentMetrics: DepartmentMetrics[];

  // Risk Indicators
  highRiskAreas: Array<{
    area: string;
    risk: string;
    impact: "high" | "medium" | "low";
    metric: number | string;
  }>;

  // Available months for filtering
  availableMonths: Array<{ value: string; label: string }>;
}

export interface ProcessingOptions {
  selectedMonth?: string;
  columnMapping?: { [key: string]: string };
  correctionResult?: any;
  industryType?: string;
}

const calculateColumnAverage = (data: any[], columnName: string): number => {
  const validValues = data
    .map((row) => Number(row[columnName]))
    .filter((value) => !isNaN(value) && value !== null && value !== undefined);

  if (validValues.length === 0) return 0;
  return (
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length
  );
};

const applyColumnMapping = (
  data: any[],
  columnMapping: { [key: string]: string }
): any[] => {
  if (!columnMapping || Object.keys(columnMapping).length === 0) {
    return data;
  }

  return data.map((row) => {
    const mappedRow: any = {};

    // Apply column mapping
    Object.keys(row).forEach((originalKey) => {
      const mappedKey = columnMapping[originalKey] || originalKey;
      mappedRow[mappedKey] = row[originalKey];
    });

    return mappedRow;
  });
};

const handleMissingValues = (data: any[]): FinanceData[] => {
  const avgAmount = calculateColumnAverage(data, "Amount");
  const avgBalance = calculateColumnAverage(data, "Account Balance");
  const avgRevenue = calculateColumnAverage(data, "Revenue");
  const avgExpenses = calculateColumnAverage(data, "Expenses");
  const avgProfit = calculateColumnAverage(data, "Profit");
  const avgTaxRate = calculateColumnAverage(data, "Tax Rate (%)");
  const avgTaxAmount = calculateColumnAverage(data, "Tax Amount");
  const avgNetProfit = calculateColumnAverage(data, "Net Profit");

  return data.map((row) => ({
    "Transaction ID":
      row["Transaction ID"] || `TXN-${Math.random().toString(36).substr(2, 9)}`,
    Date: row["Date"] || new Date().toISOString(),
    Category: row["Category"] || "Other",
    Amount: Number(row["Amount"]) || avgAmount || 0,
    "Payment Method": row["Payment Method"] || "Unknown",
    "Account Balance": Number(row["Account Balance"]) || avgBalance || 0,
    Revenue: Number(row["Revenue"]) || avgRevenue || 0,
    Expenses: Number(row["Expenses"]) || avgExpenses || 0,
    Profit: Number(row["Profit"]) || avgProfit || 0,
    "Tax Rate (%)": Number(row["Tax Rate (%)"]) || avgTaxRate || 0,
    "Tax Amount": Number(row["Tax Amount"]) || avgTaxAmount || 0,
    "Net Profit": Number(row["Net Profit"]) || avgNetProfit || 0,
    Department: row["Department"] || "General",
    "Approval Status": row["Approval Status"] || "Pending",
  }));
};

const applyCorrectionResult = (
  data: FinanceData[],
  correctionResult: any
): FinanceData[] => {
  if (!correctionResult) return data;

  // Apply any data corrections based on correctionResult
  // This is where you'd implement logic based on your correction system
  return data.map((row) => {
    // Example: Apply corrections if they exist
    if (correctionResult.corrections) {
      const corrections = correctionResult.corrections;
      // Apply specific corrections based on your correction logic
      return { ...row, ...corrections };
    }
    return row;
  });
};

export const processFinanceData = async (
  file: File,
  options: ProcessingOptions = {}
): Promise<ProcessedFinanceData> => {
  const { selectedMonth, columnMapping, correctionResult, industryType } =
    options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let rawData = utils.sheet_to_json(worksheet);

        // Step 1: Apply column mapping if provided
        if (columnMapping) {
          rawData = applyColumnMapping(rawData, columnMapping);
        }

        // Step 2: Handle missing values and standardize data
        let jsonData = handleMissingValues(rawData);

        // Step 3: Apply correction result if provided
        if (correctionResult) {
          jsonData = applyCorrectionResult(jsonData, correctionResult);
        }

        console.log("Processed data sample:", jsonData.slice(0, 2));
        console.log("Column mapping applied:", columnMapping);
        console.log("Industry type:", industryType);

        // Get available months
        const availableMonths = [
          ...new Set(
            jsonData
              .map((row) => {
                const date = new Date(row["Date"]);
                if (isNaN(date.getTime())) return null;
                return `${date.getFullYear()}-${String(
                  date.getMonth() + 1
                ).padStart(2, "0")}`;
              })
              .filter(Boolean)
          ),
        ]
          .sort()
          .map((month) => {
            const [year, monthNum] = month!.split("-");
            const date = new Date(parseInt(year), parseInt(monthNum) - 1);
            return {
              value: month!,
              label: date.toLocaleString("default", {
                month: "long",
                year: "numeric",
              }),
            };
          });

        // Filter data by selected month if provided
        const filteredData = selectedMonth
          ? jsonData.filter((row) => {
              const date = new Date(row["Date"]);
              if (isNaN(date.getTime())) return false;
              const rowMonth = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}`;
              return rowMonth === selectedMonth;
            })
          : jsonData;

        if (filteredData.length === 0) {
          resolve({
            totalRevenue: 0,
            totalExpenses: 0,
            grossProfit: 0,
            netProfit: 0,
            profitMargin: 0,
            netProfitMargin: 0,
            averageTaxRate: 0,
            totalTaxAmount: 0,
            approvalRate: 0,
            revenueTrend: {},
            expensesTrend: {},
            profitTrend: {},
            netProfitTrend: {},
            balanceTrend: {},
            paymentMethodDistribution: {},
            categoryDistribution: {},
            departmentMetrics: [],
            highRiskAreas: [],
            availableMonths,
          });
          return;
        }

        // Calculate key metrics
        const totalRevenue = filteredData.reduce(
          (sum, row) => sum + (row["Revenue"] || 0),
          0
        );
        const totalExpenses = filteredData.reduce(
          (sum, row) => sum + (row["Expenses"] || 0),
          0
        );
        const grossProfit = totalRevenue - totalExpenses;
        const totalTaxAmount = filteredData.reduce(
          (sum, row) => sum + (row["Tax Amount"] || 0),
          0
        );
        const netProfit = grossProfit - totalTaxAmount;
        const profitMargin =
          totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        const netProfitMargin =
          totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        const averageTaxRate =
          filteredData.length > 0
            ? filteredData.reduce(
                (sum, row) => sum + (row["Tax Rate (%)"] || 0),
                0
              ) / filteredData.length
            : 0;
        const approvedTransactions = filteredData.filter(
          (row) => row["Approval Status"]?.toLowerCase() === "approved"
        ).length;
        const approvalRate =
          filteredData.length > 0
            ? (approvedTransactions / filteredData.length) * 100
            : 0;

        // Process department metrics
        const departments = [
          ...new Set(filteredData.map((row) => row["Department"] || "General")),
        ];
        const departmentMetrics = departments.map((dept) => {
          const deptData = filteredData.filter(
            (row) => (row["Department"] || "General") === dept
          );
          const deptRevenue = deptData.reduce(
            (sum, row) => sum + (row["Revenue"] || 0),
            0
          );
          const deptExpenses = deptData.reduce(
            (sum, row) => sum + (row["Expenses"] || 0),
            0
          );
          const deptProfit = deptRevenue - deptExpenses;
          const deptTaxAmount = deptData.reduce(
            (sum, row) => sum + (row["Tax Amount"] || 0),
            0
          );
          const deptNetProfit = deptProfit - deptTaxAmount;
          const deptApproved = deptData.filter(
            (row) => row["Approval Status"]?.toLowerCase() === "approved"
          ).length;

          return {
            department: dept,
            revenue: deptRevenue,
            expenses: deptExpenses,
            profitMargin:
              deptRevenue > 0 ? (deptProfit / deptRevenue) * 100 : 0,
            netProfitMargin:
              deptRevenue > 0 ? (deptNetProfit / deptRevenue) * 100 : 0,
            taxEfficiency:
              deptRevenue > 0 ? (deptTaxAmount / deptRevenue) * 100 : 0,
            approvalRate:
              deptData.length > 0 ? (deptApproved / deptData.length) * 100 : 0,
          };
        });

        // Calculate distributions
        const paymentMethodDistribution = filteredData.reduce((acc, row) => {
          const method = row["Payment Method"] || "Unknown";
          acc[method] = (acc[method] || 0) + (row["Amount"] || 0);
          return acc;
        }, {} as { [key: string]: number });

        const categoryDistribution = filteredData.reduce((acc, row) => {
          const category = row["Category"] || "Other";
          acc[category] = (acc[category] || 0) + (row["Amount"] || 0);
          return acc;
        }, {} as { [key: string]: number });

        // Calculate trends (using actual data if dates are available)
        const trendData = availableMonths.reduce(
          (acc, month) => {
            const monthData = jsonData.filter((row) => {
              const date = new Date(row["Date"]);
              if (isNaN(date.getTime())) return false;
              const rowMonth = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}`;
              return rowMonth === month.value;
            });

            acc.revenue[month.label] = monthData.reduce(
              (sum, row) => sum + (row["Revenue"] || 0),
              0
            );
            acc.expenses[month.label] = monthData.reduce(
              (sum, row) => sum + (row["Expenses"] || 0),
              0
            );
            acc.profit[month.label] =
              acc.revenue[month.label] - acc.expenses[month.label];
            acc.netProfit[month.label] =
              acc.profit[month.label] -
              monthData.reduce((sum, row) => sum + (row["Tax Amount"] || 0), 0);
            acc.balance[month.label] =
              monthData.length > 0
                ? monthData[monthData.length - 1]["Account Balance"] || 0
                : 0;

            return acc;
          },
          {
            revenue: {} as { [key: string]: number },
            expenses: {} as { [key: string]: number },
            profit: {} as { [key: string]: number },
            netProfit: {} as { [key: string]: number },
            balance: {} as { [key: string]: number },
          }
        );

        // Identify high-risk areas
        const highRiskAreas = [];

        if (netProfitMargin < 10) {
          highRiskAreas.push({
            area: "Net Profit Margin",
            risk: "Low profit margin indicates potential profitability issues",
            impact: "high" as const,
            metric: netProfitMargin,
          });
        }

        if (approvalRate < 90) {
          highRiskAreas.push({
            area: "Transaction Approval",
            risk: "Low approval rate may indicate process inefficiencies",
            impact: "medium" as const,
            metric: approvalRate,
          });
        }

        const highTaxDepts = departmentMetrics.filter(
          (dept) => dept.taxEfficiency > 25
        );
        if (highTaxDepts.length > 0) {
          highRiskAreas.push({
            area: "Tax Efficiency",
            risk: `${highTaxDepts.length} department(s) have high tax burden`,
            impact: "high" as const,
            metric: highTaxDepts.length,
          });
        }

        resolve({
          totalRevenue,
          totalExpenses,
          grossProfit,
          netProfit,
          profitMargin,
          netProfitMargin,
          averageTaxRate,
          totalTaxAmount,
          approvalRate,
          revenueTrend: trendData.revenue,
          expensesTrend: trendData.expenses,
          profitTrend: trendData.profit,
          netProfitTrend: trendData.netProfit,
          balanceTrend: trendData.balance,
          paymentMethodDistribution,
          categoryDistribution,
          departmentMetrics,
          highRiskAreas,
          availableMonths,
        });
      } catch (error) {
        console.error("Error processing finance data:", error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsArrayBuffer(file);
  });
};
