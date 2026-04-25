import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { predictStudentRisk } from "../services/api";
import { BASE_CSS } from "../theme";

const S = `
  ${BASE_CSS}
  .bar-row { display:flex; align-items:center; gap:12px; margin-bottom:13px; }
  .bar-row:last-child { margin-bottom: 0; }
  .bar-name { font-size:13px; color:var(--text2); width:110px; flex-shrink:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500; }
  .bar-track { flex:1; height:6px; background:rgba(255,255,255,0.05); border-radius:99px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:99px; transition:width .65s cubic-bezier(.4,0,.2,1); }
  .bar-val   { font-size:12px; font-family:var(--font-mono); font-weight:700; width:46px; text-align:right; flex-shrink:0; }
  .donut-wrap { position:relative; width:150px; height:150px; flex-shrink:0; }
  .donut-label { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .donut-pct { font-size:28px; font-weight:800; color:var(--text); font-family:var(--font-mono); letter-spacing:-1px; }
  .donut-sub { font-size:11px; color:var(--text3); margin-top:2px; }
  .stat-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
  .stat-row:last-child { border-bottom:none; }
  .stat-label { font-size:13px; color:var(--text2); }
  .stat-val   { font-family:var(--font-mono); font-size:15px; font-weight:800; }
  .kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
  .kpi-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 22px 24px; position: relative;
    overflow: hidden; animation: fadeUp .45s ease both;
    transition: border-color .2s, transform .2s;
  }
  .kpi-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .kpi-bar { position:absolute; top:0; left:0; right:0; height:3px; }
  .kpi-label { font-size:11px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--text3); }
  .kpi-value { font-size:36px; font-weight:800; margin-top:10px; line-height:1; letter-spacing:-1.5px; }
  .kpi-sub   { font-size:12px; color:var(--text3); margin-top:7px; }
  .kpi-icon  { position:absolute; right:18px; bottom:18px; font-size:30px; opacity:.1; }
  .legend-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
`;

