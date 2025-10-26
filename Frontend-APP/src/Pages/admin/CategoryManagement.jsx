import React, { useEffect, useState } from "react";
import categoriesApi from "../../API/categories";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getCategories();
      setCategories(res ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await categoriesApi.createCategory({ name, description: "" });
      setName("");
      fetch();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa thể loại này?")) return;
    try {
      await categoriesApi.deleteCategory(id);
      setCategories((c) => c.filter((x) => x.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="page-card">Đang tải thể loại...</div>;
  if (error) return <div className="page-card">Lỗi: {error}</div>;

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Quản lý Thể loại (Admin)</h2>
        <form onSubmit={handleCreate} style={{ marginBottom: 12 }}>
          <div className="form-field">
            <label>Tên thể loại</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-actions">
            <button className="btn-primary" type="submit">
              Thêm
            </button>
          </div>
        </form>

        <ul>
          {categories.map((c) => (
            <li key={c.id}>
              {c.name}{" "}
              <button
                onClick={() => handleDelete(c.id)}
                style={{ marginLeft: 8 }}
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryManagement;
