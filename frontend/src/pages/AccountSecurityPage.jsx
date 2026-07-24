import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { scanAPI } from "../services/api.js";
import { MatrixRain, ScanLine, CyberButton, NeonBorder } from "../components/CommonUI.jsx";

export default function AccountSecurityPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ot_user") || "{}");

  const [emailBreach, setEmailBreach] = useState(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordResult, setPasswordResult] = useState(null);
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    fetchEmailBreaches();
  }, []);

  const fetchEmailBreaches = async () => {
    setLoadingEmail(true);
    try {
      const res = await scanAPI.checkEmailBreaches();
      setEmailBreach(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoadingEmail(false);
  };

  const handleTestPassword = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoadingPass(true);
    try {
      const res = await scanAPI.checkPasswordLeak(password);
      setPasswordResult(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoadingPass(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("ot_token");
    localStorage.removeItem("ot_user");
    navigate("/login", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020208",
        color: "#e0e0e0",
        fontFamily: "'Share Tech Mono',monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MatrixRain />
      <ScanLine />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 32px",
            borderBottom: "1px solid #00d4ff22",
          }}
        >
          <Link to="/" style={{ color: "#00d4ff88", textDecoration: "none", fontFamily: "monospace", fontSize: "12px", letterSpacing: "2px" }}>
            ← COMMAND CENTER
          </Link>
          <div style={{ fontSize: "16px", fontFamily: "'Orbitron',monospace", color: "#fff", letterSpacing: "4px" }}>
            ACCOUNT SECURITY AUDIT
          </div>
          <CyberButton onClick={handleLogout} variant="danger" style={{ padding: "6px 16px", fontSize: "11px" }}>
            LOGOUT
          </CyberButton>
        </div>

        <div style={{ padding: "32px", maxWidth: "950px", margin: "0 auto" }} className="fade-in">
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "10px", color: "#00d4ff88", letterSpacing: "3px", marginBottom: "6px" }}>
              ACCOUNT SECURITY AUDIT
            </div>
            <div style={{ fontSize: "24px", fontFamily: "'Orbitron',monospace", color: "#fff" }}>
              ETHICAL BREACH & EXPOSURE CONTROL
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              Target Email: <span style={{ color: "#00d4ff" }}>{user?.email}</span> (Authentic User Security Boundary)
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <NeonBorder color={emailBreach?.exposed ? "#ff3366" : "#00ff88"} style={{ padding: "20px", borderRadius: "4px" }}>
              <div style={{ fontSize: "10px", color: "#888", letterSpacing: "2px", marginBottom: "12px" }}>
                KNOWN DATA BREACHES (XposedOrNot)
              </div>

              {loadingEmail ? (
                <div style={{ color: "#00d4ff", fontSize: "12px" }}>Checking breach database...</div>
              ) : emailBreach ? (
                <div>
                  <div style={{ fontSize: "16px", color: emailBreach.exposed ? "#ff3366" : "#00ff88", fontFamily: "'Orbitron',monospace", marginBottom: "8px" }}>
                    {emailBreach.exposed ? `⚠️ COMPROMISED IN ${emailBreach.breachesCount} BREACHES` : "✓ NO KNOWN BREACHES DETECTED"}
                  </div>
                  {emailBreach.breaches && emailBreach.breaches.length > 0 && (
                    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {emailBreach.breaches.map((b, i) => (
                        <div key={i} style={{ background: "#1a0a0f", padding: "8px 12px", borderRadius: "2px", border: "1px solid #ff336633" }}>
                          <div style={{ fontSize: "12px", color: "#fff", fontWeight: "bold" }}>{b.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#666" }}>Unable to load email breaches</div>
              )}
            </NeonBorder>

            <NeonBorder color="#7c3aed" style={{ padding: "20px", borderRadius: "4px" }}>
              <div style={{ fontSize: "10px", color: "#7c3aed88", letterSpacing: "2px", marginBottom: "12px" }}>
                PWNED PASSWORDS CHECK (K-ANONYMITY)
              </div>
              <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "14px" }}>
                Test a password against 800M+ leaked passwords. Only first 5 SHA-1 hash characters are sent. Password is never stored or logged.
              </div>

              <form onSubmit={handleTestPassword} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  type="password"
                  placeholder="Enter password to test"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#0a0a1a",
                    border: "1px solid #7c3aed44",
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    borderRadius: "2px",
                  }}
                />
                <CyberButton type="submit" disabled={loadingPass || !password} style={{ width: "100%", padding: "10px" }}>
                  {loadingPass ? "CHECKING RANGE API..." : "CHECK PASSWORD LEAK"}
                </CyberButton>
              </form>

              {passwordResult && (
                <div style={{ marginTop: "14px", padding: "10px", background: passwordResult.leaked ? "#1a0a0f" : "#0a1a0f", border: `1px solid ${passwordResult.leaked ? "#ff3366" : "#00ff88"}`, borderRadius: "2px" }}>
                  <div style={{ fontSize: "13px", color: passwordResult.leaked ? "#ff3366" : "#00ff88", fontWeight: "bold" }}>
                    {passwordResult.leaked ? `🚨 LEAKED ${passwordResult.count.toLocaleString()} TIMES` : "✓ SAFE — NOT FOUND IN KNOWN LEAKS"}
                  </div>
                  <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
                    SHA-1 Prefix sent: {passwordResult.sha1Prefix}*****
                  </div>
                </div>
              )}
            </NeonBorder>
          </div>
        </div>
      </div>
    </div>
  );
}
