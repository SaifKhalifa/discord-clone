import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      onLogin(data.token, data.user);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-panel">
          <div className="auth-brand">
            <div className="app-mark">DC</div>
            <div>
              <div className="app-title">Discord Clone</div>
              <div className="app-subtitle">Realtime chat space</div>
            </div>
          </div>
          <h1>Welcome back</h1>
          <p>Login to jump into your channels and catch up fast.</p>
          <div className="auth-badges">
            <span>Realtime rooms</span>
            <span>Presence-ready</span>
            <span>Clean signal</span>
          </div>
          <div className="auth-links">
            <Link className="helper-link" to="/about">
              About / Info
            </Link>
            <Link className="helper-link" to="/register">
              Create an account
            </Link>
          </div>
        </div>
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Sign in</h2>
            <p>Use your email and password to continue.</p>
          </div>
          {error ? <div className="error-banner">{error}</div> : null}
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </button>
              <Link className="helper-link" to="/register">
                Need an account? Create one
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
