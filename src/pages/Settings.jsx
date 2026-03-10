import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { BASE_CSS } from "../theme";

const S = `
  ${BASE_CSS}
  @keyframes spin { to { transform:rotate(360deg); } }
  .topbar { display:flex; justify-content:space-between; align-items:center; padding:16px 32px; background:rgba(13,20,36,0.92); border-bottom:1px solid var(--border); backdrop-filter:blur(20px); flex-shrink:0; }
  .topbar-title { font-family:var(--font-disp); font-size:20px; font-weight:700; color:var(--text); }
  .topbar-sub { font-size:12px; color:var(--text3); margin-top:2px; }
  .section-title { font-size:11px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; display:flex; align-items:center; gap:8px; }
  .section-title::after { content:''; flex:1; height:1px; background:var(--border); }
  .setting-row { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:18px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
  .setting-row:last-child { border-bottom:none; }
  .setting-label { font-size:14px; font-weight:600; color:var(--text); margin-bottom:4px; }
  .setting-desc  { font-size:12px; color:var(--text3); line-height:1.5; }
  .range-wrap { display:flex; align-items:center; gap:14px; }
  .range-val { font-family:var(--font-disp); font-size:22px; font-weight:800; color:var(--teal); min-width:52px; text-align:right; }
  input[type=range] { -webkit-appearance:none; width:180px; height:4px; border-radius:99px; background:var(--surface2); outline:none; cursor:pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:linear-gradient(135deg,var(--teal),var(--teal2)); box-shadow:0 0 12px rgba(15,244,198,0.4); cursor:pointer; }
  input[type=range]::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:linear-gradient(135deg,var(--teal),var(--teal2)); border:none; cursor:pointer; }
  .toggle { position:relative; width:48px; height:26px; cursor:pointer; flex-shrink:0; }
  .toggle input { opacity:0; width:0; height:0; }
  .toggle-track { position:absolute; inset:0; border-radius:99px; background:var(--surface2); border:1px solid var(--border2); transition:background .2s,border-color .2s; }
  .toggle input:checked ~ .toggle-track { background:var(--teal-dim); border-color:rgba(15,244,198,.4); }
  .toggle-thumb { position:absolute; width:18px; height:18px; border-radius:50%; background:var(--text3); top:3px; left:3px; transition:transform .2s,background .2s; }
  .toggle input:checked ~ .toggle-track .toggle-thumb { transform:translateX(22px); background:var(--teal); box-shadow:0 0 8px rgba(15,244,198,.5); }
  .profile-avatar { width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg,var(--teal),var(--teal2)); display:flex; align-items:center; justify-content:center; font-family:var(--font-disp); font-size:28px; font-weight:800; color:#080c14; flex-shrink:0; box-shadow:0 0 24px rgba(15,244,198,.25); }
  .danger-zone { background:rgba(255,92,124,0.05); border:1px solid rgba(255,92,124,0.15); border-radius:var(--radius); padding:24px; }
  .danger-title { font-family:var(--font-disp); font-size:15px; font-weight:700; color:var(--red); margin-bottom:4px; display:flex; align-items:center; gap:8px; }
  .danger-desc { font-size:13px; color:var(--text3); margin-bottom:20px; line-height:1.6; }
  .toast { position:fixed; bottom:28px; right:28px; background:var(--surface2); border:1px solid rgba(15,244,198,.25); border-radius:12px; padding:14px 20px; display:flex; align-items:center; gap:10px; font-size:13px; font-weight:600; color:var(--teal); box-shadow:var(--shadow-lg); animation:fadeUp .3s ease; z-index:999; }
  .stat-pill { display:inline-flex; align-items:center; gap:6px; background:var(--teal-dim); border:1px solid rgba(15,244,198,.2); border-radius:20px; padding:5px 14px; font-size:12px; font-weight:600; color:var(--teal); }
`;

