import { read, utils } from 'xlsx';

export interface LogisticsData {
  'Shipment ID': string;
  'Order Date': string;
  'Delivery Date': string;
  'Expected Delivery Date': string;
  'Shipment Status': string;
  'Vehicle ID': string;
  'Driver ID': string;
  'Vehicle Type': string;
  'Fuel Consumption (L)': number;
  'Total Distance (km)': number;
  'Breakdown Count': number;
  'Shipping Cost': number;
  'Fuel Cost': number;
  'Total Operating Cost': number;
  'Revenue per Shipment': number;
  'Customer ID': string;
  'Customer Location': string;
  'Delivery Time (Minutes)': number;
  'Customer Rating': number;
  'Delay Reason': string;
  'Delay Duration (Minutes)': number;
  'Number of Stops': number;
}

export interface ProcessedLogisticsData {
  // General Performance
  totalShipments: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
  delayedShipmentsRate: number;
  averageDelayDuration: number;

  // Cost & Profitability
  totalOperatingCosts: number;
  averageOperatingCost: number;
  totalRevenue: number;
  averageRevenue: number;
  profitMargin: number;

  // Fuel & Efficiency
  totalFuelConsumption: number;
  averageFuelConsumption: number;
  averageFuelCost: number;
  averageDistance: number;

  // Breakdowns & Maintenance
  totalBreakdowns: number;
  averageBreakdownsPerVehicle: number;
  shipmentsAffectedByBreakdowns: number;

  // Customer Satisfaction
  averageCustomerRating: number;
  lowRatedShipmentsPercentage: number;
  shipmentsByLocation: { [key: string]: number };

  // Delay Analysis
  delaysByReason: { [key: string]: number };
  delayReasonDistribution: { [key: string]: number };

  // Vehicle Performance
  vehiclePerformance: Array<{
    vehicleId: string;
    type: string;
    totalShipments: number;
    onTimeRate: number;
    averageFuelConsumption: number;
    breakdowns: number;
  }>;

  // Driver Performance
  driverPerformance: Array<{
    driverId: string;
    totalShipments: number;
    onTimeRate: number;
    averageRating: number;
    totalDelays: number;
  }>;

  // Time-based Analysis
  shipmentsByDayOfWeek: { [key: string]: number };
  shipmentsByTimeOfDay: { [key: string]: number };

