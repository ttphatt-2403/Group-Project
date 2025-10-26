import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../Decorate/Form.css";

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Bắt buộc"),
  password: Yup.string().required("Bắt buộc"),
});

const Login = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  return (
    <div className="form-card">
      <h2>Đăng nhập</h2>
      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setServerError("");
          try {
            const data = await authService.login(
              values.username,
              values.password
            );
            const token = data?.token ?? data?.Token ?? null;
            const user = data?.user ?? data?.User ?? null;
            if (token) localStorage.setItem("token", token);
            if (user) localStorage.setItem("user", JSON.stringify(user));

            // debug logs: verify stored values
            console.debug("Login: stored token", !!token);
            console.debug("Login: stored user", user);

            // notify other parts of app that auth changed
            try {
              window.dispatchEvent(new Event("authChanged"));
              console.debug("Login: dispatched authChanged event");
            } catch (e) {}

            // After login go to home where greeting is shown
            navigate("/");
          } catch (err) {
            const message =
              err?.response?.data?.message || err?.message || "Lỗi đăng nhập";
            setServerError(message);
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
              <label>Password</label>
              <Field name="password" type="password" />
              <ErrorMessage name="password" component="div" className="error" />
            </div>

            {serverError && <div className="error">{serverError}</div>}

            <div className="form-actions">
              <button
                className="btn-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang..." : "Đăng nhập"}
              </button>
              <div className="helper-text">
                Chưa có tài khoản? <a href="/register">Đăng ký</a>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
