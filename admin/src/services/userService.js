import apiClient from "../Api/apiClient";

export const getUsers = () => apiClient.get("/users");
export const getEmployees = () => apiClient.get("/users/employees");
export const getRoles = () => apiClient.get("/users/roles");
export const createUser = (data) => apiClient.post("/users/add", data);
export const updateUser = (id, data) => apiClient.put(`/users/${id}`, data);
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);
