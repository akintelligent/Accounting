import apiClient from "../api/apiClient";

// ✅ Fetch ledger list (JSON)
export const getLedgerList = (params) =>
  apiClient.get("/ledger", { params });

// ✅ Generate single voucher PDF (blob)
// export const getLedgerVoucher = (voucherId) =>
//   apiClient.get(`/ledger/voucher/${voucherId}`, {
//     responseType: "blob", // important for 
    
  // });
  export const getLedgerVoucher = (voucherId) => {
  const url = `${apiClient.defaults.baseURL}/ledger/voucher/${voucherId}`;
  window.open(url, "_blank"); // ✅ Open in new tab/window
};
