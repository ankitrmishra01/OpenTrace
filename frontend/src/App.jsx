import {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { authAPI, scanAPI } from "./services/api.js";

const AuthContext = createContext();

const PLATFORMS = [
  {
    id: "github",
    name: "GitHub",
    icon: "⬡",
    color: "#58a6ff",
    checkUrl: (u) => `https://github.com/${u}`,
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: "◈",
    color: "#ff4500",
    checkUrl: (u) => `https://www.reddit.com/user/${u}`,
  },
  {
    id: "leetcode",
    name: "LeetCode",
    icon: "◆",
    color: "#ffa116",
    checkUrl: (u) => `https://leetcode.com/${u}`,
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    icon: "🥞",
    color: "#f48024",
    checkUrl: (u) => `https://stackoverflow.com/users/${u}`,
  },
  {
    id: "devto",
    name: "Dev.to",
    icon: "👩‍💻",
    color: "#0a0a0a",
    checkUrl: (u) => `https://dev.to/${u}`,
  },
  {
    id: "gravatar",
    name: "Gravatar",
    icon: "🌐",
    color: "#1e8cbe",
    checkUrl: (u) => `https://gravatar.com/${u}`,
  },
  {
    id: "hackernews",
    name: "HackerNews",
    icon: "Y",
    color: "#ff6600",
    checkUrl: (u) => `https://news.ycombinator.com/user?id=${u}`,
  },
];

const MANUAL_PLATFORMS = [
  {
    id: "twitter",
    name: "Twitter/X",
    icon: "◇",
    color: "#1da1f2",
    checkUrl: (u) => `https://twitter.com/${u}`,
    note: "Manual check link (automated scraping deprecated due to anti-scraping)",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "◑",
    color: "#e1306c",
    checkUrl: (u) => `https://www.instagram.com/${u}`,
    note: "Manual check link (automated scraping deprecated due to anti-scraping)",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "◉",
    color: "#0077b5",
    checkUrl: (u) => `https://www.linkedin.com/in/${u}`,
    note: "Manual check link (unauthenticated scraping violates ToS)",
  },
];

const PAGES = {
  LANDING: "landing",
  AUTH: "auth",
  DASHBOARD: "dashboard",
  SCAN: "scan",
  ACCOUNT_SECURITY: "account_security",
};


const GlitchText = ({ text, className = "" }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const iv = setInterval(
      () => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 200);
      },
      4000 + Math.random() * 3000,
    );
    return () => clearInterval(iv);
  }, []);
  return (
    <span
      className={`${className} ${glitch ? "glitch-active" : ""}`}
      data-text={text}
      style={{ position: "relative", display: "inline-block" }}
    >
      {text}
    </span>
  );
};

const ScanLine = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 1,
    }}
  >
    <div className="scan-line" />
  </div>
);

const MatrixRain = () => {
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
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.15,
      }}
    />
  );
};

const NeonBorder = ({
  children,
  color = "#00d4ff",
  style = {},
  className = "",
}) => (
  <div
    className={className}
    style={{
      border: `1px solid ${color}33`,
      boxShadow: `0 0 10px ${color}22, inset 0 0 10px ${color}11`,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(12px)",
      ...style,
    }}
  >
    {children}
  </div>
);

