import apiClient from "../api/apiClient";

export const getIncomeStatement = async (fromDate, toDate) => {
  try {
    const response = await apiClient.get("/income-statement", {
      params: { fromDate, toDate }
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching income statement:", error);
    throw error;
  }
};

export const exportIncomeStatementPDF = async (fromDate, toDate) => {
  try {
    const response = await apiClient.get("/income-statement/report/pdf", {
      params: { fromDate, toDate },
      responseType: "blob"
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting PDF:", error);
    throw error;
  }
};

export const exportIncomeStatementExcel = async (fromDate, toDate) => {
  try {
    const response = await apiClient.get("/income-statement/report/excel", {
      params: { fromDate, toDate },
      responseType: "blob"
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting Excel:", error);
    throw error;
  }
};
