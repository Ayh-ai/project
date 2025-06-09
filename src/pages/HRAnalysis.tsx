import React, { useEffect, useState } from 'react';
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
  Users,
  Clock,
  Calendar,
  Award,
  BookOpen,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Briefcase,
  Target,
  UserMinus,
  GraduationCap
} from 'lucide-react';
import { ProcessedHRData, processHRData } from '../utils/hrDataProcessing';

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

const HRAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProcessedHRData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const file = location.state?.file;
    if (!file) {
      setError('No file provided');
      return;
    }

    processHRData(file, selectedMonth)
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

  const generateRecommendations = (data: ProcessedHRData) => {
    const recommendations = [];

    // Turnover Analysis
    if (data.turnoverRate > 15) {
      recommendations.push({
        icon: UserMinus,
        title: "Address High Turnover",
        insight: `Current turnover rate (${formatPercent(data.turnoverRate)}) exceeds industry average.`,
        action: "Implement exit interviews, review compensation packages, and enhance employee engagement programs.",
        color: "red"
      });
    }

    // Training Development
    if (data.averageTrainingHours < 20) {
      recommendations.push({
        icon: GraduationCap,
        title: "Enhance Training Programs",
        insight: `Average training hours (${formatNumber(data.averageTrainingHours)}) below target of 20 hours.`,
        action: "Develop structured training programs and create individual development plans for employees.",
        color: "blue"
      });
    }

    // Performance Management
    if (data.lowPerformers / data.totalEmployees > 0.1) {
      recommendations.push({
        icon: Target,
        title: "Improve Performance Management",
        insight: `${formatPercent(data.lowPerformers / data.totalEmployees)} of employees are underperforming.`,
        action: "Implement regular performance reviews and provide targeted coaching for struggling employees.",
        color: "yellow"
      });
    }

    // Absenteeism Management
    if (data.absenteeismRate > 3) {
      recommendations.push({
        icon: Calendar,
        title: "Reduce Absenteeism",
        insight: `Absenteeism rate (${formatPercent(data.absenteeismRate)}) above acceptable threshold.`,
        action: "Review attendance policies and implement wellness programs to reduce unplanned absences.",
        color: "orange"
      });
    }

    // Career Development
    if (data.promotionRate < 10) {
      recommendations.push({
        icon: TrendingUp,
        title: "Enhance Career Development",
        insight: `Current promotion rate (${formatPercent(data.promotionRate)}) indicates limited growth opportunities.`,
        action: "Create clear career paths and implement mentorship programs.",
        color: "green"
      });
    }

    // Employee Satisfaction
    if (data.averageSatisfactionScore < 4) {
      recommendations.push({
        icon: Award,
        title: "Boost Employee Satisfaction",
        insight: `Average satisfaction score (${formatNumber(data.averageSatisfactionScore)}/5) needs improvement.`,
        action: "Conduct employee surveys and implement suggested improvements to workplace culture.",
        color: "purple"
      });
    }

    // Department Performance
    const underperformingDepts = data.departmentMetrics.filter(
      dept => dept.averagePerformance < 3.5
    );
    if (underperformingDepts.length > 0) {
      recommendations.push({
        icon: Briefcase,
        title: "Address Department Performance",
        insight: `${underperformingDepts.length} department(s) show below-average performance.`,
        action: "Review department leadership and implement targeted improvement plans.",
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
          <p className="mt-4 text-gray-600">Processing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Analytics Results</h1>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <h3 className="text-2xl font-bold text-gray-900">{data.totalEmployees}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <UserMinus className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Turnover Rate</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatPercent(data.turnoverRate)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Tenure</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatNumber(data.averageTenure)} yrs</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Performance</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatNumber(data.averageSatisfactionScore)}/5
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Turnover Rate Trend */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Turnover Rate Trend</h3>
            <div className="h-64">
              <Line
                data={{
                  labels: Object.keys(data.turnoverTrend),
                  datasets: [{
                    label: 'Turnover Rate (%)',
                    data: Object.values(data.turnoverTrend),
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Average Tenure by Department */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Tenure by Department</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: Object.keys(data.tenureByDepartment),
                  datasets: [{
                    label: 'Years',
                    data: Object.values(data.tenureByDepartment),
                    backgroundColor: 'rgba(5, 150, 105, 0.9)'
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Absenteeism Rate by Month */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Absenteeism Rate by Month</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: Object.keys(data.absenteeismByMonth),
                  datasets: [{
                    label: 'Rate (%)',
                    data: Object.values(data.absenteeismByMonth),
                    backgroundColor: 'rgba(220, 38, 38, 0.9)'
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Employee Satisfaction Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Rating Distribution</h3>
            <div className="h-64">
              <Pie
                data={{
                  labels: Object.keys(data.performanceDistribution),
                  datasets: [{
                    data: Object.values(data.performanceDistribution),
                    backgroundColor: [
                      'rgba(37, 99, 235, 0.9)',
                      'rgba(5, 150, 105, 0.9)',
                      'rgba(217, 119, 6, 0.9)',
                      'rgba(220, 38, 38, 0.9)',
                      'rgba(109, 40, 217, 0.9)'
                    ]
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Department Performance Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Department Performance Overview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turnover Rate
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Tenure
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.departmentMetrics.map((dept, index) => (
                  <tr 
                    key={dept.department}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {dept.employeeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(dept.turnoverRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatNumber(dept.averageTenure)} yrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatNumber(dept.averagePerformance)}/5
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
            HR Strategy Recommendations
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {recommendation.title}
                      </h3>
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

export default HRAnalysis;