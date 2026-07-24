import React, { useState, useEffect, useRef } from "react";
import { scanAPI } from "../services/api.js";

export const PLATFORMS = [
  { id: "github", name: "GitHub", icon: "⬡", color: "#58a6ff", checkUrl: (u) => `https://github.com/${u}` },
  { id: "reddit", name: "Reddit", icon: "◈", color: "#ff4500", checkUrl: (u) => `https://www.reddit.com/user/${u}` },
  { id: "leetcode", name: "LeetCode", icon: "◆", color: "#ffa116", checkUrl: (u) => `https://leetcode.com/${u}` },
  { id: "stackoverflow", name: "Stack Overflow", icon: "🥞", color: "#f48024", checkUrl: (u) => `https://stackoverflow.com/users/${u}` },
  { id: "devto", name: "Dev.to", icon: "👩‍💻", color: "#0a0a0a", checkUrl: (u) => `https://dev.to/${u}` },
  { id: "gravatar", name: "Gravatar", icon: "🌐", color: "#1e8cbe", checkUrl: (u) => `https://gravatar.com/${u}` },
  { id: "hackernews", name: "HackerNews", icon: "Y", color: "#ff6600", checkUrl: (u) => `https://news.ycombinator.com/user?id=${u}` },
];

export const MANUAL_PLATFORMS = [
  { id: "twitter", name: "Twitter/X", icon: "◇", color: "#1da1f2", checkUrl: (u) => `https://twitter.com/${u}`, note: "Manual check link (automated scraping deprecated due to anti-scraping)" },
  { id: "instagram", name: "Instagram", icon: "◑", color: "#e1306c", checkUrl: (u) => `https://www.instagram.com/${u}`, note: "Manual check link (automated scraping deprecated due to anti-scraping)" },
  { id: "linkedin", name: "LinkedIn", icon: "◉", color: "#0077b5", checkUrl: (u) => `https://www.linkedin.com/in/${u}`, note: "Manual check link (unauthenticated scraping violates ToS)" },
];

export const GlitchText = ({ text, className = "" }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span className={`${className} ${glitch ? "glitch-active" : ""}`} data-text={text} style={{ position: "relative", display: "inline-block" }}>
      {text}
    </span>
  );
};

export const ScanLine = () => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
    <div className="scan-line" />
  </div>
);

export const MatrixRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cols = Math.floor(canvas.width / 18);
    const drops = Array(cols).fill(1);
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ";
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0ff3";
      ctx.font = "12px monospace";
      drops.forEach((y, i) => {
        const c = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(c, i * 18, y * 18);
        if (y * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const id = setInterval(draw, 50);
    return () => clearInterval(id);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} />;
};

export const NeonBorder = ({ children, color = "#00d4ff", style = {}, className = "" }) => (
  <div className={className} style={{ border: `1px solid ${color}33`, boxShadow: `0 0 10px ${color}22, inset 0 0 10px ${color}11`, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", ...style }}>
    {children}
  </div>
);

export const CyberButton = ({ onClick, children, variant = "primary", disabled = false, style = {}, type = "button" }) => {
  const colors = { primary: "#00d4ff", danger: "#ff3366", success: "#00ff88", warning: "#ffaa00" };
  const c = colors[variant] || colors.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#111" : `${c}18`,
        border: `1px solid ${disabled ? "#333" : c}`,
        color: disabled ? "#555" : c,
        padding: "10px 24px",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "13px",
        letterSpacing: "2px",
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
        borderRadius: "2px",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.background = `${c}30`;
          e.target.style.boxShadow = `0 0 20px ${c}44`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.background = `${c}18`;
          e.target.style.boxShadow = "none";
        }
      }}
    >
      {children}
    </button>
  );
};

