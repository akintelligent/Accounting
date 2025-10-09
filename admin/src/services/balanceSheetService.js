import apiClient from "../api/apiClient";

// Balance Sheet Data (Pagination, Sorting, Date Filter)
export const getBalanceSheet = async (fromDate, toDate, page, pageSize, sortField, sortOrder) => {
  const response = await apiClient.get("/balance-sheet", {
    params: {
      fromDate: fromDate || null,
      toDate: toDate || null,
      page: page || 1,
      pageSize: pageSize || 10,
      sortField: sortField || "ACCOUNT_NAME",
      sortOrder: sortOrder || "ASC"
    }
  });
  return response.data;
};

// PDF Export
export const exportBalanceSheetPDF = async (fromDate, toDate) => {
  const response = await apiClient.get("/balance-sheet/report/pdf", {
    params: { fromDate, toDate },
    responseType: "blob"
  });
  return response.data;
};


// Excel Export
export const exportBalanceSheetExcel = async (fromDate, toDate) => {
  const response = await apiClient.get("/balance-sheet/report/excel", {
    params: { fromDate, toDate },
    responseType: "arraybuffer"
  });
  return response.data;
};
