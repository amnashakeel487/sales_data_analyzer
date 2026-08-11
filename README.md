# Tally — Sales Data Analyzer

A full-stack sales analytics dashboard featuring retail data cleaning, period-over-period aggregations, machine learning revenue forecasting, and downloadable PDF report export.

- **Frontend**: React + Vite (SVG dashboard components, responsive dark theme layout)
- **Backend**: Python FastAPI, Pandas, NumPy, Scikit-learn (Linear Regression), fpdf2

---

## Quick Start

### 1. Start the Python Backend

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Run the FastAPI server (listening at http://127.0.0.1:8000)
python backend/run.py
```

*Swagger API docs available at:* `http://127.0.0.1:8000/docs`

### 2. Start the React Frontend

```bash
# Install Node dependencies
npm install

# Start Vite dev server (listening at http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Features & Endpoints

### Data Cleaning & CSV Upload (`POST /api/upload`)
- Accepts any retail sales CSV (`date`, `product`, `units`, `price`, `discount`, `marketing_spend`, `region`, `returned`).
- Normalizes column aliases automatically.
- Imputes missing numerical and categorical values safely.
- Removes duplicate rows.
- Returns a cleaning summary displayed directly in the upload modal (`UploadPanel.jsx`).

### Live Analytics & Date Filtering (`GET /api/dashboard`)
- Query parameters: `from_date` (YYYY-MM-DD), `to_date` (YYYY-MM-DD).
- Computes period-over-period delta percentages vs. an equal-length previous period.
- Serves:
  - **KPI Summary**: Total Revenue, Units Sold, Avg Order Value, Returns Rate.
  - **Monthly Trend**: Revenue breakdown by month (`TrendChart.jsx`).
  - **Quarterly Sales**: Revenue aggregated by quarter (`QuarterlyBar.jsx`).
  - **Correlation Heatmap**: Pearson correlation matrix between numeric metrics (`CorrelationHeatmap.jsx`).
  - **Top 5 Products**: Revenue, unit sales, and growth trend (`TopProducts.jsx`).

### Predictive ML Forecasting (`PredictionCard.jsx`)
- Uses `scikit-learn` Linear Regression trained on monthly aggregate revenue.
- Returns next-month forecasted revenue, 95% confidence interval bounds, R² accuracy score, and confidence percentage.

### Downloadable PDF Sales Report (`GET /api/export-pdf`)
- Generates an executive PDF report (`fpdf2`) with formatted KPI tables, top 5 products, predictive forecast details, and monthly breakdown tables.
- Downloads directly via the **"Export PDF Report"** button in `TopBar.jsx`.

---

## Running Backend Tests

Run the backend test suite with `pytest`:

```bash
python -m pytest backend/tests
```

---

## Project Structure

```
sales_data_analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app instance & CORS middleware
│   │   ├── config.py            # Environment configuration (.env)
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── api/
│   │   │   └── routes.py        # /api/upload, /api/dashboard, /api/export-pdf
│   │   └── services/
│   │       ├── cleaner.py       # Pandas CSV cleaning & validation pipeline
│   │       ├── analytics.py     # Aggregations, KPIs, correlation matrix
│   │       ├── predictor.py     # Scikit-learn Linear Regression model
│   │       └── pdf_exporter.py  # fpdf2 PDF report builder
│   ├── data/
│   │   └── sample_retail_sales.csv
│   ├── tests/
│   │   ├── test_cleaner.py
│   │   └── test_analytics_and_predictor.py
│   ├── requirements.txt
│   └── run.py
├── src/
│   ├── api.js                   # API client service fetching FastAPI backend
│   ├── App.jsx                  # Main page layout & state management
│   └── components/              # Preserved visual dashboard components
└── README.md
```
