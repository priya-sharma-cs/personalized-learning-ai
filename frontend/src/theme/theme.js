// ─── EduRisk Design System ───────────────────────────────────────────────────
export const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:           #050810;
    --bg2:          #090d1a;
    --surface:      #0e1525;
    --surface2:     #131d30;
    --surface3:     #1a2540;
    --border:       rgba(255,255,255,0.06);
    --border2:      rgba(255,255,255,0.11);
    --border3:      rgba(255,255,255,0.18);

    /* Brand */
    --cyan:         #00f5e4;
    --cyan2:        #00c9ba;
    --cyan-dim:     rgba(0,245,228,0.1);
    --cyan-glow:    rgba(0,245,228,0.05);
    --cyan-pulse:   rgba(0,245,228,0.35);

    /* Semantic */
    --red:          #ff4d6d;
    --red-dim:      rgba(255,77,109,0.12);
    --red-border:   rgba(255,77,109,0.25);
    --amber:        #ffb703;
    --amber-dim:    rgba(255,183,3,0.12);
    --amber-border: rgba(255,183,3,0.25);
    --green:        #2dd4bf;
    --green-dim:    rgba(45,212,191,0.1);
    --green-border: rgba(45,212,191,0.22);
    --violet:       #a78bfa;
    --violet-dim:   rgba(167,139,250,0.1);

    /* Text */
    --text:         #e8edf5;
    --text2:        #8896aa;
    --text3:        #4a5568;
    --text4:        #2d3748;

    /* Typography */
    --font-body:    'Sora', sans-serif;
    --font-mono:    'JetBrains Mono', monospace;

    /* Geometry */
    --radius:       16px;
    --radius-sm:    10px;
    --radius-xs:    6px;

    /* Depth */
    --shadow:       0 4px 24px rgba(0,0,0,0.5);
    --shadow-lg:    0 16px 64px rgba(0,0,0,0.7);
    --glow-cyan:    0 0 40px rgba(0,245,228,0.12);
  }

  html, body { height: 100%; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: 14px; line-height: 1.6; -webkit-font-smoothing: antialiased; }

  /* ── Animations ── */
  @keyframes fadeUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn    { from { opacity:0 } to { opacity:1; } }
  @keyframes slideRight{ from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pulse-dot { 0%,100% { box-shadow:0 0 0 0 var(--cyan-pulse); } 70% { box-shadow:0 0 0 6px rgba(0,245,228,0); } }
  @keyframes bar-slide { from { transform:translateX(-100%); } to { transform:translateX(300%); } }
  @keyframes spin      { to { transform:rotate(360deg); } }
  @keyframes glow-pulse{ 0%,100% { opacity:.4; } 50% { opacity:1; } }
  @keyframes float     { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-6px); } }

  /* ── Layout ── */
  .page-wrap  { display:flex; height:100vh; background:var(--bg); overflow:hidden; }
  .main-col   { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .scroll-area{ flex:1; overflow-y:auto; padding:28px 32px; display:flex; flex-direction:column; gap:24px; }
  .scroll-area::-webkit-scrollbar { width:4px; }
  .scroll-area::-webkit-scrollbar-track { background:transparent; }
  .scroll-area::-webkit-scrollbar-thumb { background:rgba(0,245,228,0.15); border-radius:99px; }

  /* ── Topbar ── */
  .topbar {
    display:flex; justify-content:space-between; align-items:center;
    padding:14px 32px; background:rgba(9,13,26,0.95);
    border-bottom:1px solid var(--border); backdrop-filter:blur(24px);
    flex-shrink:0; position:sticky; top:0; z-index:50;
  }
  .topbar-title { font-size:18px; font-weight:700; color:var(--text); letter-spacing:-.3px; }
  .topbar-sub   { font-size:11.5px; color:var(--text3); margin-top:2px; }

  /* ── Cards ── */
  .card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius); padding:24px;
    animation:fadeUp .45s ease both;
    transition:border-color .2s;
  }
  .card:hover { border-color:var(--border2); }
  .card-title {
    font-size:14px; font-weight:700; color:var(--text);
    margin-bottom:20px; display:flex; align-items:center; gap:9px;
    letter-spacing:-.2px;
  }
  .card-title .dot {
    width:7px; height:7px; border-radius:50%;
    background:var(--cyan); flex-shrink:0;
    animation:pulse-dot 2.5s infinite;
    box-shadow:0 0 10px var(--cyan-pulse);
  }

  /* ── KPI Grid ── */
  .kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
  .kpi {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius); padding:22px 24px 20px;
    position:relative; overflow:hidden;
    transition:border-color .2s, transform .2s, box-shadow .2s;
    animation:fadeUp .45s ease both;
    cursor:default;
  }
  .kpi:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:var(--shadow); }
  .kpi-bar { position:absolute; top:0; left:0; right:0; height:3px; border-radius:var(--radius) var(--radius) 0 0; }
  .kpi-label { font-size:11px; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:var(--text3); }
  .kpi-value { font-size:38px; font-weight:800; margin-top:10px; line-height:1; letter-spacing:-1.5px; }
  .kpi-sub   { font-size:12px; color:var(--text3); margin-top:7px; }
  .kpi-icon  { position:absolute; right:18px; bottom:18px; font-size:32px; opacity:.11; }

  /* ── Table ── */
  .tbl-wrap { overflow-x:auto; border-radius:var(--radius-sm); }
  table { width:100%; border-collapse:collapse; }
  thead tr { border-bottom:1px solid var(--border); }
  th {
    padding:11px 14px; font-size:10.5px; font-weight:700;
    letter-spacing:.1em; text-transform:uppercase; color:var(--text3);
    text-align:left; white-space:nowrap;
  }
  td {
    padding:15px 14px; font-size:13px; color:var(--text2);
    border-bottom:1px solid rgba(255,255,255,0.025); vertical-align:middle;
  }
  tbody tr:last-child td { border-bottom:none; }
  tbody tr { transition:background .15s; }
  tbody tr:hover td { background:rgba(0,245,228,0.02); }
  td.strong { color:var(--text); font-weight:600; }

  /* ── Badges ── */
  .badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 10px; border-radius:20px; font-size:11.5px;
    font-weight:700; white-space:nowrap; letter-spacing:.01em;
  }
  .badge::before { content:''; width:5px; height:5px; border-radius:50%; flex-shrink:0; }
  .badge-high   { background:var(--red-dim);   color:var(--red);   border:1px solid var(--red-border); }
  .badge-high::before { background:var(--red); box-shadow:0 0 5px var(--red); }
  .badge-low    { background:var(--green-dim); color:var(--green); border:1px solid var(--green-border); }
  .badge-low::before  { background:var(--green); }
  .badge-info   { background:var(--cyan-dim);  color:var(--cyan);  border:1px solid rgba(0,245,228,.2); }
  .badge-amber  { background:var(--amber-dim); color:var(--amber); border:1px solid var(--amber-border); }

  /* ── Buttons ── */
  .btn {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 18px; border-radius:var(--radius-sm);
    font-size:13px; font-weight:600; font-family:var(--font-body);
    cursor:pointer; border:none; transition:all .2s; white-space:nowrap;
    letter-spacing:-.1px;
  }
  .btn-primary {
    background:linear-gradient(135deg,var(--cyan),var(--cyan2));
    color:#050810; box-shadow:0 4px 16px rgba(0,245,228,0.2);
  }
  .btn-primary:hover { box-shadow:0 6px 28px rgba(0,245,228,.4); transform:translateY(-1px); }
  .btn-ghost {
    background:rgba(255,255,255,0.05); border:1px solid var(--border2);
    color:var(--text2);
  }
  .btn-ghost:hover { background:rgba(255,255,255,0.09); color:var(--text); border-color:var(--border3); }
  .btn-danger {
    background:var(--red-dim); border:1px solid var(--red-border); color:var(--red);
  }
  .btn-danger:hover { background:rgba(255,77,109,.2); }
  .btn:disabled { opacity:.45; cursor:not-allowed !important; transform:none !important; box-shadow:none !important; }
  .btn-sm { padding:6px 13px; font-size:12px; }

  /* ── Inputs ── */
  .field { display:flex; flex-direction:column; gap:6px; }
  .field label { font-size:10.5px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--text3); }
  .inp {
    padding:10px 14px; background:rgba(255,255,255,0.04);
    border:1px solid var(--border2); border-radius:var(--radius-sm);
    color:var(--text); font-size:13px; font-family:var(--font-body);
    outline:none; transition:border-color .2s, box-shadow .2s; width:100%;
  }
  .inp:focus { border-color:var(--cyan); box-shadow:0 0 0 3px rgba(0,245,228,.1); }
  .inp::placeholder { color:var(--text4); }
  select.inp option { background:var(--surface); color:var(--text); }

  /* ── Avatar ── */
  .avatar {
    width:36px; height:36px; border-radius:50%;
    background:linear-gradient(135deg,var(--cyan),var(--cyan2));
    display:flex; align-items:center; justify-content:center;
    font-weight:800; font-size:14px; color:#050810; flex-shrink:0;
    box-shadow:0 0 14px rgba(0,245,228,0.3);
  }

  /* ── Insights ── */
  .insight { display:flex; align-items:flex-start; gap:12px; padding:13px 16px; border-radius:10px; font-size:13px; line-height:1.55; border:1px solid transparent; }
  .insight-red    { background:var(--red-dim);   border-color:var(--red-border);   color:#ffaab8; }
  .insight-orange { background:rgba(255,183,3,0.07); border-color:var(--amber-border); color:#ffd166; }
  .insight-green  { background:var(--green-dim); border-color:var(--green-border); color:#6ee7b7; }
  .insight-blue   { background:var(--cyan-glow); border-color:rgba(0,245,228,.12); color:var(--cyan); }

  /* ── History rows ── */
  .hist-row { border:1px solid var(--border); border-radius:10px; padding:14px 16px; transition:background .15s, border-color .15s; }
  .hist-row:hover { background:rgba(255,255,255,0.018); border-color:var(--border2); }

  /* ── Loading ── */
  .loading-bar { height:2px; background:var(--surface3); border-radius:99px; overflow:hidden; width:200px; margin:0 auto; }
  .loading-bar-inner { height:100%; width:35%; background:linear-gradient(90deg,transparent,var(--cyan),transparent); animation:bar-slide 1.6s ease infinite; }

  /* ── Tags ── */
  .tag { font-size:11px; padding:3px 9px; border-radius:20px; font-weight:700; }
  .tag-high  { background:var(--red-dim);   color:var(--red); }
  .tag-low   { background:var(--green-dim); color:var(--green); }

  /* ── Alerts ── */
  .form-error   { background:var(--red-dim); border:1px solid var(--red-border); border-radius:var(--radius-sm); padding:10px 14px; color:#ffa0b0; font-size:13px; }
  .form-success { background:var(--green-dim); border:1px solid var(--green-border); border-radius:var(--radius-sm); padding:10px 14px; color:var(--green); font-size:13px; }

  /* ── Grids ── */
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
  .g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .flex-row     { display:flex; align-items:center; gap:10px; }
  .flex-between { display:flex; align-items:center; justify-content:space-between; }
  .scroll-y     { overflow-y:auto; }
  .scroll-y::-webkit-scrollbar { width:4px; }
  .scroll-y::-webkit-scrollbar-thumb { background:rgba(0,245,228,0.12); border-radius:99px; }
`;