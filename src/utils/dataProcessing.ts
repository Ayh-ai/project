import { read, utils } from 'xlsx';

export interface RetailData {
  order_id: string;
  order_Date: string;
  ProductName: string;
  Category: string;
  Quantity: number;
  UnitPrice: number;
  TotalSales: number;
  customer_name: string;
  customer_email: string;
  Gender: string;
  ServiceRating: number;
}

export interface ProcessedData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByCategory: { [key: string]: number };
  salesByProduct: { [key: string]: number };
  ordersByDayOfWeek: { [key: string]: number };
  topProducts: Array<{ name: string; sales: number }>;
  topCategories: Array<{ name: string; sales: number }>;
  genderDistribution: { [key: string]: number };
  serviceRatingDistribution: { [key: string]: number };
  availableMonths: Array<{ value: string; label: string }>;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Calculate column average for numerical values
const calculateColumnAverage = (data: any[], columnName: string): number => {
  const validValues = data
    .map(row => Number(row[columnName]))
    .filter(value => !isNaN(value) && value !== null && value !== undefined);
  
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

// Function to handle missing values
const handleMissingValues = (data: any[]): RetailData[] => {
  // Calculate averages for numerical columns
  const avgQuantity = calculateColumnAverage(data, 'Quantity');
  const avgUnitPrice = calculateColumnAverage(data, 'UnitPrice');
  const avgTotalSales = calculateColumnAverage(data, 'TotalSales');
  const avgServiceRating = calculateColumnAverage(data, 'ServiceRating');

  return data.map(row => ({
    order_id: row.order_id || 'Unknown',
    order_Date: row.order_Date || new Date().toISOString(),
    ProductName: row.ProductName || 'Unknown Product',
    Category: row.Category || 'Unknown Category',
    Quantity: Number(row.Quantity) || avgQuantity,
    UnitPrice: Number(row.UnitPrice) || avgUnitPrice,
    TotalSales: Number(row.TotalSales) || avgTotalSales,
    customer_name: row.customer_name || 'Unknown Customer',
    customer_email: row.customer_email || 'unknown@example.com',
    Gender: row.Gender || 'Unknown',
    ServiceRating: Number(row.ServiceRating) || avgServiceRating
  }));
};

export const processRetailData = async (file: File, selectedMonth?: string): Promise<ProcessedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = utils.sheet_to_json(worksheet);
        
        // Handle missing values before processing
        const jsonData = handleMissingValues(rawData);

        // Get available months
        const availableMonths = [...new Set(jsonData.map(row => {
          const date = new Date(row.order_Date);
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
              const date = new Date(row.order_Date);
              const rowMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              return rowMonth === selectedMonth;
            })
          : jsonData;

        if (filteredData.length === 0) {
          resolve({
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            salesByCategory: {},
            salesByProduct: {},
            ordersByDayOfWeek: {},
            topProducts: [],
            topCategories: [],
            genderDistribution: {},
            serviceRatingDistribution: {},
            availableMonths
          });
          return;
        }

        // Initialize aggregators
        const uniqueOrders = new Set();
        const salesByCategory: { [key: string]: number } = {};
        const salesByProduct: { [key: string]: number } = {};
        const ordersByDayOfWeek: { [key: string]: number } = {};
        const genderDistribution: { [key: string]: number } = {};
        const serviceRatingDistribution: { [key: string]: number } = {};
        let totalRevenue = 0;

        // Process each row
        filteredData.forEach(row => {
          totalRevenue += row.TotalSales;
          uniqueOrders.add(row.order_id);

          salesByCategory[row.Category] = (salesByCategory[row.Category] || 0) + row.TotalSales;
          salesByProduct[row.ProductName] = (salesByProduct[row.ProductName] || 0) + row.TotalSales;

          const date = new Date(row.order_Date);
          const dayOfWeek = daysOfWeek[date.getDay()];
          ordersByDayOfWeek[dayOfWeek] = (ordersByDayOfWeek[dayOfWeek] || 0) + 1;

          genderDistribution[row.Gender] = (genderDistribution[row.Gender] || 0) + 1;

          const rating = row.ServiceRating.toString();
          serviceRatingDistribution[rating] = (serviceRatingDistribution[rating] || 0) + 1;
        });

        const topProducts = Object.entries(salesByProduct)
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        const topCategories = Object.entries(salesByCategory)
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales);

        resolve({
          totalRevenue,
          totalOrders: uniqueOrders.size,
          averageOrderValue: totalRevenue / uniqueOrders.size,
          salesByCategory,
          salesByProduct,
          ordersByDayOfWeek,
          topProducts,
          topCategories,
          genderDistribution,
          serviceRatingDistribution,
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