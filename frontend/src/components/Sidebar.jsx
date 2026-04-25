import { NavLink, useNavigate } from "react-router-dom";
import { BASE_CSS } from "../theme";

const S = `
  ${BASE_CSS}
  .sidebar {
    width: 230px; flex-shrink: 0; height: 100vh;
    background: var(--bg2);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    overflow: hidden; position: relative;
  }
  .sidebar::before {
    content: ''; position: absolute; top: -120px; left: -80px;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,245,228,0.04) 0%, transparent 65%);
    pointer-events: none;
  }
  .sb-brand {
    display: flex; align-items: center; gap: 12px;
    padding: 22px 20px 18px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .sb-logo {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, var(--cyan), var(--cyan2));
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 800; color: #050810; flex-shrink: 0;
    box-shadow: 0 0 20px rgba(0,245,228,0.25), 0 4px 12px rgba(0,0,0,0.3);
    animation: float 4s ease-in-out infinite;
  }
  .sb-name { font-size: 16px; font-weight: 800; color: var(--text); letter-spacing: -.4px; }
  .sb-tag  { font-size: 10px; color: var(--text3); font-weight: 600; letter-spacing: .05em; margin-top: 1px; text-transform: uppercase; }
  .sb-nav { flex: 1; padding: 14px 12px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
  .sb-nav::-webkit-scrollbar { display: none; }
  .sb-section { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text4); padding: 12px 10px 6px; }
  .sb-link {
    display: flex; align-items: center; gap: 11px;
    padding: 10px 12px; border-radius: 10px;
    font-size: 13px; font-weight: 500; color: var(--text2);
    text-decoration: none; transition: all .18s; cursor: pointer;
    border: 1px solid transparent; position: relative;
  }
  .sb-link:hover { background: rgba(255,255,255,0.04); color: var(--text); border-color: var(--border); }
  .sb-link.active {
    background: var(--cyan-dim); color: var(--cyan);
    border-color: rgba(0,245,228,0.2);
    font-weight: 700;
    box-shadow: 0 0 20px rgba(0,245,228,0.05);
  }
  .sb-link.active .sb-icon { filter: drop-shadow(0 0 6px rgba(0,245,228,0.6)); }
  .sb-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
  .sb-indicator {
    margin-left: auto; width: 7px; height: 7px; border-radius: 50%;
    background: var(--cyan); box-shadow: 0 0 8px var(--cyan-pulse);
    animation: pulse-dot 2.5s infinite;
  }
  .sb-footer {
    padding: 14px 16px; border-top: 1px solid var(--border); flex-shrink: 0;
  }
  .sb-backend {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 12px;
  }
  .sb-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px rgba(45,212,191,0.6); animation: pulse-dot 2s infinite; }
  .sb-status { font-size: 11px; color: var(--text3); }
  .sb-status strong { color: var(--green); font-weight: 600; }
  .sb-divider { height: 1px; background: var(--border); margin: 6px 0; }
`;

const NAV = [
  { to: "/dashboard", icon: "⬡", label: "Dashboard"   },
  { to: "/students",  icon: "◈", label: "Students"    },
  { to: "/analytics", icon: "◎", label: "Analytics"   },
  { to: "/alerts",    icon: "◬", label: "Risk Alerts" },
  { to: "/settings",  icon: "◍", label: "Settings"    },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      <style>{S}</style>

      <div className="sb-brand">
        <div className="sb-logo">E</div>
        <div>
          <div className="sb-name">EduRisk</div>
          <div className="sb-tag">AI Risk Platform</div>
        </div>
      </div>

      <nav className="sb-nav">
        <div className="sb-section">Navigation</div>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sb-link${isActive ? " active" : ""}`}
          >
            <span className="sb-icon">{icon}</span>
            {label}
            {to === "/alerts" && <span className="sb-indicator" style={{ display: "none" }} />}
          </NavLink>
        ))}

        <div className="sb-divider" style={{ marginTop: 12 }} />
        <div className="sb-section">System</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => `sb-link${isActive ? " active" : ""}`}
          style={{ display: "none" }}
        />
      </nav>

      <div className="sb-footer">
        <div className="sb-backend">
          <div className="sb-dot" />
          <div className="sb-status">Backend: <strong>localhost:8000</strong></div>
        </div>
        <div style={{ fontSize: 10.5, color: "var(--text4)", marginTop: 8, textAlign: "center" }}>
          v1.0 · FastAPI + scikit-learn
        </div>
      </div>
    </div>
  );
}