const CyberButton = ({
  onClick,
  children,
  variant = "primary",
  disabled = false,
  style = {},
}) => {
  const colors = {
    primary: "#00d4ff",
    danger: "#ff3366",
    success: "#00ff88",
    warning: "#ffaa00",
  };
  const c = colors[variant] || colors.primary;
  return (
    <button
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

const RiskMeter = ({ score }) => {
  const color = score <= 30 ? "#00ff88" : score <= 70 ? "#ffaa00" : "#ff3366";
  const label = score <= 30 ? "LOW" : score <= 70 ? "MODERATE" : "HIGH";
  const pct = score / 100;
  const r = 54,
    cx = 70,
    cy = 70;
  const arc = (pct) => {
    const a = Math.PI * (1 + pct);
    return `M ${cx - r} ${cy} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
  };
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="140" height="85" viewBox="0 0 140 90">
        <path
          d={arc(1)}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={arc(pct)}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: "all 1s ease",
          }}
        />
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          fill={color}
          fontSize="22"
          fontFamily="'Share Tech Mono',monospace"
          fontWeight="bold"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill={color}
          fontSize="10"
          fontFamily="'Share Tech Mono',monospace"
          letterSpacing="2"
        >
          {label}
        </text>
      </svg>
    </div>
  );
};

const NetworkGraph = ({ username, results }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const found = results.filter((r) => r.found);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    const cx = W / 2,
      cy = H / 2;
    const nodes = [
      {
        x: cx,
        y: cy,
        label: username,
        color: "#00d4ff",
        r: 28,
        pulse: 0,
        vx: 0,
        vy: 0,
        fixed: true,
      },
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
          vx: 0,
          vy: 0,
          fixed: false,
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
        const dx = hub.x - n.x,
          dy = hub.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const prog = (Math.sin(frame * 0.04 + i) + 1) / 2;
        const px = n.x + dx * prog,
          py = n.y + dy * prog;
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
    <div
      style={{
        background: "#050510",
        borderRadius: "4px",
        border: "1px solid #00d4ff22",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        width={480}
        height={280}
        style={{ display: "block", width: "100%", height: "280px" }}
      />
    </div>
  );
};

const UnifiedIdentityCard = ({ identityCard }) => {
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

const IdentityConfidencePanel = ({ identityConfidence }) => {
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

const RiskBreakdownList = ({ breakdown }) => {
  const [open, setOpen] = useState(false);
  if (!breakdown || breakdown.length === 0) return null;

  return (
    <div style={{ marginTop: "12px", textAlign: "left" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          color: "#00d4ff",
          fontSize: "11px",
          fontFamily: "'Share Tech Mono',monospace",
          cursor: "pointer",
          letterSpacing: "1px",
          padding: 0,
        }}
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

const ScanDiffPanel = ({ scanDiff }) => {
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

const RemediationPanel = ({ checklist }) => {
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

const AccountSecurityTab = ({ user }) => {
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

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }} className="fade-in">
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
            <CyberButton disabled={loadingPass || !password} style={{ width: "100%", padding: "10px" }}>
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
  );
};

const PlatformCard = ({ result }) => {
  const pd = result.profileData || {};
  return (
    <NeonBorder
      color={result.found ? result.color : "#333"}
      style={{
        borderRadius: "4px",
        padding: "16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
      }}
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
          background: "#0a0a1a",
          flexShrink: 0,
        }}
      >
        {result.avatar ? (
          <img
            src={result.avatar}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <span style={{ color: result.found ? result.color : "#555" }}>
            {result.icon}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              fontFamily: "'Share Tech Mono',monospace",
              color: result.found ? result.color : "#555",
              fontSize: "14px",
              letterSpacing: "1px",
              fontWeight: "bold",
            }}
          >
            {result.platform}
          </div>
          {result.found && (
            <span
              style={{
                fontSize: "9px",
                background: "#00ff8822",
                color: "#00ff88",
                padding: "1px 6px",
                borderRadius: "2px",
                letterSpacing: "1px",
              }}
            >
              VERIFIED API [HIGH CONFIDENCE]
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: result.found ? "#aaa" : "#444",
            marginTop: "2px",
          }}
        >
          {result.found ? "PROFILE DETECTED & VERIFIED" : "NO PROFILE FOUND"}
        </div>

        {result.found && pd && (
          <div style={{ marginTop: "8px", fontSize: "11px", color: "#888", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {pd.name && <span>👤 <strong>{pd.name}</strong></span>}
            {pd.location && <span>📍 {pd.location}</span>}
            {pd.email && <span style={{ color: "#ffaa00" }}>✉ {pd.email}</span>}
            {pd.public_repos !== undefined && <span>📦 {pd.public_repos} repos</span>}
            {pd.karma !== undefined && <span>⭐ {pd.karma} karma</span>}
            {pd.reputation !== undefined && <span>🏆 {pd.reputation} rep</span>}
            {pd.created_at && <span>📅 Joined {new Date(pd.created_at).getFullYear()}</span>}
            {pd.bio && (
              <div style={{ width: "100%", fontSize: "11px", color: "#bbb", fontStyle: "italic", marginTop: "2px" }}>
                "{pd.bio}"
              </div>
            )}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "4px",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: result.found ? result.color : "#333",
            boxShadow: result.found ? `0 0 8px ${result.color}` : "none",
          }}
        />
        {result.found && (
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "10px",
              color: result.color,
              textDecoration: "none",
              fontFamily: "monospace",
              letterSpacing: "1px",
              marginTop: "6px",
            }}
          >
            VIEW PROFILE →
          </a>
        )}
      </div>
    </NeonBorder>
  );
};


const TerminalLog = ({ lines }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);
  return (
    <div
      ref={ref}
      style={{
        background: "#020208",
        border: "1px solid #00d4ff22",
        borderRadius: "4px",
        padding: "12px 16px",
        fontFamily: "'Share Tech Mono',monospace",
        fontSize: "11px",
        lineHeight: "1.8",
        maxHeight: "150px",
        overflowY: "auto",
        color: "#00d4ff",
      }}
    >
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.color || "#00d4ff88" }}>
          <span style={{ color: "#00d4ff44" }}>
            [{String(i).padStart(3, "0")}]
          </span>{" "}
          {l.text}
        </div>
      ))}
      <div style={{ color: "#00d4ff" }}>█</div>
    </div>
  );
};

function LandingPage({ onEnter }) {
  const [typed, setTyped] = useState("");
  const tagline = "TRACK. ANALYZE. PROTECT.";
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setTyped(tagline.slice(0, i));
      i++;
      if (i > tagline.length) clearInterval(iv);
    }, 80);
    return () => clearInterval(iv);
  }, []);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020208",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MatrixRain />
      <ScanLine />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#00d4ff08 1px, transparent 1px), linear-gradient(90deg, #00d4ff08 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "40px",
        }}
        className="fade-in"
      >
        <div
          style={{
            fontSize: "11px",
            color: "#00d4ff88",
            letterSpacing: "6px",
            marginBottom: "20px",
          }}
        >
          OPEN SOURCE INTELLIGENCE PLATFORM
        </div>
        <div
          style={{
            fontSize: "clamp(48px,8vw,96px)",
            fontFamily: "'Orbitron',monospace",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "8px",
            lineHeight: 1,
            marginBottom: "8px",
            textShadow: "0 0 40px #00d4ff44",
          }}
        >
          <GlitchText text="OPEN" />
          <span style={{ color: "#00d4ff" }}>TRACE</span>
        </div>
        <div
          style={{
            fontSize: "clamp(12px,2vw,16px)",
            color: "#00d4ff",
            fontFamily: "'Share Tech Mono',monospace",
            letterSpacing: "4px",
            marginBottom: "48px",
            minHeight: "24px",
          }}
        >
          {typed}
          <span className="pulse-dot">_</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            justifyContent: "center",
            marginBottom: "64px",
            flexWrap: "wrap",
          }}
        >
          {[
            "USERNAME SCANNER",
            "EXPOSURE GRAPH",
            "AI RISK ANALYSIS",
            "CYBER HYGIENE",
          ].map((f) => (
            <div
              key={f}
              style={{
                fontSize: "10px",
                color: "#7c3aed88",
                letterSpacing: "2px",
                padding: "6px 14px",
                border: "1px solid #7c3aed33",
                borderRadius: "2px",
              }}
            >
              ⬡ {f}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <CyberButton
            onClick={onEnter}
            style={{
              padding: "16px 48px",
              fontSize: "15px",
              letterSpacing: "4px",
            }}
          >
            ENTER SYSTEM
          </CyberButton>
        </div>
        <div
          style={{
            marginTop: "48px",
            fontSize: "10px",
            color: "#444",
            letterSpacing: "2px",
          }}
        >
          FOR EDUCATIONAL & CYBERSECURITY AWARENESS PURPOSES ONLY
        </div>
      </div>
    </div>
  );
}

function AuthPage({
  mode,
  setMode,
  form,
  setForm,
  onSubmit,
  onBack,
  onGoogleSuccess,
}) {
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
      }}
    >
      <MatrixRain />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#00d4ff05 1px, transparent 1px), linear-gradient(90deg, #00d4ff05 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "420px",
          padding: "24px",
        }}
        className="fade-in"
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#00d4ff88",
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: "12px",
            letterSpacing: "2px",
            marginBottom: "24px",
            display: "block",
          }}
        >
          ← BACK
        </button>
        <NeonBorder
          color="#7c3aed"
          style={{ padding: "36px", borderRadius: "4px" }}
        >
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
              {mode === "login" ? "ACCESS PORTAL" : "REGISTER"}
            </div>
            <div
              style={{ fontSize: "11px", color: "#666", letterSpacing: "2px" }}
            >
              SECURE AUTHENTICATION
            </div>
          </div>
          <form
            onSubmit={onSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {mode === "register" && (
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#00d4ff88",
                    letterSpacing: "2px",
                    marginBottom: "6px",
                  }}
                >
                  OPERATOR NAME
                </div>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
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
            )}
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#00d4ff88",
                  letterSpacing: "2px",
                  marginBottom: "6px",
                }}
              >
                EMAIL ADDRESS
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
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
              <div
                style={{
                  fontSize: "10px",
                  color: "#00d4ff88",
                  letterSpacing: "2px",
                  marginBottom: "6px",
                }}
              >
                PASSWORD
              </div>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
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
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "14px",
                fontSize: "14px",
              }}
              onClick={onSubmit}
            >
              {mode === "login" ? "▶ AUTHENTICATE" : "▶ CREATE ACCOUNT"}
            </CyberButton>
          </form>

          <div
            style={{
              margin: "20px 0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#ffffff11" }} />
            <div
              style={{ color: "#666", fontSize: "11px", letterSpacing: "2px" }}
            >
              OR
            </div>
            <div style={{ flex: 1, height: "1px", background: "#ffffff11" }} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() => alert("Login Failed")}
              render={(renderProps) => (
                <CyberButton
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  style={{ width: "100%", padding: "12px", fontSize: "13px" }}
                >
                  🔐 SIGN IN WITH GOOGLE
                </CyberButton>
              )}
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{
                background: "none",
                border: "none",
                color: "#7c3aed88",
                cursor: "pointer",
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "11px",
                letterSpacing: "2px",
              }}
            >
              {mode === "login"
                ? "NEW OPERATOR? REGISTER →"
                : "ALREADY REGISTERED? LOGIN →"}
            </button>
          </div>
        </NeonBorder>
      </div>
    </div>
  );
}

function ScanPage({
  username,
  setUsername,
  scanning,
  onScan,
  results,
  riskScore,
  riskBreakdown,
  identityConfidence,
  identityCard,
  scanDiff,
  remediationChecklist,
  aiAnalysis,
  aiLoading,
  logs,
  scanComplete,
  activeTab,
  setActiveTab,
  renderMarkdown,
  onBack,
  checkPermutations,
  setCheckPermutations,
  permutationMatches,
}) {
  const tabs = ["results", "graph", "ai-analysis"];
  const found = results.filter((r) => r.found);
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
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#00d4ff88",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "12px",
              letterSpacing: "2px",
            }}
          >
            ← COMMAND CENTER
          </button>
          <div
            style={{
              fontSize: "16px",
              fontFamily: "'Orbitron',monospace",
              color: "#fff",
              letterSpacing: "4px",
            }}
          >
            INTELLIGENCE SCAN
          </div>
          <div
            style={{
              fontSize: "11px",
              color: scanning ? "#ffaa00" : "#00ff8888",
            }}
            className={scanning ? "pulse-dot" : ""}
          >
            {scanning ? "● SCANNING..." : "● READY"}
          </div>
        </div>

        <div
          style={{ padding: "28px 32px", maxWidth: "1150px", margin: "0 auto" }}
        >
          <NeonBorder
            color="#7c3aed"
            style={{
              padding: "24px",
              borderRadius: "4px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "#7c3aed88",
                letterSpacing: "3px",
                marginBottom: "14px",
              }}
            >
              TARGET IDENTIFIER & PERMUTATION SCAN
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#00d4ff66",
                    fontSize: "14px",
                  }}
                >
                  @
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !scanning && onScan()}
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
              <CyberButton
                onClick={onScan}
                disabled={scanning || !username.trim()}
                style={{
                  padding: "14px 32px",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                }}
              >
                {scanning ? (
                  <span className="spin" style={{ display: "inline-block" }}>
                    ⟳
                  </span>
                ) : (
                  "⬡"
                )}{" "}
                {scanning ? " SCANNING" : " SCAN TARGET"}
              </CyberButton>
            </div>
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="permCheck"
                checked={checkPermutations}
                onChange={(e) => setCheckPermutations(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <label htmlFor="permCheck" style={{ fontSize: "11px", color: "#aaa", cursor: "pointer" }}>
                Opt-in: Check common username permutations (e.g. {username || "u"}_, {username || "u"}.dev, the{username || "u"})
              </label>
            </div>
          </NeonBorder>

          {logs.length > 0 && (
            <div style={{ marginBottom: "24px" }} className="fade-in">
              <TerminalLog lines={logs} />
            </div>
          )}

          {(results.length > 0 || scanComplete) && (
            <div>
              {/* UNIFIED IDENTITY CARD SHOWN FIRST ABOVE ALL RESULTS */}
              {identityCard && <UnifiedIdentityCard identityCard={identityCard} />}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 340px",
                  gap: "20px",
                }}
              >
                <div>
                  <div
                    style={{ display: "flex", gap: "2px", marginBottom: "16px" }}
                  >
                    {tabs.map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        style={{
                          padding: "8px 20px",
                          background:
                            activeTab === t ? "#00d4ff18" : "transparent",
                          border: `1px solid ${activeTab === t ? "#00d4ff" : "#ffffff11"}`,
                          color: activeTab === t ? "#00d4ff" : "#666",
                          fontFamily: "'Share Tech Mono',monospace",
                          fontSize: "11px",
                          letterSpacing: "2px",
                          cursor: "pointer",
                          textTransform: "uppercase",
                          borderRadius: "2px",
                        }}
                      >
                        {t.replace("-", " ")}
                      </button>
                    ))}
                  </div>

                  {activeTab === "results" && (
                    <div
                      className="fade-in"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {results.map((r) => (
                        <PlatformCard key={r.id} result={r} />
                      ))}

                      {/* MANUAL CHECK PLATFORMS */}
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

                      {/* PERMUTATION MATCHES */}
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

                      {/* ACTIONABLE REMEDIATION CHECKLIST */}
                      <RemediationPanel checklist={remediationChecklist} />
                    </div>
                  )}

                  {activeTab === "graph" && (
                    <div className="fade-in">
                      <NetworkGraph username={username} results={results} />
                      <div
                        style={{
                          marginTop: "12px",
                          fontSize: "10px",
                          color: "#444",
                          textAlign: "center",
                          letterSpacing: "2px",
                        }}
                      >
                        LIVE NETWORK TOPOLOGY — {found.length} NODES CONNECTED
                      </div>
                    </div>
                  )}

                  {activeTab === "ai-analysis" && (
                    <NeonBorder
                      color="#7c3aed"
                      style={{
                        padding: "24px",
                        borderRadius: "4px",
                        minHeight: "280px",
                      }}
                      className="fade-in"
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#7c3aed88",
                          letterSpacing: "3px",
                          marginBottom: "16px",
                        }}
                      >
                        ⬡ AI THREAT INTELLIGENCE
                      </div>
                      {aiLoading ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#7c3aed",
                          }}
                        >
                          <div
                            className="spin"
                            style={{
                              fontSize: "32px",
                              display: "block",
                              marginBottom: "16px",
                            }}
                          >
                            ⟳
                          </div>
                          <div style={{ fontSize: "12px", letterSpacing: "2px" }}>
                            NEURAL ENGINE PROCESSING...
                          </div>
                        </div>
                      ) : aiAnalysis ? (
                        renderMarkdown(aiAnalysis)
                      ) : (
                        <div
                          style={{
                            color: "#444",
                            textAlign: "center",
                            padding: "40px",
                          }}
                        >
                          AWAITING SCAN COMPLETION
                        </div>
                      )}
                    </NeonBorder>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <NeonBorder
                    color={
                      riskScore > 70
                        ? "#ff3366"
                        : riskScore > 30
                          ? "#ffaa00"
                          : "#00ff88"
                    }
                    style={{
                      padding: "20px",
                      borderRadius: "4px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        letterSpacing: "3px",
                        color: "#666",
                        marginBottom: "12px",
                      }}
                    >
                      DETERMINISTIC CYBER RISK SCORE
                    </div>
                    <RiskMeter score={riskScore} />
                    <RiskBreakdownList breakdown={riskBreakdown} />
                  </NeonBorder>

                  <IdentityConfidencePanel identityConfidence={identityConfidence} />

                  <ScanDiffPanel scanDiff={scanDiff} />

                  <NeonBorder
                    color="#00d4ff22"
                    style={{ padding: "20px", borderRadius: "4px" }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        letterSpacing: "3px",
                        color: "#666",
                        marginBottom: "14px",
                      }}
                    >
                      EXPOSURE METRICS
                    </div>
                    {[
                      {
                        label: "Platforms Scanned",
                        value: results.length,
                        color: "#00d4ff",
                      },
                      {
                        label: "Profiles Found",
                        value: found.length,
                        color: "#00ff88",
                      },
                      {
                        label: "Not Found",
                        value: results.length - found.length,
                        color: "#666",
                      },
                      {
                        label: "Exposure Rate",
                        value: `${results.length ? Math.round((found.length / results.length) * 100) : 0}%`,
                        color: riskScore > 70 ? "#ff3366" : "#ffaa00",
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom: "1px solid #ffffff08",
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "#666" }}>
                          {m.label}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            color: m.color,
                            fontFamily: "'Orbitron',monospace",
                          }}
                        >
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </NeonBorder>
                </div>
              </div>
            </div>
          )}

          {!scanning && results.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "80px 40px",
                color: "#333",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⬡</div>
              <div style={{ fontSize: "14px", letterSpacing: "2px" }}>
                ENTER A TARGET USERNAME TO BEGIN
              </div>
              <div
                style={{ fontSize: "11px", color: "#222", marginTop: "8px" }}
              >
                Searches GitHub, Reddit, LeetCode, StackOverflow, Dev.to, Gravatar & HackerNews
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, onBack, onLogout }) {
  const [page, setPage] = useState(PAGES.DASHBOARD);
  const [username, setUsername] = useState("");
  const [checkPermutations, setCheckPermutations] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [riskBreakdown, setRiskBreakdown] = useState([]);
  const [identityConfidence, setIdentityConfidence] = useState(null);
  const [identityCard, setIdentityCard] = useState(null);
  const [scanDiff, setScanDiff] = useState(null);
  const [remediationChecklist, setRemediationChecklist] = useState([]);
  const [permutationMatches, setPermutationMatches] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("results");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await scanAPI.getHistory();
      setScanHistory(res.data.scans || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const addLog = useCallback((text, color = "#00d4ff88") => {
    setLogs((prev) => [...prev, { text, color }]);
  }, []);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const runScan = async () => {
    if (!username.trim()) return;
    setScanning(true);
    setScanComplete(false);
    setResults([]);
    setAiAnalysis("");
    setLogs([]);
    addLog(
      `INITIATING SCAN SEQUENCE FOR TARGET: ${username.toUpperCase()}`,
      "#00d4ff",
    );
    addLog("Establishing API connections across 7 public platforms...", "#00d4ff66");
    await sleep(600);

    try {
      const res = await scanAPI.startScan(username, { checkPermutations });
      const scanData = res.data.scan;

      setResults(scanData.results || []);
      setRiskScore(scanData.riskScore || 0);
      setRiskBreakdown(scanData.riskBreakdown || []);
      setIdentityConfidence(scanData.identityConfidence || null);
      setIdentityCard(scanData.identityCard || null);
      setScanDiff(scanData.scanDiff || null);
      setRemediationChecklist(scanData.remediationChecklist || []);
      setPermutationMatches(res.data.permutationMatches || []);

      addLog(
        `Scan complete. ${scanData.platformsFound}/${scanData.results.length} platforms verified.`,
        "#00d4ff",
      );
      addLog(
        `Deterministic Risk Score: ${scanData.riskScore}/100`,
        scanData.riskScore > 70
          ? "#ff3366"
          : scanData.riskScore > 30
            ? "#ffaa00"
            : "#00ff88",
      );
      setScanComplete(true);
      await loadHistory();
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
      setAiAnalysis(res.data.analysis);
    } catch (error) {
      setAiAnalysis(
        "### EXPOSURE SUMMARY\nFailed to generate AI threat analysis.",
      );
    }
    setAiLoading(false);
  };


  const renderMarkdown = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### "))
        return (
          <div
            key={i}
            style={{
              color: "#00d4ff",
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "12px",
              letterSpacing: "2px",
              marginTop: "16px",
              marginBottom: "6px",
              borderBottom: "1px solid #00d4ff22",
              paddingBottom: "4px",
            }}
          >
            {line.slice(4).toUpperCase()}
          </div>
        );
      if (line.startsWith("## "))
        return (
          <div
            key={i}
            style={{
              color: "#7c3aed",
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "13px",
              letterSpacing: "1px",
              marginTop: "12px",
            }}
          >
            {line.slice(3)}
          </div>
        );
      if (line.startsWith("- "))
        return (
          <div
            key={i}
            style={{
              color: "#ccc",
              fontSize: "13px",
              paddingLeft: "12px",
              marginBottom: "4px",
            }}
          >
            {"▸ " + line.slice(2)}
          </div>
        );
      if (line.match(/^\d+\./))
        return (
          <div
            key={i}
            style={{
              color: "#ccc",
              fontSize: "13px",
              paddingLeft: "12px",
              marginBottom: "4px",
            }}
          >
            {line}
          </div>
        );
      if (!line.trim()) return <div key={i} style={{ height: "8px" }} />;
      return (
        <div
          key={i}
          style={{ color: "#aaa", fontSize: "13px", lineHeight: "1.7" }}
        >
          {line}
        </div>
      );
    });
  };

  if (page === PAGES.SCAN) {
    return (
      <ScanPage
        username={username}
        setUsername={setUsername}
        scanning={scanning}
        onScan={runScan}
        results={results}
        riskScore={riskScore}
        riskBreakdown={riskBreakdown}
        identityConfidence={identityConfidence}
        identityCard={identityCard}
        scanDiff={scanDiff}
        remediationChecklist={remediationChecklist}
        aiAnalysis={aiAnalysis}
        aiLoading={aiLoading}
        logs={logs}
        scanComplete={scanComplete}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderMarkdown={renderMarkdown}
        checkPermutations={checkPermutations}
        setCheckPermutations={setCheckPermutations}
        permutationMatches={permutationMatches}
        onBack={() => {
          setPage(PAGES.DASHBOARD);
          setScanComplete(false);
          setResults([]);
          setLogs([]);
        }}
      />
    );
  }

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
            <div
              style={{
                fontSize: "10px",
                color: "#00d4ff66",
                letterSpacing: "2px",
              }}
            >
              v2.4.1
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setPage(PAGES.DASHBOARD)}
              style={{
                padding: "8px 16px",
                background: page === PAGES.DASHBOARD ? "#00d4ff18" : "transparent",
                border: `1px solid ${page === PAGES.DASHBOARD ? "#00d4ff" : "#ffffff11"}`,
                color: page === PAGES.DASHBOARD ? "#00d4ff" : "#888",
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "11px",
                letterSpacing: "1px",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              COMMAND CENTER
            </button>
            <button
              onClick={() => setPage(PAGES.SCAN)}
              style={{
                padding: "8px 16px",
                background: page === PAGES.SCAN ? "#00d4ff18" : "transparent",
                border: `1px solid ${page === PAGES.SCAN ? "#00d4ff" : "#ffffff11"}`,
                color: page === PAGES.SCAN ? "#00d4ff" : "#888",
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "11px",
                letterSpacing: "1px",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              OSINT SCANNER
            </button>
            <button
              onClick={() => setPage(PAGES.ACCOUNT_SECURITY)}
              style={{
                padding: "8px 16px",
                background: page === PAGES.ACCOUNT_SECURITY ? "#00ff8818" : "transparent",
                border: `1px solid ${page === PAGES.ACCOUNT_SECURITY ? "#00ff88" : "#ffffff11"}`,
                color: page === PAGES.ACCOUNT_SECURITY ? "#00ff88" : "#888",
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "11px",
                letterSpacing: "1px",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              ACCOUNT SECURITY
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "12px", color: "#00ff8888" }}>
              ⬟ SYSTEM ONLINE
            </div>
            <div style={{ fontSize: "12px", color: "#aaa" }}>
              {user?.name?.toUpperCase()}
            </div>
            <CyberButton
              onClick={onLogout}
              variant="danger"
              style={{ padding: "6px 16px", fontSize: "11px" }}
            >
              LOGOUT
            </CyberButton>
          </div>
        </div>

        {page === PAGES.ACCOUNT_SECURITY ? (
          <AccountSecurityTab user={user} />
        ) : (


        <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#00d4ff88",
                letterSpacing: "3px",
                marginBottom: "8px",
              }}
            >
              INTELLIGENCE DASHBOARD
            </div>
            <div
              style={{
                fontSize: "28px",
                fontFamily: "'Orbitron',monospace",
                color: "#fff",
                letterSpacing: "2px",
                marginBottom: "4px",
              }}
            >
              CYBER COMMAND CENTER
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Monitor your digital footprint and exposure metrics
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            {[
              { label: "TOTAL SCANS", value: totalScans, color: "#00d4ff" },
              {
                label: "AVG RISK SCORE",
                value: avgRisk,
                color:
                  avgRisk > 70
                    ? "#ff3366"
                    : avgRisk > 30
                      ? "#ffaa00"
                      : "#00ff88",
              },
              { label: "HIGH RISK TARGETS", value: highRisk, color: "#ff3366" },
              {
                label: "PLATFORMS INDEXED",
                value: PLATFORMS.length,
                color: "#7c3aed",
              },
            ].map((s) => (
              <NeonBorder
                key={s.label}
                color={s.color}
                style={{ padding: "20px", borderRadius: "4px" }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    color: "#666",
                    letterSpacing: "2px",
                    marginBottom: "8px",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: "36px",
                    color: s.color,
                    fontFamily: "'Orbitron',monospace",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textShadow: `0 0 20px ${s.color}88`,
                  }}
                >
                  {s.value}
                </div>
              </NeonBorder>
            ))}
          </div>

          <NeonBorder
            color="#7c3aed"
            style={{
              padding: "28px",
              borderRadius: "4px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontFamily: "'Orbitron',monospace",
                  color: "#fff",
                  marginBottom: "6px",
                }}
              >
                RUN NEW INTELLIGENCE SCAN
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                Analyze a username across public platforms for exposure and risk
                assessment
              </div>
            </div>
            <CyberButton
              onClick={() => setPage(PAGES.SCAN)}
              style={{ padding: "14px 32px", fontSize: "14px" }}
            >
              ⬡ INITIATE SCAN
            </CyberButton>
          </NeonBorder>

          <NeonBorder
            color="#00d4ff22"
            style={{ padding: "24px", borderRadius: "4px" }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#00d4ff88",
                letterSpacing: "3px",
                marginBottom: "16px",
              }}
            >
              SCAN HISTORY LOG
            </div>
            {scanHistory.length === 0 ? (
              <div
                style={{
                  color: "#444",
                  fontSize: "13px",
                  textAlign: "center",
                  padding: "32px",
                }}
              >
                NO SCAN RECORDS FOUND. INITIATE FIRST SCAN.
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {scanHistory.slice(0, 10).map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "12px 16px",
                      background: "#0a0a1a",
                      borderRadius: "2px",
                      border: "1px solid #ffffff11",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background:
                          h.riskScore > 70
                            ? "#ff3366"
                            : h.riskScore > 30
                              ? "#ffaa00"
                              : "#00ff88",
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{ flex: 1, color: "#00d4ff", fontSize: "13px" }}
                    >
                      @{h.username}
                    </div>
                    <div style={{ color: "#666", fontSize: "11px" }}>
                      {new Date(h.date).toLocaleDateString()}
                    </div>
                    <div style={{ color: "#888", fontSize: "11px" }}>
                      {h.platformsFound} platforms
                    </div>
                    <div
                      style={{
                        color:
                          h.riskScore > 70
                            ? "#ff3366"
                            : h.riskScore > 30
                              ? "#ffaa00"
                              : "#00ff88",
                        fontSize: "13px",
                        fontFamily: "'Orbitron',monospace",
                        minWidth: "40px",
                        textAlign: "right",
                      }}
                    >
                      {h.riskScore}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </NeonBorder>
        </div>
        )}
      </div>
    </div>
  );
}


export default function OpenTrace() {
  const [page, setPage] = useState(PAGES.LANDING);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ot_token");
    const savedUser = localStorage.getItem("ot_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setPage(PAGES.DASHBOARD);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        authMode === "register" ? authAPI.register : authAPI.login;
      const res = await endpoint(authForm);
      const { token, user: userData } = res.data;
      localStorage.setItem("ot_token", token);
      localStorage.setItem("ot_user", JSON.stringify(userData));
      setUser(userData);
      setPage(PAGES.DASHBOARD);
    } catch (err) {
      alert(
        "Authentication failed: " +
          (err.response?.data?.message || err.message),
      );
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        throw new Error("No credential received from Google");
      }
      let decoded;
      try {
        const base64Url = credential.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        decoded = JSON.parse(jsonPayload);
      } catch (e) {
        decoded = JSON.parse(atob(credential.split(".")[1]));
      }

      const res = await authAPI.googleAuth({
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name || decoded.email.split("@")[0],
        picture: decoded.picture,
      });
      const { token, user: userData } = res.data;
      localStorage.setItem("ot_token", token);
      localStorage.setItem("ot_user", JSON.stringify(userData));
      setUser(userData);
      setPage(PAGES.DASHBOARD);
    } catch (err) {
      console.error("Google login error:", err);
      alert(
        "Google login failed: " +
          (err.response?.data?.message || err.message || "Unknown error"),
      );
    }
    setLoading(false);
  };


  const handleLogout = () => {
    localStorage.removeItem("ot_token");
    localStorage.removeItem("ot_user");
    setUser(null);
    setAuthForm({ email: "", password: "", name: "" });
    setPage(PAGES.LANDING);
  };

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

  if (page === PAGES.LANDING)
    return <LandingPage onEnter={() => setPage(PAGES.AUTH)} />;
  if (page === PAGES.AUTH)
    return (
      <AuthPage
        mode={authMode}
        setMode={setAuthMode}
        form={authForm}
        setForm={setAuthForm}
        onSubmit={handleAuth}
        onBack={() => setPage(PAGES.LANDING)}
        onGoogleSuccess={handleGoogleSuccess}
      />
    );
  if (user)
    return (
      <Dashboard
        user={user}
        onBack={() => setPage(PAGES.DASHBOARD)}
        onLogout={handleLogout}
      />
    );

  return <LandingPage onEnter={() => setPage(PAGES.AUTH)} />;
}
