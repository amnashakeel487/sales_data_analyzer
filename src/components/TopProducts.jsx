import React from 'react'

export default function TopProducts({ products, currencySymbol = 'Rs ' }) {
  if (!products || products.length === 0) return null
  const maxRevenue = Math.max(...products.map(p => p.revenue))

  return (
    <div className="tp-card">
      <div className="chart-title">Top 5 Best-Selling Products</div>
      <div className="chart-sub">Ranked by total revenue</div>

      <div className="tp-list">
        {products.map((p, i) => (
          <div className="tp-row" key={p.name} style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
            <div className="tp-rank mono">{String(p.rank).padStart(2, '0')}</div>
            <div className="tp-info">
              <div className="tp-name">{p.name}</div>
              <div className="tp-bar-track">
                <div className="tp-bar-fill" style={{ '--w': `${(p.revenue / maxRevenue) * 100}%` }} />
              </div>
            </div>
            <div className="tp-nums">
              <div className="tp-revenue mono">{currencySymbol}{(p.revenue / 1000).toFixed(1)}k</div>
              <div className={`tp-trend mono ${p.trend >= 0 ? 'pos' : 'neg'}`}>
                {p.trend >= 0 ? '▲' : '▼'} {Math.abs(p.trend)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .tp-card{
          background: var(--surface); border:1px solid var(--border); border-radius:16px;
          padding:22px; animation: fadeUp .5s ease .18s both;
        }
        .chart-title{ font-family:var(--font-display); font-weight:700; font-size:15px; }
        .chart-sub{ font-size:11.5px; color:var(--text-dim); margin:2px 0 16px; }
        .tp-list{ display:flex; flex-direction:column; gap:14px; }
        .tp-row{ display:flex; align-items:center; gap:14px; opacity:0; animation: fadeUp .45s ease forwards; }
        .tp-rank{ font-size:12px; color:var(--gold); width:20px; font-weight:700; }
        .tp-info{ flex:1; min-width:0; }
        .tp-name{ font-size:13px; font-weight:600; margin-bottom:6px; }
        .tp-bar-track{ height:6px; border-radius:4px; background: var(--surface-3); overflow:hidden; }
        .tp-bar-fill{ height:100%; width:0; border-radius:4px; background: linear-gradient(90deg, var(--emerald), #0284C7); animation: growW 1s cubic-bezier(.2,.8,.2,1) forwards; animation-delay:.3s; }
        @keyframes growW{ to{ width: var(--w); } }
        .tp-nums{ text-align:right; min-width:70px; }
        .tp-revenue{ font-size:12.5px; font-weight:600; }
        .tp-trend{ font-size:10.5px; margin-top:2px; font-weight:600; }
        .tp-trend.pos{ color: var(--emerald); }
        .tp-trend.neg{ color: var(--coral); }
      `}</style>
    </div>
  )
}
