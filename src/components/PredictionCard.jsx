import React from 'react'

export default function PredictionCard({ prediction }) {
  if (!prediction) return null

  return (
    <div className="pred-card">
      <div className="pred-head">
        <div className="pred-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>
          Predicted Next Month Sales
        </div>
        <div className="pred-method mono">{prediction.method}</div>
      </div>

      <div className="pred-body">
        <div className="pred-main">
          <div className="pred-value mono">{prediction.value}</div>
          <div className="pred-month">Target Period: <strong>{prediction.nextMonth}</strong></div>
          <div className="pred-range mono">Estimated 95% Bound: {prediction.range}</div>
        </div>

        <div className="pred-stats">
          <div className="stat-box">
            <div className="stat-label">Confidence Rating</div>
            <div className="stat-value mono">{prediction.confidence}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Model R² Score</div>
            <div className="stat-value mono">{prediction.r2}</div>
          </div>
        </div>
      </div>

      <style>{`
        .pred-card{
          background: linear-gradient(145deg, var(--surface-2), var(--surface));
          border:1px solid rgba(245,158,11,0.3); border-radius:16px;
          padding:24px 28px; animation: fadeUp .5s ease .26s both;
          position:relative; overflow:hidden;
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.5);
          margin-bottom: 10px;
        }
        .pred-card::before{
          content:''; position:absolute; top:-40px; right:-40px; width:160px; height:160px;
          background: radial-gradient(circle, rgba(245,158,11,0.18), transparent 70%);
          pointer-events:none;
        }
        .pred-head{
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:16px; flex-wrap:wrap; gap:10px;
        }
        .pred-badge{
          display:inline-flex; align-items:center; gap:7px;
          font-family:var(--font-mono); font-size:10.5px; letter-spacing:0.06em; text-transform:uppercase;
          color: var(--gold); background: var(--gold-dim); border:1px solid rgba(245,158,11,0.35);
          padding:5px 12px; border-radius:20px; font-weight:600;
        }
        .pred-method{ font-size:11px; color:var(--text-dim); }

        .pred-body{
          display:flex; align-items:center; justify-content:space-between;
          gap:24px; flex-wrap:wrap;
        }
        .pred-main{ flex:1; min-width:240px; }
        .pred-value{
          font-size:36px; font-weight:800; color:var(--text);
          letter-spacing:-0.02em; line-height:1.1;
        }
        .pred-month{ font-size:13px; color:var(--text-muted); margin-top:6px; }
        .pred-month strong{ color:var(--text); }
        .pred-range{ font-size:12px; color:var(--text-dim); margin-top:8px; }

        .pred-stats{ display:flex; gap:16px; flex-wrap:wrap; }
        .stat-box{
          background: var(--surface); border:1px solid var(--border);
          border-radius:12px; padding:12px 18px; min-width:130px;
        }
        .stat-label{ font-size:10px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.06em; }
        .stat-value{ font-size:17px; font-weight:700; margin-top:4px; color:var(--gold); }
      `}</style>
    </div>
  )
}
