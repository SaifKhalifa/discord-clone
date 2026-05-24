import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProjectInfoModal from "../components/ProjectInfoModal";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);
  const [infoOpen, setInfoOpen] = useState(true);

  const pendingSession = pendingLogin?.existingSession || null;

  const formattedSession = useMemo(() => {
    if (!pendingSession) {
      return null;
    }

    const formatDate = (value) =>
      value ? new Date(value).toLocaleString() : "Unknown";

    return {
      userAgent: pendingSession.userAgent || "Unknown device",
      ipAddress: pendingSession.ipAddress || "Unknown",
      createdAt: formatDate(pendingSession.createdAt),
      lastSeenAt: formatDate(pendingSession.lastSeenAt)
    };
  }, [pendingSession]);

  useEffect(() => {
    if (location.state?.pendingLogin) {
      setPendingLogin(location.state.pendingLogin);
      setError("");
      setInfo("");
      navigate("/login", { replace: true, state: {} });
      return;
    }

    if (location.state?.message) {
      setInfo(location.state.message);
      setError("");
      navigate("/login", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      onLogin(data.token, data.user);
      navigate("/chat");
    } catch (err) {
      const status = err.response?.status;
      const payload = err.response?.data;

      if (status === 409 && payload?.code === "SESSION_CONFLICT") {
        setPendingLogin({
          pendingLoginToken: payload.pendingLoginToken,
          csrfToken: payload.csrfToken,
          expiresAt: payload.expiresAt,
          existingSession: payload.existingSession
        });
        return;
      }

      setError(payload?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    if (!pendingLogin || decisionLoading) {
      return;
    }

    setDecisionLoading(true);
    setError("");
    setInfo("");

    try {
      const { data } = await api.post("/auth/login/confirm", {
        pendingLoginToken: pendingLogin.pendingLoginToken,
        csrfToken: pendingLogin.csrfToken,
        decision
      });

      if (decision === "keep") {
        setPendingLogin(null);
        navigate("/login", {
          replace: true,
          state: {
            message:
              data.message ||
              "Login cancelled. Your existing session is still active."
          }
        });
        return;
      }

      onLogin(data.token, data.user);
      navigate("/chat");
    } catch (err) {
      const status = err.response?.status;
      const payload = err.response?.data;
      setError(
        payload?.message ||
          "Unable to confirm login. Please try again."
      );

      if (status === 403 || status === 410) {
        setPendingLogin(null);
      }
    } finally {
      setDecisionLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <ProjectInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
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
            <button
              className="helper-link link-button"
              type="button"
              onClick={() => setInfoOpen(true)}
            >
              Project info & demo
            </button>
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
            <h2>{pendingLogin ? "Confirm login" : "Sign in"}</h2>
            <p>
              {pendingLogin
                ? "Choose how you want to continue this login."
                : "Use your email and password to continue."}
            </p>
          </div>
          {info ? <div className="info-banner">{info}</div> : null}
          {error ? <div className="error-banner">{error}</div> : null}
          {pendingLogin ? (
            <div className="conflict-card">
              <div className="conflict-message">
                <h3>Already signed in</h3>
                <p>
                  You are already signed in on another device or browser.
                  Continue here to sign out the other session, or keep the
                  existing one.
                </p>
              </div>
              {formattedSession ? (
                <div className="session-preview">
                  <div className="session-preview-label">Active session</div>
                  <div className="session-preview-row">
                    <span>Device</span>
                    <span>{formattedSession.userAgent}</span>
                  </div>
                  <div className="session-preview-row">
                    <span>IP</span>
                    <span>{formattedSession.ipAddress}</span>
                  </div>
                  <div className="session-preview-row">
                    <span>Created</span>
                    <span>{formattedSession.createdAt}</span>
                  </div>
                  <div className="session-preview-row">
                    <span>Last active</span>
                    <span>{formattedSession.lastSeenAt}</span>
                  </div>
                </div>
              ) : null}
              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => handleDecision("continue")}
                  disabled={decisionLoading}
                >
                  {decisionLoading ? "Confirming..." : "Continue here"}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => handleDecision("keep")}
                  disabled={decisionLoading}
                >
                  Keep old session
                </button>
                <button
                  className="link-button"
                  type="button"
                  onClick={() =>
                    navigate("/sessions", {
                      state: { pendingLogin }
                    })
                  }
                >
                  View sessions
                </button>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
