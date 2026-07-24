import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { scanAPI } from "../services/api.js";
import { MatrixRain, ScanLine, GlitchText, CyberButton, NeonBorder, PLATFORMS } from "../components/CommonUI.jsx";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [scanHistory, setScanHistory] = useState([]);
  const [targetUsername, setTargetUsername] = useState("");
  const user = JSON.parse(localStorage.getItem("ot_user") || "{}");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await scanAPI.getHistory();
      setScanHistory(res.data.scans || []);
    } catch (err) {
      console.error("Failed to load scan history:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ot_token");
    localStorage.removeItem("ot_user");
    navigate("/login", { replace: true });
  };

  const handleStartScan = (e) => {
    e.preventDefault();
    if (!targetUsername.trim()) return;
    navigate(`/scan/${encodeURIComponent(targetUsername.trim())}`);
  };

  const totalScans = scanHistory.length;
  const avgRisk = totalScans
    ? Math.round(scanHistory.reduce((s, h) => s + (h.riskScore || 0), 0) / totalScans)
    : 0;
  const highRisk = scanHistory.filter((h) => (h.riskScore || 0) > 70).length;

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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                fontSize: "24px",
                color: "#00d4ff",
                fontFamily: "'Orbitron',monospace",
                fontWeight: 900,
                letterSpacing: "4px",
              }}
            >
              <GlitchText text="OPENTRACE" />
            </div>
            <div style={{ fontSize: "10px", color: "#00d4ff66", letterSpacing: "2px" }}>v2.4.1</div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link to="/" style={{ padding: "8px 16px", background: "#00d4ff18", border: "1px solid #00d4ff", color: "#00d4ff", textDecoration: "none", fontSize: "11px", letterSpacing: "1px", borderRadius: "2px" }}>
              COMMAND CENTER
            </Link>
            <Link to="/account-security" style={{ padding: "8px 16px", background: "transparent", border: "1px solid #ffffff11", color: "#888", textDecoration: "none", fontSize: "11px", letterSpacing: "1px", borderRadius: "2px" }}>
              ACCOUNT SECURITY
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "12px", color: "#00ff8888" }}>⬟ SYSTEM ONLINE</div>
            <div style={{ fontSize: "12px", color: "#aaa" }}>{user?.name?.toUpperCase()}</div>
            <CyberButton onClick={handleLogout} variant="danger" style={{ padding: "6px 16px", fontSize: "11px" }}>
              LOGOUT
            </CyberButton>
          </div>
        </div>

        <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", color: "#00d4ff88", letterSpacing: "3px", marginBottom: "8px" }}>
              INTELLIGENCE DASHBOARD
            </div>
            <div style={{ fontSize: "28px", fontFamily: "'Orbitron',monospace", color: "#fff", letterSpacing: "2px", marginBottom: "4px" }}>
              CYBER COMMAND CENTER
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>Monitor your digital footprint and exposure metrics</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "28px" }}>
            {[
              { label: "TOTAL SCANS", value: totalScans, color: "#00d4ff" },
              { label: "AVG RISK SCORE", value: avgRisk, color: avgRisk > 70 ? "#ff3366" : avgRisk > 30 ? "#ffaa00" : "#00ff88" },
              { label: "HIGH RISK TARGETS", value: highRisk, color: "#ff3366" },
              { label: "PLATFORMS INDEXED", value: PLATFORMS.length, color: "#7c3aed" },
            ].map((s) => (
              <NeonBorder key={s.label} color={s.color} style={{ padding: "20px", borderRadius: "4px" }}>
                <div style={{ fontSize: "10px", color: "#666", letterSpacing: "2px", marginBottom: "8px" }}>{s.label}</div>
                <div style={{ fontSize: "32px", fontFamily: "'Orbitron',monospace", color: s.color, fontWeight: "bold" }}>
                  {s.value}
                </div>
              </NeonBorder>
            ))}
          </div>

          <NeonBorder color="#00d4ff" style={{ padding: "32px", borderRadius: "4px", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "18px", fontFamily: "'Orbitron',monospace", color: "#fff", marginBottom: "6px" }}>
                INITIATE NEW OSINT SCAN
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                Analyze a target handle across GitHub, Reddit, LeetCode, StackOverflow, Dev.to, Gravatar & HackerNews
              </div>
            </div>
            <form onSubmit={handleStartScan} style={{ display: "flex", gap: "12px" }}>
              <input
                type="text"
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                placeholder="Enter target username..."
                style={{
                  padding: "12px 16px",
                  background: "#0a0a1a",
                  border: "1px solid #00d4ff44",
                  color: "#fff",
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "13px",
                  borderRadius: "2px",
                  width: "240px",
                }}
              />
              <CyberButton type="submit" style={{ padding: "14px 28px", fontSize: "13px" }}>
                ⬡ START SCAN
              </CyberButton>
            </form>
          </NeonBorder>

          <NeonBorder color="#00d4ff22" style={{ padding: "24px", borderRadius: "4px" }}>
            <div style={{ fontSize: "11px", color: "#00d4ff88", letterSpacing: "3px", marginBottom: "16px" }}>
              SCAN HISTORY LOG
            </div>
            {scanHistory.length === 0 ? (
              <div style={{ color: "#444", fontSize: "13px", textAlign: "center", padding: "32px" }}>
                NO SCAN RECORDS FOUND. INITIATE FIRST SCAN ABOVE.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {scanHistory.slice(0, 10).map((h, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/scan/${encodeURIComponent(h.username)}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "12px 16px",
                      background: "#0a0a1a",
                      borderRadius: "2px",
                      border: "1px solid #ffffff11",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: h.riskScore > 70 ? "#ff3366" : h.riskScore > 30 ? "#ffaa00" : "#00ff88", flexShrink: 0 }} />
                    <div style={{ flex: 1, color: "#00d4ff", fontSize: "13px" }}>@{h.username}</div>
                    <div style={{ color: "#666", fontSize: "11px" }}>{new Date(h.date || h.createdAt).toLocaleDateString()}</div>
                    <div style={{ color: "#888", fontSize: "11px" }}>{h.platformsFound} platforms</div>
                    <div style={{ color: h.riskScore > 70 ? "#ff3366" : h.riskScore > 30 ? "#ffaa00" : "#00ff88", fontSize: "13px", fontFamily: "'Orbitron',monospace", minWidth: "40px", textAlign: "right" }}>
                      {h.riskScore}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </NeonBorder>
        </div>
      </div>
    </div>
  );
}
