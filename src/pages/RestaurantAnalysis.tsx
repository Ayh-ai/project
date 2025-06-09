import { useEffect, useState } from 'react';
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
  TrendingUp, 
  UtensilsCrossed, 
  //DollarSign,
  Lightbulb,
  Clock,
  Calendar,
  //Users,
  BadgePercent,
  //Star,
  Truck,
  ChefHat,
  TrendingDown
} from 'lucide-react';
import { ProcessedRestaurantData, processRestaurantData } from '../utils/restaurantDataProcessing';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RestaurantAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProcessedRestaurantData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const file = location.state?.file;
    if (!file) {
      setError('No file provided');
      return;
    }

    processRestaurantData(file, selectedMonth)
      .then(setData)
      .catch(err => setError(err.message));
  }, [location.state, selectedMonth]);

  const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-DZ', { // Change to 'en-DZ' for Algeria
    style: 'currency',
    currency: 'DZD' // Change to 'DZD' for Algerian Dinar
  }).format(value);
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
          'rgba(37, 99, 235, 0.9)',  // Darker blue
          'rgba(5, 150, 105, 0.9)',  // Darker green
          'rgba(217, 119, 6, 0.9)',  // Darker yellow
          'rgba(220, 38, 38, 0.9)',  // Darker red
          'rgba(109, 40, 217, 0.9)'  // Darker purple
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
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const generateRecommendations = (data: ProcessedRestaurantData) => {
    const recommendations = [];

    // Analyze average order price
    const industryAvgOrderPrice = 35; // Example benchmark
    if (data.averageOrderPrice < industryAvgOrderPrice) {
      recommendations.push({
        icon: BadgePercent,
        title: "Optimize Menu Pricing",
        insight: `Average order value (${formatCurrency(data.averageOrderPrice)}) is below industry average.`,
        action: "Introduce premium menu items, create attractive combo deals, and strategically price high-margin items.",
        color: "blue"
      });
    }

    // Analyze top dishes performance
    if (data.topDishes.length > 0) {
      const topDish = data.topDishes[0];
      recommendations.push({
        icon: ChefHat,
        title: "Leverage Popular Dishes",
        insight: `"${topDish.name}" is your best-selling dish with ${topDish.quantity} orders.`,
        action: "Feature this dish prominently, create variations, and develop complementary sides or appetizers.",
        color: "green"
      });
    }

    // Analyze sales distribution by day
    const ordersByDay = Object.entries(data.ordersByDayOfWeek);
    const maxOrders = Math.max(...ordersByDay.map(([, count]) => count));
    const minOrders = Math.min(...ordersByDay.map(([, count]) => count));
    const slowestDay = ordersByDay.find(([, count]) => count === minOrders)?.[0];
    const peakDay = ordersByDay.find(([, count]) => count === maxOrders)?.[0];
    
    if (slowestDay && (maxOrders / minOrders > 1.5)) {
      recommendations.push({
        icon: Calendar,
        title: "Boost Slow Day Traffic",
        insight: `${slowestDay} shows ${((minOrders / maxOrders) * 100).toFixed(1)}% of ${peakDay} traffic.`,
        action: `Launch "${slowestDay} Specials" with exclusive menu items or happy hour promotions to drive traffic.`,
        color: "yellow"
      });
    }

    // Analyze peak hours
    recommendations.push({
      icon: Clock,
      title: "Optimize Peak Hour Operations",
      insight: `${peakDay} is your busiest day with ${maxOrders} orders.`,
      action: "Adjust staffing levels and streamline kitchen operations during peak hours to reduce wait times and improve service efficiency.",
      color: "purple"
    });

    // Analyze food type performance
    if (data.topFoodTypes.length >= 2) {
      const [top, second] = data.topFoodTypes;
      const salesDiff = ((top.sales - second.sales) / top.sales * 100).toFixed(1);
      
      recommendations.push({
        icon: Lightbulb,
        title: "Diversify Menu Mix",
        insight: `${top.type} category outperforms others by ${salesDiff}%.`,
        action: "Balance menu offerings while maintaining strong performers. Consider expanding successful categories with new variations.",
        color: "indigo"
      });
    }

    // Delivery and online presence
    recommendations.push({
      icon: Truck,
      title: "Expand Delivery Services",
      insight: "Online ordering and delivery services represent growth opportunities.",
      action: "Partner with popular delivery platforms, optimize takeout menu items, and create delivery-exclusive promotions.",
      color: "red"
    });

    // Low-performing dishes
    if (data.topDishes.length > 3) {
      recommendations.push({
        icon: TrendingDown,
        title: "Review Menu Performance",
        insight: "Several menu items show significantly lower order volumes.",
        action: "Consider removing or revamping underperforming dishes. Focus on items with higher margins and consistent demand.",
        color: "pink"
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

  if (Object.keys(data.salesByFoodType).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Data Available</h2>
            <p className="text-yellow-600">No data available for the selected month.</p>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-4 block mx-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Months</option>
              {data.availableMonths.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Analysis Results</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <UtensilsCrossed className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold text-gray-900">{data.totalOrders}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Order Price</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(data.averageOrderPrice)}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sales by Food Type */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Food Type</h3>
            <div className="h-64">
              <Pie data={getChartData(data.salesByFoodType)} options={chartOptions} />
            </div>
          </div>

          {/* Sales by Food Name */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Dish</h3>
            <div className="h-64">
              <Pie data={getChartData(data.salesByFoodName)} options={chartOptions} />
            </div>
          </div>

          {/* Orders by Day of Week */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Day</h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: Object.keys(data.ordersByDayOfWeek),
                  datasets: [{
                    label: 'Orders',
                    data: Object.values(data.ordersByDayOfWeek),
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

        {/* Top Dishes and Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Top 5 Best-Selling Dishes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Best-Selling Dishes</h3>
            <div className="space-y-4">
              {data.topDishes.map((dish, index) => (
                <div key={dish.name} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="ml-3 flex-1 text-gray-900 font-medium truncate">
                    {dish.name}
                  </span>
                  <span className="text-gray-600 font-medium">
                    {dish.quantity} orders
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Food Types Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Food Types Overview</h3>
            <div className="space-y-4">
              {data.topFoodTypes.slice(0, 2).map((category, index) => (
                <div key={category.type} className="bg-gray-50 rounded-lg p-4 transform hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">#{index + 1} Category</p>
                      <h4 className="text-lg font-semibold text-gray-900">{category.type}</h4>
                    </div>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(category.sales)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Data-Driven Recommendations
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

export default RestaurantAnalysis;