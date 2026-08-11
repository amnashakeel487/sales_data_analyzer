import React from 'react'

function cellColor(v) {
  // v from -1 to 1 -> coral (negative) through surface to electric cyan (positive)
  if (v >= 0) {
    const a = Math.min(1, v)
    return `rgba(56,189,248,${0.14 + a * 0.65})`
  }
  const a = Math.min(1, -v)
  return `rgba(248,113,113,${0.14 + a * 0.65})`
}

export default function CorrelationHeatmap({ labels, matrix }) {
  if (!labels || !matrix) return null

  return (
    <div className="hm-card">
      <div className="chart-title">Correlation Heatmap</div>
      <div className="chart-sub">Relationship strength between key variables</div>

      <div className="hm-grid" style={{ gridTemplateColumns: `86px repeat(${labels.length}, 1fr)` }}>
        <div />
        {labels.map(l => <div className="hm-col-label mono" key={l}>{l}</div>)}
        {matrix.map((row, i) => (
          <React.Fragment key={i}>
            <div className="hm-row-label mono">{labels[i]}</div>
            {row.map((v, j) => (
              <div
                key={j}
                className="hm-cell mono"
                style={{ background: cellColor(v), animationDelay: `${(i * labels.length + j) * 0.02}s` }}
                title={`${labels[i]} × ${labels[j]}: ${v}`}
              >
                {v.toFixed(2)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <style>{`
        .hm-card{
          background: var(--surface); border:1px solid var(--border); border-radius:16px;
          padding:22px; animation: fadeUp .5s ease .22s both;
        }
        .chart-title{ font-family:var(--font-display); font-weight:700; font-size:15px; }
        .chart-sub{ font-size:11.5px; color:var(--text-dim); margin:2px 0 18px; }
        .hm-grid{ display:grid; gap:4px; align-items:center; }
        .hm-col-label{ font-size:9.5px; color:var(--text-dim); text-align:center; padding-bottom:4px; }
        .hm-row-label{ font-size:10px; color:var(--text-muted); padding-right:8px; text-align:right; }
        .hm-cell{
          aspect-ratio:1; display:flex; align-items:center; justify-content:center;
          border-radius:6px; font-size:10.5px; color:var(--text); font-weight:600;
          opacity:0; animation: fadeUp .3s ease forwards;
        }
      `}</style>
    </div>
  )
}
