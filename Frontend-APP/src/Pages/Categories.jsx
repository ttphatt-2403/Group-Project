import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "../services/apiConfig";
import { Link, useNavigate } from "react-router-dom";
import "../Decorate/Categories.css";

// Marketplace-style categories page: card grid with search and quick links.
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(buildApiUrl(API_ENDPOINTS.CATEGORIES));
      // support APIs that wrap data or return plain array
      setCategories(res.data ?? res.data?.data ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Không thể tải thể loại"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return categories;
    const q = query.trim().toLowerCase();
    return categories.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [categories, query]);

  if (loading)
    return <div className="page-container">Đang tải thể loại...</div>;

  return (
    <div className="page-container categories-page">
      <header className="categories-header">
        <div>
          <h1>Khám phá Thể loại</h1>
          <p className="muted">
            Duyệt theo chủ đề để tìm sách bạn thích — lọc nhanh hoặc bấm vào thẻ
            để xem sản phẩm.
          </p>
        </div>

        <div className="categories-actions">
          <input
            aria-label="Tìm thể loại"
            className="search-input"
            placeholder="Tìm thể loại..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="btn btn-outline"
            onClick={() => {
              setQuery("");
              fetchCategories();
            }}
          >
            Reset
          </button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="categories-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">Không tìm thấy thể loại nào khớp.</div>
        ) : (
          filtered.map((c) => {
            // Use category id/name for a simple color/initials avatar
            const initials = (c.name || "")
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("");
            const colorSeed =
              (c.id || c.name || "").toString().charCodeAt(0) || 60;
            const hue = colorSeed % 360;

            // prefer an image from the API (c.imageUrl or c.ImageUrl) or a public asset fallback
            const publicImage = `/assets/categories/${c.id}.jpg`;
            const apiImage = c.imageUrl ?? c.ImageUrl;
            const imageSrc = apiImage || publicImage;

            return (
              <article
                key={c.id}
                className="category-card"
                onClick={() => navigate(`/books?category=${c.id}`)}
              >
                <div
                  className="card-media"
                  style={
                    !apiImage
                      ? {
                          background: `linear-gradient(135deg,hsl(${hue} 70% 55%), hsl(${
                            (hue + 40) % 360
                          } 70% 45%))`,
                        }
                      : undefined
                  }
                >
                  <img
                    src={imageSrc}
                    alt={c.name}
                    className="card-image"
                    onError={(e) => {
                      // if the image 404s or fails, hide it so the gradient/avatar shows
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="card-avatar">{initials}</div>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{c.name}</h3>
                  {typeof c.bookCount !== "undefined" && (
                    <div className="card-meta">{c.bookCount} sách</div>
                  )}
                  <div className="card-actions">
                    <Link
                      to={`/books?category=${c.id}`}
                      className="btn btn-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Xem sách
                    </Link>
                    <button
                      className="btn btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // quick filter: navigate to books with category
                        navigate(`/books?category=${c.id}`);
                      }}
                    >
                      Duyệt
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
};

export default Categories;
