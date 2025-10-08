import apiClient from "../api/apiClient";

export const getJournalEntries = () => apiClient.get("/journal");
export const getJournalEntry = (id) => apiClient.get(`/journal/${id}`);
export const createJournalEntry = (data) => apiClient.post("/journal", data);
export const updateJournalEntry = (id, data) => apiClient.put(`/journal/${id}`, data);
export const postJournalEntry = (id) => apiClient.post(`/journal/${id}/post`);
export const deleteJournalEntry = (id) => apiClient.delete(`/journal/${id}`);
