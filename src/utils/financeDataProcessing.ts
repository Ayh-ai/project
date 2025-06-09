import { read, utils } from 'xlsx';

export interface FinanceData {
  'Transaction ID': string;
  'Date': string;
  'Category': string;
  'Amount': number;
  'Payment Method': string;
  'Account Balance': number;
  'Revenue': number;
  'Expenses': number;
  'Profit': number;
  'Tax Rate (%)': number;
  'Tax Amount': number;
  'Net Profit': number;
  'Department': string;
  'Approval Status': string;
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
    impact: 'high' | 'medium' | 'low';
    metric: number | string;
  }>;

  // Available months for filtering
  availableMonths: Array<{ value: string; label: string }>;
}

const calculateColumnAverage = (data: any[], columnName: string): number => {
  const validValues = data
    .map(row => Number(row[columnName]))
    .filter(value => !isNaN(value) && value !== null && value !== undefined);
  
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

const handleMissingValues = (data: any[]): FinanceData[] => {
  const avgAmount = calculateColumnAverage(data, 'Amount');
  const avgBalance = calculateColumnAverage(data, 'Account Balance');
  const avgRevenue = calculateColumnAverage(data, 'Revenue');
  const avgExpenses = calculateColumnAverage(data, 'Expenses');
  const avgProfit = calculateColumnAverage(data, 'Profit');
  const avgTaxRate = calculateColumnAverage(data, 'Tax Rate (%)');
  const avgTaxAmount = calculateColumnAverage(data, 'Tax Amount');
  const avgNetProfit = calculateColumnAverage(data, 'Net Profit');

  return data.map(row => ({
    'Transaction ID': row['Transaction ID'] || 'Unknown',
    'Date': row['Date'] || new Date().toISOString(),
    'Category': row['Category'] || 'Other',
    'Amount': Number(row['Amount']) || avgAmount,
    'Payment Method': row['Payment Method'] || 'Unknown',
    'Account Balance': Number(row['Account Balance']) || avgBalance,
    'Revenue': Number(row['Revenue']) || avgRevenue,
    'Expenses': Number(row['Expenses']) || avgExpenses,
    'Profit': Number(row['Profit']) || avgProfit,
    'Tax Rate (%)': Number(row['Tax Rate (%)']) || avgTaxRate,
    'Tax Amount': Number(row['Tax Amount']) || avgTaxAmount,
    'Net Profit': Number(row['Net Profit']) || avgNetProfit,
    'Department': row['Department'] || 'General',
    'Approval Status': row['Approval Status'] || 'Pending'
  }));
};

export const processFinanceData = async (file: File, selectedMonth?: string): Promise<ProcessedFinanceData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = utils.sheet_to_json(worksheet);
        const jsonData = handleMissingValues(rawData);

        // Get available months
        const availableMonths = [...new Set(jsonData.map(row => {
          const date = new Date(row['Date']);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }))].sort().map(month => {
          const [year, monthNum] = month.split('-');
          const date = new Date(parseInt(year), parseInt(monthNum) - 1);
          return {
            value: month,
            label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
          };
        });

        // Filter data by selected month if provided
        const filteredData = selectedMonth
          ? jsonData.filter(row => {
              const date = new Date(row['Date']);
              const rowMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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
            availableMonths
          });
          return;
        }

        // Calculate key metrics
        const totalRevenue = filteredData.reduce((sum, row) => sum + row['Revenue'], 0);
        const totalExpenses = filteredData.reduce((sum, row) => sum + row['Expenses'], 0);
        const grossProfit = totalRevenue - totalExpenses;
        const totalTaxAmount = filteredData.reduce((sum, row) => sum + row['Tax Amount'], 0);
        const netProfit = grossProfit - totalTaxAmount;
        const profitMargin = (grossProfit / totalRevenue) * 100;
        const netProfitMargin = (netProfit / totalRevenue) * 100;
        const averageTaxRate = filteredData.reduce((sum, row) => sum + row['Tax Rate (%)'], 0) / filteredData.length;
        const approvedTransactions = filteredData.filter(row => 
          row['Approval Status'].toLowerCase() === 'approved'
        ).length;
        const approvalRate = (approvedTransactions / filteredData.length) * 100;

        // Process department metrics
        const departments = [...new Set(filteredData.map(row => row['Department']))];
        const departmentMetrics = departments.map(dept => {
          const deptData = filteredData.filter(row => row['Department'] === dept);
          const deptRevenue = deptData.reduce((sum, row) => sum + row['Revenue'], 0);
          const deptExpenses = deptData.reduce((sum, row) => sum + row['Expenses'], 0);
          const deptProfit = deptRevenue - deptExpenses;
          const deptTaxAmount = deptData.reduce((sum, row) => sum + row['Tax Amount'], 0);
          const deptNetProfit = deptProfit - deptTaxAmount;
          const deptApproved = deptData.filter(row => 
            row['Approval Status'].toLowerCase() === 'approved'
          ).length;

          return {
            department: dept,
            revenue: deptRevenue,
            expenses: deptExpenses,
            profitMargin: (deptProfit / deptRevenue) * 100,
            netProfitMargin: (deptNetProfit / deptRevenue) * 100,
            taxEfficiency: (deptTaxAmount / deptRevenue) * 100,
            approvalRate: (deptApproved / deptData.length) * 100
          };
        });

        // Calculate distributions
        const paymentMethodDistribution = filteredData.reduce((acc, row) => {
          acc[row['Payment Method']] = (acc[row['Payment Method']] || 0) + row['Amount'];
          return acc;
        }, {} as { [key: string]: number });

        const categoryDistribution = filteredData.reduce((acc, row) => {
          acc[row['Category']] = (acc[row['Category']] || 0) + row['Amount'];
          return acc;
        }, {} as { [key: string]: number });

        // Calculate trends
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const revenueTrend = months.reduce((acc, month) => {
          acc[month] = Math.random() * 100000; // Example data
          return acc;
        }, {} as { [key: string]: number });

        // Identify high-risk areas
        const highRiskAreas = [];

        if (netProfitMargin < 10) {
          highRiskAreas.push({
            area: 'Net Profit Margin',
            risk: 'Low profit margin indicates potential profitability issues',
            impact: 'high',
            metric: netProfitMargin
          });
        }

        if (approvalRate < 90) {
          highRiskAreas.push({
            area: 'Transaction Approval',
            risk: 'Low approval rate may indicate process inefficiencies',
            impact: 'medium',
            metric: approvalRate
          });
        }

        const highTaxDepts = departmentMetrics.filter(dept => dept.taxEfficiency > 25);
        if (highTaxDepts.length > 0) {
          highRiskAreas.push({
            area: 'Tax Efficiency',
            risk: `${highTaxDepts.length} department(s) have high tax burden`,
            impact: 'high',
            metric: highTaxDepts.length
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
          revenueTrend,
          expensesTrend: revenueTrend, // Example data
          profitTrend: revenueTrend, // Example data
          netProfitTrend: revenueTrend, // Example data
          balanceTrend: revenueTrend, // Example data
          paymentMethodDistribution,
          categoryDistribution,
          departmentMetrics,
          highRiskAreas,
          availableMonths
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsArrayBuffer(file);
  });
};