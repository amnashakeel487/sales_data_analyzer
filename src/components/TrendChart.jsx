import React, { useMemo, useRef, useEffect, useState } from 'react'

const W = 640, H = 220, PAD_L = 44, PAD_B = 26, PAD_T = 16

export default function TrendChart({ data, forecast }) {
  const pathRef = useRef(null)
  const [len, setLen] = useState(0)
  const all = [...data, forecast]
  const max = Math.max(...all.map(d => d.revenue)) * 1.08
  const min = Math.min(...all.map(d => d.revenue)) * 0.9
  const stepX = (W - PAD_L) / (all.length - 1)

  const points = useMemo(() => all.map((d, i) => {
    const x = PAD_L + i * stepX
    const y = PAD_T + (H - PAD_T - PAD_B) * (1 - (d.revenue - min) / (max - min))
    return { x, y, ...d }
  }), [all, max, min, stepX])

  const realPoints = points.slice(0, data.length)
  const forecastSeg = points.slice(data.length - 1)

  const linePath = realPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const forecastPath = forecastSeg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${realPoints[realPoints.length - 1].x} ${H - PAD_B} L ${realPoints[0].x} ${H - PAD_B} Z`

  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()) }, [linePath])

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div>
          <div className="chart-title">Monthly Revenue Trend</div>
          <div className="chart-sub">Actual vs. forecast (linear regression)</div>
        </div>
        <div className="legend">
          <span><i className="dot emerald" /> Actual</span>
          <span><i className="dot gold dashed" /> Forecast</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="trend-svg">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={PAD_L} x2={W} y1={PAD_T + i * (H - PAD_T - PAD_B) / 3} y2={PAD_T + i * (H - PAD_T - PAD_B) / 3} className="grid-line" />
        ))}

        <path d={areaPath} fill="url(#areaFill)" stroke="none" />
        <path ref={pathRef} d={linePath} className="line-actual" style={{ '--len': len, strokeDasharray: len, strokeDashoffset: 0 }} />
        <path d={forecastPath} className="line-forecast" />

        {realPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.2" className="point" style={{ animationDelay: `${0.6 + i * 0.05}s` }} />
        ))}
        <circle cx={forecastSeg[1].x} cy={forecastSeg[1].y} r="4" className="point forecast-point" />

        {points.map((p, i) => (
          <text key={i} x={p.x} y={H - 6} className="axis-label">{p.month}</text>
        ))}
      </svg>

      <style>{`
        .chart-card{
          background: var(--surface); border:1px solid var(--border); border-radius:16px;
          padding:22px 22px 14px; animation: fadeUp .5s ease .1s both;
        }
        .chart-head{ display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10px; }
        .chart-title{ font-family:var(--font-display); font-weight:700; font-size:15px; }
        .chart-sub{ font-size:11.5px; color:var(--text-dim); margin-top:2px; }
        .legend{ display:flex; gap:14px; font-size:11px; color:var(--text-muted); }
        .legend span{ display:flex; align-items:center; gap:6px; }
        .dot{ width:8px; height:8px; border-radius:50%; display:inline-block; }
        .dot.emerald{ background: var(--emerald); }
        .dot.gold{ background: var(--gold); }
        .dot.dashed{ border-radius:2px; }

        .trend-svg{ width:100%; height:220px; overflow:visible; }
        .grid-line{ stroke: var(--border-soft); stroke-width:1; }
        .line-actual{
          fill:none; stroke: var(--emerald); stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round;
          animation: drawLine 1.4s cubic-bezier(.3,.8,.3,1) forwards;
        }
        .line-forecast{
          fill:none; stroke: var(--gold); stroke-width:2.2; stroke-linecap:round;
          stroke-dasharray: 5 5;
          opacity:0; animation: fadeUp .5s ease 1.3s forwards;
        }
        .point{ fill: var(--ink); stroke: var(--emerald); stroke-width:2; opacity:0; animation: fadeUp .3s ease forwards; }
        .forecast-point{ stroke: var(--gold); opacity:0; animation: fadeUp .4s ease 1.5s forwards; }
        .axis-label{ font-family: var(--font-mono); font-size:9px; fill: var(--text-dim); text-anchor:middle; }
      `}</style>
    </div>
  )
}
