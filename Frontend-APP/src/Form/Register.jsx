import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../Decorate/Form.css";

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required("Bắt buộc").min(3, "Ít nhất 3 ký tự"),
  email: Yup.string().email("Email không hợp lệ").required("Bắt buộc"),
  password: Yup.string().required("Bắt buộc").min(6, "Ít nhất 6 ký tự"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("password"), null],
    "Mật khẩu không khớp"
  ),
});

const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div className="form-card">
      <h2>Đăng ký</h2>
      <Formik
        initialValues={{
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          fullname: "",
          phone: "",
        }}
        validationSchema={RegisterSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setServerError("");
          setSuccess("");
          try {
            const payload = {
              username: values.username,
              email: values.email,
              password: values.password,
              fullname: values.fullname,
              phone: values.phone,
            };
            await authService.register(payload);
            setSuccess("Đăng ký thành công — vui lòng đăng nhập");
            setTimeout(() => navigate("/login"), 1200);
          } catch (err) {
            // Log full error for debugging and show server response if present
            console.error("Register error:", err);
            const resp = err?.response?.data;
            const message =
              resp?.message || resp || err?.message || "Lỗi đăng ký";
            // If resp is an object, stringify to show details
            setServerError(
              typeof message === "object" ? JSON.stringify(message) : message
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-field">
              <label>Username</label>
              <Field name="username" />
              <ErrorMessage name="username" component="div" className="error" />
            </div>

            <div className="form-field">
              <label>Email</label>
              <Field name="email" />
              <ErrorMessage name="email" component="div" className="error" />
            </div>

            <div className="form-field">
              <label>Fullname (tuỳ chọn)</label>
              <Field name="fullname" />
            </div>

            <div className="form-field">
              <label>Phone (tuỳ chọn)</label>
              <Field name="phone" />
            </div>

            <div className="form-field">
              <label>Password</label>
              <Field name="password" type="password" />
              <ErrorMessage name="password" component="div" className="error" />
            </div>

            <div className="form-field">
              <label>Confirm Password</label>
              <Field name="confirmPassword" type="password" />
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="error"
              />
            </div>

            {serverError && <div className="error">{serverError}</div>}
            {success && <div style={{ color: "#8bd78b" }}>{success}</div>}

            <div className="form-actions">
              <button
                className="btn-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang..." : "Đăng ký"}
              </button>
              <div className="helper-text">
                Đã có tài khoản? <a href="/login">Đăng nhập</a>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Register;
