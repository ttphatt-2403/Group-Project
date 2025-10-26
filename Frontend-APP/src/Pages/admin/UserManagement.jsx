import React, { useEffect, useState } from "react";
import usersApi from "../../API/users";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers(1, 200);
      setUsers(res?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await usersApi.updateUser(id, { id, role });
      setUsers((u) => u.map((x) => (x.id === id ? { ...x, role } : x)));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa user?")) return;
    try {
      await usersApi.deleteUser(id);
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="page-card">Đang tải người dùng...</div>;
  if (error) return <div className="page-card">Lỗi: {error}</div>;

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Quản lý Người dùng (Admin)</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Fullname</th>
              <th>Role</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.fullname}</td>
                <td>
                  <select
                    value={u.role || "user"}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => (window.location = `/users/${u.id}`)}>
                    Xem
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
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

export default UserManagement;
