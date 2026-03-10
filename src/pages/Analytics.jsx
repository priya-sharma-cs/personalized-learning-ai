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
  .bar-row { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .bar-name { font-size:13px; color:var(--text2); width:100px; flex-shrink:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500; }
  .bar-track { flex:1; height:8px; background:rgba(255,255,255,0.05); border-radius:99px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:99px; transition:width .6s cubic-bezier(.4,0,.2,1); }
  .bar-val { font-size:12px; font-family:var(--font-disp); font-weight:700; width:42px; text-align:right; flex-shrink:0; }
  .donut-wrap { position:relative; width:140px; height:140px; flex-shrink:0; }
  .donut-label { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .donut-pct { font-family:var(--font-disp); font-size:26px; font-weight:800; color:var(--text); }
  .donut-sub { font-size:11px; color:var(--text3); margin-top:2px; }
  .stat-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
  .stat-row:last-child { border-bottom:none; }
  .stat-label { font-size:13px; color:var(--text2); }
  .stat-val { font-family:var(--font-disp); font-size:15px; font-weight:700; }
  .kpi-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:20px;
  margin:20px 32px;
}

.kpi{
  position:relative;
  background:#0f172a;
  border:1px solid var(--border);
  border-radius:12px;
  padding:24px;
  min-height:110px;
  display:flex;
  flex-direction:column;
  justify-content:center;
}

.kpi-accent{
  position:absolute;
  top:0;
  left:0;
  height:4px;
  width:100%;
  border-top-left-radius:12px;
  border-top-right-radius:12px;
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
  font-size:22px;
  opacity:.85;
}
`;

function DonutChart({ high, total }) {
  const pct = total > 0 ? Math.round((high / total) * 100) : 0;
  const low = total - high;
  const r = 54, cx = 70, cy = 70, circumference = 2 * Math.PI * r;
  const highArc = (high / total) * circumference;
  const lowArc = (low / total) * circumference;
  return (
    <div className="donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
        {total > 0 && <>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#34d399" strokeWidth="14"
            strokeDasharray={`${lowArc} ${circumference}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`} style={{ transition:"stroke-dasharray .8s ease" }} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ff5c7c" strokeWidth="14"
            strokeDasharray={`${highArc} ${circumference}`} strokeDashoffset={-lowArc} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`} style={{ transition:"stroke-dasharray .8s ease" }} />
        </>}
      </svg>
      <div className="donut-label">
        <div className="donut-pct">{pct}%</div>
        <div className="donut-sub">high risk</div>
      </div>
    </div>
  );
}

