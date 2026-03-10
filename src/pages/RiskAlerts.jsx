import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import { predictStudentRisk } from "../services/api";
import { BASE_CSS } from "../theme";

const S = `
  ${BASE_CSS}
  .topbar { display:flex; justify-content:space-between; align-items:center; padding:16px 32px; background:rgba(13,20,36,0.92); border-bottom:1px solid var(--border); backdrop-filter:blur(20px); flex-shrink:0; }
  .topbar-title { font-family:var(--font-disp); font-size:20px; font-weight:700; color:var(--text); }
  .topbar-sub { font-size:12px; color:var(--text3); margin-top:2px; }
  .alert-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:20px 22px; display:flex; align-items:flex-start; gap:16px; transition:border-color .2s,transform .2s; animation:fadeUp .4s ease both; }
  .alert-card:hover { border-color:var(--border2); transform:translateY(-2px); }
  .alert-card.ac-high { border-left:3px solid var(--red); }
  .alert-card.ac-medium { border-left:3px solid var(--amber); }
  .alert-card.ac-ok { border-left:3px solid var(--green); }
  .alert-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .alert-icon.ac-high   { background:var(--red-dim); }
  .alert-icon.ac-medium { background:var(--amber-dim); }
  .alert-icon.ac-ok     { background:var(--green-dim); }
  .alert-name { font-family:var(--font-disp); font-size:15px; font-weight:700; color:var(--text); margin-bottom:4px; }
  .alert-reasons { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
  .chip { font-size:11px; padding:3px 10px; border-radius:20px; font-weight:600; }
  .chip-ai     { background:rgba(139,92,246,0.12); color:#c4b5fd; border:1px solid rgba(139,92,246,0.2); }
  .chip-att    { background:var(--amber-dim); color:var(--amber); border:1px solid rgba(251,191,36,.25); }
  .chip-marks  { background:var(--red-dim); color:var(--red); border:1px solid rgba(255,92,124,.25); }
  .alert-prob { font-family:var(--font-disp); font-size:22px; font-weight:800; margin-left:auto; flex-shrink:0; padding-left:16px; }
  .sec-head { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--text3); margin-bottom:12px; display:flex; align-items:center; gap:8px; }
  .sec-head::after { content:''; flex:1; height:1px; background:var(--border); }
  .all-clear { background:var(--green-dim); border:1px solid rgba(52,211,153,.2); border-radius:var(--radius); padding:32px; text-align:center; animation:fadeUp .4s ease both; }
  /* KPI CARDS */

.kpi-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:18px;
  margin-bottom:26px;
}

.kpi{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--radius);
  padding:20px 22px;
  position:relative;
  min-height:95px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  animation:fadeUp .4s ease both;
}

.kpi-accent{
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:4px;
  border-radius:var(--radius) var(--radius) 0 0;
}

.kpi-label{
  font-size:12px;
  color:var(--text3);
  font-weight:600;
}

.kpi-value{
  font-family:var(--font-disp);
  font-size:28px;
  font-weight:800;
  margin-top:6px;
}

.kpi-sub{
  font-size:11px;
  color:var(--text3);
  margin-top:4px;
}

.kpi-icon{
  position:absolute;
  right:16px;
  top:14px;
  font-size:22px;
  opacity:.85;
}
`;

