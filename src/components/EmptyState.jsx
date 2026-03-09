import { useNavigate } from "react-router-dom";

export default function EmptyState({ page = "dashboard" }) {
  const navigate = useNavigate();

  const configs = {
    dashboard: {
      emoji: "🎓",
      title: "No students yet",
      desc: "Your dashboard is ready. Import your class roster to start monitoring student risk with AI predictions.",
      steps: [
        { icon: "📂", label: "Import a CSV file", sub: "Upload your class list from the Students page" },
        { icon: "✦",  label: "Or add manually",   sub: "Add students one by one with the form" },
        { icon: "🤖", label: "AI runs instantly",  sub: "Risk predictions appear automatically" },
      ],
      cta: "Go to Students →",
      ctaPath: "/students",
    },
    analytics: {
      emoji: "📊",
      title: "Nothing to analyze yet",
      desc: "Analytics will appear once you've added students and AI predictions have run.",
      steps: [
        { icon: "👥", label: "Add your students",   sub: "Import a CSV or add manually" },
        { icon: "🤖", label: "Let AI predict risk", sub: "Predictions run automatically" },
        { icon: "📈", label: "See rich analytics",  sub: "Charts and trends appear here" },
      ],
      cta: "Add Students →",
      ctaPath: "/students",
    },
    alerts: {
      emoji: "🔔",
      title: "No alerts to show",
      desc: "Risk alerts will appear here once students are added and high-risk cases are detected by the AI.",
      steps: [
        { icon: "👥", label: "Add your students",        sub: "Import a CSV or add manually" },
        { icon: "⚠️", label: "AI flags high-risk cases", sub: "Based on attendance, marks, and patterns" },
        { icon: "🔔", label: "Alerts appear here",       sub: "Track and act on at-risk students" },
      ],
      cta: "Add Students →",
      ctaPath: "/students",
    },
    students: {
      emoji: "👥",
      title: "Your class is empty",
      desc: "Start building your class roster. Import students from a CSV file or add them manually one by one.",
      steps: [
        { icon: "📂", label: "Import CSV",         sub: "name, subject, attendance, marks columns required" },
        { icon: "✏️", label: "Add manually",       sub: "Use the + Add Student button above" },
        { icon: "🤖", label: "Instant AI scoring", sub: "Risk level predicted as soon as you add" },
      ],
      cta: null,
    },
  };

  const c = configs[page] || configs.dashboard;

  const S = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Bricolage+Grotesque:wght@700;800&display=swap');
    @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
    @keyframes pulseRing { 0%,100%{box-shadow:0 0 48px rgba(15,244,198,0.1);}50%{box-shadow:0 0 72px rgba(15,244,198,0.18);} }
    @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 0 rgba(15,244,198,0.4);}70%{box-shadow:0 0 0 6px rgba(15,244,198,0);} }
    .es-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; padding:48px 32px; text-align:center; min-height:400px; animation:fadeUp .5s ease both; }
    .es-ring { width:100px; height:100px; border-radius:50%; background:radial-gradient(circle,rgba(15,244,198,0.12),rgba(15,244,198,0.03)); border:1px solid rgba(15,244,198,0.15); display:flex; align-items:center; justify-content:center; font-size:42px; margin:0 auto 28px; animation:pulseRing 3s ease-in-out infinite; }
    .es-title { font-family:'Bricolage Grotesque',sans-serif; font-size:24px; font-weight:800; color:#e2e8f0; margin-bottom:12px; }
    .es-desc  { font-size:14px; color:#64748b; max-width:420px; line-height:1.7; margin:0 auto 36px; }
    .es-steps { display:flex; gap:16px; margin-bottom:40px; justify-content:center; flex-wrap:wrap; }
    .es-step  { background:rgba(17,24,39,0.8); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:18px 20px; width:180px; text-align:left; transition:border-color .2s,transform .2s; }
    .es-step:hover { border-color:rgba(15,244,198,0.2); transform:translateY(-3px); }
    .es-step-icon  { font-size:22px; margin-bottom:10px; }
    .es-step-label { font-size:13px; font-weight:700; color:#e2e8f0; font-family:'Bricolage Grotesque',sans-serif; margin-bottom:4px; }
    .es-step-sub   { font-size:11.5px; color:#475569; line-height:1.5; }
    .es-cta { display:inline-flex; align-items:center; gap:8px; padding:12px 28px; background:linear-gradient(135deg,#0ff4c6,#00d4a8); color:#080c14; font-size:14px; font-weight:700; border:none; border-radius:10px; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all .2s; box-shadow:0 0 24px rgba(15,244,198,0.25); }
    .es-cta:hover { transform:translateY(-2px); box-shadow:0 0 40px rgba(15,244,198,0.4); }
    .es-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(15,244,198,0.08); border:1px solid rgba(15,244,198,0.15); border-radius:20px; padding:5px 14px; font-size:11px; font-weight:600; color:#0ff4c6; margin-bottom:20px; font-family:'Plus Jakarta Sans',sans-serif; }
    .es-dot { width:6px; height:6px; border-radius:50%; background:#0ff4c6; animation:pulse-dot 2s infinite; }
  `;

  return (
    <div className="es-wrap">
      <style>{S}</style>
      <div className="es-badge"><div className="es-dot" />Getting Started</div>
      <div className="es-ring">{c.emoji}</div>
      <div className="es-title">{c.title}</div>
      <div className="es-desc">{c.desc}</div>
      <div className="es-steps">
        {c.steps.map((step, i) => (
          <div key={i} className="es-step">
            <div className="es-step-icon">{step.icon}</div>
            <div className="es-step-label">{step.label}</div>
            <div className="es-step-sub">{step.sub}</div>
          </div>
        ))}
      </div>
      {c.cta && (
        <button className="es-cta" onClick={() => navigate(c.ctaPath)}>
          {c.cta}
        </button>
      )}
    </div>
  );
}