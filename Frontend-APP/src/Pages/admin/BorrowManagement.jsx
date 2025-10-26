import React, { useEffect, useState } from "react";
import borrowsApi from "../../API/borrows";

const BorrowManagement = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await borrowsApi.getBorrows();
      setBorrows(res ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleReturn = async (id) => {
    if (!confirm("Xác nhận trả sách này?")) return;
    try {
      await borrowsApi.returnBorrow(id);
      setBorrows((b) =>
        b.map((x) => (x.id === id ? { ...x, status: "returned" } : x))
      );
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xác nhận xóa phiếu mượn?")) return;
    try {
      await borrowsApi.deleteBorrow(id);
      setBorrows((b) => b.filter((x) => x.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="page-card">Đang tải phiếu mượn...</div>;
  if (error) return <div className="page-card">Lỗi: {error}</div>;

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Quản lý Mượn trả (Admin)</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
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
                <td>{b.user?.fullname || b.user?.username || b.userId}</td>
                <td>{b.book?.title || b.bookId}</td>
                <td>
                  {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : ""}
                </td>
                <td>{b.status}</td>
                <td>
                  {b.status === "borrowed" && (
                    <button onClick={() => handleReturn(b.id)}>Trả</button>
                  )}
                  <button
                    onClick={() => handleDelete(b.id)}
                    style={{ marginLeft: 8 }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BorrowManagement;
