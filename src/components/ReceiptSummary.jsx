import React, { useEffect, useRef, useState } from 'react'

function CountUp({ text }) {
  const [display, setDisplay] = useState(text.replace(/[0-9.]/g, m => (m === '.' ? '.' : '0')))
  const ref = useRef(null)

  useEffect(() => {
    const match = text.match(/[\d.]+/)
    if (!match) { setDisplay(text); return }
    const target = parseFloat(match[0].replace(/,/g, ''))
    const prefix = text.slice(0, match.index)
    const suffix = text.slice(match.index + match[0].length)
    const decimals = match[0].includes('.') ? match[0].split('.')[1].length : 0
    const duration = 900
    const start = performance.now()

    function tick(now) {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const current = target * eased
      const formatted = decimals
        ? current.toFixed(decimals)
        : Math.round(current).toLocaleString('en-US')
      setDisplay(`${prefix}${formatted}${suffix}`)
      if (p < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [text])

  return <span>{display}</span>
}

export default function ReceiptSummary({ kpis }) {
  return (
    <div className="receipt-wrap">
      <div className="receipt">
        <div className="r-head">
          <div className="r-store">TALLY — STATEMENT</div>
          <div className="r-meta mono">FY2026 · Q4 SUMMARY</div>
        </div>

        <div className="r-divider" />

        <div className="r-lines">
          {kpis.map((k, i) => (
            <div className="r-line" key={k.label} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
              <span className="r-label">{k.label}</span>
              <span className="r-dots" />
              <span className={`r-value mono ${k.positive ? 'pos' : 'neg'}`}>
                <CountUp text={k.value} />
                <span className="r-delta">{k.delta}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="r-divider" />

        <div className="r-barcode" aria-hidden="true">
          {Array.from({ length: 46 }).map((_, i) => (
            <span key={i} style={{ width: (i * 37) % 3 === 0 ? '3px' : '1.5px' }} />
          ))}
        </div>
        <div className="r-foot mono">GENERATED FROM 5-YEAR RETAIL DATASET</div>
      </div>

      <style>{`
        .receipt-wrap{ display:flex; justify-content:center; padding: 4px 0 6px; }
        .receipt{
          width: 100%; max-width: 620px;
          background: var(--paper);
          color: #241D0E;
          border-radius: 4px;
          padding: 26px 30px 20px;
          position: relative;
          animation: unfurl .55s cubic-bezier(.2,.8,.2,1) both;
          box-shadow: 0 24px 50px -20px rgba(0,0,0,0.55);
          -webkit-mask-image: radial-gradient(circle 5px at 0 100%, transparent 5px, black 5.5px),
                               radial-gradient(circle 5px at 100% 100%, transparent 5px, black 5.5px);
        }
        .receipt::after{
          content:'';
          position:absolute; left:0; right:0; bottom:0; height:12px;
          background-image: radial-gradient(circle 5px, var(--ink) 5px, transparent 5.5px);
          background-size: 16px 12px;
          background-position: 0 6px;
          background-repeat: repeat-x;
        }
        .r-head{ display:flex; align-items:baseline; justify-content:space-between; margin-bottom:14px; }
        .r-store{ font-family:var(--font-display); font-weight:800; font-size:15px; letter-spacing:0.02em; }
        .r-meta{ font-size:10.5px; color:#6B5E3A; letter-spacing:0.05em; }
        .r-divider{ border-top: 1.5px dashed #C9BFA0; margin: 12px 0; }

        .r-lines{ display:flex; flex-direction:column; gap:11px; }
        .r-line{
          display:flex; align-items:baseline; gap:8px;
          opacity:0; animation: fadeUp .5s ease forwards;
        }
        .r-label{ font-size:13px; font-weight:600; white-space:nowrap; }
        .r-dots{ flex:1; border-bottom: 1.5px dotted #B9AD87; transform: translateY(-3px); }
        .r-value{ font-size:14px; font-weight:600; display:flex; align-items:baseline; gap:8px; white-space:nowrap; }
        .r-delta{ font-size:10.5px; font-weight:500; padding:1px 6px; border-radius:20px; }
        .r-value.pos .r-delta{ color:#0369A1; background: rgba(3,105,161,0.14); }
        .r-value.neg .r-delta{ color:#B23A2E; background: rgba(178,58,46,0.13); }

        .r-barcode{ display:flex; align-items:center; gap:2px; height:24px; margin-top:6px; }
        .r-barcode span{ height:100%; background:#241D0E; display:inline-block; }
        .r-foot{ font-size:9px; letter-spacing:0.12em; color:#8A7E5C; margin-top:8px; text-align:center; }
      `}</style>
    </div>
  )
}
