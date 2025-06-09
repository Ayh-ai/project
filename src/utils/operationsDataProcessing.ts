import { read, utils } from 'xlsx';

export interface OperationsData {
  'Project Name': string;
  'Task Name': string;
  'Assigned Employee': string;
  'Task Start Date': string;
  'Task Due Date': string;
  'Task Status': string;
  'Task Progress (%)': number;
  'Task Priority': string;
  'Work Hours Allocated': number;
  'Work Hours Spent': number;
  'Task Quality Score': number;
  'Task Completion Satisfaction': number;
}

export interface ProjectMetrics {
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageProgress: number;
  averageQualityScore: number;
  averageSatisfaction: number;
  totalHoursAllocated: number;
  totalHoursSpent: number;
  highPriorityTasks: number;
}

export interface ProcessedOperationsData {
  // Task Completion Metrics
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  averageTaskProgress: number;
  overdueTasks: number;
  
  // Work Hours Metrics
  totalHoursAllocated: number;
  totalHoursSpent: number;
  averageHoursPerTask: number;
  hoursUtilizationRate: number;
  
  // Quality Metrics
  averageQualityScore: number;
  averageSatisfaction: number;
  highPriorityTasksCount: number;
  
  // Trends and Distributions
  taskCompletionTrend: { [key: string]: number };
  taskProgressDistribution: { [key: string]: number };
  taskStatusDistribution: { [key: string]: number };
  qualityScoreDistribution: { [key: string]: number };
  satisfactionTrend: { [key: string]: number };
  priorityDistribution: { [key: string]: number };
  
  // Project Performance
  projectMetrics: ProjectMetrics[];
  
  // Employee Performance
  employeePerformance: Array<{
    employee: string;
    tasksAssigned: number;
    tasksCompleted: number;
    averageQuality: number;
    averageSatisfaction: number;
    onTimeCompletion: number;
  }>;
  
  // High Priority Tasks
  highPriorityTasksByMonth: { [key: string]: number };
  
