import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { buildApiUrl, API_ENDPOINTS } from "../services/apiConfig";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const category = params.get("category");

        if (category) {
          const url = buildApiUrl(
            `${API_ENDPOINTS.BOOKS}/category/${category}`
          );
          const res = await axios.get(url);
          setBooks(res.data ?? res.data?.data ?? []);
        } else {
          const url = buildApiUrl(
            `${API_ENDPOINTS.BOOKS}?pageNumber=1&pageSize=100`
          );
          const res = await axios.get(url);
          setBooks(res.data?.data ?? res.data ?? []);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [location.search]);

  if (loading) return <div className="page-container">Đang tải sách...</div>;
  if (error)
    return (
      <div className="page-container">
        <div className="page-card">Lỗi: {error}</div>
      </div>
    );

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 style={{ textAlign: "center", marginBottom: 18 }}>
          Các sách bạn có thể tìm
        </h2>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table className="books-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Tiêu đề</th>
                <th>Author</th>
                <th style={{ width: 140 }}>Available</th>
                <th style={{ width: 140 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td style={{ textAlign: "left" }}>{b.title}</td>
                  <td>{b.author}</td>
                  <td style={{ textAlign: "center" }}>
                    {b.availableCopies ?? "-"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <Link to={`/books/${b.id}`} className="btn-primary">
                        Xem chi tiết
                      </Link>
                      {user ? (
                        <Link to={`/books/${b.id}`} className="btn-secondary">
                          Mượn
                        </Link>
                      ) : (
                        <Link to={`/login`} className="btn-secondary">
                          Đăng nhập để mượn
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Books;
