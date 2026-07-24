import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authAPI } from "../services/api.js";
import { MatrixRain, CyberButton, NeonBorder } from "../components/CommonUI.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token, user } = res.data;
      localStorage.setItem("ot_token", token);
      localStorage.setItem("ot_user", JSON.stringify(user));
      navigate(from, { replace: true });
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        throw new Error("No Google ID token credential received");
      }
      const res = await authAPI.googleAuth({ credential });
      const { token, user } = res.data;
      localStorage.setItem("ot_token", token);
      localStorage.setItem("ot_user", JSON.stringify(user));
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google Login Failed: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020208",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Share Tech Mono',monospace",
      }}
    >
      <MatrixRain />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "420px",
          padding: "24px",
        }}
      >
        <NeonBorder color="#7c3aed" style={{ padding: "36px", borderRadius: "4px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                fontSize: "20px",
                fontFamily: "'Orbitron',monospace",
                color: "#fff",
                letterSpacing: "4px",
                marginBottom: "6px",
              }}
            >
              ACCESS PORTAL
            </div>
            <div style={{ fontSize: "11px", color: "#666", letterSpacing: "2px" }}>
              SECURE AUTHENTICATION
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "10px", color: "#00d4ff88", letterSpacing: "2px", marginBottom: "6px" }}>
                EMAIL ADDRESS
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@domain.io"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#0a0a1a",
                  border: "1px solid #00d4ff33",
                  color: "#e0e0e0",
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "13px",
                  borderRadius: "2px",
                }}
                required
              />
            </div>
            <div>
              <div style={{ fontSize: "10px", color: "#00d4ff88", letterSpacing: "2px", marginBottom: "6px" }}>
                PASSWORD
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#0a0a1a",
                  border: "1px solid #00d4ff33",
                  color: "#e0e0e0",
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "13px",
                  borderRadius: "2px",
                }}
                required
              />
            </div>

            <CyberButton
              type="submit"
              disabled={loading}
              style={{ width: "100%", marginTop: "8px", padding: "14px", fontSize: "14px" }}
            >
              {loading ? "AUTHENTICATING..." : "▶ AUTHENTICATE"}
            </CyberButton>
          </form>

          <div style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "#ffffff11" }} />
            <div style={{ color: "#666", fontSize: "11px", letterSpacing: "2px" }}>OR</div>
            <div style={{ flex: 1, height: "1px", background: "#ffffff11" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "20px" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google Login Failed")}
              theme="filled_black"
              shape="rectangular"
              size="large"
              width="350"
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Link to="/signup" style={{ color: "#7c3aed88", fontSize: "11px", letterSpacing: "1px", textDecoration: "none" }}>
              NEW OPERATOR? REGISTER →
            </Link>
          </div>
        </NeonBorder>
      </div>
    </div>
  );
}
