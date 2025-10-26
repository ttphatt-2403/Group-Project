import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "./apiConfig";

const api = axios.create();

export const login = async (username, password) => {
  const res = await api.post(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
    Username: username,
    Password: password,
  });
  return res.data;
};

export const register = async (userData) => {
  // userData: { username, email, password, fullname?, phone? }
  const payload = {
    Username: userData.username,
    Email: userData.email,
    Password: userData.password,
    Fullname: userData.fullname || null,
    Phone: userData.phone || null,
  };
  const res = await api.post(buildApiUrl(API_ENDPOINTS.AUTH.REGISTER), payload);
  return res.data;
};

export default { login, register };
