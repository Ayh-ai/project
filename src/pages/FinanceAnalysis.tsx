import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Percent,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ProcessedFinanceData,
  processFinanceData,
} from "../utils/financeDataProcessing";

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

const FinanceAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<ProcessedFinanceData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const processData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Access all the data passed from the navigation state
        const { file, columnMapping, industryType, correctionResult } =
          location.state || {};

        if (!file) {
          setError("No file provided");
          setLoading(false);
          return;
        }

        console.log("Received navigation state:", {
          file: file?.name,
          columnMapping,
          industryType,
          correctionResult,
        });

        // Process the finance data with the new options object
        const processedData = await processFinanceData(file, {
          selectedMonth,
          columnMapping,
          correctionResult,
          industryType,
        });

        setData(processedData);
      } catch (err) {
        console.error("Error processing data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while processing the data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (location.state) {
      processData();
    } else {
      setError("No data provided");
      setLoading(false);
    }
  }, [location.state, selectedMonth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const generateRecommendations = (data: ProcessedFinanceData) => {
    const recommendations = [];

    // Net Profit Analysis
    if (data.netProfitMargin < 15) {
      recommendations.push({
        icon: TrendingDown,
        title: "Improve Net Profit Margin",
        insight: `Current net profit margin (${formatPercent(
          data.netProfitMargin
        )}) is below target of 15%.`,
        action:
          "Review pricing strategy and implement cost optimization measures.",
        priority: "high",
        color: "red",
      });
    }

    // Tax Efficiency
    if (data.averageTaxRate > 25) {
      recommendations.push({
        icon: Scale,
        title: "Optimize Tax Efficiency",
        insight: `Average tax rate (${formatPercent(
          data.averageTaxRate
        )}) indicates potential for tax optimization.`,
        action:
          "Review tax planning strategies and consult with tax advisors for optimization opportunities.",
        priority: "medium",
        color: "yellow",
      });
    }

    // Transaction Approval Process
    if (data.approvalRate < 90) {
      recommendations.push({
        icon: CheckCircle,
        title: "Streamline Approval Process",
        insight: `Current approval rate (${formatPercent(
          data.approvalRate
        )}) indicates process inefficiencies.`,
        action:
          "Review and optimize transaction approval workflow. Consider automation for routine transactions.",
        priority: "medium",
        color: "blue",
      });
    }

    return recommendations;
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your financial data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data to display</p>
        </div>
      </div>
    );
  }

  const recommendations = generateRecommendations(data);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Financial Analysis Results
            </h1>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Months</option>
              {data.availableMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
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
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.totalRevenue)}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.netProfit)}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Percent className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Net Profit Margin
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatPercent(data.netProfitMargin)}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Approval Rate
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatPercent(data.approvalRate)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Trend
            </h3>
            <div className="h-64">
              <Line
                data={{
                  labels: Object.keys(data.revenueTrend),
                  datasets: [
                    {
                      label: "Revenue",
                      data: Object.values(data.revenueTrend),
                      borderColor: "rgb(37, 99, 235)",
                      backgroundColor: "rgba(37, 99, 235, 0.1)",
                      tension: 0.4,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Net Profit Trend */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Net Profit Trend
            </h3>
            <div className="h-64">
              <Line
                data={{
                  labels: Object.keys(data.netProfitTrend),
                  datasets: [
                    {
                      label: "Net Profit",
                      data: Object.values(data.netProfitTrend),
                      borderColor: "rgb(5, 150, 105)",
                      backgroundColor: "rgba(5, 150, 105, 0.1)",
                      tension: 0.4,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Methods
            </h3>
            <div className="h-64">
              <Pie
                data={{
                  labels: Object.keys(data.paymentMethodDistribution),
                  datasets: [
                    {
                      data: Object.values(data.paymentMethodDistribution),
                      backgroundColor: [
                        "rgba(37, 99, 235, 0.9)",
                        "rgba(5, 150, 105, 0.9)",
                        "rgba(217, 119, 6, 0.9)",
                        "rgba(220, 38, 38, 0.9)",
                        "rgba(109, 40, 217, 0.9)",
                      ],
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Categories
            </h3>
            <div className="h-64">
              <Pie
                data={{
                  labels: Object.keys(data.categoryDistribution),
                  datasets: [
                    {
                      data: Object.values(data.categoryDistribution),
                      backgroundColor: [
                        "rgba(37, 99, 235, 0.9)",
                        "rgba(5, 150, 105, 0.9)",
                        "rgba(217, 119, 6, 0.9)",
                        "rgba(220, 38, 38, 0.9)",
                        "rgba(109, 40, 217, 0.9)",
                      ],
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Department Performance Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Department Performance Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Profit Margin
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Efficiency
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.departmentMetrics.map((dept, index) => (
                  <tr
                    key={dept.department}
                    className={`${
                      dept.netProfitMargin < 10
                        ? "bg-red-50"
                        : index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(dept.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(dept.expenses)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(dept.netProfitMargin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(dept.taxEfficiency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatPercent(dept.approvalRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Risk Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.highRiskAreas.map((risk, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  risk.impact === "high"
                    ? "bg-red-50"
                    : risk.impact === "medium"
                    ? "bg-yellow-50"
                    : "bg-blue-50"
                }`}
              >
                <div className="flex items-center mb-2">
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      risk.impact === "high"
                        ? "text-red-500"
                        : risk.impact === "medium"
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                  />
                  <h3 className="ml-2 font-semibold text-gray-900">
                    {risk.area}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{risk.risk}</p>
                <p className="mt-2 text-sm font-medium">
                  Current Value:{" "}
                  {typeof risk.metric === "number"
                    ? formatPercent(risk.metric)
                    : risk.metric}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Financial Optimization Recommendations
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
                    <div
                      className={`p-3 rounded-full bg-${recommendation.color}-100 flex-shrink-0`}
                    >
                      <IconComponent
                        className={`h-6 w-6 text-${recommendation.color}-600`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {recommendation.title}
                        </h3>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                            recommendation.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : recommendation.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
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

export default FinanceAnalysis;
