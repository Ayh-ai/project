import {
  AlertCircle,
  ArrowLeft,
  Brain,
  Edit3,
  FileType,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface ColumnEdit {
  originalName: string;
  mappedName: string;
  isEditing: boolean;
  isDeleted: boolean;
  confidence?: number;
  reason?: string;
}

interface PreviewData {
  original: {
    headers: string[];
    sampleData: any[];
    totalRows: number;
  };
  preview: {
    headers: string[];
    sampleData: any[];
    totalRows: number;
  };
  changes: {
    columnMapping: { [key: string]: string };
    deletedColumns: string[];
    columnsDeleted: number;
    columnsRenamed: number;
  };
}

interface CorrectionResult {
  message: string;
  correctionReport: string;
  correctedData: string;
  hasCorrectedFile: boolean;
  correctedFileBase64: string | null;
  appliedMappings: { [key: string]: string };
  deletedColumns: string[];
}

interface MappingItem {
  originalName: string;
  suggestedName: string | null;
  confidence: string; // "high", "medium", "low"
  reason: string;
}

interface MappingResult {
  mappings: MappingItem[];
  total: number;
  mapped: number;
  unmapped: number;
  industryType?: string;
  overallConfidence?: number;
}

const DataImport = () => {
  const { industry } = useParams();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileSelected, setFileSelected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [columnEdits, setColumnEdits] = useState<ColumnEdit[]>([]);
  const [showMappingConfirmation, setShowMappingConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI mapping result
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(
    null
  );

  // Correction features
  const [showCorrectionPanel, setShowCorrectionPanel] = useState(false);
  const [correctionInstructions, setCorrectionInstructions] = useState("");
  const [isCorrectingData, setIsCorrectingData] = useState(false);
  const [correctionResult, setCorrectionResult] =
    useState<CorrectionResult | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid CSV or Excel file");
      return;
    }

    setFile(file);
    setFileSelected(true);
    setError(null);
    setIsProcessing(true);
    setColumnEdits([]);
    setShowMappingConfirmation(false);
    setShowCorrectionPanel(false);
    setCorrectionResult(null);
    setPreviewData(null);
    setMappingResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("industry", industry ?? "general");

      // Updated to use the correct mapping endpoint
      const res = await fetch("http://localhost:3001/api/correct-data", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Mapping API failed" }));
        throw new Error(errorData.message || "Mapping API failed");
      }

      const apiResponse = await res.json();
      console.log("Mapping response:", apiResponse);

      // Check if the response has the expected structure
      if (!apiResponse.mappings || !Array.isArray(apiResponse.mappings)) {
        throw new Error("Invalid response format from mapping API");
      }

      const data: MappingItem[] = apiResponse.mappings;

      // Transform the array response into the expected format
      const mappedItems = data.filter((item) => item.suggestedName !== null);
      const unmappedItems = data.filter((item) => item.suggestedName === null);

      // Create unmapped items from the unmappedColumns array in the response
      const unmappedFromResponse =
        apiResponse.unmappedColumns?.map((columnName: string) => ({
          originalName: columnName,
          suggestedName: null,
          confidence: "low",
          reason: "No suitable mapping found",
        })) || [];

      // Combine mapped and unmapped items
      const allItems = [...data, ...unmappedFromResponse];

      const transformedResult: MappingResult = {
        mappings: mappedItems,
        total: apiResponse.totalColumns || allItems.length,
        mapped: apiResponse.mappedColumns || mappedItems.length,
        unmapped: apiResponse.unmappedColumns?.length || unmappedItems.length,
        industryType: apiResponse.industry || industry || "general",
        overallConfidence: calculateOverallConfidence(allItems),
      };

      setMappingResult(transformedResult);

      // Create column edits from all items (mapped + unmapped)
      const edits: ColumnEdit[] = allItems.map((item) => ({
        originalName: item.originalName,
        mappedName: item.suggestedName || item.originalName,
        isEditing: false,
        isDeleted: false,
        confidence: getConfidenceScore(item.confidence),
        reason: item.reason,
      }));

      setColumnEdits(edits);
      setShowMappingConfirmation(true);
      setIsProcessing(false);
    } catch (err) {
      console.error("Error during mapping:", err);
      setError("Error processing file: " + (err as Error).message);
      setIsProcessing(false);
      setFileSelected(false);
      setFile(null);
    }
  };

  const calculateOverallConfidence = (mappings: MappingItem[]): number => {
    if (mappings.length === 0) return 0;

    const confidenceScores = mappings.map((item) =>
      getConfidenceScore(item.confidence)
    );
    const average =
      confidenceScores.reduce((sum, score) => sum + score, 0) /
      confidenceScores.length;
    return average;
  };

  const getConfidenceScore = (confidence: string): number => {
    switch (confidence?.toLowerCase()) {
      case "high":
        return 0.9;
      case "medium":
        return 0.7;
      case "low":
        return 0.4;
      default:
        return 0.3;
    }
  };

  const handleColumnEdit = (index: number, newValue: string) => {
    const updatedEdits = [...columnEdits];
    updatedEdits[index].mappedName = newValue;
    setColumnEdits(updatedEdits);
  };

  const toggleEdit = (index: number) => {
    const updatedEdits = [...columnEdits];
    updatedEdits[index].isEditing = !updatedEdits[index].isEditing;
    setColumnEdits(updatedEdits);
  };

  const toggleDeleteColumn = (index: number) => {
    const updatedEdits = [...columnEdits];
    updatedEdits[index].isDeleted = !updatedEdits[index].isDeleted;
    setColumnEdits(updatedEdits);
  };

  const resetMapping = () => {
    if (mappingResult) {
      const edits: ColumnEdit[] = mappingResult.mappings.map((mapping) => ({
        originalName: mapping.originalName,
        mappedName: mapping.suggestedName || mapping.originalName,
        isEditing: false,
        isDeleted: false,
        confidence: getConfidenceScore(mapping.confidence),
        reason: mapping.reason,
      }));

      // Add unmapped columns
      const unmappedEdits: ColumnEdit[] = columnEdits
        .filter(
          (edit) =>
            !mappingResult.mappings.some(
              (m) => m.originalName === edit.originalName
            )
        )
        .map((edit) => ({
          ...edit,
          isEditing: false,
          isDeleted: false,
        }));

      setColumnEdits([...edits, ...unmappedEdits]);
    }
  };

  const handlePreviewChanges = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const columnMapping = columnEdits
      .filter(
        (edit) => !edit.isDeleted && edit.mappedName !== edit.originalName
      )
      .reduce((acc, edit) => {
        acc[edit.originalName] = edit.mappedName;
        return acc;
      }, {} as { [key: string]: string });

    const columnsToDelete = columnEdits
      .filter((edit) => edit.isDeleted)
      .map((edit) => edit.originalName);

    formData.append("columnMapping", JSON.stringify(columnMapping));
    formData.append("columnsToDelete", JSON.stringify(columnsToDelete));

    try {
      setIsProcessing(true);
      const response = await fetch(
        "http://localhost:3001/api/preview-changes",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to generate preview" }));
        throw new Error(errorData.message || "Failed to generate preview");
      }

      const result = await response.json();
      setPreviewData(result);
      setShowPreview(true);
    } catch (err) {
      console.error("Preview error:", err);
      setError("Error generating preview: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCorrectData = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const columnMapping = columnEdits
      .filter(
        (edit) => !edit.isDeleted && edit.mappedName !== edit.originalName
      )
      .reduce((acc, edit) => {
        acc[edit.originalName] = edit.mappedName;
        return acc;
      }, {} as { [key: string]: string });

    const columnsToDelete = columnEdits
      .filter((edit) => edit.isDeleted)
      .map((edit) => edit.originalName);

    formData.append("columnMapping", JSON.stringify(columnMapping));
    formData.append("columnsToDelete", JSON.stringify(columnsToDelete));
    formData.append("correctionInstructions", correctionInstructions);

    try {
      setIsCorrectingData(true);
      const response = await fetch("http://localhost:3001/api/correct-data", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to correct data" }));
        throw new Error(errorData.message || "Failed to correct data");
      }

      const result = await response.json();
      setCorrectionResult(result);
      setShowCorrectionPanel(false);
    } catch (err) {
      console.error("Correction error:", err);
      setError("Error correcting data: " + (err as Error).message);
    } finally {
      setIsCorrectingData(false);
    }
  };

  const handleFinalProceed = () => {
    if (file && columnEdits.length > 0) {
      const finalMapping = columnEdits
        .filter((edit) => !edit.isDeleted)
        .reduce((acc, edit) => {
          acc[edit.originalName] = edit.mappedName;
          return acc;
        }, {} as { [key: string]: string });

      navigate(`/${industry}/analysis`, {
        state: {
          file,
          columnMapping: finalMapping,
          industryType: mappingResult?.industryType,
          correctionResult: correctionResult,
        },
      });
    }
  };

  const resetFile = () => {
    setFile(null);
    setFileSelected(false);
    setError(null);
    setColumnEdits([]);
    setShowMappingConfirmation(false);
    setShowCorrectionPanel(false);
    setCorrectionResult(null);
    setPreviewData(null);
    setShowPreview(false);
    setIsProcessing(false);
    setMappingResult(null);
    setIsDragging(false);
  };

  const getActiveColumns = () => columnEdits.filter((edit) => !edit.isDeleted);
  const getDeletedColumns = () => columnEdits.filter((edit) => edit.isDeleted);
  const getUnmappedColumns = () =>
    columnEdits.filter(
      (edit) =>
        !edit.isDeleted &&
        (edit.confidence === undefined || edit.confidence < 0.5)
    );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50";
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/home")}
        className="mb-8 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 capitalize mb-2">
          {industry?.replace("-", " ")} Data Import & Correction
        </h1>
        <p className="text-gray-600">
          Upload your data file - AI will map columns and help clean your data
        </p>
      </div>

      {/* File Upload Section */}
      {!showMappingConfirmation && (
        <>
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                AI-Powered Data Processing
              </h3>
            </div>
            <p className="text-blue-800 mt-2">
              Upload your file and our AI will automatically map columns,
              identify data quality issues, and help you clean and correct your
              data before analysis.
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
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
        ${
          fileSelected || isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
        }
        text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          fileSelected || isProcessing ? "" : "focus:ring-blue-500"
        }`}
              >
                {isProcessing ? "Processing..." : "Select File"}
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileType className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-900 font-medium">
                      {file.name}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>

                  {!isProcessing && (
                    <button
                      onClick={resetFile}
                      className="text-red-600 hover:text-red-800 text-sm underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {isProcessing && (
                  <div className="mt-2 flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">
                      AI is analyzing your columns...
                    </span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-md bg-red-50">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-800">{error}</span>
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
        </>
      )}

      {/* Column Mapping & Correction Section */}
      {showMappingConfirmation && mappingResult && (
        <div className="space-y-6">
          {/* AI Analysis Results */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  AI Analysis Results
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Detected Industry:{" "}
                  <strong className="capitalize">
                    {mappingResult.industryType || "General"}
                  </strong>
                </span>
                <span className="text-sm text-gray-600">
                  Overall Confidence:{" "}
                  <strong>
                    {((mappingResult.overallConfidence || 0) * 100).toFixed(0)}%
                  </strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {getActiveColumns().length}
                </div>
                <div className="text-sm text-green-800">Active Columns</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {getDeletedColumns().length}
                </div>
                <div className="text-sm text-red-800">Deleted Columns</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {getUnmappedColumns().length}
                </div>
                <div className="text-sm text-yellow-800">Needs Review</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {mappingResult.total}
                </div>
                <div className="text-sm text-blue-800">Total Columns</div>
              </div>
            </div>

            {getUnmappedColumns().length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    Some columns need your attention
                  </span>
                </div>
                <p className="text-yellow-700 text-sm">
                  The AI couldn't confidently map {getUnmappedColumns().length}{" "}
                  column(s). Please review and adjust the mappings below.
                </p>
              </div>
            )}
          </div>

          {/* Column Mapping Table */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Column Mappings
                </h3>
                <button
                  onClick={resetMapping}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                Review and adjust column mappings. Use the edit icon to modify
                mappings and the trash icon to delete columns.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original Column
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mapped To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {columnEdits.map((edit, index) => {
                    const confidence = edit.confidence || 0;
                    const isLowConfidence = confidence < 0.5;

                    return (
                      <tr
                        key={index}
                        className={`${
                          isLowConfidence && !edit.isDeleted
                            ? "bg-yellow-50"
                            : ""
                        } ${edit.isDeleted ? "bg-red-50 opacity-60" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <span
                            className={edit.isDeleted ? "line-through" : ""}
                          >
                            {edit.originalName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {edit.isDeleted ? (
                            <span className="text-red-600 italic">Deleted</span>
                          ) : edit.isEditing ? (
                            <input
                              type="text"
                              value={edit.mappedName}
                              onChange={(e) =>
                                handleColumnEdit(index, e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  toggleEdit(index);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <span
                              className={
                                isLowConfidence
                                  ? "text-yellow-800 font-medium"
                                  : ""
                              }
                            >
                              {edit.mappedName}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {edit.isDeleted ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Deleted
                            </span>
                          ) : isLowConfidence ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Needs Review
                            </span>
                          ) : (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConfidenceColor(
                                confidence
                              )}`}
                            >
                              {getConfidenceText(confidence)} (
                              {(confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {edit.isDeleted ? (
                            <span className="text-red-600 italic">
                              Column deleted
                            </span>
                          ) : (
                            <span title={edit.reason}>
                              {edit.reason || "No reason provided"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleEdit(index)}
                              className="text-blue-600 hover:text-blue-900"
                              disabled={edit.isDeleted}
                              title={
                                edit.isEditing
                                  ? "Save changes"
                                  : "Edit column name"
                              }
                            >
                              {edit.isEditing ? (
                                <Save className="h-4 w-4" />
                              ) : (
                                <Edit3 className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => toggleDeleteColumn(index)}
                              className={`${
                                edit.isDeleted
                                  ? "text-green-600 hover:text-green-900"
                                  : "text-red-600 hover:text-red-900"
                              }`}
                              title={
                                edit.isDeleted
                                  ? "Restore column"
                                  : "Delete column"
                              }
                            >
                              {edit.isDeleted ? (
                                <RotateCcw className="h-4 w-4" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={resetFile}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Start Over
            </button>

            <button
              onClick={handleFinalProceed}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700"
            >
              Proceed to Analysis
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataImport;