export const RiskMeter = ({ score }) => {
  const color = score <= 30 ? "#00ff88" : score <= 70 ? "#ffaa00" : "#ff3366";
  const label = score <= 30 ? "LOW" : score <= 70 ? "MODERATE" : "HIGH";
  const pct = score / 100;
  const r = 54, cx = 70, cy = 70;
  const arc = (pct) => {
    const a = Math.PI * (1 + pct);
    return `M ${cx - r} ${cy} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
  };
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="140" height="85" viewBox="0 0 140 90">
        <path d={arc(1)} fill="none" stroke="#1a1a2e" strokeWidth="10" strokeLinecap="round" />
        <path d={arc(pct)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "all 1s ease" }} />
        <text x={cx} y={cy - 5} textAnchor="middle" fill={color} fontSize="22" fontFamily="'Share Tech Mono',monospace" fontWeight="bold">
          {score}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={color} fontSize="10" fontFamily="'Share Tech Mono',monospace" letterSpacing="2">
          {label}
        </text>
      </svg>
    </div>
  );
};

export const NetworkGraph = ({ username, results }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const found = results.filter((r) => r.found);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const nodes = [
      { x: cx, y: cy, label: username, color: "#00d4ff", r: 28, pulse: 0 },
      ...found.map((r, i) => {
        const angle = (i / found.length) * Math.PI * 2 - Math.PI / 2;
        const dist = 110;
        return {
          x: cx + Math.cos(angle) * dist + (Math.random() - 0.5) * 20,
          y: cy + Math.sin(angle) * dist + (Math.random() - 0.5) * 20,
          label: r.platform,
          color: r.color || "#7c3aed",
          r: 18,
          pulse: Math.random() * Math.PI * 2,
        };
      }),
    ];
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      nodes.forEach((n, i) => {
        if (i === 0) return;
        const hub = nodes[0];
        const dx = hub.x - n.x, dy = hub.y - n.y;
        const prog = (Math.sin(frame * 0.04 + i) + 1) / 2;
        const px = n.x + dx * prog, py = n.y + dy * prog;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(hub.x, hub.y);
        ctx.strokeStyle = `${n.color}33`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = n.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      nodes.forEach((n) => {
        n.pulse += 0.05;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + Math.sin(n.pulse) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = `${n.color}44`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}22`;
        ctx.fill();
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = n.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${n === nodes[0] ? 11 : 9}px 'Share Tech Mono',monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = n.label.length > 8 ? n.label.slice(0, 8) : n.label;
        ctx.fillText(label, n.x, n.y);
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [username, results]);

  return (
    <div style={{ background: "#050510", borderRadius: "4px", border: "1px solid #00d4ff22", overflow: "hidden" }}>
      <canvas ref={canvasRef} width={480} height={280} style={{ display: "block", width: "100%", height: "280px" }} />
    </div>
  );
};

