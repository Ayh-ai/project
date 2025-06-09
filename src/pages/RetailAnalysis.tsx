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
  TrendingUp, 
  ShoppingBag, 
  DollarSign,
  Lightbulb,
  Package,
  Calendar,
  Users,
  BadgePercent,
  Star,
  TrendingDown
} from 'lucide-react';
import { ProcessedData, processRetailData } from '../utils/dataProcessing';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RetailAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProcessedData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const file = location.state?.file;
    if (!file) {
      setError('No file provided');
      return;
    }

    processRetailData(file, selectedMonth)
      .then(setData)
      .catch(err => setError(err.message));
  }, [location.state, selectedMonth]);

   const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-DZ', { // Change to 'en-DZ' for Algeria
    style: 'currency',
    currency: 'DZD' // Change to 'DZD' for Algerian Dinar
  }).format(value);
};

  const getChartData = (data: { [key: string]: number }, limit = 4) => {
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
          'rgba(220, 38, 38, 0.9)'   // Darker red
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

  const generateRecommendations = (data: ProcessedData) => {
    const recommendations = [];

    // Analyze average order value
    const industryAvgOrderValue = 75; // Example benchmark
    if (data.averageOrderValue < industryAvgOrderValue) {
      recommendations.push({
        icon: BadgePercent,
        title: "Optimize Pricing Strategy",
        insight: `Current average order value (${formatCurrency(data.averageOrderValue)}) is below industry average.`,
        action: "Implement strategic bundle deals and tiered pricing to encourage larger purchases. Consider cross-selling complementary items.",
        color: "blue"
      });
    }

    // Analyze top products
    if (data.topProducts.length > 0) {
      const topProduct = data.topProducts[0];
      recommendations.push({
        icon: Package,
        title: "Leverage Best Sellers",
        insight: `"${topProduct.name}" is your top-performing product with ${formatCurrency(topProduct.sales)} in sales.`,
        action: "Feature this product prominently in displays and marketing materials. Create bundle offers with complementary items.",
        color: "green"
      });
    }

    // Analyze sales distribution by day
    const ordersByDay = Object.entries(data.ordersByDayOfWeek);
    const maxOrders = Math.max(...ordersByDay.map(([, count]) => count));
    const minOrders = Math.min(...ordersByDay.map(([, count]) => count));
    const slowestDay = ordersByDay.find(([, count]) => count === minOrders)?.[0];
    
    if (slowestDay && (maxOrders / minOrders > 1.5)) {
      recommendations.push({
        icon: Calendar,
        title: "Boost Slow Day Sales",
        insight: `${slowestDay} shows consistently lower sales performance.`,
        action: `Introduce "${slowestDay} Special" promotions and exclusive deals to drive traffic on slower days.`,
        color: "yellow"
      });
    }

    // Analyze gender distribution
    const genderData = Object.entries(data.genderDistribution);
    if (genderData.length >= 2) {
      const [dominantGender] = genderData.sort(([, a], [, b]) => b - a)[0];
      const percentage = (data.genderDistribution[dominantGender] / 
        Object.values(data.genderDistribution).reduce((a, b) => a + b, 0) * 100).toFixed(1);
      
      recommendations.push({
        icon: Users,
        title: "Balance Customer Demographics",
        insight: `${dominantGender} customers represent ${percentage}% of your customer base.`,
        action: "Diversify marketing channels and product selection to attract a broader customer base.",
        color: "purple"
      });
    }

    // Analyze service ratings
    const ratings = Object.entries(data.serviceRatingDistribution)
      .map(([rating, count]) => ({ rating: parseInt(rating), count }));
    const averageRating = ratings.reduce((acc, { rating, count }) => acc + (rating * count), 0) / 
      ratings.reduce((acc, { count }) => acc + count, 0);
    
    if (averageRating < 4.5) {
      recommendations.push({
        icon: Star,
        title: "Enhance Customer Experience",
        insight: `Average customer satisfaction rating is ${averageRating.toFixed(1)} out of 5.`,
        action: "Implement targeted staff training programs and gather detailed customer feedback to identify improvement areas.",
        color: "red"
      });
    }

    // Analyze category performance
    if (data.topCategories.length >= 2) {
      const [top, second] = data.topCategories;
      const salesDiff = ((top.sales - second.sales) / top.sales * 100).toFixed(1);
      
      recommendations.push({
        icon: TrendingUp,
        title: "Optimize Category Mix",
        insight: `${top.name} outperforms other categories by ${salesDiff}%.`,
        action: "Balance inventory across categories while maintaining strong performers. Consider expanding successful category lines.",
        color: "indigo"
      });
    }

    // Analyze low-performing products
    if (data.topProducts.length > 3) {
      recommendations.push({
        icon: TrendingDown,
        title: "Address Underperforming Products",
        insight: "Several products show significantly lower sales performance.",
        action: "Review and potentially phase out underperforming products. Reallocate shelf space to better-performing items.",
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

  if (Object.keys(data.salesByCategory).length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900">Retail Analysis Results</h1>
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
                <ShoppingBag className="h-8 w-8 text-green-600" />
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
                <p className="text-sm font-medium text-gray-500">Average Order Value</p>
                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(data.averageOrderValue)}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sales by Category */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
            <div className="h-64">
              <Pie data={getChartData(data.salesByCategory)} options={chartOptions} />
            </div>
          </div>

          {/* Sales by Product */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Product</h3>
            <div className="h-64">
              <Pie data={getChartData(data.salesByProduct)} options={chartOptions} />
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

          {/* Gender Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
            <div className="h-64">
              <Pie data={getChartData(data.genderDistribution)} options={chartOptions} />
            </div>
          </div>

          {/* Service Rating Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Rating Distribution</h3>
            <div className="h-64">
              <Pie data={getChartData(data.serviceRatingDistribution)} options={chartOptions} />
            </div>
          </div>

          {/* Top 5 Products */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Best-Selling Products</h3>
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="ml-3 flex-1 text-gray-900 font-medium truncate">
                    {product.name}
                  </span>
                  <span className="text-gray-600 font-medium">
                    {formatCurrency(product.sales)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Categories Overview */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.topCategories.slice(0, 2).map((category, index) => (
              <div key={category.name} className="bg-gray-50 rounded-lg p-4 transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">#{index + 1} Category</p>
                    <h4 className="text-lg font-semibold text-gray-900">{category.name}</h4>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(category.sales)}</p>
                </div>
              </div>
            ))}
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

export default RetailAnalysis;