  availableMonths: Array<{ value: string; label: string }>;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const calculateColumnAverage = (data: any[], columnName: string): number => {
  const validValues = data
    .map(row => Number(row[columnName]))
    .filter(value => !isNaN(value) && value !== null && value !== undefined);
  
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

const handleMissingValues = (data: any[]): LogisticsData[] => {
  const avgFuelConsumption = calculateColumnAverage(data, 'Fuel Consumption (L)');
  const avgDistance = calculateColumnAverage(data, 'Total Distance (km)');
  const avgBreakdowns = calculateColumnAverage(data, 'Breakdown Count');
  const avgShippingCost = calculateColumnAverage(data, 'Shipping Cost');
  const avgFuelCost = calculateColumnAverage(data, 'Fuel Cost');
  const avgOperatingCost = calculateColumnAverage(data, 'Total Operating Cost');
  const avgRevenue = calculateColumnAverage(data, 'Revenue per Shipment');
  const avgDeliveryTime = calculateColumnAverage(data, 'Delivery Time (Minutes)');
  const avgRating = calculateColumnAverage(data, 'Customer Rating');
  const avgDelayDuration = calculateColumnAverage(data, 'Delay Duration (Minutes)');
  const avgStops = calculateColumnAverage(data, 'Number of Stops');

  return data.map(row => ({
    'Shipment ID': row['Shipment ID'] || 'Unknown',
    'Order Date': row['Order Date'] || new Date().toISOString(),
    'Delivery Date': row['Delivery Date'] || new Date().toISOString(),
    'Expected Delivery Date': row['Expected Delivery Date'] || new Date().toISOString(),
    'Shipment Status': row['Shipment Status'] || 'Unknown',
    'Vehicle ID': row['Vehicle ID'] || 'Unknown',
    'Driver ID': row['Driver ID'] || 'Unknown',
    'Vehicle Type': row['Vehicle Type'] || 'Unknown',
    'Fuel Consumption (L)': Number(row['Fuel Consumption (L)']) || avgFuelConsumption,
    'Total Distance (km)': Number(row['Total Distance (km)']) || avgDistance,
    'Breakdown Count': Number(row['Breakdown Count']) || avgBreakdowns,
    'Shipping Cost': Number(row['Shipping Cost']) || avgShippingCost,
    'Fuel Cost': Number(row['Fuel Cost']) || avgFuelCost,
    'Total Operating Cost': Number(row['Total Operating Cost']) || avgOperatingCost,
    'Revenue per Shipment': Number(row['Revenue per Shipment']) || avgRevenue,
    'Customer ID': row['Customer ID'] || 'Unknown',
    'Customer Location': row['Customer Location'] || 'Unknown',
    'Delivery Time (Minutes)': Number(row['Delivery Time (Minutes)']) || avgDeliveryTime,
    'Customer Rating': Number(row['Customer Rating']) || avgRating,
    'Delay Reason': row['Delay Reason'] || 'Unknown',
    'Delay Duration (Minutes)': Number(row['Delay Duration (Minutes)']) || avgDelayDuration,
    'Number of Stops': Number(row['Number of Stops']) || avgStops
  }));
};

export const processLogisticsData = async (file: File, selectedMonth?: string): Promise<ProcessedLogisticsData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = utils.sheet_to_json(worksheet);
        const jsonData = handleMissingValues(rawData);

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

        const filteredData = selectedMonth
          ? jsonData.filter(row => {
              const date = new Date(row['Order Date']);
              const rowMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              return rowMonth === selectedMonth;
            })
          : jsonData;

        if (filteredData.length === 0) {
          resolve({
            totalShipments: 0,
            onTimeDeliveryRate: 0,
            averageDeliveryTime: 0,
            delayedShipmentsRate: 0,
            averageDelayDuration: 0,
            totalOperatingCosts: 0,
            averageOperatingCost: 0,
            totalRevenue: 0,
            averageRevenue: 0,
            profitMargin: 0,
            totalFuelConsumption: 0,
            averageFuelConsumption: 0,
            averageFuelCost: 0,
            averageDistance: 0,
            totalBreakdowns: 0,
            averageBreakdownsPerVehicle: 0,
            shipmentsAffectedByBreakdowns: 0,
            averageCustomerRating: 0,
            lowRatedShipmentsPercentage: 0,
            shipmentsByLocation: {},
            delaysByReason: {},
            delayReasonDistribution: {},
            vehiclePerformance: [],
            driverPerformance: [],
            shipmentsByDayOfWeek: {},
            shipmentsByTimeOfDay: {},
            availableMonths
          });
          return;
        }

        // Process vehicle performance
        const vehicleMap = new Map<string, {
          type: string;
          shipments: number;
          onTimeDeliveries: number;
          fuelConsumption: number;
          breakdowns: number;
        }>();

        // Process driver performance
        const driverMap = new Map<string, {
          shipments: number;
          onTimeDeliveries: number;
          totalRating: number;
          delays: number;
        }>();

        // Initialize aggregators
        let totalOperatingCosts = 0;
        let totalRevenue = 0;
        let totalFuelConsumption = 0;
        let totalDistance = 0;
        let totalBreakdowns = 0;
        let totalDelayedShipments = 0;
        let totalDeliveryTime = 0;
        let totalDelayDuration = 0;
        let totalCustomerRating = 0;
        let lowRatedShipments = 0;
        const shipmentsByLocation: { [key: string]: number } = {};
        const delaysByReason: { [key: string]: number } = {};
        const shipmentsByDayOfWeek: { [key: string]: number } = {};
        const shipmentsByTimeOfDay: { [key: string]: number } = {};

        // Process each shipment
        filteredData.forEach(shipment => {
          // Update totals
          totalOperatingCosts += shipment['Total Operating Cost'];
          totalRevenue += shipment['Revenue per Shipment'];
          totalFuelConsumption += shipment['Fuel Consumption (L)'];
          totalDistance += shipment['Total Distance (km)'];
          totalBreakdowns += shipment['Breakdown Count'];
          totalDeliveryTime += shipment['Delivery Time (Minutes)'];
          totalCustomerRating += shipment['Customer Rating'];

          // Process delays
          if (shipment['Delay Duration (Minutes)'] > 0) {
            totalDelayedShipments++;
            totalDelayDuration += shipment['Delay Duration (Minutes)'];
            delaysByReason[shipment['Delay Reason']] = 
              (delaysByReason[shipment['Delay Reason']] || 0) + 1;
          }

          // Process customer ratings
          if (shipment['Customer Rating'] < 3) {
            lowRatedShipments++;
          }

          // Process location data
          shipmentsByLocation[shipment['Customer Location']] = 
            (shipmentsByLocation[shipment['Customer Location']] || 0) + 1;

          // Process time-based data
          const orderDate = new Date(shipment['Order Date']);
          const dayOfWeek = daysOfWeek[orderDate.getDay()];
          shipmentsByDayOfWeek[dayOfWeek] = (shipmentsByDayOfWeek[dayOfWeek] || 0) + 1;

          const hour = orderDate.getHours();
          const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
          shipmentsByTimeOfDay[timeSlot] = (shipmentsByTimeOfDay[timeSlot] || 0) + 1;

          // Process vehicle data
          if (!vehicleMap.has(shipment['Vehicle ID'])) {
            vehicleMap.set(shipment['Vehicle ID'], {
              type: shipment['Vehicle Type'],
              shipments: 0,
              onTimeDeliveries: 0,
              fuelConsumption: 0,
              breakdowns: 0
            });
          }
          const vehicleData = vehicleMap.get(shipment['Vehicle ID'])!;
          vehicleData.shipments++;
          vehicleData.fuelConsumption += shipment['Fuel Consumption (L)'];
          vehicleData.breakdowns += shipment['Breakdown Count'];
          if (shipment['Delay Duration (Minutes)'] === 0) {
            vehicleData.onTimeDeliveries++;
          }

          // Process driver data
          if (!driverMap.has(shipment['Driver ID'])) {
            driverMap.set(shipment['Driver ID'], {
              shipments: 0,
              onTimeDeliveries: 0,
              totalRating: 0,
              delays: 0
            });
          }
          const driverData = driverMap.get(shipment['Driver ID'])!;
          driverData.shipments++;
          driverData.totalRating += shipment['Customer Rating'];
          if (shipment['Delay Duration (Minutes)'] === 0) {
            driverData.onTimeDeliveries++;
          } else {
            driverData.delays++;
          }
        });

        // Calculate final metrics
        const totalShipments = filteredData.length;
        const onTimeDeliveryRate = ((totalShipments - totalDelayedShipments) / totalShipments) * 100;
        const averageDeliveryTime = totalDeliveryTime / totalShipments;
        const delayedShipmentsRate = (totalDelayedShipments / totalShipments) * 100;
        const averageDelayDuration = totalDelayDuration / totalDelayedShipments;
        const averageOperatingCost = totalOperatingCosts / totalShipments;
        const averageRevenue = totalRevenue / totalShipments;
        const profitMargin = ((totalRevenue - totalOperatingCosts) / totalRevenue) * 100;
        const averageFuelConsumption = totalFuelConsumption / totalDistance;
        const averageFuelCost = filteredData.reduce((sum, shipment) => 
          sum + shipment['Fuel Cost'], 0) / totalShipments;
        const averageDistance = totalDistance / totalShipments;
        const uniqueVehicles = vehicleMap.size;
        const averageBreakdownsPerVehicle = totalBreakdowns / uniqueVehicles;
        const shipmentsAffectedByBreakdowns = (filteredData.filter(
          shipment => shipment['Breakdown Count'] > 0
        ).length / totalShipments) * 100;
        const averageCustomerRating = totalCustomerRating / totalShipments;
        const lowRatedShipmentsPercentage = (lowRatedShipments / totalShipments) * 100;

        // Prepare vehicle performance data
        const vehiclePerformance = Array.from(vehicleMap.entries()).map(([vehicleId, data]) => ({
          vehicleId,
          type: data.type,
          totalShipments: data.shipments,
          onTimeRate: (data.onTimeDeliveries / data.shipments) * 100,
          averageFuelConsumption: data.fuelConsumption / data.shipments,
          breakdowns: data.breakdowns
        }));

        // Prepare driver performance data
        const driverPerformance = Array.from(driverMap.entries()).map(([driverId, data]) => ({
          driverId,
          totalShipments: data.shipments,
          onTimeRate: (data.onTimeDeliveries / data.shipments) * 100,
          averageRating: data.totalRating / data.shipments,
          totalDelays: data.delays
        }));

        // Calculate delay reason distribution
        const totalDelays = Object.values(delaysByReason).reduce((a, b) => a + b, 0);
        const delayReasonDistribution = Object.entries(delaysByReason).reduce((acc, [reason, count]) => {
          acc[reason] = (count / totalDelays) * 100;
          return acc;
        }, {} as { [key: string]: number });

        resolve({
          totalShipments,
          onTimeDeliveryRate,
          averageDeliveryTime,
          delayedShipmentsRate,
          averageDelayDuration,
          totalOperatingCosts,
          averageOperatingCost,
          totalRevenue,
          averageRevenue,
          profitMargin,
          totalFuelConsumption,
          averageFuelConsumption,
          averageFuelCost,
          averageDistance,
          totalBreakdowns,
          averageBreakdownsPerVehicle,
          shipmentsAffectedByBreakdowns,
          averageCustomerRating,
          lowRatedShipmentsPercentage,
          shipmentsByLocation,
          delaysByReason,
          delayReasonDistribution,
          vehiclePerformance,
          driverPerformance,
          shipmentsByDayOfWeek,
          shipmentsByTimeOfDay,
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