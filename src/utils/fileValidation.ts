import { read, utils } from 'xlsx';

export const requiredRetailColumns = [
  'order_id',
  'order_Date',
  'ProductName',
  'Category',
  'Quantity',
  'UnitPrice',
  'TotalSales',
  'customer_name',
  'customer_email',
  'Gender',
  'ServiceRating'
];

export const requiredRestaurantColumns = [
  'Order ID',
  'Order Date',
  'Food Name',
  'Food Type',
  'Price',
  'Quantity',
  'Size',
  'Total Amount'
];

export const requiredHotelColumns = [
  'CheckOutDate',
  'RoomType',
  'NightsStayed',
  'BookingSource',
  'PricePerNight',
  'TotalPrice',
  'Status',
  'CustomerRating',
  'GuestCount',
  'PaymentMethod',
  'CancellationReason',
  'TotalRooms'
];

export const requiredManufacturingColumns = [
  'Production Date',
  'Production Line Number',
  'Product Name',
  'Production Quantity',
  'Defective Units',
  'Operating Time (Hours)',
  'Number of Stops',
  'Total Downtime (Minutes)',
  'Production Cost per Unit',
  'Raw Materials Used (kg)',
  'Operator Name',
  'Notes'
];

export const requiredLogisticsColumns = [
  'Shipment ID',
  'Order Date',
  'Delivery Date',
  'Expected Delivery Date',
  'Shipment Status',
  'Vehicle ID',
  'Driver ID',
  'Vehicle Type',
  'Fuel Consumption (L)',
  'Total Distance (km)',
  'Breakdown Count',
  'Shipping Cost',
  'Fuel Cost',
  'Total Operating Cost',
  'Revenue per Shipment',
  'Customer ID',
  'Customer Location',
  'Delivery Time (Minutes)',
  'Customer Rating',
  'Delay Reason',
  'Delay Duration (Minutes)',
  'Number of Stops'
];

export const requiredHRColumns = [
  'Employee ID',
  'Name',
  'Department',
  'Job Title',
  'Hire Date',
  'Contract Type',
  'Monthly Salary',
  'Performance Rating',
  'Absences (Days)',
  'Training Hours'
];

export const requiredFinanceColumns = [
  'Transaction ID',
  'Date',
  'Category',
  'Amount',
  'Payment Method',
  'Account Balance',
  'Revenue',
  'Expenses',
  'Profit',
  'Tax Rate (%)',
  'Tax Amount',
  'Net Profit',
  'Department',
  'Approval Status'
];

export const requiredOperationsColumns = [
  'Project Name',
  'Task Name',
  'Assigned Employee',
  'Task Start Date',
  'Task Due Date',
  'Task Status',
  'Task Progress (%)',
  'Task Priority',
  'Work Hours Allocated',
  'Work Hours Spent',
  'Task Quality Score',
  'Task Completion Satisfaction'
];

export interface ValidationResult {
  isValid: boolean;
  normalizedHeaders?: string[];
  missingColumns?: string[];
  message: string;
}

export const validateFileColumns = async (file: File, industry: string): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = read(data, { type: 'array' });
      
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const headers = utils.sheet_to_json(firstSheet, { header: 1 })[0] as string[];
      
      const normalizedHeaders = headers.map(header => 
        typeof header === 'string' ? header.trim() : String(header).trim()
      );
      
      let requiredColumns;
      switch (industry) {
        case 'restaurants':
          requiredColumns = requiredRestaurantColumns;
          break;
        case 'hotels':
          requiredColumns = requiredHotelColumns;
          break;
        case 'manufacturing':
          requiredColumns = requiredManufacturingColumns;
          break;
        case 'logistics':
          requiredColumns = requiredLogisticsColumns;
          break;
        case 'hr':
          requiredColumns = requiredHRColumns;
          break;
        case 'finance':
          requiredColumns = requiredFinanceColumns;
          break;
        case 'operations':
          requiredColumns = requiredOperationsColumns;
          break;
        default:
          requiredColumns = requiredRetailColumns;
      }
      
      const missingColumns = requiredColumns.filter(required =>
        !normalizedHeaders.some(header => 
          header.toLowerCase() === required.toLowerCase()
        )
      );
      
      if (missingColumns.length === 0) {
        const correctedHeaders = headers.map(header => {
          const matchingRequired = requiredColumns.find(required =>
            required.toLowerCase() === header.toLowerCase()
          );
          return matchingRequired || header;
        });
        
        resolve({
          isValid: true,
          normalizedHeaders: correctedHeaders,
          message: 'File structure is valid!'
        });
      } else {
        resolve({
          isValid: false,
          missingColumns,
          message: `Missing required columns: ${missingColumns.join(', ')}`
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
  });
};