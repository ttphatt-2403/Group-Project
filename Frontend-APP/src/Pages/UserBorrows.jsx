import React, { useEffect, useState } from "react";
import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "../services/apiConfig";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const UserBorrows = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const rawUser = localStorage.getItem("user");
        const user = rawUser ? JSON.parse(rawUser) : null;
        if (!user || !user.id) {
          setError("Không xác định được user");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          buildApiUrl(`${API_ENDPOINTS.BORROWS}/user/${user.id}`),
          { headers: authHeaders() }
        );
        setBorrows(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleReturn = async (id) => {
    try {
      await axios.put(
        buildApiUrl(`${API_ENDPOINTS.BORROWS}/${id}/return`),
        {},
        { headers: authHeaders() }
      );
      setBorrows((b) =>
        b.map((x) => (x.id === id ? { ...x, status: "returned" } : x))
      );
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="page-card">Đang tải phiếu mượn...</div>;
  if (error) return <div className="page-card">Lỗi: {error}</div>;

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Phiếu mượn của tôi</h2>
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Book</th>
              <th>Due</th>
              <th>Status</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.book?.title || b.bookId}</td>
                <td>
                  {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : ""}
                </td>
                <td>{b.status}</td>
                <td>
                  {b.status === "borrowed" && (
                    <button onClick={() => handleReturn(b.id)}>Trả sách</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserBorrows;
