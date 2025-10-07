import apiClient from "../api/apiClient";

export const getEmployees = async () => {
  return await apiClient.get("/employees");
};

export const getEmployeeById = async (empId) => {
  return await apiClient.get(`/employees/${empId}`);
};

export const createEmployee = async (formData) => {
  return await apiClient.post("/employees/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateEmployee = async (empId, formData) => {
  return await apiClient.put(`/employees/${empId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteEmployee = async (empId) => {
  return await apiClient.delete(`/employees/${empId}`);
};
