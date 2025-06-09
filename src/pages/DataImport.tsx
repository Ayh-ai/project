import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileType, AlertCircle, CheckCircle2, XCircle, Table, ArrowLeft } from 'lucide-react';
import { validateFileColumns, requiredRetailColumns, requiredRestaurantColumns, requiredHotelColumns, requiredManufacturingColumns, requiredLogisticsColumns, requiredHRColumns, requiredFinanceColumns, requiredOperationsColumns } from '../utils/fileValidation';

const DataImport = () => {
  const { industry } = useParams();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [fileSelected, setFileSelected] = useState(false);


  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = async (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv', // csv
    ];

    if (!validTypes.includes(file.type)) {
      setValidationStatus({
        isValid: false,
        message: 'Please upload a valid CSV or Excel file'
      });
      return;
    }

    setFile(file);

    setFileSelected(true);

    setValidationStatus(null);

    if (industry) {
      const result = await validateFileColumns(file, industry);
      setValidationStatus({
        isValid: result.isValid,
        message: result.message
      });
    }
  };

  const handleProceed = () => {
    if (file && validationStatus?.isValid) {
      navigate(`/${industry}/analysis`, { state: { file } });
    }
  };

  const getRequiredColumns = () => {
    switch (industry) {
      case 'hr':
        return {
          title: 'Human Resources Data Requirements',
          description: 'Your HR data file must include the following columns for comprehensive workforce analysis:',
          columns: requiredHRColumns,
          groups: [
            {
              title: 'Employee Information',
              columns: [
                'Employee ID',
                'Name',
                'Department',
                'Job Title'
              ]
            },
            {
              title: 'Employment Details',
              columns: [
                'Hire Date',
                'Contract Type',
                'Monthly Salary'
              ]
            },
            {
              title: 'Performance Metrics',
              columns: [
                'Performance Rating',
                'Absences (Days)',
                'Training Hours'
              ]
            }
          ]
        };
      case 'finance':
        return {
          title: 'Financial Data Requirements',
          description: 'Your financial data file must include the following columns for comprehensive expense analysis:',
          columns: requiredFinanceColumns,
          groups: [
            {
              title: 'Expense Information',
              columns: [
                'Expense ID',
                'Expense Type',
                'Expense Amount',
                'Date of Expense',
                'Budget Allocation (%)'
              ]
            }
          ]
        };
      case 'operations':
        return {
          title: 'Operations & Project Management Data Requirements',
          description: 'Your operations data file must include the following columns for comprehensive project analysis:',
          columns: requiredOperationsColumns,
          groups: [
            {
              title: 'Project & Task Information',
              columns: [
                'Project Name',
                'Task Name',
                'Assigned Employee'
              ]
            },
            {
              title: 'Timeline & Status',
              columns: [
                'Task Start Date',
                'Task Due Date',
                'Task Status',
                'Task Progress (%)',
                'Task Priority'
              ]
            },
            {
              title: 'Resource & Quality Metrics',
              columns: [
                'Work Hours Allocated',
                'Work Hours Spent',
                'Task Quality Score',
                'Task Completion Satisfaction'
              ]
            }
          ]
        };
      case 'manufacturing':
        return {
          title: 'Manufacturing Data Requirements',
          description: 'Your manufacturing data file must include the following columns for comprehensive production analysis:',
          columns: requiredManufacturingColumns,
          groups: [
            {
              title: 'Production Information',
              columns: [
                'Production Date',
                'Production Line Number',
                'Product Name',
                'Production Quantity'
              ]
            },
            {
              title: 'Quality Metrics',
              columns: [
                'Defective Units',
                'Operating Time (Hours)',
                'Number of Stops',
                'Total Downtime (Minutes)'
              ]
            },
            {
              title: 'Cost & Materials',
              columns: [
                'Production Cost per Unit',
                'Raw Materials Used (kg)'
              ]
            },
            {
              title: 'Personnel',
              columns: [
                'Operator Name',
                'Notes'
              ]
            }
          ]
        };
      case 'logistics':
        return {
          title: 'Logistics & Transportation Data Requirements',
          description: 'Your logistics data file must include the following columns for comprehensive shipment analysis:',
          columns: requiredLogisticsColumns,
          groups: [
            {
              title: 'Shipment Information',
              columns: [
                'Shipment ID',
                'Order Date',
                'Delivery Date',
                'Expected Delivery Date',
                'Shipment Status'
              ]
            },
            {
              title: 'Vehicle & Driver Details',
              columns: [
                'Vehicle ID',
                'Driver ID',
                'Vehicle Type'
              ]
            },
            {
              title: 'Performance Metrics',
              columns: [
                'Fuel Consumption (L)',
                'Total Distance (km)',
                'Breakdown Count',
                'Number of Stops'
              ]
            },
            {
              title: 'Cost Analysis',
              columns: [
                'Shipping Cost',
                'Fuel Cost',
                'Total Operating Cost',
                'Revenue per Shipment'
              ]
            },
            {
              title: 'Customer & Delivery',
              columns: [
                'Customer ID',
                'Customer Location',
                'Delivery Time (Minutes)',
                'Customer Rating',
                'Delay Reason',
                'Delay Duration (Minutes)'
              ]
            }
          ]
        };
      default:
        return null;
    }
  };

  const columnRequirements = getRequiredColumns();

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/home')}
        className="mb-8 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 capitalize mb-2">
          {industry?.replace('-', ' ')} Data Import
        </h1>
        <p className="text-gray-600">
          Upload your data file to begin analysis
        </p>
      </div>

      {columnRequirements && (
        <div className="mb-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Table className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{columnRequirements.title}</h2>
            </div>
            <p className="text-gray-600 mb-6">{columnRequirements.description}</p>
            
            <div className="space-y-6">
              {columnRequirements.groups.map((group, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{group.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.columns.map((column) => (
                      <div
                        key={column}
                        className="px-3 py-2 bg-white rounded-md text-sm font-mono text-gray-700 border border-gray-200"
                      >
                        {column}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload your file
          </h3>
          <p className="text-gray-500 mb-4">
            Drag and drop your file here, or click to select
          </p>
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            disabled={fileSelected}
          />
          <label
  htmlFor="file-upload"
  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm 
    ${fileSelected ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} 
    text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${fileSelected ? '' : 'focus:ring-blue-500'}`}
>
  Select File
</label>

        </div>

        {file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <FileType className="h-5 w-5 text-blue-500" />
              <span className="text-gray-900 font-medium">{file.name}</span>
              <span className="text-gray-500 text-sm">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>

                  <button
        onClick={() => {
          setFile(null);
          setFileSelected(false);
          setValidationStatus(null);
        }}
        className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
      >
        Cancel
      </button>

            </div>
          </div>
        )}

        {validationStatus && (
          <div className={`mt-4 p-4 rounded-md ${
            validationStatus.isValid ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center space-x-2">
              {validationStatus.isValid ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`font-medium ${
                validationStatus.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationStatus.message}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <span>Supported formats: CSV, XLSX, XLS</span>
          </div>
        </div>
      </div>

      {validationStatus?.isValid && (
        <div className="mt-6 text-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={handleProceed}
          >
            Proceed with Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default DataImport;