function DonutChart({ high, total }) {
  if (!total) return <div className="donut-wrap"><div className="donut-label"><div className="donut-pct" style={{ fontSize: 16, color: "var(--text3)" }}>No data</div></div></div>;
  const low  = total - high;
  const r = 58, cx = 75, cy = 75, circ = 2 * Math.PI * r;
  const highArc = (high / total) * circ;
  const lowArc  = (low  / total) * circ;
  const pct = Math.round((high / total) * 100);
  return (
    <div className="donut-wrap" style={{ width: 150, height: 150 }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--green)" strokeWidth="14"
          strokeDasharray={`${lowArc} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray .8s ease" }} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--red)" strokeWidth="14"
          strokeDasharray={`${highArc} ${circ}`} strokeDashoffset={-lowArc} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray .8s ease", transitionDelay: ".1s" }} />
      </svg>
      <div className="donut-label">
        <div className="donut-pct" style={{ color: pct > 50 ? "var(--red)" : "var(--green)" }}>{pct}%</div>
        <div className="donut-sub">high risk</div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [students, setStudents] = useState(() => {
    try { const s = localStorage.getItem("studentList"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [risks, setRisks]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [attT, setAttT]         = useState(75);
  const [marksT, setMarksT]     = useState(50);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) window.location.href = "/login";
    else setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  useEffect(() => {
    const load = () => {
      const a = localStorage.getItem("attendanceThreshold"), m = localStorage.getItem("marksThreshold");
      if (a) setAttT(parseInt(a)); if (m) setMarksT(parseInt(m));
    };
    load(); window.addEventListener("settingsUpdated", load);
    return () => window.removeEventListener("settingsUpdated", load);
  }, []);

  useEffect(() => {
    async function run() {
      setLoading(true);
      const raw  = localStorage.getItem("studentList");
      const curr = raw ? JSON.parse(raw) : [];
      setStudents(curr);
      const res  = {};
      for (const s of curr) {
        const md = s.modelData || buildMD(s);
        try { res[s.id] = { overall: await predictStudentRisk(md) }; }
        catch { res[s.id] = { overall: { risk_level: "Unknown", probability: null } }; }
      }
      setRisks(res); setLoading(false);
    }
    run();
  }, []);

  function buildMD(s) {
    const subs = Object.values(s.subjects), avg = subs.reduce((a, d) => a + d.marks, 0) / subs.length;
    return { age:17,Medu:2,Fedu:2,traveltime:2,studytime:2,failures:0,famrel:3,freetime:3,goout:3,Dalc:1,Walc:1,health:3,absences:6,G1:Math.round(avg/5),school_MS:0,sex_M:1,address_U:1,famsize_LE3:0,Pstatus_T:1,Mjob_health:0,Mjob_other:1,Mjob_services:0,Mjob_teacher:0,Fjob_health:0,Fjob_other:1,Fjob_services:0,Fjob_teacher:0,reason_home:0,reason_other:0,reason_reputation:1,guardian_mother:1,guardian_other:0,schoolsup_yes:0,famsup_yes:1,paid_yes:0,activities_yes:1,nursery_yes:1,higher_yes:1,internet_yes:1,romantic_yes:0 };
  }

  function avgAtt(s)   { const v = Object.values(s.subjects); return v.reduce((x, y) => x + y.attendance, 0) / v.length; }
  function avgMarks(s) { const v = Object.values(s.subjects); return v.reduce((x, y) => x + y.marks, 0) / v.length; }
  function isHigh(s) {
    const r = risks[s.id]?.overall;
    return r?.risk_level === "High Risk" || avgAtt(s) < attT || avgMarks(s) < marksT;
  }

  const highList = students.filter(isHigh);
  const lowList  = students.filter(s => !isHigh(s));
  const classAvgAtt   = students.length ? students.reduce((s, x) => s + avgAtt(x), 0) / students.length : 0;
  const classAvgMarks = students.length ? students.reduce((s, x) => s + avgMarks(x), 0) / students.length : 0;

  const handleLogout = () => {
    const email = localStorage.getItem("userEmail");
    const sb = localStorage.getItem("studentList") || "[]";
    const hb = localStorage.getItem("predictionHistory") || "[]";
    const ub = localStorage.getItem("users");
    localStorage.clear();
    if (ub) localStorage.setItem("users", ub);
    if (email) { localStorage.setItem(`studentList_${email}`, sb); localStorage.setItem(`predictionHistory_${email}`, hb); }
    window.location.href = "/login";
  };

  return (
    <div className="page-wrap">
      <style>{S}</style>
      <Sidebar />
      <div className="main-col">
        <div className="topbar">
          <div>
            <div className="topbar-title">Analytics</div>
            <div className="topbar-sub">Class performance breakdown · AI risk distribution</div>
          </div>
          <div className="flex-row">
            <div className="avatar">{userEmail ? userEmail[0].toUpperCase() : "A"}</div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{userEmail || "Admin"}</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>Teacher</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Sign out</button>
          </div>
        </div>

        {!loading && students.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 40 }}>
            <div style={{ fontSize: 44 }}>📊</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>No data yet</div>
            <div style={{ fontSize: 13, color: "var(--text3)", textAlign: "center", maxWidth: 340, lineHeight: 1.6 }}>
              Add students from the Students page to see analytics and performance charts here.
            </div>
            <a href="/students" className="btn btn-primary">→ Add Students</a>
          </div>
        ) : (
          <div className="scroll-area">
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 12 }}>Crunching analytics…</div>
                <div className="loading-bar"><div className="loading-bar-inner" /></div>
              </div>
            ) : (<>
              {/* KPIs */}
              <div className="kpi-grid">
                {[
                  { label: "Class Avg Attendance", value: `${classAvgAtt.toFixed(1)}%`, icon: "📅", bar: "linear-gradient(90deg,var(--cyan),var(--cyan2))", val: classAvgAtt < attT ? "var(--red)" : "var(--cyan)", sub: classAvgAtt >= attT ? "Above threshold" : "Below threshold", delay: 0 },
                  { label: "Class Avg Marks", value: classAvgMarks.toFixed(1), icon: "📝", bar: "linear-gradient(90deg,var(--amber),#f59e0b)", val: classAvgMarks < marksT ? "var(--red)" : "var(--amber)", sub: classAvgMarks >= marksT ? "Above threshold" : "Below threshold", delay: 80 },
                  { label: "Risk Ratio", value: `${highList.length}/${students.length}`, icon: "⚠️", bar: highList.length > 0 ? "linear-gradient(90deg,var(--red),#f97316)" : "linear-gradient(90deg,var(--green),#10b981)", val: highList.length > 0 ? "var(--red)" : "var(--green)", sub: `${highList.length} high · ${lowList.length} low`, delay: 160 },
                ].map(({ label, value, icon, bar, val, sub, delay }) => (
                  <div key={label} className="kpi-card" style={{ animationDelay: `${delay}ms` }}>
                    <div className="kpi-bar" style={{ background: bar }} />
                    <div className="kpi-label">{label}</div>
                    <div className="kpi-value" style={{ color: val }}>{value}</div>
                    <div className="kpi-sub">{sub}</div>
                    <div className="kpi-icon">{icon}</div>
                  </div>
                ))}
              </div>

              {/* Bar charts */}
              <div className="g2">
                <div className="card" style={{ animationDelay: "220ms" }}>
                  <div className="card-title"><span className="dot" />Attendance by Student</div>
                  {[...students].sort((a, b) => avgAtt(a) - avgAtt(b)).map(s => {
                    const val = avgAtt(s); const low = val < attT;
                    return (
                      <div key={s.id} className="bar-row">
                        <div className="bar-name" title={s.name}>{s.name}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${val}%`, background: low ? "linear-gradient(90deg,var(--red),#f97316)" : "linear-gradient(90deg,var(--cyan),var(--cyan2))" }} />
                        </div>
                        <div className="bar-val" style={{ color: low ? "var(--red)" : "var(--cyan)" }}>{val.toFixed(0)}%</div>
                      </div>
                    );
                  })}
                </div>
                <div className="card" style={{ animationDelay: "300ms" }}>
                  <div className="card-title"><span className="dot" />Marks by Student</div>
                  {[...students].sort((a, b) => avgMarks(a) - avgMarks(b)).map(s => {
                    const val = avgMarks(s); const low = val < marksT; const pct = Math.min(val, 100);
                    return (
                      <div key={s.id} className="bar-row">
                        <div className="bar-name" title={s.name}>{s.name}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%`, background: low ? "linear-gradient(90deg,var(--red),#f97316)" : "linear-gradient(90deg,var(--amber),#f59e0b)" }} />
                        </div>
                        <div className="bar-val" style={{ color: low ? "var(--red)" : "var(--amber)" }}>{val.toFixed(0)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Donut + Summary */}
              <div className="g2">
                <div className="card" style={{ animationDelay: "380ms" }}>
                  <div className="card-title"><span className="dot" />Risk Distribution</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    <DonutChart high={highList.length} total={students.length} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div className="legend-dot" style={{ background: "var(--red)" }} />
                        <span style={{ fontSize: 13, color: "var(--text2)" }}>High Risk</span>
                        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--red)", fontSize: 17 }}>{highList.length}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                        <div className="legend-dot" style={{ background: "var(--green)" }} />
                        <span style={{ fontSize: 13, color: "var(--text2)" }}>Low Risk</span>
                        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--green)", fontSize: 17 }}>{lowList.length}</span>
                      </div>
                      {highList.length > 0 && (
                        <div style={{ background: "var(--red-dim)", border: "1px solid var(--red-border)", borderRadius: 8, padding: "10px 13px", fontSize: 12.5, color: "#ffaab8" }}>
                          ⚠ {highList.length} student{highList.length > 1 ? "s need" : " needs"} immediate attention
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card" style={{ animationDelay: "460ms" }}>
                  <div className="card-title"><span className="dot" />Class Summary</div>
                  {[
                    ["Total Students",     students.length,                                                                                    "var(--cyan)"],
                    ["Highest Attendance", students.length ? Math.max(...students.map(avgAtt)).toFixed(1) + "%"  : "—", "var(--green)"],
                    ["Lowest Attendance",  students.length ? Math.min(...students.map(avgAtt)).toFixed(1) + "%"  : "—", "var(--red)"],
                    ["Highest Marks",      students.length ? Math.max(...students.map(avgMarks)).toFixed(1)       : "—", "var(--green)"],
                    ["Lowest Marks",       students.length ? Math.min(...students.map(avgMarks)).toFixed(1)       : "—", "var(--red)"],
                    ["At-Risk Rate",       students.length ? `${((highList.length / students.length) * 100).toFixed(0)}%` : "—", highList.length > 0 ? "var(--red)" : "var(--green)"],
                  ].map(([label, val, color]) => (
                    <div key={label} className="stat-row">
                      <span className="stat-label">{label}</span>
                      <span className="stat-val" style={{ color }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        )}
      </div>
    </div>
  );
}
