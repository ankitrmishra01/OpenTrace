import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { scanAPI } from "../services/api.js";
import {
  MatrixRain,
  ScanLine,
  CyberButton,
  NeonBorder,
  RiskMeter,
  NetworkGraph,
  UnifiedIdentityCard,
  IdentityConfidencePanel,
  RiskBreakdownList,
  ScanDiffPanel,
  RemediationPanel,
  PlatformCard,
  MANUAL_PLATFORMS,
} from "../components/CommonUI.jsx";

export default function ScanResultsPage() {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState(paramUsername || "");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [riskBreakdown, setRiskBreakdown] = useState([]);
  const [identityConfidence, setIdentityConfidence] = useState(null);
  const [identityCard, setIdentityCard] = useState(null);
  const [scanDiff, setScanDiff] = useState(null);
  const [remediationChecklist, setRemediationChecklist] = useState([]);
  const [checkPermutations, setCheckPermutations] = useState(false);
  const [permutationMatches, setPermutationMatches] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("results");

  const addLog = useCallback((text, color = "#00d4ff88") => {
    setLogs((prev) => [...prev, { text, color }]);
  }, []);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  useEffect(() => {
    if (paramUsername) {
      setUsername(paramUsername);
      executeScan(paramUsername);
    }
  }, [paramUsername]);

  const executeScan = async (targetUser) => {
    if (!targetUser) return;
    setScanning(true);
    setScanComplete(false);
    setResults([]);
    setAiAnalysis("");
    setLogs([]);
    addLog(`INITIATING SCAN SEQUENCE FOR TARGET: ${targetUser.toUpperCase()}`, "#00d4ff");
    addLog("Establishing API connections across 7 public platforms...", "#00d4ff66");
    await sleep(600);

    try {
      const res = await scanAPI.startScan(targetUser, { checkPermutations });
      const scanData = res.data.scan;

      setResults(scanData.results || []);
      setRiskScore(scanData.riskScore || 0);
      setRiskBreakdown(scanData.riskBreakdown || []);
      setIdentityConfidence(scanData.identityConfidence || null);
      setIdentityCard(scanData.identityCard || null);
      setScanDiff(scanData.scanDiff || null);
      setRemediationChecklist(scanData.remediationChecklist || []);
      setPermutationMatches(res.data.permutationMatches || []);

      addLog(`Scan complete. ${scanData.platformsFound}/${scanData.results.length} platforms verified.`, "#00d4ff");
      addLog(`Deterministic Risk Score: ${scanData.riskScore}/100`, scanData.riskScore > 70 ? "#ff3366" : scanData.riskScore > 30 ? "#ffaa00" : "#00ff88");
      setScanComplete(true);
      await generateAI(scanData._id || scanData.id);
    } catch (error) {
      addLog("SCAN FAILED: " + (error.response?.data?.message || error.message), "#ff3366");
    }
    setScanning(false);
  };

  const generateAI = async (scanId) => {
    if (!scanId) return;
    setAiLoading(true);
    try {
      const res = await scanAPI.generateAnalysis(scanId);
      setAiAnalysis(res.data.analysis || "");
    } catch (err) {
      setAiAnalysis("### EXPOSURE SUMMARY\nFailed to generate AI threat analysis.");
    }
    setAiLoading(false);
  };

  const handleFormScan = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    navigate(`/scan/${encodeURIComponent(username.trim())}`);
  };

  const renderMarkdown = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### "))
        return (
          <div key={i} style={{ color: "#00d4ff", fontFamily: "'Share Tech Mono',monospace", fontSize: "12px", letterSpacing: "2px", marginTop: "16px", marginBottom: "6px", borderBottom: "1px solid #00d4ff22", paddingBottom: "4px" }}>
            {line.slice(4).toUpperCase()}
          </div>
        );
      if (line.startsWith("## "))
        return (
          <div key={i} style={{ color: "#7c3aed", fontFamily: "'Share Tech Mono',monospace", fontSize: "13px", letterSpacing: "1px", marginTop: "12px" }}>
            {line.slice(3)}
          </div>
        );
      if (line.startsWith("- "))
        return (
          <div key={i} style={{ color: "#ccc", fontSize: "13px", paddingLeft: "12px", marginBottom: "4px" }}>
            {"▸ " + line.slice(2)}
          </div>
        );
      return <div key={i} style={{ color: "#aaa", fontSize: "13px", marginBottom: "4px" }}>{line}</div>;
    });
  };

  const found = results.filter((r) => r.found);

  return (
    <div style={{ minHeight: "100vh", background: "#020208", color: "#e0e0e0", fontFamily: "'Share Tech Mono',monospace", position: "relative", overflow: "hidden" }}>
      <MatrixRain />
      <ScanLine />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #00d4ff22" }}>
          <Link to="/" style={{ color: "#00d4ff88", textDecoration: "none", fontFamily: "monospace", fontSize: "12px", letterSpacing: "2px" }}>
            ← COMMAND CENTER
          </Link>
          <div style={{ fontSize: "16px", fontFamily: "'Orbitron',monospace", color: "#fff", letterSpacing: "4px" }}>
            INTELLIGENCE SCAN
          </div>
          <div style={{ fontSize: "11px", color: scanning ? "#ffaa00" : "#00ff8888" }} className={scanning ? "pulse-dot" : ""}>
            {scanning ? "● SCANNING..." : "● READY"}
          </div>
        </div>

        <div style={{ padding: "28px 32px", maxWidth: "1150px", margin: "0 auto" }}>
          <NeonBorder color="#7c3aed" style={{ padding: "24px", borderRadius: "4px", marginBottom: "24px" }}>
            <div style={{ fontSize: "10px", color: "#7c3aed88", letterSpacing: "3px", marginBottom: "14px" }}>
              TARGET IDENTIFIER & PERMUTATION SCAN
            </div>
            <form onSubmit={handleFormScan} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#00d4ff66", fontSize: "14px" }}>@</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  style={{
                    width: "100%",
                    padding: "14px 16px 14px 32px",
                    background: "#0a0a1a",
                    border: "1px solid #7c3aed44",
                    color: "#e0e0e0",
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "14px",
                    borderRadius: "2px",
                    letterSpacing: "1px",
                  }}
                />
              </div>
              <CyberButton type="submit" disabled={scanning} style={{ padding: "14px 32px", fontSize: "13px" }}>
                {scanning ? "SCANNING..." : "⬡ SCAN TARGET"}
              </CyberButton>
            </form>

            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="permCheck"
                checked={checkPermutations}
                onChange={(e) => setCheckPermutations(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <label htmlFor="permCheck" style={{ fontSize: "11px", color: "#888", cursor: "pointer" }}>
                Opt-in: Check common username permutations (e.g. {username}_, {username}.dev, the{username})
              </label>
            </div>
          </NeonBorder>

          {logs.length > 0 && (
            <div style={{ background: "#02020a", border: "1px solid #00d4ff22", padding: "16px", borderRadius: "4px", marginBottom: "24px", fontFamily: "'Share Tech Mono',monospace", fontSize: "12px", maxHeight: "150px", overflowY: "auto" }}>
              {logs.map((l, i) => (
                <div key={i} style={{ color: l.color, marginBottom: "4px" }}>
                  [{String(i).padStart(3, "0")}] {l.text}
                </div>
              ))}
            </div>
          )}

          {scanComplete && (
            <div>
              <UnifiedIdentityCard identityCard={identityCard} />

              <div style={{ display: "flex", gap: "12px", marginBottom: "20px", borderBottom: "1px solid #00d4ff22", paddingBottom: "12px" }}>
                {["results", "graph", "ai-analysis"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "8px 20px",
                      background: activeTab === tab ? "#00d4ff18" : "transparent",
                      border: `1px solid ${activeTab === tab ? "#00d4ff" : "transparent"}`,
                      color: activeTab === tab ? "#00d4ff" : "#666",
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "12px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      borderRadius: "2px",
                    }}
                  >
                    {tab === "results" ? "VERIFIED PROFILES" : tab === "graph" ? "NETWORK TOPOLOGY" : "AI ANALYSIS"}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
                <div>
                  {activeTab === "results" && (
                    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {results.map((r) => (
                        <PlatformCard key={r.id} result={r} />
                      ))}

                      <NeonBorder color="#333" style={{ padding: "16px", borderRadius: "4px", marginTop: "16px" }}>
                        <div style={{ fontSize: "10px", color: "#888", letterSpacing: "2px", marginBottom: "10px" }}>
                          MANUAL VERIFICATION PLATFORMS (Scraping Deprecated)
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {MANUAL_PLATFORMS.map((mp) => (
                            <div key={mp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a1a", padding: "8px 12px", borderRadius: "2px" }}>
                              <div>
                                <span style={{ color: mp.color, fontWeight: "bold", fontSize: "12px" }}>{mp.name}</span>
                                <span style={{ fontSize: "10px", color: "#666", marginLeft: "10px" }}>{mp.note}</span>
                              </div>
                              <a href={mp.checkUrl(username)} target="_blank" rel="noreferrer" style={{ fontSize: "10px", color: mp.color, textDecoration: "none" }}>
                                CHECK MANUALLY →
                              </a>
                            </div>
                          ))}
                        </div>
                      </NeonBorder>

                      {permutationMatches && permutationMatches.length > 0 && (
                        <NeonBorder color="#ffaa00" style={{ padding: "16px", borderRadius: "4px", marginTop: "16px" }}>
                          <div style={{ fontSize: "10px", color: "#ffaa00", letterSpacing: "2px", marginBottom: "8px" }}>
                            POSSIBLE RELATED ACCOUNTS (Username Permutations)
                          </div>
                          {permutationMatches.map((pm, i) => (
                            <div key={i} style={{ fontSize: "11px", color: "#ccc", marginBottom: "4px" }}>
                              • @{pm.permutation} found on {pm.platform} → <a href={pm.url} target="_blank" rel="noreferrer" style={{ color: "#00d4ff" }}>View Profile</a>
                            </div>
                          ))}
                        </NeonBorder>
                      )}

                      <RemediationPanel checklist={remediationChecklist} />
                    </div>
                  )}

                  {activeTab === "graph" && (
                    <div className="fade-in">
                      <NetworkGraph username={username} results={results} />
                      <div style={{ marginTop: "12px", fontSize: "10px", color: "#444", textAlign: "center", letterSpacing: "2px" }}>
                        LIVE NETWORK TOPOLOGY — {found.length} NODES CONNECTED
                      </div>
                    </div>
                  )}

                  {activeTab === "ai-analysis" && (
                    <NeonBorder color="#7c3aed" style={{ padding: "24px", borderRadius: "4px", minHeight: "280px" }} className="fade-in">
                      <div style={{ fontSize: "10px", color: "#7c3aed88", letterSpacing: "3px", marginBottom: "16px" }}>
                        ⬡ AI THREAT INTELLIGENCE
                      </div>
                      {aiLoading ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#7c3aed" }}>
                          <div className="spin" style={{ fontSize: "32px", display: "block" }}>⬡</div>
                          <div style={{ fontSize: "12px", marginTop: "12px" }}>SYNTHESIZING THREAT INTELLIGENCE...</div>
                        </div>
                      ) : (
                        <div>{renderMarkdown(aiAnalysis)}</div>
                      )}
                    </NeonBorder>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <NeonBorder color={riskScore > 70 ? "#ff3366" : riskScore > 30 ? "#ffaa00" : "#00ff88"} style={{ padding: "24px", borderRadius: "4px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#666", marginBottom: "12px" }}>
                      CYBER RISK INDEX
                    </div>
                    <RiskMeter score={riskScore} />
                    <RiskBreakdownList breakdown={riskBreakdown} />
                  </NeonBorder>

                  <IdentityConfidencePanel identityConfidence={identityConfidence} />

                  <ScanDiffPanel scanDiff={scanDiff} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
