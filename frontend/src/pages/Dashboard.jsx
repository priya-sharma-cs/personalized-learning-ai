import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import { predictStudentRisk } from "../services/api";
import { useLocation } from "react-router-dom";
import { BASE_CSS } from "../theme";

const S = `
  ${BASE_CSS}
  @keyframes spin { to { transform:rotate(360deg); } }
  .topbar { display:flex; justify-content:space-between; align-items:center; padding:16px 32px; background:rgba(13,20,36,0.92); border-bottom:1px solid var(--border); backdrop-filter:blur(20px); flex-shrink:0; }
  .topbar-title { font-family:var(--font-disp); font-size:20px; font-weight:700; color:var(--text); }
  .topbar-sub { font-size:12px; color:var(--text3); margin-top:2px; }
  /* KPI FIX */

.kpi-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:20px;
  margin:20px 32px;
}

.kpi{
  display:flex;
  flex-direction:column;
  justify-content:center;
  position:relative;
  background:#0f172a;
  border:1px solid var(--border);
  border-radius:12px;
  padding:24px;
  min-height:110px;
}

.kpi-accent{
  position:absolute;
  top:0;
  left:0;
  height:4px;
  width:100%;
}

.kpi-label{
  font-size:13px;
  color:var(--text3);
}

.kpi-value{
  font-size:28px;
  font-weight:700;
  margin-top:6px;
}

.kpi-sub{
  font-size:12px;
  color:var(--text3);
  margin-top:4px;
}

.kpi-icon{
  position:absolute;
  right:16px;
  top:16px;
  font-size:24px;
  opacity:.8;
}

`;

function KpiCard({ label, value, sub, color, icon, delay = 0 }) {

  const colors = {
    teal: {
      accent: "linear-gradient(90deg,var(--teal),var(--teal2))",
      value: "var(--teal)"
    },
    red: {
      accent: "linear-gradient(90deg,var(--red),#f97316)",
      value: "var(--red)"
    },
    amber: {
      accent: "linear-gradient(90deg,var(--amber),#f59e0b)",
      value: "var(--amber)"
    }
  }

  const c = colors[color] || colors.teal

  return (
    <div className="kpi-card" style={{ animationDelay: `${delay}ms` }}>

      <div
        className="kpi-card-accent"
        style={{ background: c.accent }}
      />

      <div className="kpi-card-label">{label}</div>

      <div
        className="kpi-card-value"
        style={{ color: c.value }}
      >
        {value}
      </div>

      {sub && <div className="kpi-card-sub">{sub}</div>}

      <div className="kpi-card-icon">{icon}</div>

    </div>
  )
}

