import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "../services/apiConfig";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const url = buildApiUrl(`${API_ENDPOINTS.BOOKS}/${id}`);
        const res = await axios.get(url, { headers: authHeaders() });
        setBook(res.data ?? null);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  const handleBorrow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập để mượn sách");
        return;
      }

      // include userId as backend expects CreateBorrowRequest with UserId
      const rawUser = localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (!user || !user.id) {
        alert("Không xác định được user, vui lòng đăng nhập lại.");
        return;
      }

      const payload = {
        userId: user.id,
        bookId: parseInt(id, 10),
      };

      const res = await axios.post(
        buildApiUrl(API_ENDPOINTS.BORROWS),
        payload,
        {
          headers: authHeaders(),
        }
      );

      alert("Mượn sách thành công");

      // decrement availableCopies locally for immediate feedback
      setBook((b) => ({ ...b, availableCopies: (b.availableCopies ?? 0) - 1 }));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="page-container">Đang tải...</div>;
  if (error) return <div className="page-container">Lỗi: {error}</div>;
  if (!book) return <div className="page-container">Không tìm thấy sách.</div>;

  return (
    <div className="page-container">
      <div className="page-card">
        <div style={{ display: "flex", gap: 20 }}>
          {book.imageUrl ? (
            <img
              src={book.imageUrl}
              alt={book.title}
              style={{
                width: 220,
                height: 300,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />
          ) : (
            <div
              style={{
                width: 220,
                height: 300,
                background: "#eee",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              No image
            </div>
          )}

          <div style={{ flex: 1 }}>
            <h2 style={{ marginTop: 0 }}>{book.title}</h2>
            <div style={{ color: "#666", marginBottom: 8 }}>{book.author}</div>
            <div style={{ marginBottom: 8 }}>
              <strong>Thể loại:</strong>{" "}
              {book.category?.name ?? book.categoryName ?? "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Nhà xuất bản:</strong> {book.publisher ?? "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>ISBN:</strong> {book.isbn ?? "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Ngày xuất bản:</strong> {book.publishedDate ?? "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Tổng bản:</strong> {book.totalCopies ?? "-"} —{" "}
              <strong>Còn:</strong> {book.availableCopies ?? "-"}
            </div>

            <div style={{ marginTop: 12 }}>
              <Link
                to="/books"
                className="btn-secondary"
                style={{ marginRight: 8 }}
              >
                Quay lại
              </Link>
              {/* Borrow action for users */}
              {(() => {
                try {
                  const raw = localStorage.getItem("user");
                  const u = raw ? JSON.parse(raw) : null;
                  const role =
                    u && u.role ? String(u.role).toLowerCase() : null;
                  if (role === "user") {
                    return (
                      <button
                        className="btn-primary"
                        onClick={handleBorrow}
                        disabled={(book.availableCopies ?? 0) <= 0}
                      >
                        {book.availableCopies > 0 ? "Mượn sách" : "Hết hàng"}
                      </button>
                    );
                  }
                  if (role === "admin") {
                    return null; // admin sees edit controls elsewhere
                  }
                } catch (e) {}
                return null;
              })()}
            </div>
          </div>
        </div>

        {book.description && (
          <div style={{ marginTop: 18 }}>
            <h3>Mô tả</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{book.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
