import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import ReceiptSummary from './components/ReceiptSummary.jsx'
import TrendChart from './components/TrendChart.jsx'
import QuarterlyBar from './components/QuarterlyBar.jsx'
import CorrelationHeatmap from './components/CorrelationHeatmap.jsx'
import TopProducts from './components/TopProducts.jsx'
import PredictionCard from './components/PredictionCard.jsx'
import UploadPanel from './components/UploadPanel.jsx'

import { fetchDashboard, downloadPDFReport } from './api.js'

const CURRENCY_SYMBOLS = {
  PKR: 'Rs ',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'A$',
}

export default function App() {
  const [active, setActive]         = useState('overview')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [fromDate, setFromDate]     = useState('2021-01-01')
  const [toDate, setToDate]         = useState('2026-12-31')
  const [currency, setCurrency]     = useState('PKR')
  const [dashboardData, setData]    = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [exporting, setExporting]   = useState(false)
  // ← KEY FIX: increment this to force a re-fetch even when dates haven't changed
  const [refreshKey, setRefreshKey] = useState(0)

  const currencySymbol = CURRENCY_SYMBOLS[currency] || 'Rs '

  const loadData = useCallback(async (from, to, curr) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDashboard(from, to, curr)
      setData(data)
    } catch (err) {
      setError(err.message || 'Unable to connect to backend server.')
    } finally {
      setLoading(false)
    }
  }, []) // no deps — arguments always passed explicitly

  // Re-fetch whenever dates, currency, OR refreshKey change
  useEffect(() => {
    loadData(fromDate, toDate, currency)
  }, [fromDate, toDate, currency, refreshKey, loadData])

  const handleApplyFilter = (from, to) => {
    setFromDate(from)
    setToDate(to)
  }

  const handleUploadSuccess = (summaryData) => {
    // Update date range from the newly uploaded CSV
    const newFrom = summaryData.date_min || fromDate
    const newTo   = summaryData.date_max || toDate
    setFromDate(newFrom)
    setToDate(newTo)
    // ALWAYS bump refreshKey so useEffect fires a fresh fetch,
    // even if the date range is identical to what was already set
    setRefreshKey(k => k + 1)
  }

  const handleCurrencyChange = (code) => {
    setCurrency(code)
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await downloadPDFReport(fromDate, toDate, currency)
    } catch (err) {
      alert(`Export failed: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="app">
      <Sidebar active={active} onSelect={setActive} fromDate={fromDate} toDate={toDate} />

      <div className="app-main">
        <TopBar
          activeTab={active}
          fromDate={fromDate}
          toDate={toDate}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          onUploadClick={() => setUploadOpen(true)}
          onExportClick={handleExportPDF}
          exporting={exporting}
        />

        <div className="content">
          {error && (
            <div className="error-card">
              <div className="error-title">⚠️ Connection or Data Error</div>
              <div className="error-msg">{error}</div>
              <button className="retry-btn" onClick={() => setRefreshKey(k => k + 1)}>Retry Connection</button>
            </div>
          )}

          {loading && (
            <div className="loading-container">
              <div className="spinner" />
              <div className="loading-text mono">
                {dashboardData ? 'Refreshing data...' : 'Computing analytics & ML predictions...'}
              </div>
            </div>
          )}

          {!loading && dashboardData && active === 'overview' && (
            <div className="tab-page">
              <ReceiptSummary kpis={dashboardData.kpis} />
              <div className="grid-2">
                <TrendChart data={dashboardData.monthly_trend} forecast={dashboardData.forecast} />
                <QuarterlyBar data={dashboardData.quarterly} currencySymbol={currencySymbol} />
              </div>
              <div className="grid-2">
                <CorrelationHeatmap labels={dashboardData.correlation_labels} matrix={dashboardData.correlation_matrix} />
                <TopProducts products={dashboardData.top_products} currencySymbol={currencySymbol} />
              </div>
              <PredictionCard prediction={dashboardData.prediction} />
            </div>
          )}

          {!loading && dashboardData && active === 'trends' && (
            <div className="tab-page">
              <TrendChart data={dashboardData.monthly_trend} forecast={dashboardData.forecast} />
              <div className="grid-2">
                <QuarterlyBar data={dashboardData.quarterly} currencySymbol={currencySymbol} />
                <CorrelationHeatmap labels={dashboardData.correlation_labels} matrix={dashboardData.correlation_matrix} />
              </div>
            </div>
          )}

          {!loading && dashboardData && active === 'products' && (
            <div className="tab-page">
              <TopProducts products={dashboardData.top_products} currencySymbol={currencySymbol} />
              <div className="detail-card">
                <div className="card-title">Product Sales Performance Detail</div>
                <div className="prod-table-wrap">
                  <table className="prod-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Product Name</th>
                        <th>Units Sold</th>
                        <th>Total Revenue</th>
                        <th>PoP Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.top_products.map(p => (
                        <tr key={p.rank}>
                          <td className="mono">#{p.rank}</td>
                          <td><strong>{p.name}</strong></td>
                          <td className="mono">{p.units.toLocaleString()}</td>
                          <td className="mono">{currencySymbol}{p.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className={`mono ${p.trend >= 0 ? 'pos' : 'neg'}`}>
                            {p.trend >= 0 ? '▲' : '▼'} {Math.abs(p.trend)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!loading && dashboardData && active === 'predictions' && (
            <div className="tab-page">
              <PredictionCard prediction={dashboardData.prediction} />
              <div className="detail-card">
                <div className="card-title">Machine Learning Model Architecture</div>
                <div className="model-grid">
                  <div className="model-stat">
                    <div className="stat-lbl">Algorithm</div>
                    <div className="stat-val mono">Ordinary Least Squares (OLS) Linear Regression</div>
                  </div>
                  <div className="model-stat">
                    <div className="stat-lbl">Goodness of Fit (R²)</div>
                    <div className="stat-val mono">{dashboardData.prediction.r2}</div>
                  </div>
                  <div className="model-stat">
                    <div className="stat-lbl">Confidence Level</div>
                    <div className="stat-val mono">{dashboardData.prediction.confidence}</div>
                  </div>
                  <div className="model-stat">
                    <div className="stat-lbl">Active Currency</div>
                    <div className="stat-val mono">{currencySymbol} ({currency})</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && dashboardData && active === 'reports' && (
            <div className="tab-page">
              <div className="export-banner-card">
                <div>
                  <div className="eb-title">Executive PDF Sales Report</div>
                  <div className="eb-sub">
                    Includes full KPI breakdown, top 5 products, monthly revenue tables, and predictive forecast.
                    Report will use <strong>{currency}</strong> ({currencySymbol}) as the currency.
                  </div>
                </div>
                <button className="btn primary" onClick={handleExportPDF} disabled={exporting}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 15V3M8 11l4 4 4-4"/><path d="M4 21h16"/></svg>
                  {exporting ? 'Generating PDF...' : 'Download PDF Report'}
                </button>
              </div>

              {dashboardData.cleaning_summary && (
                <div className="detail-card">
                  <div className="card-title">Active Dataset Audit &amp; Cleaning Log</div>
                  <div className="audit-grid mono">
                    <div className="audit-item"><span>Raw Rows Uploaded:</span><strong>{dashboardData.cleaning_summary.rows_before.toLocaleString()}</strong></div>
                    <div className="audit-item"><span>Cleaned Rows Retained:</span><strong>{dashboardData.cleaning_summary.rows_after.toLocaleString()}</strong></div>
                    <div className="audit-item"><span>Duplicate Rows Removed:</span><strong>{dashboardData.cleaning_summary.duplicates_removed.toLocaleString()}</strong></div>
                    <div className="audit-item"><span>Missing Values Imputed:</span><strong>{dashboardData.cleaning_summary.nulls_imputed.toLocaleString()}</strong></div>
                  </div>
                </div>
              )}

              <ReceiptSummary kpis={dashboardData.kpis} />
            </div>
          )}
        </div>
      </div>

      <UploadPanel
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        fromDate={fromDate}
        toDate={toDate}
        onApplyFilter={handleApplyFilter}
        onUploadSuccess={(summaryData) => {
          handleUploadSuccess(summaryData)
          setUploadOpen(false) // auto-close modal after successful upload
        }}
      />

      <style>{`
        .app{ display:flex; height:100vh; overflow:hidden; }
        .app-main{ flex:1; display:flex; flex-direction:column; min-width:0; }
        .content{
          flex:1; overflow-y:auto; padding: 26px 32px 100px;
          display:flex; flex-direction:column; gap:24px;
        }
        .grid-2{ display:grid; grid-template-columns: 1.4fr 1fr; gap:20px; }
        .tab-page{ display:flex; flex-direction:column; gap:24px; animation: fadeUp .3s ease; padding-bottom: 20px; }

        @media (max-width: 1050px){
          .grid-2{ grid-template-columns: 1fr; }
          .app > :first-child{ display:none; }
        }

        .loading-container{
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          min-height:300px; gap:14px;
        }
        .spinner{
          width:32px; height:32px; border:3px solid var(--border);
          border-top-color: var(--gold); border-radius:50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text{ font-size:12px; color:var(--text-dim); }

        .error-card{
          background: rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.3);
          border-radius:14px; padding:18px 22px; color:var(--coral);
          display:flex; flex-direction:column; gap:8px; align-items:flex-start;
        }
        .error-title{ font-weight:700; font-size:14px; }
        .error-msg{ font-size:12.5px; color:var(--text); }
        .retry-btn{
          background: var(--surface-2); border:1px solid var(--border); color:var(--text);
          padding:6px 14px; border-radius:8px; font-size:12px; cursor:pointer; margin-top:4px;
        }
        .retry-btn:hover{ background: var(--surface-3); }

        .detail-card{
          background: var(--surface); border:1px solid var(--border); border-radius:16px;
          padding:22px;
        }
        .card-title{ font-family:var(--font-display); font-weight:700; font-size:15px; margin-bottom:16px; }

        .prod-table-wrap{ overflow-x:auto; }
        .prod-table{ width:100%; border-collapse:collapse; text-align:left; font-size:13px; }
        .prod-table th{
          padding:10px 12px; color:var(--text-dim); font-size:11px; text-transform:uppercase;
          letter-spacing:0.06em; border-bottom:1px solid var(--border);
        }
        .prod-table td{ padding:12px; border-bottom:1px solid var(--border-soft); }
        .prod-table tr:last-child td{ border-bottom:none; }
        .pos{ color: var(--emerald); }
        .neg{ color: var(--coral); }

        .model-grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px; }
        .model-stat{ background:var(--surface-2); border:1px solid var(--border); border-radius:12px; padding:14px; }
        .stat-lbl{ font-size:10.5px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.06em; }
        .stat-val{ font-size:14px; font-weight:600; color:var(--text); margin-top:6px; }

        .export-banner-card{
          background: linear-gradient(135deg, var(--surface-2), var(--surface));
          border:1px solid var(--border); border-radius:16px; padding:22px;
          display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap;
        }
        .eb-title{ font-family:var(--font-display); font-weight:700; font-size:16px; }
        .eb-sub{ font-size:12px; color:var(--text-dim); margin-top:4px; max-width:480px; }
        .eb-sub strong{ color:var(--gold); }

        .audit-grid{ display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:14px; font-size:12px; }
        .audit-item{
          background:var(--surface-2); border:1px solid var(--border); border-radius:10px; padding:12px;
          display:flex; flex-direction:column; gap:4px;
        }
        .audit-item span{ color:var(--text-dim); font-size:10.5px; text-transform:uppercase; }
        .audit-item strong{ color:var(--text); font-size:15px; }

        .btn{
          display:flex; align-items:center; gap:7px; cursor:pointer;
          border-radius:10px; padding:9px 14px; font-size:12.5px; font-weight:600;
          border:1px solid transparent;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
          white-space:nowrap;
        }
        .btn:disabled{ opacity:.7; cursor:not-allowed; }
        .btn.ghost{ background: var(--surface-2); color:var(--text); border-color: var(--border); }
        .btn.ghost:hover{ background: var(--surface-3); transform: translateY(-1px); }
        .btn.primary{
          background: linear-gradient(135deg, var(--gold), #C9932E); color:#1F1905;
          box-shadow: 0 8px 18px -8px rgba(245,158,11,0.4);
        }
        .btn.primary:hover:not(:disabled){ transform: translateY(-1px); box-shadow: 0 10px 22px -6px rgba(245,158,11,0.55); }
      `}</style>
    </div>
  )
}