export default function RiskAlerts() {
  const [userEmail, setUserEmail] = useState("");
  const [students, setStudents] = useState([]);
  const [risks, setRisks] = useState({});
  const [loading, setLoading] = useState(true);
  const [attT, setAttT] = useState(75);
  const [marksT, setMarksT] = useState(50);

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) window.location.href = "/login";
    else setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  useEffect(() => {
    const a=localStorage.getItem("attendanceThreshold"), m=localStorage.getItem("marksThreshold");
    if(a) setAttT(parseInt(a)); if(m) setMarksT(parseInt(m));
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
      setRisks(res); setLoading(false);
    }
    run();
  }, []);

  function buildMD(s) {
    const subs=Object.values(s.subjects); const avg=subs.reduce((a,d)=>a+d.marks,0)/subs.length;
    return {age:17,Medu:2,Fedu:2,traveltime:2,studytime:2,failures:0,famrel:3,freetime:3,goout:3,Dalc:1,Walc:1,health:3,absences:6,G1:Math.round(avg/5),school_MS:0,sex_M:1,address_U:1,famsize_LE3:0,Pstatus_T:1,Mjob_health:0,Mjob_other:1,Mjob_services:0,Mjob_teacher:0,Fjob_health:0,Fjob_other:1,Fjob_services:0,Fjob_teacher:0,reason_home:0,reason_other:0,reason_reputation:1,guardian_mother:1,guardian_other:0,schoolsup_yes:0,famsup_yes:1,paid_yes:0,activities_yes:1,nursery_yes:1,higher_yes:1,internet_yes:1,romantic_yes:0};
  }

  function getInfo(s) {
    const r=risks[s.id]?.overall; const subs=Object.values(s.subjects);
    const a=subs.reduce((x,y)=>x+y.attendance,0)/subs.length; const m=subs.reduce((x,y)=>x+y.marks,0)/subs.length;
    const aiH=r?.risk_level==="High Risk"; const attLow=a<attT; const mLow=m<marksT;
    const reasons=[]; if(aiH)reasons.push("ai"); if(attLow)reasons.push("att"); if(mLow)reasons.push("marks");
    const severity=reasons.length>=3?"critical":reasons.length===2?"high":reasons.length===1?"medium":"ok";
    return {isHigh:aiH||attLow||mLow,reasons,severity,avgA:a,avgM:m,probability:r?.probability??null};
  }

  const handleLogout = () => {
    const email=localStorage.getItem("userEmail"); const sb=localStorage.getItem("studentList")||"[]"; const hb=localStorage.getItem("predictionHistory")||"[]"; const ub=localStorage.getItem("users");
    localStorage.clear(); if(ub)localStorage.setItem("users",ub); if(email){localStorage.setItem(`studentList_${email}`,sb);localStorage.setItem(`predictionHistory_${email}`,hb);}
    window.location.href="/login";
  };

  const highRisk = students.filter(s=>getInfo(s).isHigh);
  const lowRisk  = students.filter(s=>!getInfo(s).isHigh);
  const sevOrder = { critical:0, high:1, medium:2 };
  const sortedHigh = [...highRisk].sort((a,b)=>(sevOrder[getInfo(a).severity]??3)-(sevOrder[getInfo(b).severity]??3));

  const sevCfg = {
    critical: { label:"Critical", icon:"🚨", cls:"ac-high"   },
    high:     { label:"High",     icon:"⚠️", cls:"ac-high"   },
    medium:   { label:"Medium",   icon:"⚡", cls:"ac-medium" },
  };

  return (
    <div className="page-wrap">
      <style>{S}</style>
      <Sidebar />
      <div className="main-col">
        <div className="topbar">
          <div>
            <div className="topbar-title">Risk Alerts</div>
            <div className="topbar-sub">Students flagged for intervention</div>
          </div>
          <div className="flex-row">
            <div className="avatar">{userEmail ? userEmail[0].toUpperCase() : "A"}</div>
            <div style={{ lineHeight:1.3 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{userEmail||"Admin"}</div>
              <div style={{ fontSize:11, color:"var(--text3)" }}>Teacher</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Sign out</button>
          </div>
        </div>

        {!loading && students.length === 0 ? <EmptyState page="alerts" /> : (
          <div className="scroll-area">
            {loading ? (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <div style={{ color:"var(--text3)", fontSize:13, marginBottom:12 }}>Scanning for risk alerts...</div>
                <div className="loading-bar"><div className="loading-bar-inner"/></div>
              </div>
            ) : (<>
           

              {sortedHigh.length > 0 ? (
                <div>
                  <div className="sec-head"><span style={{ color:"var(--red)" }}>⚠</span> {sortedHigh.length} Student{sortedHigh.length>1?"s":""} Need Attention</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {sortedHigh.map((s,i) => {
                      const info=getInfo(s); const sc=sevCfg[info.severity]||sevCfg.medium;
                      return (
                        <div key={s.id} className={`alert-card ${sc.cls}`} style={{ animationDelay:`${i*60}ms` }}>
                          <div className={`alert-icon ${sc.cls}`}>{sc.icon}</div>
                          <div style={{ flex:1 }}>
                            <div className="alert-name">{s.name}</div>
                            <div style={{ fontSize:12, color:"var(--text3)" }}>
                              Attendance: <span style={{ color:info.avgA<attT?"var(--red)":"var(--text2)", fontWeight:600 }}>{info.avgA.toFixed(1)}%</span>
                              <span style={{ margin:"0 8px", color:"var(--border2)" }}>·</span>
                              Marks: <span style={{ color:info.avgM<marksT?"var(--red)":"var(--text2)", fontWeight:600 }}>{info.avgM.toFixed(1)}</span>
                              <span style={{ margin:"0 8px", color:"var(--border2)" }}>·</span>
                              <span style={{ color:"var(--text2)" }}>{Object.keys(s.subjects).join(", ")}</span>
                            </div>
                            <div className="alert-reasons">
                              <span style={{ fontSize:11, padding:"3px 8px", borderRadius:20, background:"rgba(255,255,255,0.05)", color:"var(--text3)", fontWeight:600 }}>{sc.label} Risk</span>
                              {info.reasons.includes("ai")     && <span className="chip chip-ai">🤖 AI flagged</span>}
                              {info.reasons.includes("att")    && <span className="chip chip-att">📅 Low attendance</span>}
                              {info.reasons.includes("marks")  && <span className="chip chip-marks">📝 Low marks</span>}
                            </div>
                          </div>
                          <div className="alert-prob" style={{ color:info.probability!=null?(info.probability>0.6?"var(--red)":"var(--amber)"):"var(--text3)" }}>
                            {info.probability!=null?`${(info.probability*100).toFixed(0)}%`:"—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="all-clear">
                  <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
                  <div style={{ fontFamily:"var(--font-disp)", fontSize:18, fontWeight:700, color:"var(--green)", marginBottom:8 }}>All Clear!</div>
                  <div style={{ fontSize:13, color:"var(--text3)" }}>No high-risk students detected. Your class is performing well.</div>
                </div>
              )}

              {lowRisk.length > 0 && (
                <div>
                  <div className="sec-head"><span style={{ color:"var(--green)" }}>✓</span> {lowRisk.length} Student{lowRisk.length>1?"s":""} Performing Well</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {lowRisk.map((s,i) => {
                      const info=getInfo(s);
                      return (
                        <div key={s.id} className="alert-card ac-ok" style={{ animationDelay:`${i*40}ms` }}>
                          <div className="alert-icon ac-ok">✅</div>
                          <div style={{ flex:1 }}>
                            <div className="alert-name">{s.name}</div>
                            <div style={{ fontSize:12, color:"var(--text3)" }}>
                              Attendance: <span style={{ color:"var(--green)", fontWeight:600 }}>{info.avgA.toFixed(1)}%</span>
                              <span style={{ margin:"0 8px", color:"var(--border2)" }}>·</span>
                              Marks: <span style={{ color:"var(--green)", fontWeight:600 }}>{info.avgM.toFixed(1)}</span>
                              <span style={{ margin:"0 8px", color:"var(--border2)" }}>·</span>
                              <span style={{ color:"var(--text2)" }}>{Object.keys(s.subjects).join(", ")}</span>
                            </div>
                          </div>
                          <span className="badge badge-low" style={{ marginLeft:"auto" }}>Low Risk</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>)}
          </div>
        )}
      </div>
    </div>
  );
}