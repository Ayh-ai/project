import  { useEffect, useState } from 'react';
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
  DollarSign,
  Building2,
  Percent,
  Clock,
  Users,
  Calendar,
  Star,
  TrendingUp,
  BadgePercent,
  CreditCard,
  XCircle,
  Hotel,
  UserCheck,
  LineChart
} from 'lucide-react';
import { ProcessedHotelData, processHotelData } from '../utils/hotelDataProcessing';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HotelAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProcessedHotelData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const file = location.state?.file;
    if (!file) {
      setError('No file provided');
      return;
    }

    processHotelData(file, selectedMonth)
      .then(setData)
      .catch(err => setError(err.message));
  }, [location.state, selectedMonth]);

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

  const generateRecommendations = (data: ProcessedHotelData) => {
    const recommendations = [];

    // Industry benchmarks (example values)
    const benchmarks = {
      occupancyRate: 70,
      adr: 150,
      revPAR: 105,
      avgRating: 4.2,
      avgStayLength: 2.5
    };

    // 1. Occupancy Rate Analysis
    if (data.occupancyRate < benchmarks.occupancyRate) {
      recommendations.push({
        icon: Hotel,
        title: "Boost Occupancy Rate",
        insight: `Current occupancy rate (${formatPercent(data.occupancyRate)}) is below industry average of ${formatPercent(benchmarks.occupancyRate)}.`,
        action: "Implement dynamic pricing strategies during low-occupancy periods and create targeted promotions for specific room types.",
        color: "blue"
      });
    }

    // 2. Revenue Performance
    if (data.averageDailyRate < benchmarks.adr) {
      recommendations.push({
        icon: DollarSign,
        title: "Optimize Room Pricing",
        insight: `ADR (${formatCurrency(data.averageDailyRate)}) is below market average of ${formatCurrency(benchmarks.adr)}.`,
        action: "Review and adjust room rates based on market demand, seasonality, and competitor pricing. Consider implementing premium packages for high-demand periods.",
        color: "green"
      });
    }

    // 3. Booking Source Analysis
    const bookingSources = Object.entries(data.bookingsBySource);
    const totalBookings = bookingSources.reduce((sum, [, count]) => sum + count, 0);
    const directBookings = bookingSources.find(([source]) => 
      source.toLowerCase().includes('direct'))?.[1] || 0;
    const directBookingPercentage = (directBookings / totalBookings) * 100;

    if (directBookingPercentage < 30) {
      recommendations.push({
        icon: LineChart,
        title: "Increase Direct Bookings",
        insight: `Direct bookings account for only ${directBookingPercentage.toFixed(1)}% of total reservations.`,
        action: "Enhance website booking experience, implement a loyalty program, and offer exclusive direct booking benefits.",
        color: "indigo"
      });
    }

    // 4. Cancellation Analysis
    const totalCancellations = Object.values(data.cancellationsByReason).reduce((a, b) => a + b, 0);
    const cancellationRate = (totalCancellations / data.totalBookings) * 100;

    if (cancellationRate > 15) {
      recommendations.push({
        icon: XCircle,
        title: "Reduce Cancellation Rate",
        insight: `Current cancellation rate of ${cancellationRate.toFixed(1)}% is above target.`,
        action: "Analyze common cancellation reasons and implement flexible booking policies. Consider offering cancellation insurance options.",
        color: "red"
      });
    }

    // 5. Length of Stay Optimization
    if (data.averageLengthOfStay < benchmarks.avgStayLength) {
      recommendations.push({
        icon: Calendar,
        title: "Extend Average Stay Duration",
        insight: `Average stay length (${data.averageLengthOfStay.toFixed(1)} nights) is below target of ${benchmarks.avgStayLength} nights.`,
        action: "Create attractive extended-stay packages and implement length-of-stay discounts to encourage longer bookings.",
        color: "yellow"
      });
    }

    // 6. Customer Satisfaction
    if (data.averageCustomerRating < benchmarks.avgRating) {
      recommendations.push({
        icon: Star,
        title: "Improve Guest Satisfaction",
        insight: `Average guest rating (${data.averageCustomerRating.toFixed(1)}/5) is below industry benchmark of ${benchmarks.avgRating}.`,
        action: "Implement a comprehensive guest feedback system and prioritize improvements in areas receiving lower ratings.",
        color: "orange"
      });
    }

    // 7. Payment Method Optimization
    const paymentMethods = Object.keys(data.paymentMethodDistribution).length;
    if (paymentMethods < 3) {
      recommendations.push({
        icon: CreditCard,
        title: "Diversify Payment Options",
        insight: `Limited payment methods (${paymentMethods} options) may restrict booking accessibility.`,
        action: "Expand payment options to include digital wallets, international payment systems, and installment plans.",
        color: "purple"
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
            <h1 className="text-3xl font-bold text-gray-900">Hotel Analysis Results</h1>
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
                <span className="h-8 w-8 text-blue-600 font-bold">DZD</span>

              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalRevenue)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <h3 className="text-2xl font-bold text-gray-900">{data.totalBookings}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Percent className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatPercent(data.occupancyRate)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Stay</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {data.averageLengthOfStay.toFixed(1)} nights
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">RevPAR</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(data.revPAR)}</p>
            <p className="text-sm text-gray-500 mt-1">Revenue per Available Room</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ADR</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(data.averageDailyRate)}</p>
            <p className="text-sm text-gray-500 mt-1">Average Daily Rate</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {data.averageCustomerRating.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Average Rating</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bookings by Day of Week */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Day of Week</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: Object.keys(data.bookingsByDayOfWeek),
                  datasets: [{
                    label: 'Bookings',
                    data: Object.values(data.bookingsByDayOfWeek),
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

          {/* Cancellations by Reason */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellations by Reason</h3>
            <div className="h-64">
              <Pie data={getChartData(data.cancellationsByReason)} options={chartOptions} />
            </div>
          </div>

          {/* Bookings by Room Type */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Room Type</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: Object.keys(data.bookingsByRoomType),
                  datasets: [{
                    label: 'Bookings',
                    data: Object.values(data.bookingsByRoomType),
                    backgroundColor: 'rgba(5, 150, 105, 0.9)'
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

          {/* Booking Source Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Source Distribution</h3>
            <div className="h-64">
              <Pie data={getChartData(data.bookingsBySource)} options={chartOptions} />
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method Distribution</h3>
            <div className="h-64">
              <Pie data={getChartData(data.paymentMethodDistribution)} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Data-Driven Recommendations */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Strategic Recommendations
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

export default HotelAnalysis;