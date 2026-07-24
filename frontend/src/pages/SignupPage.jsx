import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authAPI, API_URL } from "../services/api.js";
import { MatrixRain, CyberButton, NeonBorder } from "../components/CommonUI.jsx";

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      const { token, user } = res.data;
      localStorage.setItem("ot_token", token);
      localStorage.setItem("ot_user", JSON.stringify(user));
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Signup failed:", err.response?.status, err.response?.data || err.message);
      alert(
        err.response?.status === 404
          ? `Auth endpoint not found (404) at ${API_URL}/auth/register — check VITE_API_URL includes /api`
          : err.response?.data?.message || "Registration failed"
      );
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
      console.error("Google auth failed:", err.response?.status, err.response?.data || err.message);
      alert(
        err.response?.status === 404
          ? `Auth endpoint not found (404) at ${API_URL}/auth/google — check VITE_API_URL includes /api`
          : err.response?.data?.message || "Google sign-in failed"
      );
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
              REGISTER OPERATOR
            </div>
            <div style={{ fontSize: "11px", color: "#666", letterSpacing: "2px" }}>
              CREATE NEW SYSTEM IDENTITY
            </div>
          </div>

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "10px", color: "#00d4ff88", letterSpacing: "2px", marginBottom: "6px" }}>
                OPERATOR NAME
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter callsign..."
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
              {loading ? "CREATING..." : "▶ CREATE ACCOUNT"}
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
              onError={() => alert("Google Sign-In Failed")}
              theme="filled_black"
              shape="rectangular"
              size="large"
              width="350"
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Link to="/login" style={{ color: "#7c3aed88", fontSize: "11px", letterSpacing: "1px", textDecoration: "none" }}>
              ALREADY REGISTERED? LOGIN →
            </Link>
          </div>
        </NeonBorder>
      </div>
    </div>
  );
}
