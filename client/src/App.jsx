import { Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import api from "./api/axios";

const getStoredAuth = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  return {
    token: token || null,
    user: user ? JSON.parse(user) : null
  };
};

const RequireAuth = ({ auth, children }) => {
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [auth, setAuth] = useState(getStoredAuth);

  const handleAuthSuccess = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, user });
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Ignore logout errors; we'll still clear local state.
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={auth.token ? "/chat" : "/login"} replace />}
      />
      <Route path="/login" element={<Login onLogin={handleAuthSuccess} />} />
      <Route
        path="/register"
        element={<Register onRegister={handleAuthSuccess} />}
      />
      <Route
        path="/chat"
        element={
          <RequireAuth auth={auth}>
            <Chat auth={auth} onLogout={handleLogout} />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
