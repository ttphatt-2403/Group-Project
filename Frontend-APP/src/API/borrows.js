import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../services/apiConfig";

const BASE = API_ENDPOINTS.BORROWS;

export const getBorrows = () => apiClient.get(`${BASE}`).then((r) => r.data);
export const getBorrow = (id) =>
  apiClient.get(`${BASE}/${id}`).then((r) => r.data);
export const getBorrowsByUser = (userId) =>
  apiClient.get(`${BASE}/user/${userId}`).then((r) => r.data);
export const getOverdueBorrows = () =>
  apiClient.get(`${BASE}/overdue`).then((r) => r.data);

export const createBorrow = (dto) =>
  apiClient.post(`${BASE}`, dto).then((r) => r.data);
export const returnBorrow = (id, notes) =>
  apiClient.put(`${BASE}/${id}/return`, { notes }).then((r) => r.data);
export const updateBorrow = (id, dto) =>
  apiClient.put(`${BASE}/${id}`, dto).then((r) => r.data);
export const deleteBorrow = (id) =>
  apiClient.delete(`${BASE}/${id}`).then((r) => r.data);

export default {
  getBorrows,
  getBorrow,
  getBorrowsByUser,
  getOverdueBorrows,
  createBorrow,
  returnBorrow,
  updateBorrow,
  deleteBorrow,
};
