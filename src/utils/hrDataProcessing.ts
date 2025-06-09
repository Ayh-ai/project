import { read, utils } from 'xlsx';

export interface HRData {
  'Employee ID': string;
  'Name': string;
  'Department': string;
  'Job Title': string;
  'Hire Date': string;
  'Contract Type': string;
  'Monthly Salary': number;
  'Performance Rating': number;
  'Absences (Days)': number;
  'Training Hours': number;
}

export interface ProcessedHRData {
  // Key Metrics
  totalEmployees: number;
  turnoverRate: number;
  averageTenure: number;
  absenteeismRate: number;
  averageOvertimeHours: number;
  averageSatisfactionScore: number;
  averageTrainingHours: number;
  promotionRate: number;

  // Trends and Distributions
  turnoverTrend: { [key: string]: number };
  tenureByDepartment: { [key: string]: number };
  absenteeismByMonth: { [key: string]: number };
  overtimeTrend: { [key: string]: number };
  satisfactionDistribution: { [key: string]: number };
  trainingHoursByDepartment: { [key: string]: number };
  promotionsByDepartment: { [key: string]: number };

  // Department Analysis
  departmentMetrics: Array<{
    department: string;
    employeeCount: number;
    turnoverRate: number;
    averageTenure: number;
    averagePerformance: number;
  }>;

  // Performance Metrics
  performanceDistribution: { [key: string]: number };
  highPerformers: number;
  lowPerformers: number;

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

const handleMissingValues = (data: any[]): HRData[] => {
  const avgSalary = calculateColumnAverage(data, 'Monthly Salary');
  const avgPerformance = calculateColumnAverage(data, 'Performance Rating');
  const avgAbsences = calculateColumnAverage(data, 'Absences (Days)');
  const avgTraining = calculateColumnAverage(data, 'Training Hours');

  return data.map(row => ({
    'Employee ID': row['Employee ID'] || 'Unknown',
    'Name': row['Name'] || 'Unknown',
    'Department': row['Department'] || 'Unknown',
    'Job Title': row['Job Title'] || 'Unknown',
    'Hire Date': row['Hire Date'] || new Date().toISOString(),
    'Contract Type': row['Contract Type'] || 'Full-time',
    'Monthly Salary': Number(row['Monthly Salary']) || avgSalary,
    'Performance Rating': Number(row['Performance Rating']) || avgPerformance,
    'Absences (Days)': Number(row['Absences (Days)']) || avgAbsences,
    'Training Hours': Number(row['Training Hours']) || avgTraining
  }));
};

export const processHRData = async (file: File, selectedMonth?: string): Promise<ProcessedHRData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = utils.sheet_to_json(worksheet);
        const jsonData = handleMissingValues(rawData);

