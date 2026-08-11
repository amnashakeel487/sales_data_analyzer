import React from 'react'

const NAV = [
  { key: 'overview', label: 'Overview', icon: '◧' },
  { key: 'trends', label: 'Trends', icon: '⟋' },
  { key: 'products', label: 'Products', icon: '▤' },
  { key: 'predictions', label: 'Predictions', icon: '✦' },
  { key: 'reports', label: 'Reports', icon: '▥' },
]

export default function Sidebar({ active, onSelect, fromDate, toDate }) {
  const fromYear = fromDate ? fromDate.split('-')[0] : '2021'
  const toYear = toDate ? toDate.split('-')[0] : '2026'

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">T</div>
        <div>
          <div className="brand-name">Tally</div>
          <div className="brand-sub">Sales Analyzer</div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map(item => (
          <button
            key={item.key}
            className={`nav-item ${active === item.key ? 'active' : ''}`}
            onClick={() => onSelect(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="foot-label">Data range</div>
        <div className="foot-value mono">{fromYear} — {toYear}</div>
      </div>

      <style>{`
        .sidebar{
          width: 236px; min-width: 236px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display:flex; flex-direction:column;
          padding: 26px 16px;
        }
        .brand{ display:flex; align-items:center; gap:11px; padding:0 6px; margin-bottom:34px; }
        .brand-mark{
          width:36px; height:36px; border-radius:9px;
          background: linear-gradient(135deg, var(--gold), #C9932E);
          color:#1F1905; font-family:var(--font-display); font-weight:800; font-size:17px;
          display:flex; align-items:center; justify-content:center;
          box-shadow: 0 4px 12px rgba(245,158,11,0.25);
        }
        .brand-name{ font-family:var(--font-display); font-weight:800; font-size:16.5px; letter-spacing:-0.01em; }
        .brand-sub{ font-family:var(--font-mono); font-size:10px; letter-spacing:0.12em; color:var(--text-dim); text-transform:uppercase; margin-top:2px; }

        .nav{ display:flex; flex-direction:column; gap:3px; margin-bottom:auto; }
        .nav-item{
          display:flex; align-items:center; gap:12px;
          background:transparent; border:none; color:var(--text-muted);
          padding:11px 12px; border-radius:10px; font-size:13.5px; font-weight:500;
          text-align:left; transition: background .15s ease, color .15s ease, transform .15s ease;
          position:relative; cursor:pointer;
        }
        .nav-item:hover{ background: var(--surface-2); color:var(--text); }
        .nav-item.active{ background: var(--gold-dim); color: var(--gold); font-weight:600; }
        .nav-item.active::before{
          content:''; position:absolute; left:-16px; top:50%; transform:translateY(-50%);
          width:3px; height:18px; border-radius:3px; background: var(--gold);
        }
        .nav-icon{ width:16px; text-align:center; font-size:13px; }

        .sidebar-foot{
          padding:14px 12px; border-radius:11px; background: var(--surface-2);
          border:1px solid var(--border-soft);
        }
        .foot-label{ font-family:var(--font-mono); font-size:9.5px; letter-spacing:0.1em; color:var(--text-dim); text-transform:uppercase; }
        .foot-value{ font-size:13px; color:var(--text); margin-top:4px; font-weight:500; }
      `}</style>
    </aside>
  )
}
