import React from 'react'

export default function QuarterlyBar({ data, currencySymbol = 'Rs ' }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.value))

  return (
    <div className="qb-card">
      <div className="chart-title">Quarterly Sales</div>
      <div className="chart-sub">Total revenue by quarter</div>

      <div className="bars">
        {data.map((d, i) => (
          <div className="bar-col" key={d.q}>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ '--h': `${(d.value / max) * 100}%`, animationDelay: `${0.2 + i * 0.1}s` }}
              />
            </div>
            <div className="bar-value mono">{currencySymbol}{(d.value / 1000).toFixed(0)}k</div>
            <div className="bar-label mono">{d.q}</div>
          </div>
        ))}
      </div>

      <style>{`
        .qb-card{
          background: var(--surface); border:1px solid var(--border); border-radius:16px;
          padding:22px; animation: fadeUp .5s ease .16s both;
        }
        .chart-title{ font-family:var(--font-display); font-weight:700; font-size:15px; }
        .chart-sub{ font-size:11.5px; color:var(--text-dim); margin:2px 0 20px; }
        .bars{ display:flex; align-items:flex-end; justify-content:space-between; gap:14px; height:150px; }
        .bar-col{ flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end; }
        .bar-track{ width:100%; height:100px; display:flex; align-items:flex-end; }
        .bar-fill{
          width:100%; height:0; border-radius:7px 7px 3px 3px;
          background: linear-gradient(180deg, var(--gold), #C9932E);
          animation: growBar .8s cubic-bezier(.2,.8,.2,1) forwards;
        }
        @keyframes growBar{ to{ height: var(--h); } }
        .bar-value{ font-size:11.5px; font-weight:600; margin-top:9px; color:var(--text); }
        .bar-label{ font-size:10px; color:var(--text-dim); margin-top:2px; }
      `}</style>
    </div>
  )
}
