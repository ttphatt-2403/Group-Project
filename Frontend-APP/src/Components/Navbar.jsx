import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Decorate/Navbar.css";

const UsernameBadge = ({ user }) => (
  <div className="username-badge">
    <div style={{ opacity: 0.95 }}>{user.fullname || user.username}</div>
    <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>({user.role})</div>
  </div>
);

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const userRole = user && user.role ? String(user.role).toLowerCase() : null;

  // small inline styles for role badges so they're visible without extra CSS edits
  const badgeCommon = {
    fontSize: "0.65rem",
    marginLeft: 8,
    padding: "2px 6px",
    borderRadius: 10,
    color: "#fff",
    display: "inline-block",
  };
  const adminBadgeStyle = { ...badgeCommon, background: "#6f42c1" };
  const userBadgeStyle = { ...badgeCommon, background: "#28a745" };

  useEffect(() => {
    // update when auth changes inside same window (dispatched by login/logout)
    const onAuthChanged = () => {
      console.debug("Navbar: authChanged event received");
      try {
        const raw = localStorage.getItem("user");
        const parsed = raw ? JSON.parse(raw) : null;
        console.debug("Navbar: updated user from localStorage", parsed);
        setUser(parsed);
      } catch (e) {
        setUser(null);
      }
    };

    // also react to storage events from other tabs/windows
    const onStorage = (e) => {
      // storage events fire on other windows/tabs; log for debugging
      console.debug("Navbar: storage event", e.key, e.newValue);
      if (e.key === "user" || e.key === "token") onAuthChanged();
    };

    window.addEventListener("authChanged", onAuthChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // notify app and navigate to home
    try {
      window.dispatchEvent(new Event("authChanged"));
      console.debug("Navbar: dispatched authChanged on logout");
    } catch (e) {}
    navigate("/");
  };

  return (
    <nav className="app-navbar">
      <div className="brand-area">
        <Link to="/" className="brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">Library Manager</span>
        </Link>
        <button
          className={`menu-toggle ${open ? "open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`nav-links ${open ? "open" : ""}`}>
        {user && userRole === "admin" ? (
          // Admin sees management links
          <>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/admin/books" className="nav-link">
              Quản lý Sách
            </Link>
            <Link to="/admin/categories" className="nav-link">
              Quản lý Thể loại
            </Link>
            <Link to="/admin/borrows" className="nav-link">
              Quản lý Mượn trả
            </Link>
            <Link to="/admin/users" className="nav-link">
              Quản lý Người dùng
            </Link>
          </>
        ) : (
          // Guests and regular users see public browsing links
          <>
            <Link to="/books" className="nav-link">
              Sách
            </Link>
            <Link to="/categories" className="nav-link">
              Thể loại
            </Link>
            <Link to="/borrows" className="nav-link">
              Mượn trả
            </Link>
          </>
        )}

        {user && userRole === "user" && (
          <Link to="/user" className="nav-link">
            My Page{" "}
            <span style={userBadgeStyle} aria-hidden>
              User
            </span>
          </Link>
        )}
      </div>

      <div className="spacer" />

      <div className="user-area">
        {!user ? (
          <>
            <Link to="/login" className="nav-link auth-link">
              Đăng nhập
            </Link>
            <Link to="/register" className="nav-link auth-link auth-cta">
              Đăng ký
            </Link>
          </>
        ) : (
          <div className="user-dropdown">
            <div className="avatar">
              {(user.fullname || user.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="user-name">
              Xin chào,{" "}
              <span className="user-greet-name">
                {user.fullname || user.username}
              </span>
            </div>
            <div className="user-actions">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
