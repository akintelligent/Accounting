import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default apiClient;
