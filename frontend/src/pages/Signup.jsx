import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BASE_CSS } from "../theme";

const S = `
  ${BASE_CSS}
  .auth-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); position: relative; overflow: hidden;
  }
  .auth-bg-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,245,228,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,228,0.025) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%);
    pointer-events: none;
  }
  .auth-orb1 {
    position: absolute; top: -200px; left: -100px; width: 600px; height: 600px;
    border-radius: 50%; background: radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 60%);
    pointer-events: none; animation: float 9s ease-in-out infinite;
  }
  .auth-orb2 {
    position: absolute; bottom: -180px; right: -120px; width: 550px; height: 550px;
    border-radius: 50%; background: radial-gradient(circle, rgba(0,245,228,0.06) 0%, transparent 60%);
    pointer-events: none; animation: float 7s ease-in-out infinite reverse;
  }
  .auth-card { width: 460px; position: relative; z-index: 10; animation: fadeUp .55s ease both; }
  .auth-glass {
    background: rgba(14,21,37,0.9); backdrop-filter: blur(28px);
    border: 1px solid var(--border2); border-radius: 22px; padding: 42px;
    box-shadow: var(--shadow-lg), var(--glow-cyan), 0 0 0 1px rgba(255,255,255,0.03) inset;
  }
  .auth-logo-wrap { text-align: center; margin-bottom: 32px; }
  .auth-chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--violet-dim); border: 1px solid rgba(167,139,250,.2);
    border-radius: 20px; padding: 4px 12px;
    font-size: 11px; font-weight: 700; color: var(--violet);
    letter-spacing: .08em; text-transform: uppercase; margin-bottom: 16px;
  }
  .auth-logo-mark {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, var(--violet), #7c3aed);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px; font-size: 24px; font-weight: 800; color: #fff;
    box-shadow: 0 0 32px rgba(167,139,250,0.3), 0 8px 24px rgba(0,0,0,0.4);
    animation: float 4s ease-in-out infinite;
  }
  .auth-title { font-size: 24px; font-weight: 800; color: var(--text); letter-spacing: -.6px; }
  .auth-subtitle { font-size: 13px; color: var(--text3); margin-top: 5px; }
  .auth-fields { display: flex; flex-direction: column; gap: 14px; }
  .auth-inp-wrap { position: relative; }
  .auth-inp-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: .4; pointer-events: none; }
  .auth-inp {
    padding: 11px 14px 11px 40px; background: rgba(255,255,255,0.04);
    border: 1px solid var(--border2); border-radius: var(--radius-sm);
    color: var(--text); font-size: 13px; font-family: var(--font-body);
    outline: none; transition: border-color .2s, box-shadow .2s; width: 100%;
  }
  .auth-inp:focus { border-color: var(--violet); box-shadow: 0 0 0 3px rgba(167,139,250,.1); }
  .auth-inp::placeholder { color: var(--text4); }
  .auth-cta {
    width: 100%; justify-content: center; padding: 13px; font-size: 14px; font-weight: 700;
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg, var(--violet), #7c3aed);
    color: #fff; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;
    transition: all .2s; box-shadow: 0 4px 20px rgba(167,139,250,0.25); margin-top: 6px;
  }
  .auth-cta:hover:not(:disabled) { box-shadow: 0 6px 32px rgba(167,139,250,.4); transform: translateY(-1px); }
  .auth-cta:disabled { opacity: .5; cursor: not-allowed; }
  .auth-footer { text-align: center; margin-top: 20px; font-size: 13px; color: var(--text3); }
  .auth-footer a { color: var(--cyan); text-decoration: none; font-weight: 700; }
  .auth-footer a:hover { text-decoration: underline; }
  .spin-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.25); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
`;

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields"); return;
    }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find(u => u.email === email)) {
      setError("An account with this email already exists");
      setLoading(false); return;
    }

    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <style>{S}</style>
      <div className="auth-bg-grid" />
      <div className="auth-orb1" />
      <div className="auth-orb2" />

      <div className="auth-card">
        <div className="auth-glass">
          <div className="auth-logo-wrap">
            <div className="auth-chip">◈ New Account</div>
            <div className="auth-logo-mark">✦</div>
            <div className="auth-title">Create your account</div>
            <div className="auth-subtitle">Join EduRisk — AI-powered student monitoring</div>
          </div>

          <div className="auth-fields">
            <div className="field">
              <label>Full Name</label>
              <div className="auth-inp-wrap">
                <span className="auth-inp-icon">👤</span>
                <input className="auth-inp" type="text" placeholder="Dr. Jane Smith"
                  value={name} onChange={e => { setName(e.target.value); setError(""); }} />
              </div>
            </div>
            <div className="field">
              <label>Email Address</label>
              <div className="auth-inp-wrap">
                <span className="auth-inp-icon">✉</span>
                <input className="auth-inp" type="email" placeholder="teacher@school.edu"
                  value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
              </div>
            </div>
            <div className="field">
              <label>Password</label>
              <div className="auth-inp-wrap">
                <span className="auth-inp-icon">🔒</span>
                <input className="auth-inp" type="password" placeholder="Min. 6 characters"
                  value={password} onChange={e => { setPassword(e.target.value); setError(""); }} />
              </div>
            </div>
            <div className="field">
              <label>Confirm Password</label>
              <div className="auth-inp-wrap">
                <span className="auth-inp-icon">🔑</span>
                <input className="auth-inp" type="password" placeholder="Repeat password"
                  value={confirm} onChange={e => { setConfirm(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleSignup()} />
              </div>
            </div>

            {error && <div className="form-error">⚠ {error}</div>}

            <button className="auth-cta" onClick={handleSignup} disabled={loading}>
              {loading
                ? <><div className="spin-sm" /> Creating account...</>
                : "Create Account →"}
            </button>
          </div>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
