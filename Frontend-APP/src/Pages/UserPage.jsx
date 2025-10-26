import React from "react";

const UserPage = () => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  if (!user)
    return (
      <div className="page-container">
        <div className="page-card">Chưa đăng nhập.</div>
      </div>
    );

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Trang người dùng</h2>
        <p>
          <strong>Họ tên:</strong> {user.fullname}
        </p>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Vai trò:</strong> {user.role}
        </p>
      </div>
    </div>
  );
};

export default UserPage;
