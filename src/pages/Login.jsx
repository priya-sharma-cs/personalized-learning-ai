import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BASE_CSS } from "../theme";

const S = `
  ${BASE_CSS}
  @keyframes spin { to { transform:rotate(360deg); } }
  .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); position:relative; overflow:hidden; }
  .orb1 { position:absolute; top:-200px; right:-100px; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(15,244,198,0.06) 0%,transparent 65%); pointer-events:none; }
  .orb2 { position:absolute; bottom:-200px; left:-100px; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,0.05) 0%,transparent 65%); pointer-events:none; }
  .grid-bg { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px); background-size:48px 48px; pointer-events:none; mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,black,transparent); }
  .auth-card { width:420px; position:relative; z-index:1; animation:fadeUp .5s ease both; }
  .auth-glass { background:rgba(17,24,39,0.85); backdrop-filter:blur(24px); border:1px solid var(--border2); border-radius:20px; padding:44px 40px; box-shadow:var(--shadow-lg),0 0 0 1px rgba(255,255,255,0.03) inset; }
  .auth-logo { text-align:center; margin-bottom:36px; }
  .auth-logo-mark { width:56px; height:56px; border-radius:16px; background:linear-gradient(135deg,var(--teal),var(--teal2)); display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-family:var(--font-disp); font-size:24px; font-weight:800; color:#080c14; box-shadow:0 0 32px rgba(15,244,198,0.35); }
  .auth-logo h1 { font-family:var(--font-disp); font-size:26px; font-weight:800; color:var(--text); letter-spacing:-.5px; }
  .auth-logo p  { font-size:13px; color:var(--text3); margin-top:5px; }
  .auth-fields { display:flex; flex-direction:column; gap:16px; }
  .auth-footer { text-align:center; margin-top:20px; font-size:13px; color:var(--text3); }
  .auth-footer a { color:var(--teal); text-decoration:none; font-weight:600; }
  .auth-footer a:hover { text-decoration:underline; }
  .brand-chip { display:inline-flex; align-items:center; gap:5px; background:var(--teal-dim); border:1px solid rgba(15,244,198,.2); border-radius:20px; padding:4px 10px; font-size:11px; font-weight:600; color:var(--teal); margin-bottom:8px; }
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError("Please enter your email and password"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const match = users.find(u => u.email === email && u.password === password);
    if (users.length > 0 && !match) { setError("Invalid email or password"); setLoading(false); return; }
    const saved = localStorage.getItem(`studentList_${email}`);
    if (saved) {
      localStorage.setItem("studentList", saved);
    } else {
      localStorage.removeItem("studentList");
    }
    const hist = localStorage.getItem(`predictionHistory_${email}`);
    hist ? localStorage.setItem("predictionHistory", hist) : localStorage.removeItem("predictionHistory");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    if (match?.name) localStorage.setItem("userName", match.name);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <style>{S}</style>
      <div className="orb1" /><div className="orb2" /><div className="grid-bg" />
      <div className="auth-card">
        <div className="auth-glass">
          <div className="auth-logo">
            <div className="brand-chip">✦ Teacher Portal</div>
            <div className="auth-logo-mark">E</div>
            <h1>Welcome back</h1>
            <p>Sign in to your EduRisk dashboard</p>
          </div>
          <div className="auth-fields">
            <div className="field">
              <label>Email Address</label>
              <input className="inp" type="email" placeholder="teacher@school.edu" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="inp" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            {error && <div className="form-error">⚠ {error}</div>}
            <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ width:"100%", justifyContent:"center", padding:"13px", marginTop:4, fontSize:14 }}>
              {loading ? (
                <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:14, height:14, border:"2px solid rgba(8,12,20,.3)", borderTop:"2px solid #080c14", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </div>
          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/signup">Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}