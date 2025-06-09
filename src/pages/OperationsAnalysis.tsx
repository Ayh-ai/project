import  { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Timer,
  //BarChart2,
  //TrendingUp,
  Activity,
  Star,
  Flag,
  Users,
  Calendar,
  FileCheck,
  AlertOctagon,
  Gauge,
  Target,
  Award,
  ClipboardCheck
} from 'lucide-react';
import { ProcessedOperationsData, processOperationsData } from '../utils/operationsDataProcessing';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const OperationsAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProcessedOperationsData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    const file = location.state?.file;
    if (!file) {
      setError('No file provided');
      return;
    }

    processOperationsData(file, selectedMonth)
      .then(setData)
      .catch(err => setError(err.message));
  }, [location.state, selectedMonth]);
  
 

  const formatNumber = (value: number, decimals = 1) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      }
    }
  };

  const generateRecommendations = (data: ProcessedOperationsData) => {
    const recommendations = [];

    // Task Completion Analysis
    if (data.taskCompletionRate < 80) {
      recommendations.push({
        icon: CheckCircle2,
        title: "Improve Task Completion Rate",
        insight: `Current completion rate (${formatPercent(data.taskCompletionRate)}) is below target of 80%.`,
        action: "Implement daily stand-ups and task tracking to identify and address bottlenecks early.",
        priority: "high",
        color: "red"
      });
    }

    // Overdue Tasks Analysis
    if (data.overdueTasks > data.totalTasks * 0.2) {
      recommendations.push({
        icon: Clock,
        title: "Address Overdue Tasks",
        insight: `${data.overdueTasks} tasks are currently overdue (${formatPercent(data.overdueTasks/data.totalTasks)}).`,
        action: "Review task allocation and deadlines. Consider implementing a task prioritization system.",
        priority: "high",
        color: "orange"
      });
    }

    // Resource Utilization
    if (data.hoursUtilizationRate > 110) {
      recommendations.push({
        icon: Timer,
        title: "Optimize Resource Allocation",
        insight: `Teams are working ${formatPercent(data.hoursUtilizationRate - 100)} over allocated hours.`,
        action: "Review workload distribution and consider additional resource allocation where needed.",
        priority: "medium",
        color: "yellow"
      });
    }

    // Quality Metrics
    if (data.averageQualityScore < 4) {
      recommendations.push({
        icon: Star,
        title: "Enhance Task Quality",
        insight: `Average quality score (${formatNumber(data.averageQualityScore)}/5) needs improvement.`,
        action: "Implement quality checkpoints and peer review processes for critical tasks.",
        priority: "medium",
        color: "blue"
      });
    }

    // High Priority Tasks
    if (data.highPriorityTasksCount > data.totalTasks * 0.3) {
      recommendations.push({
        icon: Flag,
        title: "Review Task Prioritization",
        insight: `${formatPercent(data.highPriorityTasksCount/data.totalTasks)} of tasks are marked as high priority.`,
        action: "Review and refine task prioritization criteria to ensure proper resource allocation.",
        priority: "medium",
        color: "purple"
      });
    }

    // Employee Performance
    const lowPerformingEmployees = data.employeePerformance.filter(
      emp => emp.averageQuality < 3.5 || emp.onTimeCompletion < 70
    );
    if (lowPerformingEmployees.length > 0) {
      recommendations.push({
        icon: Users,
        title: "Address Performance Gaps",
        insight: `${lowPerformingEmployees.length} employee(s) showing below-target performance metrics.`,
        action: "Schedule one-on-one meetings to identify challenges and provide necessary support or training.",
        priority: "high",
        color: "indigo"
      });
    }

    return recommendations;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing operations data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Operations Analysis Results</h1>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Months</option>
              {data.availableMonths.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          <div className='flex gap-4'> 
                      <button
                       onClick={() => window.print()}
                       className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                           >
                         🖨️ Print to PDF
                      </button>
          
                    <button
                      onClick={() => navigate(-1)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Import
                    </button>
                    </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Task Completion Rate</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatPercent(data.taskCompletionRate)}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Progress</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatPercent(data.averageTaskProgress)}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
                <h3 className="text-2xl font-bold text-gray-900">{data.overdueTasks}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Quality Score</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatNumber(data.averageQualityScore)}/5
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Task Completion Trend */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Trend</h3>
            <div className="h-64">
              <Line
                data={{
                  labels: Object.keys(data.taskCompletionTrend),
                  datasets: [{
                    label: 'Completion Rate',
                    data: Object.values(data.taskCompletionTrend),
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Task Progress Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Progress Distribution</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: Object.keys(data.taskProgressDistribution),
                  datasets: [{
                    label: 'Tasks',
                    data: Object.values(data.taskProgressDistribution),
                    backgroundColor: 'rgba(5, 150, 105, 0.9)'
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Task Status Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
            <div className="h-64">
              <Pie
                data={{
                  labels: Object.keys(data.taskStatusDistribution),
                  datasets: [{
                    data: Object.values(data.taskStatusDistribution),
                    backgroundColor: [
                      'rgba(37, 99, 235, 0.9)',
                      'rgba(5, 150, 105, 0.9)',
                      'rgba(217, 119, 6, 0.9)',
                      'rgba(220, 38, 38, 0.9)'
                    ]
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Quality Score Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Score Distribution</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: Object.keys(data.qualityScoreDistribution),
                  datasets: [{
                    label: 'Tasks',
                    data: Object.values(data.qualityScoreDistribution),
                    backgroundColor: 'rgba(109, 40, 217, 0.9)'
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Project Performance Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Project Performance Overview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Progress
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality Score
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours Utilization
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.projectMetrics.map((project, index) => (
                  <tr 
                    key={project.projectName}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {project.totalTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(project.completedTasks / project.totalTasks)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(project.averageProgress)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatNumber(project.averageQualityScore)}/5
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(project.totalHoursSpent / project.totalHoursAllocated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Employee Performance Overview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks Assigned
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality Score
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On-Time Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.employeePerformance.map((employee, index) => (
                  <tr 
                    key={employee.employee}
                    className={`${
                      employee.averageQuality < 3.5 ? 'bg-red-50' : 
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.employee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {employee.tasksAssigned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(employee.tasksCompleted / employee.tasksAssigned)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatNumber(employee.averageQuality)}/5
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(employee.onTimeCompletion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Performance Optimization Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generateRecommendations(data).map((recommendation, index) => {
              const IconComponent = recommendation.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full bg-${recommendation.color}-100 flex-shrink-0`}>
                      <IconComponent className={`h-6 w-6 text-${recommendation.color}-600`} />
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {recommendation.title}
                        </h3>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                          recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {recommendation.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">
                        <strong>Insight:</strong> {recommendation.insight}
                      </p>
                      <p className="text-gray-600">
                        <strong>Action:</strong> {recommendation.action}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsAnalysis;