import React, { useEffect, useState } from "react";
import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "../services/apiConfig";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const bookRes = await axios.get(
          buildApiUrl(`${API_ENDPOINTS.BOOKS}?pageNumber=1&pageSize=1`),
          { headers: authHeaders() }
        );
        const userRes = await axios.get(
          buildApiUrl(`${API_ENDPOINTS.USERS}?pageNumber=1&pageSize=1`),
          { headers: authHeaders() }
        );
        const overdueRes = await axios.get(
          buildApiUrl(`${API_ENDPOINTS.BORROWS}/overdue`),
          { headers: authHeaders() }
        );

        const totalBooks = bookRes.data?.totalRecords ?? 0;
        const totalUsers =
          userRes.data?.totalUsers ?? userRes.data?.totalRecords ?? 0;
        const overdue = Array.isArray(overdueRes.data)
          ? overdueRes.data.length
          : overdueRes.data?.length ?? 0;

        setStats({ totalBooks, totalUsers, overdue });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div>Đang tải dashboard...</div>;

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Library Dashboard</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div
            style={{ padding: "1rem", background: "#0f0f0f", borderRadius: 8 }}
          >
            <div>Total Books</div>
            <div style={{ fontSize: "1.6rem" }}>{stats.totalBooks}</div>
          </div>
          <div
            style={{ padding: "1rem", background: "#0f0f0f", borderRadius: 8 }}
          >
            <div>Total Users</div>
            <div style={{ fontSize: "1.6rem" }}>{stats.totalUsers}</div>
          </div>
          <div
            style={{ padding: "1rem", background: "#0f0f0f", borderRadius: 8 }}
          >
            <div>Overdue Borrows</div>
            <div style={{ fontSize: "1.6rem" }}>{stats.overdue}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
