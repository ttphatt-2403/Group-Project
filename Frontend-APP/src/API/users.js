import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../services/apiConfig";

const BASE = API_ENDPOINTS.USERS;

export const getUsers = (pageNumber = 1, pageSize = 10) =>
  apiClient
    .get(`${BASE}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    .then((r) => r.data);

export const getUser = (id) =>
  apiClient.get(`${BASE}/${id}`).then((r) => r.data);
export const searchUsers = (keyword) =>
  apiClient
    .get(`${BASE}/search?keyword=${encodeURIComponent(keyword)}`)
    .then((r) => r.data);

export const createUser = (dto) =>
  apiClient.post(`${BASE}`, dto).then((r) => r.data);
export const updateUser = (id, dto) =>
  apiClient.put(`${BASE}/${id}`, dto).then((r) => r.data);
export const patchUser = (id, dto) =>
  apiClient.patch(`${BASE}/${id}`, dto).then((r) => r.data);
export const deleteUser = (id) =>
  apiClient.delete(`${BASE}/${id}`).then((r) => r.data);

export default {
  getUsers,
  getUser,
  searchUsers,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
};