export const UnifiedIdentityCard = ({ identityCard }) => {
  if (!identityCard) return null;
  const { primaryName, nameVariants, locations, consolidatedBio, knownLinks, earliestOnline } = identityCard;

  return (
    <NeonBorder color="#00d4ff" style={{ padding: "24px", borderRadius: "4px", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #00d4ff33", paddingBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#00d4ff88", letterSpacing: "3px" }}>UNIFIED IDENTITY SUMMARY</div>
          <div style={{ fontSize: "22px", fontFamily: "'Orbitron',monospace", color: "#fff", marginTop: "4px" }}>
            {primaryName || "Identity Profile"}
          </div>
          {nameVariants && nameVariants.length > 1 && (
            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
              Known Name Variants: {nameVariants.map((v) => v.name).join(" | ")}
            </div>
          )}
        </div>
        {earliestOnline && (
          <div style={{ textAlign: "right", fontSize: "11px", color: "#00ff88" }}>
            <div style={{ fontSize: "9px", color: "#666", letterSpacing: "1px" }}>EARLIEST ONLINE FOOTPRINT</div>
            <div>Online since {new Date(earliestOnline).getFullYear()}</div>
          </div>
        )}
      </div>

      <div style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.6", marginBottom: "16px", background: "#0a0a1a", padding: "12px", borderRadius: "4px", border: "1px solid #ffffff11" }}>
        <span style={{ color: "#00d4ff", fontWeight: "bold" }}>AI SYNTHESIS: </span>
        {consolidatedBio}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#888", letterSpacing: "1px", marginBottom: "6px" }}>DISCLOSED LOCATIONS</div>
          {locations && locations.length > 0 ? (
            locations.map((l, i) => (
              <div key={i} style={{ fontSize: "12px", color: "#e0e0e0", marginBottom: "4px" }}>
                📍 {l.location} <span style={{ fontSize: "10px", color: "#666" }}>({l.platforms.join(", ")})</span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: "11px", color: "#555" }}>No location disclosed</div>
          )}
        </div>

        <div>
          <div style={{ fontSize: "10px", color: "#888", letterSpacing: "1px", marginBottom: "6px" }}>VERIFIED EXTERNAL LINKS</div>
          {knownLinks && knownLinks.length > 0 ? (
            knownLinks.map((link, i) => (
              <div key={i} style={{ fontSize: "11px", color: "#00d4ff", marginBottom: "4px" }}>
                🔗 <a href={link.url} target="_blank" rel="noreferrer" style={{ color: "#00d4ff" }}>{link.url}</a>{" "}
                {link.confirmed && <span style={{ background: "#00ff8822", color: "#00ff88", padding: "1px 6px", borderRadius: "2px", fontSize: "9px" }}>CONFIRMED</span>}
              </div>
            ))
          ) : (
            <div style={{ fontSize: "11px", color: "#555" }}>No cross-linked web profiles</div>
          )}
        </div>
      </div>
    </NeonBorder>
  );
};

export const IdentityConfidencePanel = ({ identityConfidence }) => {
  if (!identityConfidence) return null;
  const { score, evidence } = identityConfidence;
  const color = score >= 70 ? "#00ff88" : score >= 40 ? "#ffaa00" : "#ff3366";

  return (
    <NeonBorder color={color} style={{ padding: "16px", borderRadius: "4px", marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ fontSize: "10px", color: "#888", letterSpacing: "2px" }}>IDENTITY LINKAGE CONFIDENCE</div>
        <div style={{ fontSize: "18px", fontFamily: "'Orbitron',monospace", color, fontWeight: 700 }}>
          {score}%
        </div>
      </div>
      <div style={{ fontSize: "11px", color: "#aaa" }}>
        {evidence && evidence.map((e, i) => (
          <div key={i} style={{ marginBottom: "3px" }}>✓ {e}</div>
        ))}
      </div>
    </NeonBorder>
  );
};

export const RiskBreakdownList = ({ breakdown }) => {
  const [open, setOpen] = useState(false);
  if (!breakdown || breakdown.length === 0) return null;

  return (
    <div style={{ marginTop: "12px", textAlign: "left" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: "none", border: "none", color: "#00d4ff", fontSize: "11px", fontFamily: "'Share Tech Mono',monospace", cursor: "pointer", letterSpacing: "1px", padding: 0 }}
      >
        {open ? "▼ HIDE SCORE BREAKDOWN" : "▶ EXPLAIN SCORE BREAKDOWN"}
      </button>
      {open && (
        <div style={{ marginTop: "10px", background: "#050515", padding: "10px", borderRadius: "4px", border: "1px solid #ffffff11" }}>
          {breakdown.map((b, i) => (
            <div key={i} style={{ marginBottom: "8px", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#e0e0e0" }}>
                <span>{b.factor}</span>
                <span style={{ color: "#ffaa00", fontFamily: "monospace" }}>+{b.points} pts</span>
              </div>
              <div style={{ color: "#666", fontSize: "10px" }}>{b.reason}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ScanDiffPanel = ({ scanDiff }) => {
  if (!scanDiff || !scanDiff.hasChanges) return null;

  return (
    <NeonBorder color="#ffaa00" style={{ padding: "16px", borderRadius: "4px", marginBottom: "16px" }}>
      <div style={{ fontSize: "10px", color: "#ffaa00", letterSpacing: "2px", marginBottom: "8px" }}>
        ⚡ EXPOSURE CHANGES SINCE LAST SCAN ({new Date(scanDiff.baselineDate).toLocaleDateString()})
      </div>
      {scanDiff.newFound && scanDiff.newFound.length > 0 && (
        <div style={{ fontSize: "12px", color: "#ff3366", marginBottom: "4px" }}>
          + Newly Discovered Accounts: {scanDiff.newFound.join(", ")}
        </div>
      )}
      {scanDiff.disappeared && scanDiff.disappeared.length > 0 && (
        <div style={{ fontSize: "12px", color: "#00ff88" }}>
          - Accounts No Longer Present: {scanDiff.disappeared.join(", ")}
        </div>
      )}
    </NeonBorder>
  );
};

export const RemediationPanel = ({ checklist }) => {
  if (!checklist || checklist.length === 0) return null;

  return (
    <NeonBorder color="#00ff88" style={{ padding: "20px", borderRadius: "4px", marginTop: "20px" }}>
      <div style={{ fontSize: "10px", color: "#00ff8888", letterSpacing: "3px", marginBottom: "12px" }}>
        🛡️ ACTIONABLE PRIVACY REMEDIATION CHECKLIST
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {checklist.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a1a0f", padding: "10px 14px", borderRadius: "4px", border: "1px solid #00ff8822" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#fff", fontWeight: "bold" }}>{item.platform}: {item.issue}</div>
              <div style={{ fontSize: "11px", color: "#888" }}>{item.action}</div>
            </div>
            <a href={item.link} target="_blank" rel="noreferrer" style={{ background: "#00ff8822", color: "#00ff88", padding: "6px 12px", borderRadius: "2px", textDecoration: "none", fontSize: "11px", fontFamily: "monospace" }}>
              FIX NOW →
            </a>
          </div>
        ))}
      </div>
    </NeonBorder>
  );
};

export const PlatformCard = ({ result }) => {
  const pd = result.profileData || {};
  return (
    <NeonBorder
      color={result.found ? result.color : "#333"}
      style={{ borderRadius: "4px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "14px" }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: `2px solid ${result.found ? result.color : "#333"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          boxShadow: result.found ? `0 0 12px ${result.color}66` : "none",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {pd.avatar_url ? (
          <img src={pd.avatar_url} alt={result.platform} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          result.icon
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <span style={{ fontSize: "14px", fontFamily: "'Orbitron',monospace", color: "#fff", fontWeight: "bold" }}>
            {result.platform}
          </span>
          <span
            style={{
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "2px",
              background: result.found ? "#00ff8822" : "#33333344",
              color: result.found ? "#00ff88" : "#666",
              border: `1px solid ${result.found ? "#00ff8844" : "#444"}`,
            }}
          >
            {result.found ? "✓ VERIFIED" : "NOT FOUND"}
          </span>
          {result.confidence && (
            <span style={{ fontSize: "9px", color: result.confidence === "high" ? "#00d4ff" : "#ffaa00", fontFamily: "monospace" }}>
              API: {result.confidence.toUpperCase()}
            </span>
          )}
        </div>

        {result.found ? (
          <div style={{ fontSize: "12px" }}>
            {pd.bio && <div style={{ color: "#ccc", marginBottom: "6px", fontStyle: "italic" }}>"{pd.bio}"</div>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", color: "#888", fontSize: "11px" }}>
              {pd.location && <span>📍 {pd.location}</span>}
              {pd.company && <span>🏢 {pd.company}</span>}
              {pd.public_repos !== undefined && <span>📦 {pd.public_repos} Repos</span>}
              {pd.karma !== undefined && <span>⭐ {pd.karma} Karma</span>}
              {pd.reputation !== undefined && <span>🏆 {pd.reputation} Rep</span>}
              {pd.ranking !== undefined && <span>🏅 Rank {pd.ranking}</span>}
            </div>
            <a href={result.url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "8px", fontSize: "11px", color: result.color, textDecoration: "none" }}>
              VIEW PROFILE →
            </a>
          </div>
        ) : (
          <div style={{ fontSize: "11px", color: "#555" }}>No public profile detected for target handle.</div>
        )}
      </div>
    </NeonBorder>
  );
};
