import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { buildApiUrl, API_ENDPOINTS } from "../services/apiConfig";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const url = buildApiUrl(
          `${API_ENDPOINTS.BOOKS}?pageNumber=1&pageSize=12`
        );
        const res = await axios.get(url, { headers: authHeaders() });
        setBooks(res.data?.data ?? res.data ?? []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1>Welcome to Library Manager</h1>
        <p style={{ maxWidth: 800, margin: "8px auto", color: "#444" }}>
          Browse featured books, explore categories, or sign in to manage the
          collection.
        </p>
        <div style={{ marginTop: 12 }}>
          <Link to="/login" style={{ marginRight: 12 }} className="btn-primary">
            Đăng nhập
          </Link>
          <Link to="/register" className="btn-secondary">
            Đăng ký
          </Link>
        </div>
      </div>

      <section>
        <h2 style={{ marginBottom: 12 }}>Featured books</h2>
        {loading && <div>Đang tải sách...</div>}
        {error && <div className="page-card">Lỗi: {error}</div>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {books.map((b) => (
            <div key={b.id} className="book-card page-card">
              <div style={{ fontWeight: 700 }}>{b.title}</div>
              <div style={{ color: "#666", marginBottom: 8 }}>{b.author}</div>
              <div style={{ fontSize: "0.9rem", color: "#333" }}>
                Available: {b.availableCopies ?? "-"}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Link to="/books" className="btn-primary">
            Xem tất cả sách
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
