import apiClient from "../api/apiClient";

// Get Balance Sheet (with pagination, sorting, date filter)
export const getBalanceSheet = async (fromDate, toDate, page = 1, pageSize = 10, sortField = "ACCOUNT_NAME", sortOrder = "ASC") => {
  const response = await apiClient.get("/balance-sheet", {
    params: { fromDate, toDate, page, pageSize, sortField, sortOrder }
  });
  return response.data;
};

// PDF Export
export const exportBalanceSheetPDF = async (fromDate, toDate) => {
  try {
    const response = await apiClient.get("/balance-sheet/report/pdf", {
      params: { fromDate, toDate },
      responseType: "blob"
    });
    return response.data;
  } catch (error) {
    console.error("PDF Export failed:", error);
    throw error;
  }
};

// Excel Export
export const exportBalanceSheetExcel = async (fromDate, toDate) => {
  try {
    const response = await apiClient.get("/balance-sheet/report/excel", {
      params: { fromDate, toDate },
      responseType: "arraybuffer"
    });
    return response.data;
  } catch (error) {
    console.error("Excel Export failed:", error);
    throw error;
  }
};
