import apiClient from "../api/apiClient";

export const getDashboardStats = async () => {
  const response = await apiClient.get("/dashboard/stats");
  return response.data;
};
