import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Sessions = ({ auth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pendingLogin = location.state?.pendingLogin || null;
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString() : "Unknown";

  const formattedPending = useMemo(() => {
    const session = pendingLogin?.existingSession;
    if (!session) {
      return null;
    }

    return {
      id: session.id || "pending",
      userAgent: session.userAgent || "Unknown device",
      ipAddress: session.ipAddress || "Unknown",
      createdAt: formatDate(session.createdAt),
      lastSeenAt: formatDate(session.lastSeenAt)
    };
  }, [pendingLogin]);

  useEffect(() => {
    if (!auth?.token && !pendingLogin) {
      navigate("/login", {
        replace: true,
        state: { message: "Please sign in to view sessions." }
      });
    }
  }, [auth?.token, navigate, pendingLogin]);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    const fetchSessions = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/auth/sessions");
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [auth?.token]);

  const handleRevoke = async (sessionId) => {
    if (!sessionId) {
      return;
    }

    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/auth/sessions/revoke", { sessionId });
      setMessage(data.message || "Session revoked.");
      const refreshed = await api.get("/auth/sessions");
      setSessions(refreshed.data.sessions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to revoke session.");
    }
  };

  const renderSessionRow = (session) => (
    <div key={session.id} className="session-row">
      <div className="session-row-main">
        <div className="session-device">{session.userAgent}</div>
        <div className="session-meta">
          <span>IP {session.ipAddress || "Unknown"}</span>
          <span>Created {formatDate(session.createdAt)}</span>
          <span>Last active {formatDate(session.lastSeenAt)}</span>
        </div>
      </div>
      <div className="session-row-actions">
        {session.isCurrent ? (
          <span className="session-chip">Current</span>
        ) : (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => handleRevoke(session.id)}
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="sessions-page">
      <div className="sessions-shell">
        <div className="sessions-header">
          <div>
            <h1>Active sessions</h1>
            <p>Review where your account is signed in.</p>
          </div>
          <div className="sessions-header-actions">
            <Link className="helper-link" to="/chat">
              Back to chat
            </Link>
            <Link className="helper-link" to="/login">
              Sign in
            </Link>
          </div>
        </div>

        {message ? <div className="info-banner">{message}</div> : null}
        {error ? <div className="error-banner">{error}</div> : null}

        {auth?.token ? (
          <div className="session-card">
            {loading ? (
              <div className="empty-state">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="empty-state">No active sessions found.</div>
            ) : (
              sessions.map(renderSessionRow)
            )}
          </div>
        ) : (
          <div className="session-card">
            <div className="session-info">
              <h2>Current session</h2>
              <p>
                You are viewing session details for the account you attempted
                to sign in with.
              </p>
            </div>
            {formattedPending ? (
              <div className="session-row">
                <div className="session-row-main">
                  <div className="session-device">
                    {formattedPending.userAgent}
                  </div>
                  <div className="session-meta">
                    <span>IP {formattedPending.ipAddress}</span>
                    <span>Created {formattedPending.createdAt}</span>
                    <span>Last active {formattedPending.lastSeenAt}</span>
                  </div>
                </div>
                <div className="session-row-actions">
                  <span className="session-chip">Active</span>
                </div>
              </div>
            ) : (
              <div className="empty-state">No session details available.</div>
            )}
            <div className="session-footer">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() =>
                  navigate("/login", {
                    state: { pendingLogin }
                  })
                }
              >
                Back to confirmation
              </button>
              <Link className="helper-link" to="/login">
                Return to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
