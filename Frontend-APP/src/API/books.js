import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../services/apiConfig";

const BASE = API_ENDPOINTS.BOOKS;

export const getBooks = (pageNumber = 1, pageSize = 10) =>
  apiClient
    .get(`${BASE}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
    .then((r) => r.data);

export const getBook = (id) =>
  apiClient.get(`${BASE}/${id}`).then((r) => r.data);

export const searchBooks = (query = "", pageNumber = 1, pageSize = 10) =>
  apiClient
    .get(
      `${BASE}/search?query=${encodeURIComponent(
        query
      )}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
    .then((r) => r.data);

export const getBooksByCategory = (categoryId) =>
  apiClient.get(`${BASE}/category/${categoryId}`).then((r) => r.data);

export const createBook = (book) =>
  apiClient.post(`${BASE}`, book).then((r) => r.data);
export const updateBook = (id, book) =>
  apiClient.put(`${BASE}/${id}`, book).then((r) => r.data);
export const deleteBook = (id) =>
  apiClient.delete(`${BASE}/${id}`).then((r) => r.data);

export default {
  getBooks,
  getBook,
  searchBooks,
  getBooksByCategory,
  createBook,
  updateBook,
  deleteBook,
};
