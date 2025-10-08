import apiClient from "../api/apiClient";

export const getAccounts = () => apiClient.get("/accounts");
export const getAccountTree = () => apiClient.get("/accounts/tree");
export const getAccount = (id) => apiClient.get(`/accounts/${id}`);
export const createAccount = (data) => apiClient.post("/accounts/add", data);
export const updateAccount = (id, data) => apiClient.put(`/accounts/${id}`, data);
export const deleteAccount = (id) => apiClient.delete(`/accounts/${id}`);
