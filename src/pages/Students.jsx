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

const EMPTY = { name:"",age:"",failures:"",absences:"",G1:"",studytime:"",health:"",schoolsup_yes:"0",internet_yes:"1",higher_yes:"1",subject1_name:"Math",subject1_attendance:"",subject1_marks:"",subject2_name:"Science",subject2_attendance:"",subject2_marks:"" };

function Field({ label, field, type="number", min, max, placeholder, form, setForm }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="inp" type={type} min={min} max={max} placeholder={placeholder||label} value={form[field]} onChange={e => setForm({...form,[field]:e.target.value})} />
    </div>
  );
}
function Sel({ label, field, options, form, setForm }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select className="inp" value={form[field]} onChange={e => setForm({...form,[field]:e.target.value})}>
        {options.map(([v,t]) => <option key={v} value={v}>{t}</option>)}
      </select>
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

  function save(updated) {
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
    return {age:17,Medu:2,Fedu:2,traveltime:2,studytime:2,failures:0,famrel:3,freetime:3,goout:3,Dalc:1,Walc:1,health:3,absences:6,G1:Math.round(avg/5),school_MS:0,sex_M:1,address_U:1,famsize_LE3:0,Pstatus_T:1,Mjob_health:0,Mjob_other:1,Mjob_services:0,Mjob_teacher:0,Fjob_health:0,Fjob_other:1,Fjob_services:0,Fjob_teacher:0,reason_home:0,reason_other:0,reason_reputation:1,guardian_mother:1,guardian_other:0,schoolsup_yes:0,famsup_yes:1,paid_yes:0,activities_yes:1,nursery_yes:1,higher_yes:1,internet_yes:1,romantic_yes:0};
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
      return {id:Date.now()+i,name:row.name,subjects,modelData:{age:parseInt(row.age)||17,studytime:parseInt(row.studytime)||2,failures:parseInt(row.failures)||0,absences:parseInt(row.absences)||6,health:parseInt(row.health)||3,G1:parseInt(row.g1)||parseInt(row.G1)||10,schoolsup_yes:parseInt(row.schoolsup_yes)||0,internet_yes:parseInt(row.internet_yes)||1,higher_yes:parseInt(row.higher_yes)||1,Medu:2,Fedu:2,traveltime:2,famrel:3,freetime:3,goout:3,Dalc:1,Walc:1,school_MS:0,sex_M:1,address_U:1,famsize_LE3:0,Pstatus_T:1,Mjob_health:0,Mjob_other:1,Mjob_services:0,Mjob_teacher:0,Fjob_health:0,Fjob_other:1,Fjob_services:0,Fjob_teacher:0,reason_home:0,reason_other:0,reason_reputation:1,guardian_mother:1,guardian_other:0,famsup_yes:1,paid_yes:0,activities_yes:1,nursery_yes:1,romantic_yes:0}};
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
    for(const f of ["name","age","failures","absences","G1","studytime","health","subject1_attendance","subject1_marks"]){
      if(form[f]===""||form[f]===undefined){setFormError(`Please fill in: ${f}`);return;}
    }
    setFormLoading(true);
    const md={age:parseInt(form.age),studytime:parseInt(form.studytime),failures:parseInt(form.failures),absences:parseInt(form.absences),health:parseInt(form.health),G1:parseInt(form.G1),schoolsup_yes:parseInt(form.schoolsup_yes),internet_yes:parseInt(form.internet_yes),higher_yes:parseInt(form.higher_yes),Medu:2,Fedu:2,traveltime:2,famrel:3,freetime:3,goout:3,Dalc:1,Walc:1,school_MS:0,sex_M:1,address_U:1,famsize_LE3:0,Pstatus_T:1,Mjob_health:0,Mjob_other:1,Mjob_services:0,Mjob_teacher:0,Fjob_health:0,Fjob_other:1,Fjob_services:0,Fjob_teacher:0,reason_home:0,reason_other:0,reason_reputation:1,guardian_mother:1,guardian_other:0,famsup_yes:1,paid_yes:0,activities_yes:1,nursery_yes:1,romantic_yes:0};
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
    if(!r||!s) return {level:"...",reason:"Loading...",probability:null};
    const subs=Object.values(s.subjects); const avgA=subs.reduce((x,y)=>x+y.attendance,0)/subs.length; const avgM=subs.reduce((x,y)=>x+y.marks,0)/subs.length;
    const aiH=r.risk_level==="High Risk"; const attLow=avgA<attT; const mLow=avgM<marksT; const high=aiH||attLow||mLow;
    const reasons=[]; if(aiH)reasons.push("AI flagged"); if(attLow)reasons.push("Low Attendance"); if(mLow)reasons.push("Low Marks");
    return {level:high?"High":"Low",reason:high?reasons.join(", "):"Good Performance",probability:r.probability};
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
            {" "}· Optional: <code>age, failures, absences, G1, studytime, health, schoolsup_yes, internet_yes, higher_yes, subject2_name, subject2_attendance, subject2_marks</code>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="form-card">
              <div className="card-title" style={{ marginBottom:20 }}><span className="dot"/>Add New Student</div>
              <div className="g2" style={{ marginBottom:20 }}>
                <Field label="Student Name" field="name" type="text" form={form} setForm={setForm}/>
                <Field label="Age" field="age" min={10} max={22} form={form} setForm={setForm}/>
              </div>
              <div className="form-section-label">Academic Profile</div>
              <div className="g4" style={{ marginBottom:20 }}>
                <Field label="Past Failures (0–3)" field="failures" min={0} max={3} form={form} setForm={setForm}/>
                <Field label="Absences (days)" field="absences" min={0} max={100} form={form} setForm={setForm}/>
                <Field label="Mid-term Grade G1 (0–20)" field="G1" min={0} max={20} form={form} setForm={setForm}/>
                <Field label="Study Time (1=low, 4=high)" field="studytime" min={1} max={4} form={form} setForm={setForm}/>
                <Field label="Health (1=bad, 5=good)" field="health" min={1} max={5} form={form} setForm={setForm}/>
                <Sel label="School Support" field="schoolsup_yes" options={[["0","No"],["1","Yes"]]} form={form} setForm={setForm}/>
                <Sel label="Internet at Home" field="internet_yes" options={[["1","Yes"],["0","No"]]} form={form} setForm={setForm}/>
                <Sel label="Wants Higher Ed." field="higher_yes" options={[["1","Yes"],["0","No"]]} form={form} setForm={setForm}/>
              </div>
              <div className="form-section-label">Subjects</div>
              <div className="g3" style={{ marginBottom:20 }}>
                <Field label="Subject 1 Name" field="subject1_name" type="text" form={form} setForm={setForm}/>
                <Field label="Subject 1 Attendance %" field="subject1_attendance" min={0} max={100} form={form} setForm={setForm}/>
                <Field label="Subject 1 Marks" field="subject1_marks" min={0} max={100} form={form} setForm={setForm}/>
                <Field label="Subject 2 Name (optional)" field="subject2_name" type="text" form={form} setForm={setForm}/>
                <Field label="Subject 2 Attendance %" field="subject2_attendance" min={0} max={100} form={form} setForm={setForm}/>
                <Field label="Subject 2 Marks (optional)" field="subject2_marks" min={0} max={100} form={form} setForm={setForm}/>
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
                    <th>Student</th><th>Subjects</th><th>Risk Level</th><th>AI Probability</th><th>Reason</th><th></th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(s => {
                      const risk = getRisk(s.id);
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
                          <td><span className={`badge ${risk.level==="High"?"badge-high":"badge-low"}`}>{risk.level==="High"?"High Risk":"Low Risk"}</span></td>
                          <td style={{ fontFamily:"var(--font-disp)", fontWeight:700, color:risk.probability!=null?(risk.probability>0.5?"var(--red)":"var(--green)"):"var(--text3)" }}>
                            {risk.probability!=null ? `${(risk.probability*100).toFixed(1)}%` : "—"}
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