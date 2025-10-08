import apiClient from "../api/apiClient";

export const getLedgerList = (params) =>
  apiClient.get("/ledger", { params });

export const getLedgerReport = (params) =>
  apiClient.get("/ledger/report", { params, responseType: "blob" });

export const getLedgerVoucher = (voucherId) =>
  apiClient.get(`/ledger/voucher/${voucherId}`, { responseType: "blob" });
