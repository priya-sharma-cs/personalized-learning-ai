import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import EmptyState from "../components/EmptyState";
import { predictStudentRisk } from "../services/api";
import { useNavigate } from "react-router-dom";
import { BASE_CSS } from "../theme";

const S = `
  ${BASE_CSS}
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
  .topbar { display:flex; justify-content:space-between; align-items:center; padding:16px 32px; background:rgba(13,20,36,0.92); border-bottom:1px solid var(--border); backdrop-filter:blur(20px); flex-shrink:0; }
  .topbar-title { font-family:var(--font-disp); font-size:20px; font-weight:700; color:var(--text); }
  .topbar-sub { font-size:12px; color:var(--text3); margin-top:2px; }
  .form-card { background:var(--surface2); border:1px solid rgba(15,244,198,0.15); border-radius:var(--radius); padding:28px; animation:slideDown .3s ease both; }
  .form-section-label { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--teal); margin-bottom:14px; display:flex; align-items:center; gap:8px; }
  .form-section-label::before { content:''; display:block; width:20px; height:1px; background:var(--teal); opacity:.5; }
  .csv-hint { background:rgba(15,244,198,0.05); border:1px solid rgba(15,244,198,0.12); border-radius:var(--radius-sm); padding:12px 16px; font-size:12.5px; color:var(--teal); line-height:1.6; }
  .csv-hint code { background:rgba(15,244,198,0.1); border-radius:4px; padding:1px 6px; font-size:11.5px; }
  .btn-link { background:none; border:none; color:var(--red); font-size:13px; font-weight:600; cursor:pointer; padding:0; font-family:var(--font-body); transition:color .2s; }
  .btn-link:hover { color:#ff8099; }
  .name-link { background:none; border:none; color:var(--teal); font-size:13.5px; font-weight:600; cursor:pointer; padding:0; font-family:var(--font-body); transition:color .2s; }
  .name-link:hover { text-decoration:underline; }
  .search-wrap { position:relative; }
  .search-wrap .inp { padding-left:36px; }
  .search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text3); font-size:14px; pointer-events:none; }
`;

const EMPTY = { name:"", studytime:"", failures:"", absences:"", G1:"", G2:"", subject1_name:"Math", subject1_attendance:"", subject1_marks:"", subject2_name:"Science", subject2_attendance:"", subject2_marks:"" };

function Field({ label, field, type="number", min, max, placeholder, form, setForm }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="inp" type={type} min={min} max={max} placeholder={placeholder||label} value={form[field]} onChange={e => setForm({...form,[field]:e.target.value})} />
    </div>
  );
}

