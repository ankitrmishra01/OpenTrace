import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ScanResultsPage from "./pages/ScanResultsPage.jsx";
import AccountSecurityPage from "./pages/AccountSecurityPage.jsx";

export default function App() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #020208; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: #0a0a1a; }
      ::-webkit-scrollbar-thumb { background: #00d4ff44; border-radius: 2px; }
      .scan-line { position: absolute; top: -100%; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #00d4ff44, transparent); animation: scanDown 3s linear infinite; }
      @keyframes scanDown { to { top: 110%; } }
      .glitch-active::before, .glitch-active::after { content: attr(data-text); position: absolute; top: 0; left: 0; right: 0; }
      .glitch-active::before { color: #ff3366; clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%); transform: translate(-2px, -2px); }
      .glitch-active::after { color: #00d4ff; clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%); transform: translate(2px, 2px); }
      .pulse-dot { animation: pulseDot 2s infinite; }
      @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
      .fade-in { animation: fadeIn 0.5s ease; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .spin { animation: spin 2s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      input, textarea { outline: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan/:username"
        element={
          <ProtectedRoute>
            <ScanResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account-security"
        element={
          <ProtectedRoute>
            <AccountSecurityPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
