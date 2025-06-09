import { read, utils } from 'xlsx';

export interface RestaurantData {
  'Order ID': string;
  'Order Date': string;
  'Food Name': string;
  'Food Type': string;
  'Price': number;
  'Quantity': number;
  'Size': string;
  'Total Amount': number;
}

export interface ProcessedRestaurantData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderPrice: number;
  salesByFoodType: { [key: string]: number };
  salesByFoodName: { [key: string]: number };
  ordersByDayOfWeek: { [key: string]: number };
  topDishes: Array<{ name: string; quantity: number; revenue: number }>;
  topFoodTypes: Array<{ type: string; sales: number }>;
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
const handleMissingValues = (data: any[]): RestaurantData[] => {
  // Calculate averages for numerical columns
  const avgPrice = calculateColumnAverage(data, 'Price');
  const avgQuantity = calculateColumnAverage(data, 'Quantity');
  const avgTotalAmount = calculateColumnAverage(data, 'Total Amount');

  return data.map(row => ({
    'Order ID': row['Order ID'] || 'Unknown',
    'Order Date': row['Order Date'] || new Date().toISOString(),
    'Food Name': row['Food Name'] || 'Unknown Item',
    'Food Type': row['Food Type'] || 'Unknown Type',
    'Price': Number(row['Price']) || avgPrice,
    'Quantity': Number(row['Quantity']) || avgQuantity,
    'Size': row['Size'] || 'Regular',
    'Total Amount': Number(row['Total Amount']) || avgTotalAmount
  }));
};

export const processRestaurantData = async (file: File, selectedMonth?: string): Promise<ProcessedRestaurantData> => {
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
          const date = new Date(row['Order Date']);
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
              const date = new Date(row['Order Date']);
              const rowMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              return rowMonth === selectedMonth;
            })
          : jsonData;

        if (filteredData.length === 0) {
          resolve({
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderPrice: 0,
            salesByFoodType: {},
            salesByFoodName: {},
            ordersByDayOfWeek: {},
            topDishes: [],
            topFoodTypes: [],
            availableMonths
          });
          return;
        }

        // Initialize aggregators
        const uniqueOrders = new Set();
        const salesByFoodType: { [key: string]: number } = {};
        const salesByFoodName: { [key: string]: number } = {};
        const ordersByDayOfWeek: { [key: string]: number } = {};
        const quantityByDish: { [key: string]: { quantity: number; revenue: number } } = {};
        let totalRevenue = 0;

        // Process each row
        filteredData.forEach(row => {
          totalRevenue += row['Total Amount'];
          uniqueOrders.add(row['Order ID']);

          salesByFoodType[row['Food Type']] = (salesByFoodType[row['Food Type']] || 0) + row['Total Amount'];
          salesByFoodName[row['Food Name']] = (salesByFoodName[row['Food Name']] || 0) + row['Total Amount'];

          const date = new Date(row['Order Date']);
          const dayOfWeek = daysOfWeek[date.getDay()];
          ordersByDayOfWeek[dayOfWeek] = (ordersByDayOfWeek[dayOfWeek] || 0) + 1;

          if (!quantityByDish[row['Food Name']]) {
            quantityByDish[row['Food Name']] = { quantity: 0, revenue: 0 };
          }
          quantityByDish[row['Food Name']].quantity += row['Quantity'];
          quantityByDish[row['Food Name']].revenue += row['Total Amount'];
        });

        const topDishes = Object.entries(quantityByDish)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        const topFoodTypes = Object.entries(salesByFoodType)
          .map(([type, sales]) => ({ type, sales }))
          .sort((a, b) => b.sales - a.sales);

        resolve({
          totalRevenue,
          totalOrders: uniqueOrders.size,
          averageOrderPrice: totalRevenue / uniqueOrders.size,
          salesByFoodType,
          salesByFoodName,
          ordersByDayOfWeek,
          topDishes,
          topFoodTypes,
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