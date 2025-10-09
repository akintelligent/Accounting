import apiClient from "../api/apiClient";

export const getTrialBalance = async () => {
  try {
    const response = await apiClient.get("/trial-balance");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching trial balance:", error);
    throw error;
  }
};
