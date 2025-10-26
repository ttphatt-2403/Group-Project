import React, { useEffect, useState } from "react";
import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "../services/apiConfig";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          buildApiUrl(`${API_ENDPOINTS.USERS}?pageNumber=1&pageSize=100`),
          { headers: authHeaders() }
        );
        setUsers(res.data?.data ?? res.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div>Đang tải người dùng...</div>;
  if (error) return <div className="page-card">Lỗi: {error}</div>;

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Quản lý Người dùng</h2>
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Fullname</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.fullname}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