export default function Settings() {
  const [userEmail,   setUserEmail]   = useState("");
  const [userName,    setUserName]    = useState("");
  const [attT,        setAttT]        = useState(75);
  const [marksT,      setMarksT]      = useState(50);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [autoPredict, setAutoPredict] = useState(true);
  const [showProb,    setShowProb]    = useState(true);
  const [toast,       setToast]       = useState("");
  const [clearing,    setClearing]    = useState(false);

  const studentCount = (() => {
    try { return JSON.parse(localStorage.getItem("studentList") || "[]").length; } catch { return 0; }
  })();

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) { window.location.href = "/login"; return; }
    setUserEmail(localStorage.getItem("userEmail") || "");
    setUserName(localStorage.getItem("userName") || "");
    const a  = localStorage.getItem("attendanceThreshold");
    const m  = localStorage.getItem("marksThreshold");
    const ea = localStorage.getItem("emailAlerts");
    const ap = localStorage.getItem("autoPredict");
    const sp = localStorage.getItem("showProbability");
    if (a)  setAttT(parseInt(a));
    if (m)  setMarksT(parseInt(m));
    if (ea !== null) setEmailAlerts(ea === "true");
    if (ap !== null) setAutoPredict(ap === "true");
    if (sp !== null) setShowProb(sp === "true");
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function handleSave() {
    localStorage.setItem("attendanceThreshold", attT);
    localStorage.setItem("marksThreshold",      marksT);
    localStorage.setItem("emailAlerts",         emailAlerts);
    localStorage.setItem("autoPredict",         autoPredict);
    localStorage.setItem("showProbability",     showProb);
    window.dispatchEvent(new Event("settingsUpdated"));
    showToast("Settings saved successfully");
  }

  async function handleClearStudents() {
    if (!window.confirm("This will delete all students for your account. Are you sure?")) return;
    setClearing(true);
    await new Promise(r => setTimeout(r, 600));
    const email = localStorage.getItem("userEmail");
    localStorage.removeItem("studentList");
    localStorage.removeItem("predictionHistory");
    if (email) {
      localStorage.removeItem(`studentList_${email}`);
      localStorage.removeItem(`predictionHistory_${email}`);
    }
    window.dispatchEvent(new Event("studentListUpdated"));
    setClearing(false);
    showToast("Student data cleared");
  }

  function handleLogout() {
    const email = localStorage.getItem("userEmail");
    const sb = localStorage.getItem("studentList") || "[]";
    const hb = localStorage.getItem("predictionHistory") || "[]";
    const ub = localStorage.getItem("users");
    localStorage.clear();
    if (ub) localStorage.setItem("users", ub);
    if (email) { localStorage.setItem(`studentList_${email}`, sb); localStorage.setItem(`predictionHistory_${email}`, hb); }
    window.location.href = "/login";
  }

  const initial = userEmail ? userEmail[0].toUpperCase() : "A";

  return (
    <div className="page-wrap">
      <style>{S}</style>
      <Sidebar />
      <div className="main-col">

        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">Settings</div>
            <div className="topbar-sub">Manage your account and preferences</div>
          </div>
          <div className="flex-row">
            <div className="avatar">{initial}</div>
            <div style={{ lineHeight:1.3 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{userEmail || "Admin"}</div>
              <div style={{ fontSize:11, color:"var(--text3)" }}>Teacher</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Sign out</button>
          </div>
        </div>

        <div className="scroll-area">

          {/* Account */}
          <div>
            <div className="section-title">Account</div>
            <div className="card" style={{ animationDelay:"0ms" }}>
              <div style={{ display:"flex", alignItems:"center", gap:20, paddingBottom:20, borderBottom:"1px solid var(--border)", marginBottom:20 }}>
                <div className="profile-avatar">{initial}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--font-disp)", fontSize:18, fontWeight:700, color:"var(--text)", marginBottom:4 }}>{userName || "Teacher"}</div>
                  <div style={{ fontSize:13, color:"var(--text3)", marginBottom:10 }}>{userEmail}</div>
                  <div className="stat-pill">👥 {studentCount} student{studentCount !== 1 ? "s" : ""} in roster</div>
                </div>
              </div>
              <div className="setting-row" style={{ paddingTop:0 }}>
                <div>
                  <div className="setting-label">Display Name</div>
                  <div className="setting-desc">Your name shown in the dashboard header</div>
                </div>
                <div style={{ width:220 }}>
                  <input className="inp" type="text" value={userName}
                    onChange={e => { setUserName(e.target.value); localStorage.setItem("userName", e.target.value); }}
                    placeholder="Enter your name" />
                </div>
              </div>
            </div>
          </div>

          {/* Risk Thresholds */}
          <div>
            <div className="section-title">Risk Thresholds</div>
            <div className="card" style={{ animationDelay:"80ms" }}>
              <div style={{ background:"var(--teal-dim)", border:"1px solid rgba(15,244,198,.15)", borderRadius:"var(--radius-sm)", padding:"12px 16px", fontSize:13, color:"var(--teal)", marginBottom:24, lineHeight:1.6 }}>
                ✦ Students below these thresholds are automatically flagged as high risk. Changes apply instantly after saving.
              </div>
              <div className="setting-row" style={{ paddingTop:0 }}>
                <div>
                  <div className="setting-label">Attendance Threshold</div>
                  <div className="setting-desc">Students with avg attendance below this % are flagged</div>
                </div>
                <div>
                  <div className="range-wrap">
                    <input type="range" min={40} max={100} step={5} value={attT} onChange={e => setAttT(parseInt(e.target.value))} />
                    <div className="range-val">{attT}%</div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text3)", marginTop:6, paddingRight:66 }}>
                    <span>40%</span><span>70%</span><span>100%</span>
                  </div>
                </div>
              </div>
              <div className="setting-row">
                <div>
                  <div className="setting-label">Marks Threshold</div>
                  <div className="setting-desc">Students with avg marks below this value are flagged</div>
                </div>
                <div>
                  <div className="range-wrap">
                    <input type="range" min={20} max={80} step={5} value={marksT} onChange={e => setMarksT(parseInt(e.target.value))} />
                    <div className="range-val" style={{ color:"var(--amber)" }}>{marksT}</div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text3)", marginTop:6, paddingRight:66 }}>
                    <span>20</span><span>50</span><span>80</span>
                  </div>
                </div>
              </div>
              <div style={{ background:"var(--surface2)", borderRadius:"var(--radius-sm)", padding:"14px 18px", marginTop:8, display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:12, color:"var(--text3)" }}>Preview:</span>
                <span style={{ fontSize:13, color:"var(--text2)" }}>
                  Student flagged if attendance &lt; <strong style={{ color:"var(--teal)" }}>{attT}%</strong> OR marks &lt; <strong style={{ color:"var(--amber)" }}>{marksT}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div>
            <div className="section-title">Display Preferences</div>
            <div className="card" style={{ animationDelay:"160ms" }}>
              {[
                { label:"Show AI Probability",    desc:"Display the AI confidence score (%) alongside risk level in tables",             value:showProb,    set:setShowProb },
                { label:"Auto-run Predictions",   desc:"Automatically run AI risk predictions when you visit the dashboard",             value:autoPredict, set:setAutoPredict },
                { label:"Email Alerts (coming soon)", desc:"Get notified by email when new high-risk students are detected",             value:emailAlerts, set:setEmailAlerts, disabled:true },
              ].map(({ label, desc, value, set, disabled }) => (
                <div key={label} className="setting-row" style={{ opacity:disabled?.5:1 }}>
                  <div>
                    <div className="setting-label">{label}</div>
                    <div className="setting-desc">{desc}</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={value} onChange={e => !disabled && set(e.target.checked)} disabled={disabled} />
                    <div className="toggle-track"><div className="toggle-thumb" /></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button className="btn btn-primary" onClick={handleSave} style={{ padding:"12px 32px", fontSize:14 }}>
              ✓ Save Settings
            </button>
          </div>

          {/* Danger Zone */}
          <div>
            <div className="section-title" style={{ color:"var(--red)" }}>Danger Zone</div>
            <div className="danger-zone">
              <div className="danger-title">⚠ Destructive Actions</div>
              <div className="danger-desc">These actions cannot be undone. Student data and prediction history will be permanently removed.</div>
              <div className="flex-row" style={{ flexWrap:"wrap", gap:12 }}>
                <button className="btn btn-danger" onClick={handleClearStudents} disabled={clearing} style={{ fontSize:13 }}>
                  {clearing
                    ? <><span style={{ width:13, height:13, border:"2px solid rgba(255,92,124,.3)", borderTop:"2px solid var(--red)", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }} />Clearing...</>
                    : <>🗑 Clear All Student Data</>}
                </button>
                <button className="btn btn-danger" onClick={() => { if (!window.confirm("Sign out?")) return; handleLogout(); }} style={{ fontSize:13 }}>
                  ↩ Sign Out
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {toast && (
        <div className="toast">
          <span style={{ fontSize:18 }}>✓</span> {toast}
        </div>
      )}
    </div>
  );
}