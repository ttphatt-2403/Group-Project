import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../services/apiConfig";

const BASE = API_ENDPOINTS.CATEGORIES;

export const getCategories = () => apiClient.get(`${BASE}`).then((r) => r.data);
export const getCategory = (id) =>
  apiClient.get(`${BASE}/${id}`).then((r) => r.data);
export const createCategory = (model) =>
  apiClient.post(`${BASE}`, model).then((r) => r.data);
export const updateCategory = (id, model) =>
  apiClient.put(`${BASE}/${id}`, model).then((r) => r.data);
export const deleteCategory = (id) =>
  apiClient.delete(`${BASE}/${id}`).then((r) => r.data);

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