export default function Dashboard() {
  const location = useLocation();
  const [attT, setAttT] = useState(75);
  const [marksT, setMarksT] = useState(50);
  const [userEmail, setUserEmail] = useState("");
  const [riskResults, setRiskResults] = useState({});
  const [students, setStudents] = useState(() => {
    try { const s = localStorage.getItem("studentList"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("predictionHistory") || "[]"); } catch { return []; }
  });

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
      const raw = localStorage.getItem("studentList");
      const curr = raw ? JSON.parse(raw) : [];
      setStudents(curr);
      const res = {};
      for (const s of curr) {
        const md = s.modelData || buildMD(s);
        try { res[s.id] = { overall: await predictStudentRisk(md) }; }
        catch { res[s.id] = { overall: { risk_level:"Unknown", probability:null } }; }
      }
      setRiskResults(res);
      if (curr.length > 0) {
        const snap = {
          timestamp: new Date().toISOString(), label: new Date().toLocaleString(),
          totalStudents: curr.length,
          highRisk: curr.filter(s => isHighWith(s, res)).length,
          results: Object.fromEntries(curr.map(s => [s.id, { name:s.name, riskLevel:res[s.id]?.overall?.risk_level||"Unknown", probability:res[s.id]?.overall?.probability??null }])),
        };
        setHistory(prev => {
          const updated = [snap, ...prev].slice(0, 10);
          localStorage.setItem("predictionHistory", JSON.stringify(updated));
          const email = localStorage.getItem("userEmail");
          if (email) localStorage.setItem(`predictionHistory_${email}`, JSON.stringify(updated));
          return updated;
        });
      }
      setLoading(false);
    }
    run();
    window.addEventListener("studentListUpdated", run);
    return () => window.removeEventListener("studentListUpdated", run);
  }, [location]);

  function buildMD(student) {
    const subs = Object.values(student.subjects);
    const avg = subs.reduce((s, d) => s + d.marks, 0) / subs.length;
    // Only the 5 features the XGBoost model was trained on
    return { studytime:2, failures:0, absences:6, G1:Math.round(avg/5), G2:Math.round(avg/5) };
  }

  function isHighWith(student, res) {
    const r = res[student.id]?.overall;
    const subs = Object.values(student.subjects);
    const a = subs.reduce((s, x) => s + x.attendance, 0) / subs.length;
    const m = subs.reduce((s, x) => s + x.marks, 0) / subs.length;
    // risk_class 2 = High Risk, also flag if attendance or marks below threshold
    return (r?.risk_class ?? 0) >= 2 || a < attT || m < marksT;
  }
  const isHigh = s => isHighWith(s, riskResults);
  const riskCount = students.filter(isHigh).length;

  function insights() {
    if (!students.length || loading) return [];
    const ins = [];
    const hi = students.filter(isHigh);
    const pct = ((hi.length / students.length) * 100).toFixed(0);
    if (!hi.length) ins.push({ cls:"green", icon:"🎉", text:"All students are currently low risk. Excellent work!" });
    else ins.push({ cls:"red", icon:"⚠️", text:`${pct}% of students (${hi.length}/${students.length}) are flagged as high risk.` });
    const byA = [...students].sort((a, b) => {
      const A = Object.values(a.subjects).reduce((s,x)=>s+x.attendance,0)/Object.values(a.subjects).length;
      const B = Object.values(b.subjects).reduce((s,x)=>s+x.attendance,0)/Object.values(b.subjects).length;
      return A - B;
    });
    if (byA[0]) { const v=Object.values(byA[0].subjects).reduce((s,x)=>s+x.attendance,0)/Object.values(byA[0].subjects).length; ins.push({ cls:"orange", icon:"📉", text:`${byA[0].name} has the lowest avg attendance at ${v.toFixed(1)}%.` }); }
    const byM = [...students].sort((a, b) => {
      const A = Object.values(a.subjects).reduce((s,x)=>s+x.marks,0)/Object.values(a.subjects).length;
      const B = Object.values(b.subjects).reduce((s,x)=>s+x.marks,0)/Object.values(b.subjects).length;
      return A - B;
    });
    if (byM[0]) { const v=Object.values(byM[0].subjects).reduce((s,x)=>s+x.marks,0)/Object.values(byM[0].subjects).length; ins.push({ cls:"orange", icon:"📝", text:`${byM[0].name} has the lowest avg marks at ${v.toFixed(1)}.` }); }
    const top = [...students].sort((a, b) => {
      const A = Object.values(a.subjects).reduce((s,x)=>s+x.marks,0)/Object.values(a.subjects).length;
      const B = Object.values(b.subjects).reduce((s,x)=>s+x.marks,0)/Object.values(b.subjects).length;
      return B - A;
    })[0];
    if (top) { const v=Object.values(top.subjects).reduce((s,x)=>s+x.marks,0)/Object.values(top.subjects).length; ins.push({ cls:"green", icon:"🌟", text:`${top.name} is the top performer with avg marks of ${v.toFixed(1)}.` }); }
    if (history.length >= 2) {
      const l = history[0].highRisk, p = history[1].highRisk;
      if (l > p) ins.push({ cls:"red",   icon:"📈", text:`High risk count increased from ${p} to ${l} since last check.` });
      else if (l < p) ins.push({ cls:"green", icon:"📉", text:`High risk count dropped from ${p} to ${l} — improvement!` });
      else ins.push({ cls:"blue", icon:"➡️", text:`High risk count unchanged at ${l} since last check.` });
    }
    return ins;
  }

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
            <div className="topbar-title">Dashboard</div>
            <div className="topbar-sub">AI-powered student risk overview</div>
          </div>
          <div className="flex-row">
            <div className="avatar">{userEmail ? userEmail[0].toUpperCase() : "A"}</div>
            <div style={{ lineHeight:1.3 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{userEmail || "Admin"}</div>
              <div style={{ fontSize:11, color:"var(--text3)" }}>Teacher</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Sign out</button>
          </div>
        </div>

        {!loading && students.length === 0 ? (
          <EmptyState page="dashboard" />
        ) : (
          <div className="scroll-area">

           <div className="kpi-grid">
  <KpiCard label="Total Students" value={students.length} icon="👥" color="teal" sub="Enrolled" delay={0} />
  <KpiCard label="High Risk" value={loading ? "…" : riskCount} icon="⚠️" color="red" sub={loading ? "Calculating…" : "Flagged by AI"} delay={80} />
  <KpiCard label="Attendance Threshold" value={`${attT}%`} icon="📊" color="amber" sub="Current setting" delay={160} />
</div>

            <div className="card" style={{ animationDelay:"240ms" }}>
              <div className="card-title"><span className="dot" />Student Overview</div>
              {loading ? (
                <div style={{ padding:"32px 0", textAlign:"center" }}>
                  <div style={{ color:"var(--text3)", fontSize:13, marginBottom:12 }}>Running AI predictions...</div>
                  <div className="loading-bar"><div className="loading-bar-inner" /></div>
                </div>
              ) : (
                <div className="tbl-wrap">
                  <table>
                    <thead><tr>
                      <th>Student</th><th>Subjects</th><th>Avg Attendance</th><th>Avg Marks</th><th>Risk Level</th><th>AI Probability</th>
                    </tr></thead>
                    <tbody>
                      {students.map(s => {
                        const subs = Object.values(s.subjects);
                        const avgA = subs.reduce((x, y) => x + y.attendance, 0) / subs.length;
                        const avgM = subs.reduce((x, y) => x + y.marks, 0) / subs.length;
                        const result = riskResults[s.id]?.overall;
                        const high = isHigh(s);
                        const reasons = [];
                        if (result?.risk_level === "High Risk") reasons.push("AI");
                        if (avgA < attT) reasons.push("Attendance");
                        if (avgM < marksT) reasons.push("Marks");
                        return (
                          <tr key={s.id}>
                            <td className="strong">{s.name}</td>
                            <td style={{ color:"var(--text3)", fontSize:12 }}>{Object.keys(s.subjects).join(", ")}</td>
                            <td style={{ color:avgA<attT?"var(--red)":"var(--text2)", fontWeight:avgA<attT?600:400 }}>{avgA.toFixed(1)}%</td>
                            <td style={{ color:avgM<marksT?"var(--red)":"var(--text2)", fontWeight:avgM<marksT?600:400 }}>{avgM.toFixed(1)}</td>
                            <td>
                              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                                <span className={`badge ${high ? "badge-high" : result?.risk_class===1 ? "badge-amber" : "badge-low"}`}>
                                  {result?.risk_level ?? (high ? "High Risk" : "Low Risk")}
                                </span>
                                {reasons.length > 0 && <span style={{ fontSize:11, color:"var(--text3)" }}>{reasons.join(", ")}</span>}
                              </div>
                            </td>
                            <td style={{ fontFamily:"var(--font-disp)", fontWeight:700, color:result?.probability!=null?(result.probability>0.5?"var(--red)":"var(--green)"):"var(--text3)" }}>
                              {result?.probability != null ? `${(result.probability * 100).toFixed(1)}%` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="g2">
              <div className="card" style={{ animationDelay:"320ms" }}>
                <div className="card-title"><span className="dot" />Prediction Insights</div>
                {loading
                  ? <div style={{ color:"var(--text3)", fontSize:13 }}>Generating insights...</div>
                  : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {insights().map((ins, i) => (
                        <div key={i} className={`insight insight-${ins.cls}`}>
                          <span style={{ fontSize:16, flexShrink:0 }}>{ins.icon}</span>
                          <span>{ins.text}</span>
                        </div>
                      ))}
                      {!insights().length && <div style={{ color:"var(--text3)", fontSize:13 }}>No insights yet.</div>}
                    </div>
                }
              </div>

              <div className="card" style={{ animationDelay:"400ms" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div className="card-title" style={{ marginBottom:0 }}><span className="dot" />Prediction History</div>
                  {history.length > 0 && (
                    <button className="btn btn-danger btn-sm" onClick={() => { setHistory([]); localStorage.removeItem("predictionHistory"); }}>Clear</button>
                  )}
                </div>
                {!history.length
                  ? <div style={{ color:"var(--text3)", fontSize:13 }}>History is saved each time you visit this page.</div>
                  : <div className="scroll-y" style={{ maxHeight:280, display:"flex", flexDirection:"column", gap:10 }}>
                      {history.map((e, i) => (
                        <div key={i} className="hist-row">
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                            <span style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{e.label}</span>
                            {i === 0 && <span className="badge badge-info" style={{ fontSize:10 }}>Latest</span>}
                          </div>
                          <div className="flex-row" style={{ fontSize:12, color:"var(--text3)", marginBottom:8 }}>
                            <span>👥 {e.totalStudents}</span>
                            <span style={{ color:e.highRisk>0?"var(--red)":"var(--green)", fontWeight:600 }}>⚠ {e.highRisk} high</span>
                            <span style={{ color:"var(--green)" }}>✓ {e.totalStudents - e.highRisk} low</span>
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                            {Object.values(e.results || {}).map(r => (
                              <span key={r.name} className={`tag ${r.riskLevel === "High Risk" ? "tag-high" : "tag-low"}`}>{r.name}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}