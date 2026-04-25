import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { predictStudentRisk } from "../services/api";
import { BASE_CSS } from "../theme";

const S = `
  ${BASE_CSS}
  .detail-hero {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 28px 32px;
    display: flex; align-items: flex-start; gap: 24px;
    animation: fadeUp .4s ease both; position: relative; overflow: hidden;
  }
  .detail-hero::before {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,245,228,0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-avatar {
    width: 64px; height: 64px; border-radius: 18px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--cyan), var(--cyan2));
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; font-weight: 800; color: #050810;
    box-shadow: 0 0 28px rgba(0,245,228,0.3);
  }
  .hero-name { font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -.5px; }
  .hero-meta { font-size: 12px; color: var(--text3); margin-top: 4px; }
  .hero-badges { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .sub-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 18px 20px;
    transition: border-color .2s, transform .15s;
  }
  .sub-card:hover { border-color: var(--border2); transform: translateY(-1px); }
  .sub-name { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
  .sub-metric { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .sub-metric-lbl { font-size: 11px; color: var(--text3); font-weight: 600; letter-spacing:.05em; text-transform:uppercase; }
  .sub-metric-val { font-size: 15px; font-weight: 800; font-family: var(--font-mono); }
  .meter { height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; margin-top: 4px; }
  .meter-fill { height: 100%; border-radius: 99px; transition: width .7s ease; }
  .rec-card {
    border-radius: var(--radius); padding: 22px 24px;
    animation: fadeUp .4s ease both; border: 1px solid;
  }
  .rec-card.high { background: rgba(255,77,109,0.07); border-color: rgba(255,77,109,0.2); }
  .rec-card.low  { background: rgba(45,212,191,0.06); border-color: rgba(45,212,191,0.18); }
  .rec-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
  .rec-items { display: flex; flex-direction: column; gap: 8px; }
  .rec-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; line-height: 1.55; }
  .rec-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
`;

