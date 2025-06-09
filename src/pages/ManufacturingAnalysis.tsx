import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  ArrowLeft,
  Factory,
  AlertTriangle,
  Clock,
  Timer,
  Settings,
  DollarSign,
  Scale,
  LineChart,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  BarChart3,
  Percent,
  AlertOctagon,
  Wrench,
  Package,
  Users,
  StopCircle,
  Timer as TimerIcon
} from 'lucide-react';
import { ProcessedManufacturingData, processManufacturingData } from '../utils/manufacturingDataProcessing';

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

const ManufacturingAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProcessedManufacturingData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const file = location.state?.file;
    if (!file) {
      setError('No file provided');
      return;
    }

    processManufacturingData(file, selectedMonth)
      .then(setData)
      .catch(err => setError(err.message));
  }, [location.state, selectedMonth]);

  const formatNumber = (value: number, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

   const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-DZ', { // Change to 'en-DZ' for Algeria
    style: 'currency',
    currency: 'DZD' // Change to 'DZD' for Algerian Dinar
  }).format(value);
};
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  const getChartData = (data: { [key: string]: number }, limit = 5) => {
    const sortedData = Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
    
    const total = sortedData.reduce((sum, [, value]) => sum + value, 0);

    return {
      labels: sortedData.map(([label, value]) => {
        const percentage = ((value / total) * 100).toFixed(1);
        return `${label} (${percentage}%)`;
      }),
      datasets: [{
        data: sortedData.map(([, value]) => value),
        backgroundColor: [
          'rgba(37, 99, 235, 0.9)',   // Blue
          'rgba(5, 150, 105, 0.9)',   // Green
          'rgba(217, 119, 6, 0.9)',   // Yellow
          'rgba(220, 38, 38, 0.9)',   // Red
          'rgba(109, 40, 217, 0.9)'   // Purple
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
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

  const generateRecommendations = (data: ProcessedManufacturingData) => {
    const recommendations = [];

    // 1. Production Efficiency Analysis
    if (data.averageProductionEfficiency < data.efficiencyThreshold) {
      recommendations.push({
        icon: Gauge,
        title: "Optimize Production Efficiency",
        insight: `Overall efficiency (${formatPercent(data.averageProductionEfficiency)}) is below target of ${formatPercent(data.efficiencyThreshold)}.`,
        action: "Implement machine calibration improvements, streamline workflows, and enhance worker training programs to boost efficiency.",
        color: "blue"
      });
    }

    // 2. Material Waste Analysis
    if (data.averageRawMaterialWaste > 15) {
      recommendations.push({
        icon: Scale,
        title: "Reduce Material Waste",
        insight: `Material waste rate (${formatPercent(data.averageRawMaterialWaste)}) exceeds acceptable levels.`,
        action: "Implement lean manufacturing techniques, optimize material cutting processes, and improve inventory management systems.",
        color: "yellow"
      });
    }

    // 3. Defect Rate Analysis
    if (data.defectRate > data.defectRateThreshold) {
      recommendations.push({
        icon: AlertOctagon,
        title: "Lower Defect Rate",
        insight: `Current defect rate (${formatPercent(data.defectRate)}) exceeds threshold of ${formatPercent(data.defectRateThreshold)}.`,
        action: "Enhance quality control measures, increase inspection frequency, and implement automated defect detection systems.",
        color: "red"
      });
    }

    // 4. Production Line Performance
    const underperformingLines = data.productionLineMetrics.filter(
      line => line.efficiency < data.efficiencyThreshold
    );
    if (underperformingLines.length > 0) {
      recommendations.push({
        icon: BarChart3,
        title: "Improve Line Performance",
        insight: `${underperformingLines.length} production line(s) operating below efficiency target.`,
        action: "Standardize best practices across all lines and implement performance monitoring systems for real-time optimization.",
        color: "purple"
      });
    }

    // 5. Breakdown Rate Analysis
    if (data.averageBreakdownRate > 10) {
      recommendations.push({
        icon: Wrench,
        title: "Minimize Equipment Breakdowns",
        insight: `Average breakdown rate (${formatPercent(data.averageBreakdownRate)}) indicates frequent equipment failures.`,
        action: "Implement predictive maintenance strategies and invest in equipment health monitoring systems.",
        color: "indigo"
      });
    }

    // 6. Downtime Analysis
    if (data.totalDowntime > data.downtimeThreshold) {
      recommendations.push({
        icon: StopCircle,
        title: "Reduce Total Downtime",
        insight: `Total downtime (${formatNumber(data.totalDowntime)} minutes) exceeds acceptable threshold.`,
        action: "Automate downtime tracking, improve maintenance scheduling, and establish rapid response protocols for equipment issues.",
        color: "orange"
      });
    }

    // 7. Product-specific Defect Analysis
    const highDefectProducts = data.productMetrics.filter(
      product => product.defectRate > data.defectRateThreshold
    );
    if (highDefectProducts.length > 0) {
      recommendations.push({
        icon: Package,
        title: "Address Product Quality Issues",
        insight: `${highDefectProducts.length} product(s) show defect rates above ${formatPercent(data.defectRateThreshold)}.`,
        action: "Conduct root cause analysis for affected products and implement targeted quality improvement measures.",
        color: "green"
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
            <h1 className="text-3xl font-bold text-gray-900">Manufacturing Analysis Results</h1>
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
                <Gauge className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Production Efficiency</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatPercent(data.averageProductionEfficiency)}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Operating Time</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatNumber(data.averageOperatingTimePerLine, 1)} hrs
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <Percent className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Breakdown Rate</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatPercent(data.averageBreakdownRate)}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Scale className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Material Waste</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatPercent(data.averageRawMaterialWaste)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Production Overview</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Production</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(data.totalProduction)} units</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Defects</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(data.totalDefects)} units</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Defect Rate</p>
                <p className="text-2xl font-bold text-orange-600">{formatPercent(data.defectRate)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <TimerIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Time Utilization</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Operating Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(data.averageOperatingTime, 1)} hrs</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Downtime</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(data.totalDowntime)} mins</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Stops</p>
                <p className="text-2xl font-bold text-orange-600">{formatNumber(data.totalStops)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Cost & Materials</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Avg Production Cost</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.averageProductionCost)}/unit</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Raw Materials</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(data.totalRawMaterials)} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Material Efficiency</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPercent(100 - data.averageRawMaterialWaste)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Production Line Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Production Line Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Line
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defect Rate
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breakdown Rate
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.productionLineMetrics.map((line, index) => (
                  <tr 
                    key={line.lineNumber}
                    className={`${
                      line.efficiency < data.efficiencyThreshold ? 'bg-red-50' : 
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {line.lineNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(line.efficiency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(line.defectRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(line.breakdownRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(line.averageCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Quality Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Products by Defect Rate</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: data.productMetrics.slice(0, 5).map(p => p.name),
                  datasets: [{
                    label: 'Defect Rate (%)',
                    data: data.productMetrics.slice(0, 5).map(p => p.defectRate),
                    backgroundColor: 'rgba(220, 38, 38, 0.9)'
                  }]
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Defect Rate (%)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Usage by Product</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: data.productMetrics.slice(0, 5).map(p => p.name),
                  datasets: [{
                    label: 'Material Usage (kg/unit)',
                    data: data.productMetrics.slice(0, 5).map(p => p.materialUsage / p.totalProduction),
                    backgroundColor: 'rgba(5, 150, 105, 0.9)'
                  }]
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Material Usage (kg/unit)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Days with High Defect Rate */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Days with High Defect Rate</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defect Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.daysWithHighDefectRate.map((day, index) => (
                  <tr key={day.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right font-semibold">
                      {formatPercent(day.defectRate)}
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
            Process Optimization Recommendations
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

export default ManufacturingAnalysis;