import React, { useState, useEffect } from 'react'
import { uploadCSVFile } from '../api.js'

export default function UploadPanel({
  open,
  onClose,
  fromDate,
  toDate,
  onApplyFilter,
  onUploadSuccess,
}) {
  const [fileName, setFileName] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)

  const [localFrom, setLocalFrom] = useState(fromDate || '2021-01-01')
  const [localTo, setLocalTo] = useState(toDate || '2026-12-31')

  useEffect(() => {
    setLocalFrom(fromDate || '2021-01-01')
    setLocalTo(toDate || '2026-12-31')
  }, [fromDate, toDate])

  if (!open) return null

  async function handleFiles(files) {
    if (!files || !files[0]) return
    const file = files[0]
    setFileName(file.name)
    setUploading(true)
    setError(null)
    setSummary(null)

    try {
      const summaryData = await uploadCSVFile(file)
      setSummary(summaryData)
      // Update local date range to match the uploaded dataset
      const newFrom = summaryData.date_min || localFrom
      const newTo   = summaryData.date_max || localTo
      setLocalFrom(newFrom)
      setLocalTo(newTo)
      // Notify App immediately — this bumps refreshKey → triggers fresh fetch
      if (onUploadSuccess) {
        onUploadSuccess(summaryData)
      }
    } catch (err) {
      setError(err.message || 'CSV upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleAnalyze() {
    onApplyFilter(localFrom, localTo)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Upload Sales CSV</div>
            <div className="modal-sub">Data will be cleaned, deduplicated and validated automatically</div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <label
          className={`dropzone ${dragOver ? 'over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 3v13M6 9l6-6 6 6"/><path d="M4 21h16"/></svg>
          <div className="dz-text">
            {uploading ? 'Cleaning and validating dataset...' : (fileName ? fileName : 'Drag a .csv here, or click to browse')}
          </div>
          <div className="dz-hint mono">Retail sales data · date, product, units, price</div>
          <input type="file" accept=".csv" hidden onChange={e => handleFiles(e.target.files)} disabled={uploading} />
        </label>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {summary && (
          <div className="summary-box">
            <div className="summary-title success-title">✅ Upload Successful — Dashboard Refreshed</div>
            <div className="summary-grid mono">
              <div><span>Rows Processed:</span> <strong>{summary.rows_before.toLocaleString()} → {summary.rows_after.toLocaleString()}</strong></div>
              <div><span>Missing Values Imputed:</span> <strong>{summary.nulls_imputed.toLocaleString()}</strong></div>
              <div><span>Duplicates Removed:</span> <strong>{summary.duplicates_removed.toLocaleString()}</strong></div>
              {summary.date_min && <div><span>Date Range:</span> <strong>{summary.date_min} → {summary.date_max}</strong></div>}
            </div>
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <label>From</label>
            <input type="date" value={localFrom} onChange={e => setLocalFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>To</label>
            <input type="date" value={localTo} onChange={e => setLocalTo(e.target.value)} />
          </div>
        </div>

        <button className="analyze-btn" onClick={handleAnalyze} disabled={uploading}>
          {uploading ? 'Processing...' : 'Analyze Data'}
        </button>
      </div>

      <style>{`
        .modal-backdrop{
          position:fixed; inset:0; background: rgba(6,10,8,0.72); backdrop-filter: blur(4px);
          display:flex; align-items:center; justify-content:center; z-index:50;
          animation: fadeUp .2s ease;
        }
        .modal{
          width:440px; max-width:92vw; background: var(--surface); border:1px solid var(--border);
          border-radius:18px; padding:24px; animation: unfurl .3s cubic-bezier(.2,.8,.2,1);
        }
        .modal-head{ display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:18px; }
        .modal-title{ font-family:var(--font-display); font-weight:700; font-size:16px; }
        .modal-sub{ font-size:11.5px; color:var(--text-dim); margin-top:4px; max-width:320px; }
        .close-btn{ background:none; border:none; color:var(--text-dim); font-size:14px; cursor:pointer; }
        .close-btn:hover{ color:var(--text); }

        .dropzone{
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
          border:1.5px dashed var(--border); border-radius:14px; padding:26px 16px;
          color:var(--text-muted); cursor:pointer; transition: border-color .15s ease, background .15s ease;
          margin-bottom:14px;
        }
        .dropzone.over, .dropzone:hover{ border-color: var(--gold); background: var(--gold-dim); }
        .dz-text{ font-size:13px; font-weight:500; color:var(--text); text-align:center; }
        .dz-hint{ font-size:10px; color:var(--text-dim); }

        .error-banner{
          background: rgba(255,107,92,0.12); border:1px solid rgba(255,107,92,0.3);
          border-radius:10px; padding:10px 12px; color:var(--coral); font-size:12px; margin-bottom:14px;
        }

        .summary-box{
          background: var(--surface-2); border:1px solid var(--border); border-radius:10px;
          padding:12px 14px; margin-bottom:14px;
        }
        .summary-title{ font-size:11px; font-weight:700; color:var(--gold); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px; }
        .success-title{ color: var(--emerald) !important; }
        .summary-grid{ font-size:11px; color:var(--text-muted); display:flex; flex-direction:column; gap:4px; }
        .summary-grid div{ display:flex; justify-content:space-between; }
        .summary-grid strong{ color:var(--text); }

        .field-row{ display:flex; gap:12px; margin-bottom:20px; }
        .field{ flex:1; display:flex; flex-direction:column; gap:6px; }
        .field label{ font-size:10.5px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.06em; }
        .field input{
          background: var(--surface-2); border:1px solid var(--border); border-radius:9px;
          padding:9px 10px; color:var(--text); font-size:12.5px;
        }

        .analyze-btn{
          width:100%; background: linear-gradient(135deg, var(--gold), #C9932E); color:#241A05;
          border:none; border-radius:11px; padding:12px; font-weight:700; font-size:13.5px;
          box-shadow: 0 10px 22px -8px rgba(232,184,75,0.55); cursor:pointer;
          transition: transform .15s ease;
        }
        .analyze-btn:hover:not(:disabled){ transform: translateY(-1px); }
        .analyze-btn:disabled{ opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
