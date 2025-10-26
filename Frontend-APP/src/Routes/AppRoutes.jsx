import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../Form/Login";
import Register from "../Form/Register";
import Books from "../Pages/Books";
import BookDetail from "../Pages/BookDetail";
import Categories from "../Pages/Categories";
import Borrows from "../Pages/Borrows";
import BookManagement from "../Pages/admin/BookManagement";
import CategoryManagement from "../Pages/admin/CategoryManagement";
import BorrowManagement from "../Pages/admin/BorrowManagement";
import UserManagement from "../Pages/admin/UserManagement";
import UserBorrows from "../Pages/UserBorrows";
import Users from "../Pages/Users";
import Dashboard from "../Pages/Dashboard";
import UserPage from "../Pages/UserPage";
import Home from "../Pages/Home";
import BorrowLanding from "../Pages/BorrowLanding";

// Simple PrivateRoute component using localStorage 'user'
const PrivateRoute = ({ children, roles }) => {
  let raw = null;
  try {
    raw = localStorage.getItem("user");
  } catch (e) {
    raw = null;
  }
  const user = raw ? JSON.parse(raw) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && Array.isArray(roles) && roles.length > 0) {
    // normalize role comparison (backend may use different casing)
    const userRole = user && user.role ? String(user.role).toLowerCase() : null;
    const allowed = roles.map((r) => String(r).toLowerCase());
    if (!userRole || !allowed.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

// Login and Register components are implemented in ./Form
const Unauthorized = () => (
  <div>
    <h2>Unauthorized</h2>
  </div>
);

// Role-aware borrow route: guest sees landing, user sees own borrows, admin sees management
const BorrowRoute = () => {
  let raw = null;
  try {
    raw = localStorage.getItem("user");
  } catch (e) {
    raw = null;
  }
  const user = raw ? JSON.parse(raw) : null;
  const role = user && user.role ? String(user.role).toLowerCase() : null;

  if (!user) return <BorrowLanding />;
  if (role === "admin") return <BorrowManagement />;
  if (role === "user") return <UserBorrows />;

  return <BorrowLanding />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={["admin"]}>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Books listing should be public (browse without login) */}
      <Route path="/books" element={<Books />} />
      {/* Book detail (public read) */}
      <Route path="/books/:id" element={<BookDetail />} />

      <Route path="/categories" element={<Categories />} />

      {/* user borrows - only for normal users */}
      <Route path="/borrows" element={<BorrowRoute />} />

      {/* admin area */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute roles={["admin"]}>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/books"
        element={
          <PrivateRoute roles={["admin"]}>
            <BookManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <PrivateRoute roles={["admin"]}>
            <CategoryManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/borrows"
        element={
          <PrivateRoute roles={["admin"]}>
            <BorrowManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute roles={["admin"]}>
            <UserManagement />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute roles={["admin"]}>
            <Users />
          </PrivateRoute>
        }
      />

      <Route
        path="/user"
        element={
          <PrivateRoute roles={["user"]}>
            <UserPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/users"
        element={
          <PrivateRoute roles={["admin"]}>
            <Users />
          </PrivateRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
}