        // Get available months from hire dates
        const availableMonths = [...new Set(jsonData.map(row => {
          const date = new Date(row['Hire Date']);
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
              const date = new Date(row['Hire Date']);
              const rowMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              return rowMonth === selectedMonth;
            })
          : jsonData;

        if (filteredData.length === 0) {
          resolve({
            totalEmployees: 0,
            turnoverRate: 0,
            averageTenure: 0,
            absenteeismRate: 0,
            averageOvertimeHours: 0,
            averageSatisfactionScore: 0,
            averageTrainingHours: 0,
            promotionRate: 0,
            turnoverTrend: {},
            tenureByDepartment: {},
            absenteeismByMonth: {},
            overtimeTrend: {},
            satisfactionDistribution: {},
            trainingHoursByDepartment: {},
            promotionsByDepartment: {},
            departmentMetrics: [],
            performanceDistribution: {},
            highPerformers: 0,
            lowPerformers: 0,
            availableMonths
          });
          return;
        }

        // Calculate total employees
        const totalEmployees = filteredData.length;

        // Calculate turnover rate (example calculation)
        const terminatedEmployees = filteredData.filter(emp => 
          emp['Contract Type'].toLowerCase().includes('terminated')
        ).length;
        const turnoverRate = (terminatedEmployees / totalEmployees) * 100;

        // Calculate average tenure
        const now = new Date();
        const tenures = filteredData.map(emp => {
          const hireDate = new Date(emp['Hire Date']);
          return (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        });
        const averageTenure = tenures.reduce((a, b) => a + b, 0) / totalEmployees;

        // Calculate absenteeism rate
        const totalAbsences = filteredData.reduce((sum, emp) => sum + emp['Absences (Days)'], 0);
        const absenteeismRate = (totalAbsences / (totalEmployees * 260)) * 100; // 260 working days per year

        // Calculate average training hours
        const averageTrainingHours = filteredData.reduce((sum, emp) => 
          sum + emp['Training Hours'], 0) / totalEmployees;

        // Calculate performance metrics
        const performanceScores = filteredData.map(emp => emp['Performance Rating']);
        const averageSatisfactionScore = performanceScores.reduce((a, b) => a + b, 0) / totalEmployees;
        const highPerformers = performanceScores.filter(score => score >= 4).length;
        const lowPerformers = performanceScores.filter(score => score <= 2).length;

        // Calculate promotion rate (example: employees with title changes)
        const promotedEmployees = filteredData.filter(emp => 
          emp['Job Title'].toLowerCase().includes('senior') || 
          emp['Job Title'].toLowerCase().includes('lead') ||
          emp['Job Title'].toLowerCase().includes('manager')
        ).length;
        const promotionRate = (promotedEmployees / totalEmployees) * 100;

        // Process department metrics
        const departments = [...new Set(filteredData.map(emp => emp['Department']))];
        const departmentMetrics = departments.map(dept => {
          const deptEmployees = filteredData.filter(emp => emp['Department'] === dept);
          const deptCount = deptEmployees.length;
          const deptTurnover = deptEmployees.filter(emp => 
            emp['Contract Type'].toLowerCase().includes('terminated')
          ).length / deptCount * 100;
          const deptTenures = deptEmployees.map(emp => {
            const hireDate = new Date(emp['Hire Date']);
            return (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          });
          const deptAvgTenure = deptTenures.reduce((a, b) => a + b, 0) / deptCount;
          const deptAvgPerformance = deptEmployees.reduce((sum, emp) => 
            sum + emp['Performance Rating'], 0) / deptCount;

          return {
            department: dept,
            employeeCount: deptCount,
            turnoverRate: deptTurnover,
            averageTenure: deptAvgTenure,
            averagePerformance: deptAvgPerformance
          };
        });

        // Calculate distributions and trends
        const performanceDistribution = performanceScores.reduce((acc, score) => {
          const roundedScore = Math.round(score);
          acc[roundedScore] = (acc[roundedScore] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        const trainingHoursByDepartment = departments.reduce((acc, dept) => {
          const deptEmployees = filteredData.filter(emp => emp['Department'] === dept);
          acc[dept] = deptEmployees.reduce((sum, emp) => sum + emp['Training Hours'], 0) / deptEmployees.length;
          return acc;
        }, {} as { [key: string]: number });

        const tenureByDepartment = departments.reduce((acc, dept) => {
          const deptEmployees = filteredData.filter(emp => emp['Department'] === dept);
          const deptTenures = deptEmployees.map(emp => {
            const hireDate = new Date(emp['Hire Date']);
            return (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          });
          acc[dept] = deptTenures.reduce((a, b) => a + b, 0) / deptEmployees.length;
          return acc;
        }, {} as { [key: string]: number });

        // Mock data for trends (replace with actual calculations in production)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const turnoverTrend = months.reduce((acc, month) => {
          acc[month] = Math.random() * 5 + 2; // Random turnover rate between 2-7%
          return acc;
        }, {} as { [key: string]: number });

        const overtimeTrend = months.reduce((acc, month) => {
          acc[month] = Math.random() * 10 + 5; // Random overtime hours between 5-15
          return acc;
        }, {} as { [key: string]: number });

        const absenteeismByMonth = months.reduce((acc, month) => {
          acc[month] = Math.random() * 3 + 1; // Random absenteeism rate between 1-4%
          return acc;
        }, {} as { [key: string]: number });

        resolve({
          totalEmployees,
          turnoverRate,
          averageTenure,
          absenteeismRate,
          averageOvertimeHours: 10, // Example value
          averageSatisfactionScore,
          averageTrainingHours,
          promotionRate,
          turnoverTrend,
          tenureByDepartment,
          absenteeismByMonth,
          overtimeTrend,
          satisfactionDistribution: performanceDistribution,
          trainingHoursByDepartment,
          promotionsByDepartment: tenureByDepartment, // Example mapping
          departmentMetrics,
          performanceDistribution,
          highPerformers,
          lowPerformers,
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