export default function StudentDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [student, setStudent]     = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [loading, setLoading]     = useState(true);
  const attT  = parseInt(localStorage.getItem("attendanceThreshold") || "75");
  const mrkT  = parseInt(localStorage.getItem("marksThreshold") || "50");

  useEffect(() => {
    const storedStudents = localStorage.getItem("studentList");
    const all = storedStudents ? JSON.parse(storedStudents) : [];
    setStudent(all.find(s => String(s.id) === String(id)) || null);
  }, [id]);

  useEffect(() => {
    if (!student) return;
    async function fetchRisk() {
      setLoading(true);
      const md = student.modelData || buildDefaultMD(student);
      try { setRiskResult(await predictStudentRisk(md)); }
      catch { setRiskResult({ risk_level: "Unknown", probability: null }); }
      setLoading(false);
    }
    fetchRisk();
  }, [student]);

  function buildDefaultMD(student) {
    const subs = Object.values(student.subjects);
    const avg  = subs.reduce((s, d) => s + d.marks, 0) / subs.length;
    return { age:17,Medu:2,Fedu:2,traveltime:2,studytime:2,failures:0,famrel:3,freetime:3,goout:3,Dalc:1,Walc:1,health:3,absences:6,G1:Math.round(avg/5),school_MS:0,sex_M:1,address_U:1,famsize_LE3:0,Pstatus_T:1,Mjob_health:0,Mjob_other:1,Mjob_services:0,Mjob_teacher:0,Fjob_health:0,Fjob_other:1,Fjob_services:0,Fjob_teacher:0,reason_home:0,reason_other:0,reason_reputation:1,guardian_mother:1,guardian_other:0,schoolsup_yes:0,famsup_yes:1,paid_yes:0,activities_yes:1,nursery_yes:1,higher_yes:1,internet_yes:1,romantic_yes:0 };
  }

  if (!student) {
    return (
      <div className="page-wrap">
        <style>{S}</style>
        <Sidebar />
        <div className="main-col" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Student not found</div>
            <button className="btn btn-ghost" onClick={() => navigate("/students")}>← Back to Students</button>
          </div>
        </div>
      </div>
    );
  }

  const subjects   = Object.entries(student.subjects);
  const subjArr    = Object.values(student.subjects);
  const avgAtt     = subjArr.reduce((s, x) => s + x.attendance, 0) / subjArr.length;
  const avgMarks   = subjArr.reduce((s, x) => s + x.marks, 0) / subjArr.length;
  const attLow     = avgAtt < attT;
  const marksLow   = avgMarks < mrkT;
  const aiHigh     = riskResult?.risk_level === "High Risk";
  const isHighRisk = aiHigh || attLow || marksLow;
  const prob       = riskResult?.probability;
  const pct        = prob != null ? Math.round(prob * 100) : null;
  const reasons    = [];
  if (aiHigh) reasons.push("AI Detected Risk");
  if (attLow) reasons.push("Low Attendance");
  if (marksLow) reasons.push("Low Marks");

  const initials = student.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const recommendations = isHighRisk
    ? [
        attLow && marksLow ? { icon: "🚨", text: "Immediate academic counseling recommended — both attendance and marks are critically low." } : null,
        attLow && !marksLow ? { icon: "📅", text: "Attendance is below threshold. Notify student's advisor and track absences weekly." } : null,
        marksLow && !attLow ? { icon: "📚", text: "Marks are below passing threshold. Arrange subject-specific tutoring sessions." } : null,
        aiHigh ? { icon: "🤖", text: "AI model detected risk patterns from academic behaviour. Review performance history carefully." } : null,
        { icon: "📞", text: "Consider a parent-teacher meeting to discuss support strategies." },
        { icon: "📝", text: "Create a personalised improvement plan with clear milestones." },
      ].filter(Boolean)
    : [
        { icon: "✅", text: "Student is performing well across all monitored metrics." },
        { icon: "🌟", text: "Encourage participation in enrichment programs or competitions." },
        { icon: "📊", text: "Continue regular monitoring to maintain performance standards." },
      ];

  return (
    <div className="page-wrap">
      <style>{S}</style>
      <Sidebar />
      <div className="main-col">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/students")}>← Back</button>
            <div>
              <div className="topbar-title">Student Detail</div>
              <div className="topbar-sub">Full risk analysis for {student.name}</div>
            </div>
          </div>
        </div>

        <div className="scroll-area">
          {/* Hero card */}
          <div className="detail-hero">
            <div className="hero-avatar">{initials}</div>
            <div style={{ flex: 1 }}>
              <div className="hero-name">{student.name}</div>
              <div className="hero-meta">ID: {student.id} · {subjects.length} subject{subjects.length !== 1 ? "s" : ""}</div>
              <div className="hero-badges">
                {loading
                  ? <span className="badge badge-info">Analyzing…</span>
                  : <>
                      <span className={`badge ${isHighRisk ? "badge-high" : "badge-low"}`}>{isHighRisk ? "High Risk" : "Low Risk"}</span>
                      {pct != null && (
                        <span className="badge badge-amber" style={{ fontFamily: "var(--font-mono)" }}>
                          AI: {pct}%
                        </span>
                      )}
                      {reasons.map(r => (
                        <span key={r} className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text2)", border: "1px solid var(--border2)", fontSize: 11 }}>{r}</span>
                      ))}
                    </>
                }
              </div>
            </div>
            {/* Circular probability meter */}
            {!loading && pct != null && (
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none"
                    stroke={pct > 50 ? "var(--red)" : "var(--green)"}
                    strokeWidth="8"
                    strokeDasharray={`${(pct / 100) * 201} 201`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                    style={{ transition: "stroke-dasharray .8s ease" }}
                  />
                  <text x="40" y="44" textAnchor="middle" fill={pct > 50 ? "var(--red)" : "var(--green)"} fontFamily="Sora,sans-serif" fontSize="16" fontWeight="800">{pct}%</text>
                </svg>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>AI Risk</div>
              </div>
            )}
          </div>

          {/* Subject cards */}
          <div className="card" style={{ animationDelay: "80ms" }}>
            <div className="card-title"><span className="dot" />Subject Breakdown</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {subjects.map(([name, data]) => {
                const subAttLow   = data.attendance < attT;
                const subMarksLow = data.marks < mrkT;
                const subRisk     = subAttLow || subMarksLow;
                return (
                  <div key={name} className="sub-card" style={{ borderColor: subRisk ? "rgba(255,77,109,0.2)" : "var(--border)" }}>
                    <div className="sub-name">{name}</div>
                    <div className="sub-metric">
                      <span className="sub-metric-lbl">Attendance</span>
                      <span className="sub-metric-val" style={{ color: subAttLow ? "var(--red)" : "var(--cyan)" }}>{data.attendance}%</span>
                    </div>
                    <div className="meter">
                      <div className="meter-fill" style={{ width: `${data.attendance}%`, background: subAttLow ? "linear-gradient(90deg,var(--red),#f97316)" : "linear-gradient(90deg,var(--cyan),var(--cyan2))" }} />
                    </div>
                    <div className="sub-metric" style={{ marginTop: 12 }}>
                      <span className="sub-metric-lbl">Marks</span>
                      <span className="sub-metric-val" style={{ color: subMarksLow ? "var(--red)" : "var(--amber)" }}>{data.marks}</span>
                    </div>
                    <div className="meter">
                      <div className="meter-fill" style={{ width: `${Math.min(data.marks, 100)}%`, background: subMarksLow ? "linear-gradient(90deg,var(--red),#f97316)" : "linear-gradient(90deg,var(--amber),#f59e0b)" }} />
                    </div>
                    <div style={{ marginTop: 12, textAlign: "center" }}>
                      <span className={`badge ${subRisk ? "badge-high" : "badge-low"}`} style={{ fontSize: 11 }}>
                        {subRisk ? "At Risk" : "Good"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Averages bar */}
            <div style={{ marginTop: 20, padding: "16px 20px", background: "var(--surface2)", borderRadius: "var(--radius-sm)", display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Avg Attendance</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)", color: attLow ? "var(--red)" : "var(--cyan)" }}>{avgAtt.toFixed(1)}%</div>
                {attLow && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 2 }}>Below {attT}% threshold</div>}
              </div>
              <div style={{ width: 1, background: "var(--border)" }} />
              <div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Avg Marks</div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)", color: marksLow ? "var(--red)" : "var(--amber)" }}>{avgMarks.toFixed(1)}</div>
                {marksLow && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 2 }}>Below {mrkT} threshold</div>}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {!loading && (
            <div className={`rec-card ${isHighRisk ? "high" : "low"}`} style={{ animationDelay: "160ms" }}>
              <div className="rec-title">
                {isHighRisk ? "⚠ AI Recommendations" : "✅ Performance Summary"}
              </div>
              <div className="rec-items">
                {recommendations.map((rec, i) => (
                  <div key={i} className="rec-item">
                    <span className="rec-icon">{rec.icon}</span>
                    <span style={{ color: isHighRisk ? "#ffaab8" : "#6ee7b7" }}>{rec.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}