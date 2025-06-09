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
  Legend
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  ArrowLeft,
  Truck,
  Clock,
  //DollarSign,
  HandCoins,
  Fuel,
  AlertTriangle,
  MapPin,
  Users,
  BarChart2,
  Timer,
  Star,
  TrendingUp,
  Package,
  Calendar,
  AlertOctagon,
  Activity,
  Gauge,
  Route
} from 'lucide-react';
import { ProcessedLogisticsData, processLogisticsData } from '../utils/logisticsDataProcessing';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LogisticsAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProcessedLogisticsData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const file = location.state?.file;
    if (!file) {
      setError('No file provided');
      return;
    }

    processLogisticsData(file, selectedMonth)
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

  const generateRecommendations = (data: ProcessedLogisticsData) => {
    const recommendations = [];

    // Delivery Performance
    if (data.onTimeDeliveryRate < 90) {
      recommendations.push({
        icon: Clock,
        title: "Improve On-Time Delivery",
        insight: `Current on-time delivery rate (${formatPercent(data.onTimeDeliveryRate)}) is below target of 90%.`,
        action: "Optimize route planning and implement real-time tracking to improve delivery performance.",
        color: "blue"
      });
    }

    // Cost Efficiency
    if (data.profitMargin < 20) {
      recommendations.push({
        icon: HandCoins,
        title: "Optimize Operating Costs",
        insight: `Current profit margin (${formatPercent(data.profitMargin)}) indicates potential cost inefficiencies.`,
        action: "Review cost structure and implement cost-saving measures in fuel consumption and route optimization.",
        color: "green"
      });
    }

    // Fuel Efficiency
    const highFuelConsumption = data.averageFuelConsumption > 0.3; // L/km
    if (highFuelConsumption) {
      recommendations.push({
        icon: Fuel,
        title: "Reduce Fuel Consumption",
        insight: `Average fuel consumption (${formatNumber(data.averageFuelConsumption, 2)} L/km) is above target.`,
        action: "Implement eco-driving training and optimize vehicle maintenance schedules.",
        color: "yellow"
      });
    }

    // Vehicle Maintenance
    if (data.shipmentsAffectedByBreakdowns > 5) {
      recommendations.push({
        icon: AlertTriangle,
        title: "Enhance Vehicle Maintenance",
        insight: `${formatPercent(data.shipmentsAffectedByBreakdowns)} of shipments affected by breakdowns.`,
        action: "Implement preventive maintenance program and regular vehicle inspections.",
        color: "red"
      });
    }

    // Customer Satisfaction
    if (data.averageCustomerRating < 4) {
      recommendations.push({
        icon: Star,
        title: "Improve Customer Satisfaction",
        insight: `Average customer rating (${formatNumber(data.averageCustomerRating, 1)}/5) needs improvement.`,
        action: "Enhance delivery communication and implement customer feedback system.",
        color: "purple"
      });
    }

    // Route Optimization
    const highDelayRate = data.delayedShipmentsRate > 15;
    if (highDelayRate) {
      recommendations.push({
        icon: Route,
        title: "Optimize Delivery Routes",
        insight: `High delay rate (${formatPercent(data.delayedShipmentsRate)}) indicates routing inefficiencies.`,
        action: "Implement advanced route optimization software and real-time traffic monitoring.",
        color: "indigo"
      });
    }

    // Driver Performance
    const lowPerformingDrivers = data.driverPerformance.filter(
      driver => driver.onTimeRate < 85
    ).length;
    if (lowPerformingDrivers > 0) {
      recommendations.push({
        icon: Users,
        title: "Address Driver Performance",
        insight: `${lowPerformingDrivers} driver(s) have on-time delivery rates below 85%.`,
        action: "Provide additional training and implement performance monitoring system.",
        color: "orange"
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

  // Get top 5 vehicles by on-time rate
  const topVehicles = [...data.vehiclePerformance]
    .sort((a, b) => b.onTimeRate - a.onTimeRate)
    .slice(0, 5);

  // Get top 5 and bottom 5 drivers by on-time rate
  const sortedDrivers = [...data.driverPerformance].sort((a, b) => b.onTimeRate - a.onTimeRate);
  const topDrivers = sortedDrivers.slice(0, 5);
  const bottomDrivers = sortedDrivers.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Logistics Analysis Results</h1>
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
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Shipments</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatNumber(data.totalShipments)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">On-Time Delivery</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatPercent(data.onTimeDeliveryRate)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <HandCoins className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Profit Margin</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatPercent(data.profitMargin)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Customer Rating</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatNumber(data.averageCustomerRating, 1)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Timer className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Delivery Performance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Average Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(data.averageDeliveryTime)} mins</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Delayed Shipments</p>
                <p className="text-2xl font-bold text-red-600">{formatPercent(data.delayedShipmentsRate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Delay Duration</p>
                <p className="text-2xl font-bold text-orange-600">{formatNumber(data.averageDelayDuration)} mins</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Fuel className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Fuel & Distance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Fuel Used</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(data.totalFuelConsumption, 1)} L</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Fuel Consumption</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(data.averageFuelConsumption, 2)} L/km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Distance per Shipment</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(data.averageDistance, 1)} km</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Breakdowns & Issues</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Breakdowns</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(data.totalBreakdowns)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Breakdowns per Vehicle</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(data.averageBreakdownsPerVehicle, 1)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Affected Shipments</p>
                <p className="text-2xl font-bold text-orange-600">{formatPercent(data.shipmentsAffectedByBreakdowns)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Delay Reasons Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delay Reasons Distribution</h3>
            <div className="h-64">
              <Pie data={getChartData(data.delayReasonDistribution)} options={chartOptions} />
            </div>
          </div>

          {/* Shipments by Location */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipments by Location</h3>
            <div className="h-64">
              <Pie data={getChartData(data.shipmentsByLocation)} options={chartOptions} />
            </div>
          </div>

          {/* Shipments by Day of Week */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipments by Day</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: Object.keys(data.shipmentsByDayOfWeek),
                  datasets: [{
                    label: 'Shipments',
                    data: Object.values(data.shipmentsByDayOfWeek),
                    backgroundColor: 'rgba(37, 99, 235, 0.9)'
                  }]
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Top 5 Vehicle Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top 5 Performing Vehicles</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle ID
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Shipments
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On-Time Rate
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel Consumption
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breakdowns
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topVehicles.map((vehicle, index) => (
                  <tr 
                    key={vehicle.vehicleId}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicle.vehicleId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatNumber(vehicle.totalShipments)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(vehicle.onTimeRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatNumber(vehicle.averageFuelConsumption, 2)} L/km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatNumber(vehicle.breakdowns)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Performance */}
        <div className="space-y-8">
          {/* Top 5 Drivers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top 5 Performing Drivers</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver ID
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Shipments
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      On-Time Rate
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Rating
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Delays
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topDrivers.map((driver, index) => (
                    <tr 
                      key={driver.driverId}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {driver.driverId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatNumber(driver.totalShipments)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatPercent(driver.onTimeRate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatNumber(driver.averageRating, 1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatNumber(driver.totalDelays)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 5 Drivers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bottom 5 Performing Drivers</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver ID
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Shipments
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      On-Time Rate
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Rating
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Delays
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bottomDrivers.map((driver, index) => (
                    <tr 
                      key={driver.driverId}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} bg-opacity-75`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {driver.driverId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatNumber(driver.totalShipments)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right font-medium">
                        {formatPercent(driver.onTimeRate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatNumber(driver.averageRating, 1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right font-medium">
                        {formatNumber(driver.totalDelays)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default LogisticsAnalysis;