export default function Students() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [search, setSearch] = useState("");
  const [attT, setAttT] = useState(75);
  const [marksT, setMarksT] = useState(50);
  const [userEmail, setUserEmail] = useState("");
  const [list, setList] = useState(() => {
    try {
      const s = localStorage.getItem("studentList");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [risks, setRisks] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState("");
  const [csvOk, setCsvOk] = useState("");

  const [backendOk, setBackendOk] = useState(null); // null=checking, true=ok, false=down

  // Check backend connectivity on mount
  useEffect(() => {
    fetch("/api/")
      .then(r => r.ok ? setBackendOk(true) : setBackendOk(false))
      .catch(() => setBackendOk(false));
  }, []);
    localStorage.setItem("studentList", JSON.stringify(updated));
    const email = localStorage.getItem("userEmail");
    if (email) localStorage.setItem(`studentList_${email}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("studentListUpdated"));
  }

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) window.location.href = "/login";
    else setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  useEffect(() => {
    const load = () => {
      const a=localStorage.getItem("attendanceThreshold"), m=localStorage.getItem("marksThreshold");
      if(a) setAttT(parseInt(a)); if(m) setMarksT(parseInt(m));
    };
    load(); window.addEventListener("settingsUpdated", load);
    return () => window.removeEventListener("settingsUpdated", load);
  }, []);

  useEffect(() => {
    async function run() {
      setLoading(true);
      const res = {};
      for (const s of list) {
        const md = s.modelData || buildMD(s);
        try { res[s.id] = { overall: await predictStudentRisk(md) }; }
        catch { res[s.id] = { overall: { risk_level:"Unknown", probability:null } }; }
      }
      setRisks(res); setLoading(false);
    }
    run();
  }, [list]);

  function buildMD(s) {
    const subs=Object.values(s.subjects); const avg=subs.reduce((a,d)=>a+d.marks,0)/subs.length;
    // Only the 5 features the model needs
    return {studytime:2,failures:0,absences:6,G1:Math.round(avg/5),G2:Math.round(avg/5)};
  }

  function parseCSV(text) {
    const lines=text.trim().split("\n").filter(Boolean);
    if(lines.length<2) throw new Error("CSV must have a header row and at least one data row");
    const headers=lines[0].split(",").map(h=>h.trim().toLowerCase());
    for(const r of ["name","subject1_name","subject1_attendance","subject1_marks"]) if(!headers.includes(r)) throw new Error(`Missing required column: "${r}"`);
    return lines.slice(1).map((line,i)=>{
      const vals=line.split(",").map(v=>v.trim()); const row={}; headers.forEach((h,idx)=>{row[h]=vals[idx]||"";});
      if(!row.name) throw new Error(`Row ${i+2}: name is empty`);
      const subjects={[row.subject1_name||"Math"]:{attendance:parseInt(row.subject1_attendance)||0,marks:parseInt(row.subject1_marks)||0}};
      if(row.subject2_name&&row.subject2_attendance) subjects[row.subject2_name]={attendance:parseInt(row.subject2_attendance)||0,marks:parseInt(row.subject2_marks)||0};
      return {id:Date.now()+i,name:row.name,subjects,modelData:{studytime:parseInt(row.studytime)||2,failures:parseInt(row.failures)||0,absences:parseInt(row.absences)||0,G1:parseInt(row.g1)||parseInt(row.G1)||10,G2:parseInt(row.g2)||parseInt(row.G2)||parseInt(row.g1)||parseInt(row.G1)||11}};
    });
  }

  async function handleCSV(e) {
    const file=e.target.files[0]; if(!file) return;
    if(!file.name.endsWith(".csv")){setCsvError("Please upload a .csv file");return;}
    setCsvError(""); setCsvOk(""); setCsvLoading(true);
    try {
      const parsed=parseCSV(await file.text());
      const newRes={...risks};
      for(const s of parsed){try{newRes[s.id]={overall:await predictStudentRisk(s.modelData)};}catch{newRes[s.id]={overall:{risk_level:"Unknown",probability:null}};}}
      setList(prev=>{const u=[...prev,...parsed];save(u);return u;});
      setRisks(newRes); setCsvOk(`✓ ${parsed.length} student(s) imported successfully`);
    } catch(err){setCsvError(`✗ ${err.message}`);}
    setCsvLoading(false); e.target.value="";
  }

  function handleDownload() {
    const rows=[["Name","Subjects","Avg Attendance (%)","Avg Marks","Risk Level","Risk Reason","AI Probability (%)"]];
    for(const s of list){
      const subs=Object.values(s.subjects); const avgA=subs.reduce((x,y)=>x+y.attendance,0)/subs.length; const avgM=subs.reduce((x,y)=>x+y.marks,0)/subs.length;
      const r=risks[s.id]?.overall; const aiH=r?.risk_level==="High Risk"; const attLow=avgA<attT; const mLow=avgM<marksT;
      const high=aiH||attLow||mLow; const reasons=[]; if(aiH)reasons.push("AI flagged"); if(attLow)reasons.push("Low Attendance"); if(mLow)reasons.push("Low Marks");
      rows.push([s.name,Object.keys(s.subjects).join(" | "),avgA.toFixed(1),avgM.toFixed(1),high?"High Risk":"Low Risk",high?reasons.join(", "):"Good Performance",r?.probability!=null?(r.probability*100).toFixed(1):"-"]);
    }
    const csv=rows.map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=`risk_report_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  }

  async function handleAdd() {
    setFormError("");
    for(const f of ["name","studytime","failures","absences","G1","G2","subject1_attendance","subject1_marks"]){
      if(form[f]===""||form[f]===undefined){setFormError(`Please fill in: ${f}`);return;}
    }
    setFormLoading(true);
    // Only the 5 features the XGBoost model was trained on
    const md = {
      studytime: parseInt(form.studytime) || 2,
      failures:  parseInt(form.failures)  || 0,
      absences:  parseInt(form.absences)  || 0,
      G1:        parseInt(form.G1)        || 10,
      G2:        parseInt(form.G2)        || 11,
    };
    try {
      const res=await predictStudentRisk(md);
      const ns={id:Date.now(),name:form.name,subjects:{[form.subject1_name]:{attendance:parseInt(form.subject1_attendance),marks:parseInt(form.subject1_marks)},...(form.subject2_attendance?{[form.subject2_name]:{attendance:parseInt(form.subject2_attendance),marks:parseInt(form.subject2_marks)}}:{})},modelData:md};
      setList(prev=>{const u=[...prev,ns];save(u);return u;});
      setRisks(prev=>({...prev,[ns.id]:{overall:res}}));
      setShowForm(false); setForm(EMPTY);
    } catch { setFormError("Failed to get AI prediction. Is the backend running?"); }
    setFormLoading(false);
  }

  function handleDelete(id) {
    if(!window.confirm("Delete this student?")) return;
    setList(prev=>{const u=prev.filter(s=>s.id!==id);save(u);return u;});
    setRisks(prev=>{const u={...prev};delete u[id];return u;});
  }

  function getRisk(id) {
    const r=risks[id]?.overall; const s=list.find(x=>x.id===id);
    if(!r||!s) return {level:"...",reason:"Loading...",probability:null,risk_class:null};
    const subs=Object.values(s.subjects); const avgA=subs.reduce((x,y)=>x+y.attendance,0)/subs.length; const avgM=subs.reduce((x,y)=>x+y.marks,0)/subs.length;
    const riskClass=r.risk_class??2; // 0=Low, 1=Medium, 2=High
    const aiH=riskClass>=2; const aiM=riskClass===1;
    const attLow=avgA<attT; const mLow=avgM<marksT;
    const high=aiH||attLow||mLow; const medium=aiM&&!attLow&&!mLow;
    const reasons=[]; if(aiH)reasons.push("AI High Risk"); if(aiM)reasons.push("AI Medium Risk"); if(attLow)reasons.push("Low Attendance"); if(mLow)reasons.push("Low Marks");
    const level=high?"High":medium?"Medium":"Low";
    return {level,reason:level!=="Low"?reasons.join(", "):"Good Performance",probability:r.probability,risk_class:riskClass};
  }

  const handleLogout = () => {
    const email=localStorage.getItem("userEmail"); const sb=localStorage.getItem("studentList")||"[]"; const hb=localStorage.getItem("predictionHistory")||"[]"; const ub=localStorage.getItem("users");
    localStorage.clear(); if(ub)localStorage.setItem("users",ub); if(email){localStorage.setItem(`studentList_${email}`,sb);localStorage.setItem(`predictionHistory_${email}`,hb);}
    window.location.href="/login";
  };

  const filtered = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-wrap">
      <style>{S}</style>
      <Sidebar />
      <div className="main-col">
        <div className="topbar">
          <div>
            <div className="topbar-title">Students</div>
            <div className="topbar-sub">Manage and monitor student records</div>
          </div>
          <div className="flex-row">
            {/* Backend + Model status chip */}
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background: backendOk===true?"var(--green-dim)":backendOk===false?"var(--red-dim)":"rgba(255,255,255,0.05)", border:`1px solid ${backendOk===true?"rgba(52,211,153,.3)":backendOk===false?"rgba(255,92,124,.3)":"rgba(255,255,255,0.1)"}` }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background: backendOk===true?"var(--green)":backendOk===false?"var(--red)":"var(--text3)", display:"inline-block", boxShadow: backendOk===true?"0 0 6px var(--green)":backendOk===false?"0 0 6px var(--red)":"none" }}/>
              <span style={{ fontSize:11, fontWeight:700, color: backendOk===true?"var(--green)":backendOk===false?"var(--red)":"var(--text3)" }}>
                {backendOk===null?"Connecting...":backendOk?"XGBoost Model ✓":"Backend Offline ✗"}
              </span>
            </div>
            <div className="avatar">{userEmail ? userEmail[0].toUpperCase() : "A"}</div>
            <div style={{ lineHeight:1.3 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{userEmail||"Admin"}</div>
              <div style={{ fontSize:11, color:"var(--text3)" }}>Teacher</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Sign out</button>
          </div>
        </div>

        <div className="scroll-area">
          {/* Toolbar — always visible */}
          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div className="search-wrap" style={{ width:280 }}>
              <span className="search-icon">⌕</span>
              <input className="inp" placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
              <div className="flex-row">
                <button className="btn btn-ghost" onClick={()=>fileRef.current?.click()} disabled={csvLoading}>
                  {csvLoading
                    ? <><span style={{width:12,height:12,border:"2px solid rgba(255,255,255,.2)",borderTop:"2px solid white",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Importing...</>
                    : <>📂 Import CSV</>}
                </button>
                <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} style={{ display:"none" }} />
                <button className="btn btn-ghost" onClick={handleDownload}>⬇ Download Report</button>
                <button className={`btn ${showForm?"btn-danger":"btn-primary"}`} onClick={()=>{setShowForm(!showForm);setFormError("");}}>
                  {showForm ? "✕ Cancel" : "+ Add Student"}
                </button>
              </div>
              {csvError && <div style={{ fontSize:12, color:"var(--red)" }}>{csvError}</div>}
              {csvOk    && <div style={{ fontSize:12, color:"var(--green)" }}>{csvOk}</div>}
            </div>
          </div>

          {/* CSV hint */}
          <div className="csv-hint">
            <strong>CSV Format</strong> — Required: <code>name, subject1_name, subject1_attendance, subject1_marks</code>
            {" "}· Optional: <code>failures, absences, G1, G2, studytime, subject2_name, subject2_attendance, subject2_marks</code>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="form-card">
              <div className="card-title" style={{ marginBottom:20 }}><span className="dot"/>Add New Student</div>

              {/* Student Name */}
              <div style={{ marginBottom:20 }}>
                <Field label="Student Name" field="name" type="text" form={form} setForm={setForm}/>
              </div>

              <div className="form-section-label">Academic Profile (Model Inputs)</div>
              <div className="g3" style={{ marginBottom:20 }}>
                <Field label="Past Failures (0–3)" field="failures" min={0} max={3} placeholder="e.g. 0" form={form} setForm={setForm}/>
                <Field label="Absences (days)" field="absences" min={0} max={93} placeholder="e.g. 5" form={form} setForm={setForm}/>
                <Field label="Study Time (1=low, 4=high)" field="studytime" min={1} max={4} placeholder="e.g. 2" form={form} setForm={setForm}/>
                <Field label="Mid-term Grade G1 (0–20)" field="G1" min={0} max={20} placeholder="e.g. 10" form={form} setForm={setForm}/>
                <Field label="Mid-term Grade G2 (0–20)" field="G2" min={0} max={20} placeholder="e.g. 11" form={form} setForm={setForm}/>
              </div>

              <div className="form-section-label">Subjects</div>
              <div className="g3" style={{ marginBottom:20 }}>
                <Field label="Subject 1 Name" field="subject1_name" type="text" form={form} setForm={setForm}/>
                <Field label="Subject 1 Attendance %" field="subject1_attendance" min={0} max={100} placeholder="e.g. 80" form={form} setForm={setForm}/>
                <Field label="Subject 1 Marks" field="subject1_marks" min={0} max={100} placeholder="e.g. 65" form={form} setForm={setForm}/>
                <Field label="Subject 2 Name (optional)" field="subject2_name" type="text" form={form} setForm={setForm}/>
                <Field label="Subject 2 Attendance %" field="subject2_attendance" min={0} max={100} placeholder="e.g. 75" form={form} setForm={setForm}/>
                <Field label="Subject 2 Marks (optional)" field="subject2_marks" min={0} max={100} placeholder="e.g. 55" form={form} setForm={setForm}/>
              </div>
              {formError && <div className="form-error" style={{ marginBottom:14 }}>⚠ {formError}</div>}
              <button className="btn btn-primary" onClick={handleAdd} disabled={formLoading}>
                {formLoading
                  ? <><span style={{width:13,height:13,border:"2px solid rgba(8,12,20,.3)",borderTop:"2px solid #080c14",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Running AI prediction...</>
                  : <>✦ Add Student & Predict Risk</>}
              </button>
            </div>
          )}

          {/* Table */}
          <div className="card">
            <div className="card-title"><span className="dot"/>Student Records <span style={{ fontSize:12, color:"var(--text3)", fontWeight:400, fontFamily:"var(--font-body)" }}>({filtered.length})</span></div>
            {loading ? (
              <div style={{ padding:"32px 0", textAlign:"center" }}>
                <div style={{ color:"var(--text3)", fontSize:13, marginBottom:12 }}>Running AI predictions...</div>
                <div className="loading-bar"><div className="loading-bar-inner"/></div>
              </div>
            ) : list.length === 0 ? (
              <EmptyState page="students" />
            ) : (
              <div className="tbl-wrap">
                <table>
                  <thead><tr>
                    <th>Student</th><th>Subjects</th><th>Risk Level</th>
                    <th>XGBoost Probability</th>
                    <th>Reason</th><th></th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(s => {
                      const risk = getRisk(s.id);
                      // Derive probability from risk_class if not set
                      const probMap = {0: 15, 1: 55, 2: 85};
                      const displayProb = risk.probability != null
                        ? (risk.probability * 100).toFixed(1)
                        : risk.risk_class != null ? probMap[risk.risk_class] : null;
                      const probColor = risk.risk_class===2?"var(--red)":risk.risk_class===1?"var(--amber)":"var(--green)";
                      return (
                        <tr key={s.id}>
                          <td><button className="name-link" onClick={()=>navigate(`/student/${s.id}`)}>{s.name}</button></td>
                          <td>
                            {Object.entries(s.subjects).map(([sub,d])=>(
                              <div key={sub} style={{ fontSize:12, color:"var(--text3)", marginBottom:2 }}>
                                <span style={{ color:"var(--text2)" }}>{sub}</span>
                                <span style={{ marginLeft:6 }}>— {d.attendance}% att · {d.marks} marks</span>
                              </div>
                            ))}
                          </td>
                          <td><span className={`badge ${risk.level==="High"?"badge-high":risk.level==="Medium"?"badge-amber":"badge-low"}`}>{risk.level==="High"?"High Risk":risk.level==="Medium"?"Medium Risk":"Low Risk"}</span></td>
                          <td>
                            {displayProb != null ? (
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <div style={{ flex:1, height:5, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
                                  <div style={{ width:`${displayProb}%`, height:"100%", background:probColor, borderRadius:99 }}/>
                                </div>
                                <span style={{ fontFamily:"var(--font-disp)", fontWeight:700, fontSize:13, color:probColor, minWidth:38 }}>
                                  {displayProb}%
                                </span>
                              </div>
                            ) : <span style={{ color:"var(--text3)" }}>—</span>}
                          </td>
                          <td style={{ fontSize:12, color:"var(--text3)" }}>{risk.reason}</td>
                          <td><button className="btn-link" onClick={()=>handleDelete(s.id)}>🗑</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}