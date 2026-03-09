// Shared design system — import this string into each component's <style> tag
export const FONT_LINK = `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap`;

export const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:         #080c14;
    --bg2:        #0d1424;
    --surface:    #111827;
    --surface2:   #1a2436;
    --border:     rgba(255,255,255,0.07);
    --border2:    rgba(255,255,255,0.12);
    --teal:       #0ff4c6;
    --teal2:      #00d4a8;
    --teal-dim:   rgba(15,244,198,0.12);
    --teal-glow:  rgba(15,244,198,0.06);
    --amber:      #fbbf24;
    --amber-dim:  rgba(251,191,36,0.12);
    --red:        #ff5c7c;
    --red-dim:    rgba(255,92,124,0.12);
    --green:      #34d399;
    --green-dim:  rgba(52,211,153,0.1);
    --text:       #e2e8f0;
    --text2:      #94a3b8;
    --text3:      #475569;
    --font-body:  'Plus Jakarta Sans', sans-serif;
    --font-disp:  'Bricolage Grotesque', sans-serif;
    --radius:     14px;
    --radius-sm:  8px;
    --shadow:     0 4px 24px rgba(0,0,0,0.4);
    --shadow-lg:  0 12px 48px rgba(0,0,0,0.6);
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes shimmer  { 0%,100% { opacity:.4; } 50% { opacity:1; } }
  @keyframes pulse-dot { 0%,100% { box-shadow:0 0 0 0 rgba(15,244,198,0.4); } 70% { box-shadow:0 0 0 6px rgba(15,244,198,0); } }
  @keyframes bar-slide { from { transform:translateX(-100%); } to { transform:translateX(200%); } }

  .page-wrap   { display:flex; height:100vh; background:var(--bg); overflow:hidden; }
  .main-col    { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .scroll-area { flex:1; overflow-y:auto; padding:28px 32px; display:flex; flex-direction:column; gap:24px; }
  .scroll-area::-webkit-scrollbar { width:5px; }
  .scroll-area::-webkit-scrollbar-track { background:transparent; }
  .scroll-area::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:99px; }

  /* TOPBAR */
  .topbar { display:flex; justify-content:space-between; align-items:center; padding:16px 32px; background:rgba(13,20,36,0.9); border-bottom:1px solid var(--border); backdrop-filter:blur(20px); flex-shrink:0; }
  .topbar-left h1 { font-family:var(--font-disp); font-size:20px; font-weight:700; color:var(--text); }
  .topbar-left p  { font-size:12px; color:var(--text3); margin-top:2px; }

  /* CARDS */
  .card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px; animation:fadeUp .4s ease both; }
  .card-title { font-family:var(--font-disp); font-size:15px; font-weight:700; color:var(--text); margin-bottom:20px; display:flex; align-items:center; gap:8px; }
  .card-title .dot { width:8px; height:8px; border-radius:50%; background:var(--teal); box-shadow:0 0 8px var(--teal); animation:pulse-dot 2s infinite; }

  /* KPI */
  .kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .kpi { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:22px 24px; position:relative; overflow:hidden; cursor:default; transition:border-color .2s, transform .2s; animation:fadeUp .4s ease both; }
  .kpi:hover { border-color:var(--border2); transform:translateY(-2px); }
  .kpi::after { content:''; position:absolute; inset:0; background:inherit; border-radius:inherit; }
  .kpi-accent { position:absolute; top:0; left:0; right:0; height:2px; border-radius:var(--radius) var(--radius) 0 0; }
  .kpi-label { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--text3); }
  .kpi-value { font-family:var(--font-disp); font-size:40px; font-weight:800; margin-top:10px; line-height:1; }
  .kpi-icon  { position:absolute; right:20px; bottom:20px; font-size:36px; opacity:.12; }
  .kpi-sub   { font-size:12px; color:var(--text3); margin-top:8px; }

  /* TABLE */
  .tbl-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  thead tr { border-bottom:1px solid var(--border); }
  th { padding:10px 14px; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--text3); text-align:left; white-space:nowrap; }
  td { padding:14px 14px; font-size:13.5px; color:var(--text2); border-bottom:1px solid rgba(255,255,255,0.03); vertical-align:middle; }
  tbody tr:last-child td { border-bottom:none; }
  tbody tr { transition:background .15s; }
  tbody tr:hover td { background:rgba(255,255,255,0.02); }
  td.strong { color:var(--text); font-weight:600; }

  /* BADGES */
  .badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600; white-space:nowrap; }
  .badge::before { content:''; width:5px; height:5px; border-radius:50%; }
  .badge-high  { background:var(--red-dim);   color:var(--red);   border:1px solid rgba(255,92,124,.25); }
  .badge-high::before  { background:var(--red); }
  .badge-low   { background:var(--green-dim); color:var(--green); border:1px solid rgba(52,211,153,.2); }
  .badge-low::before   { background:var(--green); }
  .badge-info  { background:var(--teal-dim);  color:var(--teal);  border:1px solid rgba(15,244,198,.2); }
  .badge-amber { background:var(--amber-dim); color:var(--amber); border:1px solid rgba(251,191,36,.25); }

  /* BUTTONS */
  .btn { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:var(--radius-sm); font-size:13px; font-weight:600; font-family:var(--font-body); cursor:pointer; border:none; transition:all .2s; white-space:nowrap; }
  .btn-primary { background:linear-gradient(135deg,var(--teal),var(--teal2)); color:#080c14; }
  .btn-primary:hover { box-shadow:0 0 20px rgba(15,244,198,.35); transform:translateY(-1px); }
  .btn-ghost   { background:rgba(255,255,255,0.05); border:1px solid var(--border2); color:var(--text2); }
  .btn-ghost:hover { background:rgba(255,255,255,0.08); color:var(--text); }
  .btn-danger  { background:var(--red-dim); border:1px solid rgba(255,92,124,.25); color:var(--red); }
  .btn-danger:hover { background:rgba(255,92,124,.2); }
  .btn-amber   { background:linear-gradient(135deg,#fbbf24,#f59e0b); color:#080c14; }
  .btn-amber:hover { box-shadow:0 0 20px rgba(251,191,36,.3); transform:translateY(-1px); }
  .btn:disabled { opacity:.5; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
  .btn-sm { padding:6px 13px; font-size:12px; }
  .btn-icon { width:34px; height:34px; padding:0; justify-content:center; border-radius:var(--radius-sm); }

  /* INPUTS */
  .field { display:flex; flex-direction:column; gap:6px; }
  .field label { font-size:11px; font-weight:600; letter-spacing:.07em; text-transform:uppercase; color:var(--text3); }
  .inp { padding:10px 14px; background:rgba(255,255,255,0.04); border:1px solid var(--border2); border-radius:var(--radius-sm); color:var(--text); font-size:13.5px; font-family:var(--font-body); outline:none; transition:border-color .2s, box-shadow .2s; width:100%; }
  .inp:focus { border-color:var(--teal); box-shadow:0 0 0 3px rgba(15,244,198,.1); }
  .inp::placeholder { color:var(--text3); }
  select.inp option { background:var(--surface); }

  /* AVATAR */
  .avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--teal),var(--teal2)); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; color:#080c14; flex-shrink:0; }

  /* INSIGHT ITEMS */
  .insight { display:flex; align-items:flex-start; gap:12px; padding:13px 16px; border-radius:10px; font-size:13px; line-height:1.5; border:1px solid transparent; }
  .insight-red    { background:var(--red-dim);   border-color:rgba(255,92,124,.2);  color:#fda4b4; }
  .insight-orange { background:rgba(249,115,22,.09); border-color:rgba(249,115,22,.2); color:#fdba74; }
  .insight-green  { background:var(--green-dim); border-color:rgba(52,211,153,.2);  color:#6ee7b7; }
  .insight-blue   { background:var(--teal-glow); border-color:rgba(15,244,198,.15); color:var(--teal); }

  /* HISTORY ENTRIES */
  .hist-row { border:1px solid var(--border); border-radius:10px; padding:14px 16px; transition:background .15s; }
  .hist-row:hover { background:rgba(255,255,255,0.02); border-color:var(--border2); }

  /* LOADING BAR */
  .loading-bar { height:2px; background:var(--surface2); border-radius:99px; overflow:hidden; width:180px; margin:0 auto; }
  .loading-bar-inner { height:100%; width:40%; background:linear-gradient(90deg,transparent,var(--teal),transparent); animation:bar-slide 1.4s ease infinite; }

  /* SECTION LABEL */
  .section-label { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--text3); padding:0 20px; margin-bottom:4px; margin-top:8px; }

  /* DIVIDER */
  .divider { height:1px; background:var(--border); margin:4px 0; }

  /* TAG chips */
  .tag { font-size:11px; padding:3px 9px; border-radius:20px; font-weight:600; }
  .tag-high  { background:var(--red-dim); color:var(--red); }
  .tag-low   { background:var(--green-dim); color:var(--green); }

  /* ALERT in forms */
  .form-error { background:var(--red-dim); border:1px solid rgba(255,92,124,.3); border-radius:var(--radius-sm); padding:10px 14px; color:#fda4b4; font-size:13px; }
  .form-success { background:var(--green-dim); border:1px solid rgba(52,211,153,.25); border-radius:var(--radius-sm); padding:10px 14px; color:var(--green); font-size:13px; }

  /* GRID helpers */
  .g2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
  .g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .flex-row { display:flex; align-items:center; gap:10px; }
  .flex-between { display:flex; align-items:center; justify-content:space-between; }
  .gap-sm { gap:8px; }
  .gap-md { gap:14px; }
  .mt-sm { margin-top:10px; }
  .mt-md { margin-top:18px; }
  .scroll-y { overflow-y:auto; }
  .scroll-y::-webkit-scrollbar { width:4px; }
  .scroll-y::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:99px; }
`;