  // Risk Areas
  riskAreas: Array<{
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

const handleMissingValues = (data: any[]): OperationsData[] => {
  const avgProgress = calculateColumnAverage(data, 'Task Progress (%)');
  const avgHoursAllocated = calculateColumnAverage(data, 'Work Hours Allocated');
  const avgHoursSpent = calculateColumnAverage(data, 'Work Hours Spent');
  const avgQualityScore = calculateColumnAverage(data, 'Task Quality Score');
  const avgSatisfaction = calculateColumnAverage(data, 'Task Completion Satisfaction');

  return data.map(row => ({
    'Project Name': row['Project Name'] || 'Unspecified Project',
    'Task Name': row['Task Name'] || 'Unspecified Task',
    'Assigned Employee': row['Assigned Employee'] || 'Unassigned',
    'Task Start Date': row['Task Start Date'] || new Date().toISOString(),
    'Task Due Date': row['Task Due Date'] || new Date().toISOString(),
    'Task Status': row['Task Status'] || 'Not Started',
    'Task Progress (%)': Number(row['Task Progress (%)']) || avgProgress || 0,
    'Task Priority': row['Task Priority'] || 'Medium',
    'Work Hours Allocated': Number(row['Work Hours Allocated']) || avgHoursAllocated || 0,
    'Work Hours Spent': Number(row['Work Hours Spent']) || avgHoursSpent || 0,
    'Task Quality Score': Number(row['Task Quality Score']) || avgQualityScore || 0,
    'Task Completion Satisfaction': Number(row['Task Completion Satisfaction']) || avgSatisfaction || 0
  }));
};

export const processOperationsData = async (file: File, selectedMonth?: string): Promise<ProcessedOperationsData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = utils.sheet_to_json(worksheet);
        const jsonData = handleMissingValues(rawData);

        // Get available months from start dates
        const availableMonths = [...new Set(jsonData.map(row => {
          const date = new Date(row['Task Start Date']);
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
              const date = new Date(row['Task Start Date']);
              const rowMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              return rowMonth === selectedMonth;
            })
          : jsonData;

        if (filteredData.length === 0) {
          resolve({
            totalTasks: 0,
            completedTasks: 0,
            taskCompletionRate: 0,
            averageTaskProgress: 0,
            overdueTasks: 0,
            totalHoursAllocated: 0,
            totalHoursSpent: 0,
            averageHoursPerTask: 0,
            hoursUtilizationRate: 0,
            averageQualityScore: 0,
            averageSatisfaction: 0,
            highPriorityTasksCount: 0,
            taskCompletionTrend: {},
            taskProgressDistribution: {},
            taskStatusDistribution: {},
            qualityScoreDistribution: {},
            satisfactionTrend: {},
            priorityDistribution: {},
            projectMetrics: [],
            employeePerformance: [],
            highPriorityTasksByMonth: {},
            riskAreas: [],
            availableMonths
          });
          return;
        }

        // Process project metrics
        const projectMap = new Map<string, ProjectMetrics>();
        const employeeMap = new Map<string, {
          tasksAssigned: number;
          tasksCompleted: number;
          qualityScores: number[];
          satisfactionScores: number[];
          onTimeCompletions: number;
        }>();

        // Initialize aggregators
        let totalTasks = filteredData.length;
        let completedTasks = 0;
        let overdueTasks = 0;
        let totalProgress = 0;
        let totalHoursAllocated = 0;
        let totalHoursSpent = 0;
        let totalQualityScore = 0;
        let totalSatisfaction = 0;
        let highPriorityTasks = 0;

        const now = new Date();
        const taskStatusDistribution: { [key: string]: number } = {};
        const taskProgressDistribution: { [key: string]: number } = {};
        const qualityScoreDistribution: { [key: string]: number } = {};
        const priorityDistribution: { [key: string]: number } = {};
        const highPriorityTasksByMonth: { [key: string]: number } = {};

        // Process each task
        filteredData.forEach(task => {
          // Update totals
          totalProgress += task['Task Progress (%)'];
          totalHoursAllocated += task['Work Hours Allocated'];
          totalHoursSpent += task['Work Hours Spent'];
          totalQualityScore += task['Task Quality Score'];
          totalSatisfaction += task['Task Completion Satisfaction'];

          // Check completion status
          if (task['Task Status'].toLowerCase() === 'completed') {
            completedTasks++;
          }

          // Check for overdue tasks
          const dueDate = new Date(task['Task Due Date']);
          if (dueDate < now && task['Task Status'].toLowerCase() !== 'completed') {
            overdueTasks++;
          }

          // Check priority
          if (task['Task Priority'].toLowerCase() === 'high') {
            highPriorityTasks++;
            const month = new Date(task['Task Start Date']).toLocaleString('default', { month: 'short' });
            highPriorityTasksByMonth[month] = (highPriorityTasksByMonth[month] || 0) + 1;
          }

          // Update distributions
          taskStatusDistribution[task['Task Status']] = 
            (taskStatusDistribution[task['Task Status']] || 0) + 1;

          const progressBucket = Math.floor(task['Task Progress (%)'] / 10) * 10;
          taskProgressDistribution[`${progressBucket}-${progressBucket + 10}%`] = 
            (taskProgressDistribution[`${progressBucket}-${progressBucket + 10}%`] || 0) + 1;

          const qualityBucket = Math.floor(task['Task Quality Score']);
          qualityScoreDistribution[qualityBucket] = 
            (qualityScoreDistribution[qualityBucket] || 0) + 1;

          priorityDistribution[task['Task Priority']] = 
            (priorityDistribution[task['Task Priority']] || 0) + 1;

          // Process project metrics
          if (!projectMap.has(task['Project Name'])) {
            projectMap.set(task['Project Name'], {
              projectName: task['Project Name'],
              totalTasks: 0,
              completedTasks: 0,
              overdueTasks: 0,
              averageProgress: 0,
              averageQualityScore: 0,
              averageSatisfaction: 0,
              totalHoursAllocated: 0,
              totalHoursSpent: 0,
              highPriorityTasks: 0
            });
          }

          const projectMetrics = projectMap.get(task['Project Name'])!;
          projectMetrics.totalTasks++;
          projectMetrics.totalHoursAllocated += task['Work Hours Allocated'];
          projectMetrics.totalHoursSpent += task['Work Hours Spent'];
          if (task['Task Status'].toLowerCase() === 'completed') {
            projectMetrics.completedTasks++;
          }
          if (dueDate < now && task['Task Status'].toLowerCase() !== 'completed') {
            projectMetrics.overdueTasks++;
          }
          if (task['Task Priority'].toLowerCase() === 'high') {
            projectMetrics.highPriorityTasks++;
          }
          projectMetrics.averageProgress += task['Task Progress (%)'];
          projectMetrics.averageQualityScore += task['Task Quality Score'];
          projectMetrics.averageSatisfaction += task['Task Completion Satisfaction'];

          // Process employee metrics
          if (!employeeMap.has(task['Assigned Employee'])) {
            employeeMap.set(task['Assigned Employee'], {
              tasksAssigned: 0,
              tasksCompleted: 0,
              qualityScores: [],
              satisfactionScores: [],
              onTimeCompletions: 0
            });
          }

          const employeeMetrics = employeeMap.get(task['Assigned Employee'])!;
          employeeMetrics.tasksAssigned++;
          if (task['Task Status'].toLowerCase() === 'completed') {
            employeeMetrics.tasksCompleted++;
            if (dueDate >= now) {
              employeeMetrics.onTimeCompletions++;
            }
          }
          employeeMetrics.qualityScores.push(task['Task Quality Score']);
          employeeMetrics.satisfactionScores.push(task['Task Completion Satisfaction']);
        });

        // Calculate final metrics
        const taskCompletionRate = (completedTasks / totalTasks) * 100;
        const averageTaskProgress = totalProgress / totalTasks;
        const averageHoursPerTask = totalHoursSpent / totalTasks;
        const hoursUtilizationRate = (totalHoursSpent / totalHoursAllocated) * 100;
        const averageQualityScore = totalQualityScore / totalTasks;
        const averageSatisfaction = totalSatisfaction / totalTasks;

        // Finalize project metrics
        const projectMetrics = Array.from(projectMap.values()).map(project => ({
          ...project,
          averageProgress: project.averageProgress / project.totalTasks,
          averageQualityScore: project.averageQualityScore / project.totalTasks,
          averageSatisfaction: project.averageSatisfaction / project.totalTasks
        }));

        // Finalize employee metrics
        const employeePerformance = Array.from(employeeMap.entries()).map(([employee, metrics]) => ({
          employee,
          tasksAssigned: metrics.tasksAssigned,
          tasksCompleted: metrics.tasksCompleted,
          averageQuality: metrics.qualityScores.reduce((a, b) => a + b, 0) / metrics.qualityScores.length,
          averageSatisfaction: metrics.satisfactionScores.reduce((a, b) => a + b, 0) / metrics.satisfactionScores.length,
          onTimeCompletion: (metrics.onTimeCompletions / metrics.tasksCompleted) * 100
        }));

        // Generate risk areas
        const riskAreas = [];

        if (taskCompletionRate < 70) {
          riskAreas.push({
            area: 'Task Completion',
            risk: 'Low task completion rate indicates potential project delays',
            impact: 'high' as const,
            metric: taskCompletionRate
          });
        }

        if (overdueTasks > totalTasks * 0.2) {
          riskAreas.push({
            area: 'Overdue Tasks',
            risk: 'High number of overdue tasks requires immediate attention',
            impact: 'high' as const,
            metric: overdueTasks
          });
        }

        if (hoursUtilizationRate > 120) {
          riskAreas.push({
            area: 'Resource Utilization',
            risk: 'Teams are consistently working over allocated hours',
            impact: 'medium' as const,
            metric: hoursUtilizationRate
          });
        }

        if (averageQualityScore < 3.5) {
          riskAreas.push({
            area: 'Quality Standards',
            risk: 'Task quality scores are below acceptable threshold',
            impact: 'high' as const,
            metric: averageQualityScore
          });
        }

        // Mock data for trends (replace with actual calculations in production)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const taskCompletionTrend = months.reduce((acc, month) => {
          acc[month] = Math.random() * 30 + 70; // Random completion rate between 70-100%
          return acc;
        }, {} as { [key: string]: number });

        const satisfactionTrend = months.reduce((acc, month) => {
          acc[month] = Math.random() * 2 + 3; // Random satisfaction between 3-5
          return acc;
        }, {} as { [key: string]: number });

        resolve({
          totalTasks,
          completedTasks,
          taskCompletionRate,
          averageTaskProgress,
          overdueTasks,
          totalHoursAllocated,
          totalHoursSpent,
          averageHoursPerTask,
          hoursUtilizationRate,
          averageQualityScore,
          averageSatisfaction,
          highPriorityTasksCount: highPriorityTasks,
          taskCompletionTrend,
          taskProgressDistribution,
          taskStatusDistribution,
          qualityScoreDistribution,
          satisfactionTrend,
          priorityDistribution,
          projectMetrics,
          employeePerformance,
          highPriorityTasksByMonth,
          riskAreas,
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