export default function Analytics() {
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

  function isHigh(s) {
    const r=risks[s.id]?.overall; const subs=Object.values(s.subjects);
    const a=subs.reduce((x,y)=>x+y.attendance,0)/subs.length; const m=subs.reduce((x,y)=>x+y.marks,0)/subs.length;
    return r?.risk_level==="High Risk"||a<attT||m<marksT;
  }
  const avgAtt  = s => { const subs=Object.values(s.subjects); return subs.reduce((x,y)=>x+y.attendance,0)/subs.length; };
  const avgMarks = s => { const subs=Object.values(s.subjects); return subs.reduce((x,y)=>x+y.marks,0)/subs.length; };

  const highList = students.filter(isHigh);
  const lowList  = students.filter(s=>!isHigh(s));
  const classAvgAtt   = students.length ? students.reduce((s,x)=>s+avgAtt(x),0)/students.length : 0;
  const classAvgMarks = students.length ? students.reduce((s,x)=>s+avgMarks(x),0)/students.length : 0;

  const handleLogout = () => {
    const email=localStorage.getItem("userEmail"); const sb=localStorage.getItem("studentList")||"[]"; const hb=localStorage.getItem("predictionHistory")||"[]"; const ub=localStorage.getItem("users");
    localStorage.clear(); if(ub)localStorage.setItem("users",ub); if(email){localStorage.setItem(`studentList_${email}`,sb);localStorage.setItem(`predictionHistory_${email}`,hb);}
    window.location.href="/login";
  };

  return (
    <div className="page-wrap">
      <style>{S}</style>
      <Sidebar />
      <div className="main-col">
        <div className="topbar">
          <div>
            <div className="topbar-title">Analytics</div>
            <div className="topbar-sub">Class performance insights</div>
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

        {!loading && students.length === 0 ? <EmptyState page="analytics" /> : (
          <div className="scroll-area">
            {loading ? (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <div style={{ color:"var(--text3)", fontSize:13, marginBottom:12 }}>Crunching analytics...</div>
                <div className="loading-bar"><div className="loading-bar-inner"/></div>
              </div>
            ) : (<>
            <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    margin: "20px 32px"
  }}
>

  <div
    style={{
      position: "relative",
      background: "#0f172a",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      padding: "24px",
      minHeight: "110px"
    }}
  >
    <div style={{
      position:"absolute",
      top:0,
      left:0,
      width:"100%",
      height:"4px",
      background:"linear-gradient(90deg,var(--teal),var(--teal2))"
    }}/>

    <div style={{fontSize:13,color:"var(--text3)"}}>
      Class Avg Attendance
    </div>

    <div style={{
      fontSize:28,
      fontWeight:700,
      marginTop:6,
      color: classAvgAtt < attT ? "var(--red)" : "var(--teal)"
    }}>
      {classAvgAtt.toFixed(1)}%
    </div>

    <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>
      {classAvgAtt >= attT ? "Above threshold" : "Below threshold"}
    </div>

    <div style={{position:"absolute",right:16,top:16,fontSize:22}}>
      📅
    </div>
  </div>


  <div
    style={{
      position: "relative",
      background: "#0f172a",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      padding: "24px",
      minHeight: "110px"
    }}
  >
    <div style={{
      position:"absolute",
      top:0,
      left:0,
      width:"100%",
      height:"4px",
      background:"linear-gradient(90deg,var(--amber),#f59e0b)"
    }}/>

    <div style={{fontSize:13,color:"var(--text3)"}}>
      Class Avg Marks
    </div>

    <div style={{
      fontSize:28,
      fontWeight:700,
      marginTop:6,
      color: classAvgMarks < marksT ? "var(--red)" : "var(--amber)"
    }}>
      {classAvgMarks.toFixed(1)}
    </div>

    <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>
      {classAvgMarks >= marksT ? "Above threshold" : "Below threshold"}
    </div>

    <div style={{position:"absolute",right:16,top:16,fontSize:22}}>
      📝
    </div>
  </div>


  <div
    style={{
      position: "relative",
      background: "#0f172a",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      padding: "24px",
      minHeight: "110px"
    }}
  >
    <div style={{
      position:"absolute",
      top:0,
      left:0,
      width:"100%",
      height:"4px",
      background:
        highList.length > 0
          ? "linear-gradient(90deg,var(--red),#f97316)"
          : "linear-gradient(90deg,var(--green),#10b981)"
    }}/>

    <div style={{fontSize:13,color:"var(--text3)"}}>
      Risk Ratio
    </div>

    <div style={{
      fontSize:28,
      fontWeight:700,
      marginTop:6,
      color: highList.length > 0 ? "var(--red)" : "var(--green)"
    }}>
      {highList.length}/{students.length}
    </div>

    <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>
      {highList.length} high · {lowList.length} low
    </div>

    <div style={{position:"absolute",right:16,top:16,fontSize:22}}>
      ⚠️
    </div>
  </div>

</div>
               
                 
              

              <div className="g2">
                <div className="card" style={{ animationDelay:"240ms" }}>
                  <div className="card-title"><span className="dot"/>Attendance by Student</div>
                  {[...students].sort((a,b)=>avgAtt(a)-avgAtt(b)).map(s=>{
                    const val=avgAtt(s); const isLow=val<attT;
                    return (
                      <div key={s.id} className="bar-row">
                        <div className="bar-name" title={s.name}>{s.name}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width:`${val}%`, background:isLow?"linear-gradient(90deg,var(--red),#f97316)":"linear-gradient(90deg,var(--teal),var(--teal2))" }} />
                        </div>
                        <div className="bar-val" style={{ color:isLow?"var(--red)":"var(--teal)" }}>{val.toFixed(0)}%</div>
                      </div>
                    );
                  })}
                </div>
                <div className="card" style={{ animationDelay:"320ms" }}>
                  <div className="card-title"><span className="dot"/>Marks by Student</div>
                  {[...students].sort((a,b)=>avgMarks(a)-avgMarks(b)).map(s=>{
                    const val=avgMarks(s); const isLow=val<marksT; const pct=Math.min(val,100);
                    return (
                      <div key={s.id} className="bar-row">
                        <div className="bar-name" title={s.name}>{s.name}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width:`${pct}%`, background:isLow?"linear-gradient(90deg,var(--red),#f97316)":"linear-gradient(90deg,var(--amber),#f59e0b)" }} />
                        </div>
                        <div className="bar-val" style={{ color:isLow?"var(--red)":"var(--amber)" }}>{val.toFixed(0)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="g2">
                <div className="card" style={{ animationDelay:"400ms" }}>
                  <div className="card-title"><span className="dot"/>Risk Distribution</div>
                  <div style={{ display:"flex", alignItems:"center", gap:32 }}>
                    <DonutChart high={highList.length} total={students.length} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--red)" }} />
                        <span style={{ fontSize:13, color:"var(--text2)" }}>High Risk</span>
                        <span style={{ marginLeft:"auto", fontFamily:"var(--font-disp)", fontWeight:700, color:"var(--red)", fontSize:16 }}>{highList.length}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:"var(--green)" }} />
                        <span style={{ fontSize:13, color:"var(--text2)" }}>Low Risk</span>
                        <span style={{ marginLeft:"auto", fontFamily:"var(--font-disp)", fontWeight:700, color:"var(--green)", fontSize:16 }}>{lowList.length}</span>
                      </div>
                      {highList.length > 0 && (
                        <div style={{ background:"var(--red-dim)", border:"1px solid rgba(255,92,124,.2)", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#fda4b4" }}>
                          ⚠ {highList.length} student{highList.length>1?"s need":" needs"} attention
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card" style={{ animationDelay:"480ms" }}>
                  <div className="card-title"><span className="dot"/>Class Summary</div>
                  {[
                    ["Total Students",      students.length,                                              "var(--teal)"],
                    ["Highest Attendance",  students.length?Math.max(...students.map(avgAtt)).toFixed(1)+"%":"—", "var(--green)"],
                    ["Lowest Attendance",   students.length?Math.min(...students.map(avgAtt)).toFixed(1)+"%":"—", "var(--red)"],
                    ["Highest Marks",       students.length?Math.max(...students.map(avgMarks)).toFixed(1):"—",   "var(--green)"],
                    ["Lowest Marks",        students.length?Math.min(...students.map(avgMarks)).toFixed(1):"—",   "var(--red)"],
                    ["At-Risk Rate",        students.length?((highList.length/students.length)*100).toFixed(0)+"%":"—", highList.length>0?"var(--red)":"var(--green)"],
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