import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BASE_CSS } from "../theme";

const S = `
  ${BASE_CSS}
  .auth-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); position: relative; overflow: hidden;
  }
  /* Layered background atmosphere */
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
    position: absolute; top: -250px; right: -150px;
    width: 700px; height: 700px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,245,228,0.07) 0%, transparent 60%);
    pointer-events: none; animation: float 8s ease-in-out infinite;
  }
  .auth-orb2 {
    position: absolute; bottom: -200px; left: -100px;
    width: 600px; height: 600px; border-radius: 50%;
    background: radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 60%);
    pointer-events: none; animation: float 10s ease-in-out infinite reverse;
  }
  .auth-orb3 {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    width: 800px; height: 400px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0,245,228,0.03) 0%, transparent 70%);
    pointer-events: none;
  }
  /* Card */
  .auth-card {
    width: 440px; position: relative; z-index: 10;
    animation: fadeUp .55s ease both;
  }
  .auth-glass {
    background: rgba(14,21,37,0.9);
    backdrop-filter: blur(28px);
    border: 1px solid var(--border2);
    border-radius: 22px; padding: 46px 42px;
    box-shadow: var(--shadow-lg), var(--glow-cyan),
                0 0 0 1px rgba(255,255,255,0.03) inset;
  }
  /* Logo */
  .auth-logo-wrap { text-align: center; margin-bottom: 36px; }
  .auth-chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--cyan-dim); border: 1px solid rgba(0,245,228,.2);
    border-radius: 20px; padding: 4px 12px;
    font-size: 11px; font-weight: 700; color: var(--cyan);
    letter-spacing: .08em; text-transform: uppercase;
    margin-bottom: 16px;
  }
  .auth-logo-mark {
    width: 60px; height: 60px; border-radius: 18px;
    background: linear-gradient(135deg, var(--cyan), var(--cyan2));
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; font-size: 26px; font-weight: 800; color: #050810;
    box-shadow: 0 0 40px rgba(0,245,228,0.35), 0 8px 24px rgba(0,0,0,0.4);
    animation: float 4s ease-in-out infinite;
  }
  .auth-title { font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: -.7px; }
  .auth-subtitle { font-size: 13px; color: var(--text3); margin-top: 6px; }
  /* Fields */
  .auth-fields { display: flex; flex-direction: column; gap: 16px; margin-top: 4px; }
  .auth-inp-wrap { position: relative; }
  .auth-inp-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    font-size: 15px; opacity: .4; pointer-events: none;
  }
  .auth-inp {
    padding: 12px 14px 12px 40px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border2); border-radius: var(--radius-sm);
    color: var(--text); font-size: 13.5px; font-family: var(--font-body);
    outline: none; transition: border-color .2s, box-shadow .2s; width: 100%;
  }
  .auth-inp:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(0,245,228,.1); }
  .auth-inp::placeholder { color: var(--text4); }
  /* CTA */
  .auth-cta {
    width: 100%; justify-content: center; padding: 14px;
    margin-top: 6px; font-size: 14px; font-weight: 700;
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg, var(--cyan), var(--cyan2));
    color: #050810; border: none; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    transition: all .2s;
    box-shadow: 0 4px 20px rgba(0,245,228,0.25);
  }
  .auth-cta:hover:not(:disabled) { box-shadow: 0 6px 32px rgba(0,245,228,0.4); transform: translateY(-1px); }
  .auth-cta:disabled { opacity: .5; cursor: not-allowed; }
  .auth-footer { text-align: center; margin-top: 22px; font-size: 13px; color: var(--text3); }
  .auth-footer a { color: var(--cyan); text-decoration: none; font-weight: 700; }
  .auth-footer a:hover { text-decoration: underline; }
  /* Spinner */
  .spin-sm { width: 14px; height: 14px; border: 2px solid rgba(5,8,16,.25); border-top-color: #050810; border-radius: 50%; animation: spin .7s linear infinite; }
  /* Demo hint */
  .demo-hint {
    background: rgba(0,245,228,0.05); border: 1px solid rgba(0,245,228,0.1);
    border-radius: var(--radius-sm); padding: 10px 14px;
    font-size: 11.5px; color: var(--text3); margin-top: 4px;
    line-height: 1.6;
  }
  .demo-hint strong { color: var(--cyan); }
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const match = users.find(u => u.email === email && u.password === password);

    if (users.length > 0 && !match) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    const saved = localStorage.getItem(`studentList_${email}`);
    saved
      ? localStorage.setItem("studentList", saved)
      : localStorage.removeItem("studentList");
    const hist = localStorage.getItem(`predictionHistory_${email}`);
    hist
      ? localStorage.setItem("predictionHistory", hist)
      : localStorage.removeItem("predictionHistory");

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    if (match?.name) localStorage.setItem("userName", match.name);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <style>{S}</style>
      <div className="auth-bg-grid" />
      <div className="auth-orb1" />
      <div className="auth-orb2" />
      <div className="auth-orb3" />

      <div className="auth-card">
        <div className="auth-glass">
          <div className="auth-logo-wrap">
            <div className="auth-chip">✦ Teacher Portal</div>
            <div className="auth-logo-mark">E</div>
            <div className="auth-title">Welcome back</div>
            <div className="auth-subtitle">Sign in to your EduRisk AI dashboard</div>
          </div>

          <div className="auth-fields">
            <div className="field">
              <label>Email Address</label>
              <div className="auth-inp-wrap">
                <span className="auth-inp-icon">✉</span>
                <input
                  className="auth-inp"
                  type="email"
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="auth-inp-wrap">
                <span className="auth-inp-icon">🔒</span>
                <input
                  className="auth-inp"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            {error && <div className="form-error">⚠ {error}</div>}

            <div className="demo-hint">
              <strong>First time?</strong> Create a free account below.
              Any email + password combination works if no accounts exist yet.
            </div>

            <button className="auth-cta" onClick={handleLogin} disabled={loading}>
              {loading
                ? <><div className="spin-sm" /> Signing in...</>
                : "Sign In →"}
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
