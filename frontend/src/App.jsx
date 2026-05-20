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
    avatarApi: (u) => `https://github.com/${u}.png?size=80`,
    weight: 2,
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: "◈",
    color: "#ff4500",
    checkUrl: (u) => `https://www.reddit.com/user/${u}`,
    avatarApi: null,
    weight: 1.5,
  },
  {
    id: "gravatar",
    name: "Gravatar",
    icon: "◎",
    color: "#1e73be",
    checkUrl: (u) => `https://gravatar.com/${u}`,
    avatarApi: null,
    weight: 1,
  },
];

const PAGES = {
  LANDING: "landing",
  AUTH: "auth",
  DASHBOARD: "dashboard",
  SCAN: "scan",
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

const PlatformCard = ({ result }) => (
  <NeonBorder
    color={result.found ? result.color : "#333"}
    style={{
      borderRadius: "4px",
      padding: "16px",
      display: "flex",
      alignItems: "center",
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
      <div
        style={{
          fontFamily: "'Share Tech Mono',monospace",
          color: result.found ? result.color : "#555",
          fontSize: "13px",
          letterSpacing: "1px",
        }}
      >
        {result.platform}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: result.found ? "#aaa" : "#444",
          marginTop: "2px",
        }}
      >
        {result.found ? "PROFILE DETECTED" : "NO PROFILE FOUND"}
      </div>
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
          }}
        >
          VIEW →
        </a>
      )}
    </div>
  </NeonBorder>
);

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
              type="standard"
              theme="dark"
              size="large"
              text="signin"
              locale="en"
              style={{
                width: "100%",
                "--google_container_width": "100%",
              }}
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
  aiAnalysis,
  aiLoading,
  logs,
  scanComplete,
  activeTab,
  setActiveTab,
  renderMarkdown,
  onBack,
}) {
  const tabs = ["graph", "results", "ai-analysis"];
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
            ← DASHBOARD
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
          style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto" }}
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
              TARGET IDENTIFIER
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
          </NeonBorder>

          {logs.length > 0 && (
            <div style={{ marginBottom: "24px" }} className="fade-in">
              <TerminalLog lines={logs} />
            </div>
          )}

          {(results.length > 0 || scanComplete) && (
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
                    CYBER RISK SCORE
                  </div>
                  <RiskMeter score={riskScore} />
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginTop: "12px",
                      letterSpacing: "1px",
                    }}
                  >
                    {riskScore <= 30
                      ? "MINIMAL EXPOSURE DETECTED"
                      : riskScore <= 70
                        ? "MODERATE DIGITAL FOOTPRINT"
                        : "HIGH EXPOSURE — ACTION NEEDED"}
                  </div>
                </NeonBorder>

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
                Searches GitHub, Reddit & Gravatar
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
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("graph");

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
    addLog("Establishing secure tunnel...", "#00d4ff66");
    await sleep(600);

    try {
      const res = await scanAPI.startScan(username);
      const scanResults = res.data.scan;
      setResults(scanResults.results);
      setRiskScore(scanResults.riskScore);
      addLog(
        `Scan complete. ${scanResults.platformsFound}/${PLATFORMS.length} platforms detected.`,
        "#00d4ff",
      );
      addLog(
        `Cyber Risk Score: ${scanResults.riskScore}/100`,
        scanResults.riskScore > 70
          ? "#ff3366"
          : scanResults.riskScore > 30
            ? "#ffaa00"
            : "#00ff88",
      );
      setScanComplete(true);
      await loadHistory();
      await generateAI(scanResults.id);
    } catch (error) {
      addLog("SCAN FAILED: " + error.message, "#ff3366");
    }
    setScanning(false);
  };

  const generateAI = async (scanId) => {
    setAiLoading(true);
    try {
      const res = await scanAPI.generateAnalysis(scanId);
      setAiAnalysis(res.data.analysis);
    } catch (error) {
      setAiAnalysis(
        "### AI ANALYSIS\nFailed to generate analysis. Please try again.",
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
        aiAnalysis={aiAnalysis}
        aiLoading={aiLoading}
        logs={logs}
        scanComplete={scanComplete}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderMarkdown={renderMarkdown}
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
    ? Math.round(scanHistory.reduce((s, h) => s + h.riskScore, 0) / totalScans)
    : 0;
  const highRisk = scanHistory.filter((h) => h.riskScore > 70).length;

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
      const decoded = JSON.parse(atob(credential.split(".")[1]));
      const res = await authAPI.googleAuth({
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      });
      const { token, user: userData } = res.data;
      localStorage.setItem("ot_token", token);
      localStorage.setItem("ot_user", JSON.stringify(userData));
      setUser(userData);
      setPage(PAGES.DASHBOARD);
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google login failed: " + (err.message || "Unknown error"));
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
