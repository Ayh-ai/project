import { read, utils } from 'xlsx';

export interface ManufacturingData {
  'Production Date': string;
  'Production Line Number': number;
  'Product Name': string;
  'Production Quantity': number;
  'Defective Units': number;
  'Operating Time (Hours)': number;
  'Number of Stops': number;
  'Total Downtime (Minutes)': number;
  'Production Cost per Unit': number;
  'Raw Materials Used (kg)': number;
  'Operator Name': string;
  'Notes': string;
}

export interface ProductionLineMetrics {
  lineNumber: string;
  totalProduction: number;
  totalDefects: number;
  defectRate: number;
  operatingTime: number;
  downtime: number;
  breakdownRate: number;
  totalCost: number;
  averageCost: number;
  efficiency: number;
  rawMaterialUsage: number;
  rawMaterialWaste: number;
}

export interface ProductMetrics {
  name: string;
  totalProduction: number;
  defects: number;
  defectRate: number;
  averageCost: number;
  materialUsage: number;
}

export interface ProcessedManufacturingData {
  totalProduction: number;
  totalDefects: number;
  defectRate: number;
  averageOperatingTime: number;
  totalDowntime: number;
  totalStops: number;
  averageProductionCost: number;
  totalRawMaterials: number;
  productionByLine: { [key: string]: number };
  defectsByLine: { [key: string]: number };
  productionByProduct: { [key: string]: number };
  operatorPerformance: Array<{
    operator: string;
    production: number;
    defects: number;
    efficiency: number;
  }>;
  downtimeByLine: { [key: string]: number };
  productionLineMetrics: ProductionLineMetrics[];
  productMetrics: ProductMetrics[];
  daysWithHighDefectRate: Array<{
    date: string;
    defectRate: number;
  }>;
  averageProductionEfficiency: number;
  averageOperatingTimePerLine: number;
  averageBreakdownRate: number;
  averageRawMaterialUsage: number;
  averageRawMaterialWaste: number;
  efficiencyThreshold: number;
  defectRateThreshold: number;
  downtimeThreshold: number;
  costBenchmark: number;
  availableMonths: Array<{ value: string; label: string }>;
}

const EFFICIENCY_THRESHOLD = 85;
const DEFECT_RATE_THRESHOLD = 5;
const DOWNTIME_THRESHOLD = 240;
const COST_BENCHMARK = 50;
const EXPECTED_MATERIAL_PER_UNIT = 1.0;

