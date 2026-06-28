import React, { useEffect, useState, useCallback, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import "@/App.css";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ProjectSetup from "@/pages/ProjectSetup";
import ProjectDetail from "@/pages/ProjectDetail";
import Analysis from "@/pages/Analysis";
import Report from "@/pages/Report";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/auth/me`);
      setUser(r.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh]);

  const logout = async () => {
    try { await axios.post(`${API}/auth/logout`); } catch {}
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, refresh, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = React.useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const session_id = params.get("session_id");
    if (!session_id) {
      navigate("/", { replace: true });
      return;
    }
    (async () => {
      try {
        const r = await axios.post(`${API}/auth/session`, { session_id });
        setUser(r.data.user);
        // Clear hash and redirect
        window.history.replaceState(null, "", "/dashboard");
        navigate("/dashboard", { replace: true, state: { user: r.data.user } });
      } catch (e) {
        navigate("/", { replace: true });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center" data-testid="auth-callback">
      <div className="font-mono text-sm">authenticating…</div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [user, loading, navigate]);
  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-sm">loading…</div>;
  if (!user) return null;
  return children;
}

function AppRouter() {
  const location = useLocation();
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><ProjectSetup /></ProtectedRoute>} />
      <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
      <Route path="/projects/:projectId/analyze/:reportId" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
      <Route path="/reports/:reportId" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/share/:token" element={<Report />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
