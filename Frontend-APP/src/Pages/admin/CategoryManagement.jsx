import React, { useEffect, useState } from "react";
import categoriesApi from "../../API/categories";
import axios from "axios";
import { buildApiUrl } from "../../services/apiConfig";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [createFile, setCreateFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editFile, setEditFile] = useState(null);

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
      const created = await categoriesApi.createCategory({
        name,
        description,
        imageUrl: imageUrl || null,
      });
      // if user selected a file during creation, upload it now and update the category
      if (createFile && created?.id) {
        try {
          const up = await uploadFile(created.id, createFile);
          if (up?.imageUrl) {
            await categoriesApi.updateCategory(created.id, {
              id: created.id,
              name: created.name,
              description: created.description,
              imageUrl: up.imageUrl,
            });
          }
        } catch (uerr) {
          console.error("Upload failed", uerr);
        }
      }
      setName("");
      setDescription("");
      setImageUrl("");
      setCreateFile(null);
      await fetch();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const uploadFile = async (id, file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    const res = await axios.post(buildApiUrl(`/Category/upload/${id}`), fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
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

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditName(c.name || "");
    setEditDescription(c.description || "");
    setEditImageUrl(c.imageUrl ?? c.ImageUrl ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditImageUrl("");
  };

  const saveEdit = async (id) => {
    try {
      await categoriesApi.updateCategory(id, {
        id,
        name: editName,
        description: editDescription,
        imageUrl: editImageUrl || null,
      });
      await fetch();
      cancelEdit();
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
          <div className="form-field">
            <label>Mô tả (tuỳ chọn)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Image URL (dán link ảnh hoặc để trống để dùng assets)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Hoặc upload ảnh (tùy chọn)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCreateFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="form-actions">
            <button className="btn-primary" type="submit">
              Thêm
            </button>
          </div>
        </form>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {categories.map((c) => (
            <li
              key={c.id}
              style={{
                marginBottom: 12,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 60,
                  overflow: "hidden",
                  borderRadius: 8,
                  background: "#f3f4f6",
                }}
              >
                <img
                  src={
                    (c.imageUrl ?? c.ImageUrl) ||
                    `/assets/categories/${c.id}.jpg`
                  }
                  alt={c.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>

              <div style={{ flex: 1 }}>
                {editingId === c.id ? (
                  <div>
                    <div className="form-field">
                      <label>Tên</label>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Mô tả</label>
                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Image URL</label>
                      <input
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                      />
                      <div style={{ marginTop: 6 }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setEditFile(e.target.files?.[0] || null)
                          }
                        />
                        <button
                          style={{ marginLeft: 8 }}
                          onClick={async (ev) => {
                            ev.preventDefault();
                            if (!editFile)
                              return alert("Chọn file trước khi upload");
                            try {
                              const r = await uploadFile(c.id, editFile);
                              if (r?.imageUrl) {
                                setEditImageUrl(r.imageUrl);
                                // persist change
                                await saveEdit(c.id);
                              }
                            } catch (err) {
                              alert(
                                err?.response?.data?.message || err.message
                              );
                            }
                          }}
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button
                        className="btn-primary"
                        onClick={() => saveEdit(c.id)}
                      >
                        Lưu
                      </button>
                      <button style={{ marginLeft: 8 }} onClick={cancelEdit}>
                        Huỷ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <strong>{c.name}</strong>
                    <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                      {c.description}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => startEdit(c)}>Sửa</button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ marginLeft: 8 }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryManagement;
