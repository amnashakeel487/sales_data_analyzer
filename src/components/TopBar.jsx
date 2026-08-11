import React from 'react'

function formatDateLabel(dStr, fallback) {
  if (!dStr) return fallback
  try {
    const parts = dStr.split('-')
    if (parts.length >= 2) {
      const year = parts[0]
      const monthIndex = parseInt(parts[1], 10) - 1
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${months[monthIndex]} ${year}`
    }
  } catch (e) {}
  return dStr
}

const TAB_TITLES = {
  overview:    { title: 'Overview',            sub: '5-year sales history · cleaned & deduplicated' },
  trends:      { title: 'Sales Trends',        sub: 'Monthly revenue patterns, quarterly aggregates & variable correlations' },
  products:    { title: 'Product Performance', sub: 'Top best-selling products ranked by revenue and growth' },
  predictions: { title: 'Revenue Forecast',   sub: 'Scikit-learn linear regression model & confidence analysis' },
  reports:     { title: 'Reports & Export',    sub: 'Data cleaning audit summary & PDF executive report generator' },
}

const CURRENCIES = [
  { code: 'PKR', symbol: 'Rs',  label: 'Pakistani Rupee (Rs)' },
  { code: 'USD', symbol: '$',   label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€',   label: 'Euro (€)' },
  { code: 'GBP', symbol: '£',   label: 'British Pound (£)' },
  { code: 'INR', symbol: '₹',   label: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$',  label: 'Australian Dollar (A$)' },
]

export default function TopBar({
  activeTab, fromDate, toDate,
  currency, onCurrencyChange,
  onUploadClick, onExportClick, exporting
}) {
  const fromLabel = formatDateLabel(fromDate, 'Jan 2021')
  const toLabel   = formatDateLabel(toDate,   'Dec 2026')
  const meta = TAB_TITLES[activeTab] || TAB_TITLES.overview
  const activeCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]

  return (
    <header className="topbar">
      <div>
        <h1 className="title">{meta.title}</h1>
        <p className="subtitle">{meta.sub}</p>
      </div>

      <div className="actions">
        {/* Date range badge */}
        <div className="range-picker mono">
          <span>{fromLabel}</span>
          <span className="range-sep">→</span>
          <span>{toLabel}</span>
        </div>

        {/* Currency selector */}
        <div className="currency-wrap">
          <div className="currency-badge mono">
            <span className="currency-icon">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M8 7h6a3 3 0 0 1 0 6H8m0 0h7"/></svg>
            </span>
            <span>{activeCurrency.symbol} {activeCurrency.code}</span>
          </div>
          <select
            className="currency-select"
            value={currency}
            onChange={e => onCurrencyChange(e.target.value)}
            aria-label="Select currency"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.symbol} — {c.label}</option>
            ))}
          </select>
        </div>

        <button className="btn ghost" onClick={onUploadClick}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v13M6 9l6-6 6 6"/><path d="M4 21h16"/></svg>
          Upload CSV
        </button>
        <button className="btn primary" onClick={onExportClick} disabled={exporting}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 15V3M8 11l4 4 4-4"/><path d="M4 21h16"/></svg>
          {exporting ? 'Generating…' : 'Export PDF'}
        </button>
      </div>

      <style>{`
        .topbar{
          display:flex; align-items:center; justify-content:space-between;
          padding: 20px 32px; border-bottom:1px solid var(--border);
          gap:16px; flex-wrap:wrap;
        }
        .title{ font-family:var(--font-display); font-size:20px; font-weight:800; letter-spacing:-0.01em; }
        .subtitle{ font-size:12px; color:var(--text-dim); margin-top:3px; }

        .actions{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .range-picker{
          display:flex; align-items:center; gap:8px;
          font-size:11.5px; color:var(--text-muted);
          background: var(--surface-2); border:1px solid var(--border);
          padding:8px 13px; border-radius:10px;
        }
        .range-sep{ color:var(--text-dim); }

        /* ---- Currency selector ---- */
        .currency-wrap{
          position:relative; display:flex; align-items:center;
        }
        .currency-badge{
          display:flex; align-items:center; gap:6px;
          font-size:12px; font-weight:700; color:var(--gold);
          background: var(--gold-dim); border:1px solid rgba(245,158,11,0.35);
          padding:8px 13px; border-radius:10px; pointer-events:none;
          white-space:nowrap;
        }
        .currency-icon{ display:flex; align-items:center; }
        .currency-select{
          position:absolute; inset:0; opacity:0; cursor:pointer;
          width:100%; border:none; appearance:none;
        }
        .currency-wrap:hover .currency-badge{
          background: rgba(245,158,11,0.22);
          border-color: rgba(245,158,11,0.55);
        }

        .btn{
          display:flex; align-items:center; gap:7px; cursor:pointer;
          border-radius:10px; padding:9px 14px; font-size:12.5px; font-weight:600;
          border:1px solid transparent;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
          white-space:nowrap;
        }
        .btn:disabled{ opacity:.7; cursor:not-allowed; }
        .btn.ghost{
          background: var(--surface-2); color:var(--text); border-color: var(--border);
        }
        .btn.ghost:hover{ background: var(--surface-3); transform: translateY(-1px); }
        .btn.primary{
          background: linear-gradient(135deg, var(--gold), #C9932E);
          color:#1F1905;
          box-shadow: 0 8px 18px -8px rgba(245,158,11,0.4);
        }
        .btn.primary:hover:not(:disabled){ transform: translateY(-1px); box-shadow: 0 10px 22px -6px rgba(245,158,11,0.55); }
        .btn.primary:active,.btn.ghost:active{ transform:translateY(0); }
      `}</style>
    </header>
  )
}
