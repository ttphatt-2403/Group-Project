import React, { useEffect, useState } from "react";
import booksApi from "../../API/books";

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await booksApi.getBooks(1, 200);
      setBooks(res?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa sách này?")) return;
    try {
      await booksApi.deleteBook(id);
      setBooks((b) => b.filter((x) => x.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="page-card">Đang tải sách...</div>;
  if (error) return <div className="page-card">Lỗi: {error}</div>;

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Quản lý Sách (Admin)</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Tác giả</th>
              <th>Available</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.availableCopies ?? "-"}</td>
                <td>
                  <button onClick={() => (window.location = `/books/${b.id}`)}>
                    Xem
                  </button>
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

export default BookManagement;
