export const API_BASE_URL = "http://localhost:5053/api";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/Auth/login",
    REGISTER: "/Auth/register",
    ME: "/Auth/me",
  },
  USERS: "/Users",
  CATEGORIES: "/Category",
  BOOKS: "/Book",
  BORROWS: "/Borrow",
};

export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
