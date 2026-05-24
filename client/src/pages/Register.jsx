import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = ({ onRegister }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
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
      const { data } = await api.post("/auth/register", form);
      onRegister(data.token, data.user);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
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
          <h1>Create your account</h1>
          <p>Join the channels and start chatting in seconds.</p>
          <div className="auth-badges">
            <span>Fast signup</span>
            <span>Realtime sync</span>
            <span>Mobile ready</span>
          </div>
          <div className="auth-links">
            <Link className="helper-link" to="/about">
              About / Info
            </Link>
            <Link className="helper-link" to="/login">
              Already have an account?
            </Link>
          </div>
        </div>
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Register</h2>
            <p>Create your profile to jump in.</p>
          </div>
          {error ? <div className="error-banner">{error}</div> : null}
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
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
                {loading ? "Creating..." : "Register"}
              </button>
              <Link className="helper-link" to="/login">
                Already have an account? Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
