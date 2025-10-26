import React, { useEffect, useState } from "react";
import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "../services/apiConfig";
import { Link } from "react-router-dom";
import "../Decorate/Form.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // categories endpoint is public
      const res = await axios.get(buildApiUrl(API_ENDPOINTS.CATEGORIES));
      setCategories(res.data ?? res.data?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // public page: category creation is available for admins in admin area
  const handleCreate = async (e) => {
    e.preventDefault();
    // noop on public page
  };

  if (loading) return <div>Đang tải thể loại...</div>;

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Duyệt Thể loại</h2>

        {error && <div className="error">{error}</div>}

        <ul>
          {categories.map((c) => (
            <li key={c.id}>
              <Link to={`/books?category=${c.id}`}>{c.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Categories;
