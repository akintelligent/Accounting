import apiClient from "../api/apiClient";

export const getCashFlow = async () => {
  try {
    const response = await apiClient.get("/cash-flow");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching cash flow:", error);
    throw error;
  }
};