const calculateColumnAverage = (data: any[], columnName: string): number => {
  const validValues = data
    .map(row => Number(row[columnName]))
    .filter(value => !isNaN(value) && value !== null && value !== undefined);
  
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

const parseDate = (dateStr: string): Date => {
  // Try parsing different date formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try parsing Excel date number
  const excelDate = parseInt(dateStr);
  if (!isNaN(excelDate)) {
    // Excel dates are counted from 1900-01-01
    const date = new Date(1900, 0, 1);
    date.setDate(date.getDate() + excelDate - 2); // Subtract 2 to account for Excel's date system
    return date;
  }

  // Return current date as fallback
  return new Date();
};

const handleMissingValues = (data: any[]): ManufacturingData[] => {
  const avgProductionQuantity = calculateColumnAverage(data, 'Production Quantity');
  const avgDefectiveUnits = calculateColumnAverage(data, 'Defective Units');
  const avgOperatingTime = calculateColumnAverage(data, 'Operating Time (Hours)');
  const avgStops = calculateColumnAverage(data, 'Number of Stops');
  const avgDowntime = calculateColumnAverage(data, 'Total Downtime (Minutes)');
  const avgProductionCost = calculateColumnAverage(data, 'Production Cost per Unit');
  const avgRawMaterials = calculateColumnAverage(data, 'Raw Materials Used (kg)');

  return data.map(row => {
    const productionDate = parseDate(row['Production Date']);
    
    return {
      'Production Date': productionDate.toISOString(),
      'Production Line Number': Number(row['Production Line Number']) || 1,
      'Product Name': row['Product Name'] || 'Unspecified',
      'Production Quantity': Number(row['Production Quantity']) || avgProductionQuantity || 0,
      'Defective Units': Number(row['Defective Units']) || avgDefectiveUnits || 0,
      'Operating Time (Hours)': Number(row['Operating Time (Hours)']) || avgOperatingTime || 0,
      'Number of Stops': Number(row['Number of Stops']) || avgStops || 0,
      'Total Downtime (Minutes)': Number(row['Total Downtime (Minutes)']) || avgDowntime || 0,
      'Production Cost per Unit': Number(row['Production Cost per Unit']) || avgProductionCost || 0,
      'Raw Materials Used (kg)': Number(row['Raw Materials Used (kg)']) || avgRawMaterials || 0,
      'Operator Name': row['Operator Name'] || 'Unspecified',
      'Notes': row['Notes'] || ''
    };
  });
};

export const processManufacturingData = async (file: File, selectedMonth?: string): Promise<ProcessedManufacturingData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = utils.sheet_to_json(worksheet);
        const jsonData = handleMissingValues(rawData);

        // Get available months from Production Date
        const availableMonths = [...new Set(jsonData.map(row => {
          const date = new Date(row['Production Date']);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }))].sort().map(month => {
          const [year, monthNum] = month.split('-');
          const date = new Date(parseInt(year), parseInt(monthNum) - 1);
          return {
            value: month,
            label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
          };
        });

        // Filter data by selected month
        const filteredData = selectedMonth
          ? jsonData.filter(row => {
              const date = new Date(row['Production Date']);
              const rowMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              return rowMonth === selectedMonth;
            })
          : jsonData;

        if (filteredData.length === 0) {
          resolve({
            totalProduction: 0,
            totalDefects: 0,
            defectRate: 0,
            averageOperatingTime: 0,
            totalDowntime: 0,
            totalStops: 0,
            averageProductionCost: 0,
            totalRawMaterials: 0,
            productionByLine: {},
            defectsByLine: {},
            productionByProduct: {},
            operatorPerformance: [],
            downtimeByLine: {},
            productionLineMetrics: [],
            productMetrics: [],
            daysWithHighDefectRate: [],
            averageProductionEfficiency: 0,
            averageOperatingTimePerLine: 0,
            averageBreakdownRate: 0,
            averageRawMaterialUsage: 0,
            averageRawMaterialWaste: 0,
            efficiencyThreshold: EFFICIENCY_THRESHOLD,
            defectRateThreshold: DEFECT_RATE_THRESHOLD,
            downtimeThreshold: DOWNTIME_THRESHOLD,
            costBenchmark: COST_BENCHMARK,
            availableMonths
          });
          return;
        }

        // Process production line metrics
        const lineMetricsMap = new Map<number, ProductionLineMetrics>();
        const productMetricsMap = new Map<string, ProductMetrics>();
        const daysWithHighDefectRate: Array<{ date: string; defectRate: number }> = [];

        // Initialize aggregates
        let totalProduction = 0;
        let totalDefects = 0;
        let totalOperatingTime = 0;
        let totalDowntime = 0;
        let totalStops = 0;
        let totalCost = 0;
        let totalRawMaterials = 0;

        // Process each row
        filteredData.forEach(row => {
          const lineNumber = row['Production Line Number'];
          const lineKey = `Line ${lineNumber}`;
          
          // Update totals
          totalProduction += row['Production Quantity'];
          totalDefects += row['Defective Units'];
          totalOperatingTime += row['Operating Time (Hours)'];
          totalDowntime += row['Total Downtime (Minutes)'];
          totalStops += row['Number of Stops'];
          totalCost += row['Production Cost per Unit'] * row['Production Quantity'];
          totalRawMaterials += row['Raw Materials Used (kg)'];

          // Process line metrics
          if (!lineMetricsMap.has(lineNumber)) {
            lineMetricsMap.set(lineNumber, {
              lineNumber: lineKey,
              totalProduction: 0,
              totalDefects: 0,
              defectRate: 0,
              operatingTime: 0,
              downtime: 0,
              breakdownRate: 0,
              totalCost: 0,
              averageCost: 0,
              efficiency: 0,
              rawMaterialUsage: 0,
              rawMaterialWaste: 0
            });
          }

          const lineMetrics = lineMetricsMap.get(lineNumber)!;
          lineMetrics.totalProduction += row['Production Quantity'];
          lineMetrics.totalDefects += row['Defective Units'];
          lineMetrics.operatingTime += row['Operating Time (Hours)'];
          lineMetrics.downtime += row['Total Downtime (Minutes)'];
          lineMetrics.totalCost += row['Production Cost per Unit'] * row['Production Quantity'];
          lineMetrics.rawMaterialUsage += row['Raw Materials Used (kg)'];

          // Update calculations
          lineMetrics.defectRate = (lineMetrics.totalDefects / lineMetrics.totalProduction) * 100;
          lineMetrics.breakdownRate = (lineMetrics.downtime / (lineMetrics.operatingTime * 60)) * 100;
          lineMetrics.averageCost = lineMetrics.totalCost / lineMetrics.totalProduction;
          lineMetrics.efficiency = ((lineMetrics.totalProduction - lineMetrics.totalDefects) / lineMetrics.totalProduction) * 100;
          lineMetrics.rawMaterialWaste = ((lineMetrics.rawMaterialUsage - (lineMetrics.totalProduction * EXPECTED_MATERIAL_PER_UNIT)) / lineMetrics.rawMaterialUsage) * 100;

          // Process product metrics
          if (!productMetricsMap.has(row['Product Name'])) {
            productMetricsMap.set(row['Product Name'], {
              name: row['Product Name'],
              totalProduction: 0,
              defects: 0,
              defectRate: 0,
              averageCost: 0,
              materialUsage: 0
            });
          }

          const productMetrics = productMetricsMap.get(row['Product Name'])!;
          productMetrics.totalProduction += row['Production Quantity'];
          productMetrics.defects += row['Defective Units'];
          productMetrics.materialUsage += row['Raw Materials Used (kg)'];
          productMetrics.defectRate = (productMetrics.defects / productMetrics.totalProduction) * 100;
          productMetrics.averageCost = row['Production Cost per Unit'];

          // Check for high defect rate days
          const dailyDefectRate = (row['Defective Units'] / row['Production Quantity']) * 100;
          if (dailyDefectRate > DEFECT_RATE_THRESHOLD) {
            daysWithHighDefectRate.push({
              date: row['Production Date'],
              defectRate: dailyDefectRate
            });
          }
        });

        // Calculate averages and prepare final metrics
        const productionLineMetrics = Array.from(lineMetricsMap.values());
        const productMetrics = Array.from(productMetricsMap.values())
          .sort((a, b) => b.defectRate - a.defectRate);

        const averageProductionEfficiency = ((totalProduction - totalDefects) / totalProduction) * 100;
        const uniqueLines = new Set(filteredData.map(row => row['Production Line Number'])).size;
        const averageOperatingTimePerLine = totalOperatingTime / uniqueLines;
        const averageBreakdownRate = (totalDowntime / (totalOperatingTime * 60)) * 100;
        const averageRawMaterialUsage = totalRawMaterials / totalProduction;
        const averageRawMaterialWaste = ((totalRawMaterials - (totalProduction * EXPECTED_MATERIAL_PER_UNIT)) / totalRawMaterials) * 100;

        resolve({
          totalProduction,
          totalDefects,
          defectRate: (totalDefects / totalProduction) * 100,
          averageOperatingTime: totalOperatingTime / filteredData.length,
          totalDowntime,
          totalStops,
          averageProductionCost: totalCost / totalProduction,
          totalRawMaterials,
          productionByLine: Object.fromEntries(
            productionLineMetrics.map(line => [line.lineNumber, line.totalProduction])
          ),
          defectsByLine: Object.fromEntries(
            productionLineMetrics.map(line => [line.lineNumber, line.totalDefects])
          ),
          productionByProduct: Object.fromEntries(
            productMetrics.map(product => [product.name, product.totalProduction])
          ),
          operatorPerformance: [],
          downtimeByLine: Object.fromEntries(
            productionLineMetrics.map(line => [line.lineNumber, line.downtime])
          ),
          productionLineMetrics,
          productMetrics,
          daysWithHighDefectRate,
          averageProductionEfficiency,
          averageOperatingTimePerLine,
          averageBreakdownRate,
          averageRawMaterialUsage,
          averageRawMaterialWaste,
          efficiencyThreshold: EFFICIENCY_THRESHOLD,
          defectRateThreshold: DEFECT_RATE_THRESHOLD,
          downtimeThreshold: DOWNTIME_THRESHOLD,
          costBenchmark: COST_BENCHMARK,
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