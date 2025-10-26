import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../services/apiConfig";

export const login = (username, password) =>
  apiClient
    .post(API_ENDPOINTS.AUTH.LOGIN, { Username: username, Password: password })
    .then((r) => r.data);

export const register = (userData) => {
  const payload = {
    Username: userData.username,
    Email: userData.email,
    Password: userData.password,
    Fullname: userData.fullname || null,
    Phone: userData.phone || null,
  };
  return apiClient
    .post(API_ENDPOINTS.AUTH.REGISTER, payload)
    .then((r) => r.data);
};

export const me = () =>
  apiClient.get(API_ENDPOINTS.AUTH.ME).then((r) => r.data);

export default { login, register, me };
