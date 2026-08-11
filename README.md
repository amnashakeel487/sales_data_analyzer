# 📊 Tally — Sales Data Analyzer

A full-stack **sales analytics and forecasting platform** that transforms raw retail sales data into actionable business insights.

**Tally** allows users to upload retail sales CSV files, automatically clean and validate the data, explore interactive analytics, compare performance across periods, forecast future revenue using Machine Learning, and export a professional PDF report.

---

## 🚀 Overview

Businesses often have large amounts of sales data but need an easy way to turn that data into meaningful insights.

Tally provides an end-to-end solution for this process:

```text
Raw Sales CSV
      ↓
Data Cleaning & Validation
      ↓
Analytics & Aggregation
      ↓
Interactive Dashboard
      ↓
ML Revenue Forecast
      ↓
PDF Business Report
```

The application combines a **React + Vite frontend** with a **FastAPI Python backend** and uses **Pandas, NumPy, and Scikit-learn** for data processing and predictive analytics.

---

## ✨ Key Features

### 📁 CSV Upload & Data Cleaning

Upload retail sales data directly through the dashboard.

Tally automatically:

* Detects and normalizes supported column aliases
* Handles missing numerical values
* Handles missing categorical values
* Removes duplicate records
* Validates the dataset
* Generates a cleaning summary
* Prepares the cleaned data for analysis

### 📈 Interactive Sales Analytics

The dashboard provides:

* Total Revenue
* Units Sold
* Average Order Value
* Returns Rate
* Monthly Revenue Trends
* Quarterly Sales Performance
* Top 5 Products
* Product Growth Trends
* Period-over-Period Performance Comparison

Users can also filter analytics using custom date ranges.

### 🤖 Machine Learning Revenue Forecast

Tally uses **Scikit-learn Linear Regression** to forecast future revenue.

The prediction module provides:

* Next-month revenue forecast
* 95% confidence interval bounds
* R² model score
* Confidence percentage
* Monthly revenue-based training data

> **Note:** The forecasting model is intentionally simple and is designed for educational and analytical purposes rather than production financial forecasting.

### 📊 Correlation Analysis

A Pearson correlation matrix is generated for numerical sales metrics.

This helps identify relationships between variables such as:

* Units sold
* Price
* Discount
* Marketing spend
* Revenue
* Returns

### 📄 PDF Report Export

Users can export an executive-style PDF report containing:

* KPI summary
* Top 5 products
* Monthly sales breakdown
* Revenue forecast
* Prediction confidence information
* Key sales metrics

The report is generated dynamically using **fpdf2**.

---

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* JavaScript
* Responsive UI
* SVG-based dashboard visualizations

### Backend

* Python
* FastAPI
* Pydantic
* Pandas
* NumPy
* Scikit-learn
* fpdf2

### Machine Learning

* Linear Regression
* Monthly revenue aggregation
* R² evaluation
* Confidence interval estimation

### Testing

* Pytest

---

## 🏗️ Architecture

Tally follows a frontend-backend architecture:

```text
┌─────────────────────────────┐
│       React + Vite          │
│                             │
│  Dashboard / Charts / UI    │
└──────────────┬──────────────┘
               │
               │ REST API
               ↓
┌─────────────────────────────┐
│        FastAPI Backend      │
│                             │
│  API Routes                 │
│  Data Cleaning              │
│  Analytics                  │
│  ML Prediction              │
│  PDF Generation             │
└──────────────┬──────────────┘
               │
       ┌───────┼────────┐
       ↓       ↓        ↓
    Pandas  Scikit    fpdf2
             -learn
```

---

## 🔌 API Endpoints

### `POST /api/upload`

Uploads and processes a retail sales CSV file.

**Input:**

Retail sales CSV containing fields such as:

```text
date
product
units
price
discount
marketing_spend
region
returned
```

**Returns:**

* Cleaned dataset information
* Number of removed duplicates
* Missing values handled
* Cleaning summary

---

### `GET /api/dashboard`

Returns analytics for the selected date range.

**Query Parameters:**

```text
from_date=YYYY-MM-DD
to_date=YYYY-MM-DD
```

**Provides:**

* KPI summary
* Monthly revenue trends
* Quarterly sales
* Correlation matrix
* Top products
* Growth metrics
* Period-over-period comparisons

---

### `GET /api/export-pdf`

Generates and downloads a complete PDF sales report.

The report includes:

* KPI summary
* Top products
* Monthly revenue
* Forecast information
* Business performance metrics

---

## 🤖 Machine Learning Pipeline

The forecasting workflow is:

```text
Sales Dataset
     ↓
Data Cleaning
     ↓
Monthly Revenue Aggregation
     ↓
Feature Preparation
     ↓
Linear Regression
     ↓
Model Evaluation
     ↓
Next-Month Prediction
     ↓
Confidence Interval
```

The model uses historical monthly revenue to estimate the next month's revenue.

---

## 📊 Dashboard

The dashboard provides a centralized view of business performance.

### KPI Cards

```text
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Revenue│ Units Sold   │ Avg Order    │ Returns Rate │
│              │              │ Value        │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Analytics Components

* Revenue Trend Chart
* Quarterly Sales Chart
* Correlation Heatmap
* Top Products Analysis
* Revenue Forecast Card

---

## 📂 Project Structure

```text
sales_data_analyzer/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── schemas.py
│   │   │
│   │   ├── api/
│   │   │   └── routes.py
│   │   │
│   │   └── services/
│   │       ├── cleaner.py
│   │       ├── analytics.py
│   │       ├── predictor.py
│   │       └── pdf_exporter.py
│   │
│   ├── data/
│   │   └── sample_retail_sales.csv
│   │
│   ├── tests/
│   │   ├── test_cleaner.py
│   │   └── test_analytics_and_predictor.py
│   │
│   ├── requirements.txt
│   └── run.py
│
├── src/
│   ├── api.js
│   ├── App.jsx
│   │
│   └── components/
│       ├── UploadPanel.jsx
│       ├── TrendChart.jsx
│       ├── QuarterlyBar.jsx
│       ├── CorrelationHeatmap.jsx
│       ├── TopProducts.jsx
│       ├── PredictionCard.jsx
│       └── TopBar.jsx
│
├── package.json
└── README.md
```

---

# ⚡ Quick Start

## Prerequisites

Make sure you have installed:

* Python 3.10+
* Node.js 18+
* npm

---

## 1. Clone the Repository

```bash
git clone https://github.com/amnashakeel487/sales_data_analyzer.git

cd sales_data_analyzer
```

---

## 2. Set Up the Backend

Install Python dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the FastAPI server:

```bash
python backend/run.py
```

The backend will run at:

```text
http://127.0.0.1:8000
```

### API Documentation

FastAPI automatically provides interactive Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 3. Set Up the Frontend

Install Node dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🧪 Running Tests

Run the backend test suite using:

```bash
python -m pytest backend/tests
```

The tests cover:

* Data cleaning
* Data validation
* Analytics calculations
* Machine learning prediction functionality

---

# 📋 Supported Dataset Format

Tally expects retail sales data containing fields similar to:

```text
date
product
units
price
discount
marketing_spend
region
returned
```

Example:

```csv
date,product,units,price,discount,marketing_spend,region,returned
2025-01-05,Laptop,5,85000,10,5000,North,0
2025-01-12,Phone,12,45000,5,3500,South,1
```

The cleaning pipeline automatically handles missing values and duplicate records.

---

# 🔐 Configuration

Environment-specific configuration should be stored using environment variables rather than hard-coded values.

Example:

```text
.env
```

Make sure sensitive configuration files are included in `.gitignore` and are not committed to the repository.

---

# 📈 Future Improvements

Potential improvements include:

* Multiple ML forecasting models
* Time-series forecasting using ARIMA or Prophet
* User authentication
* PostgreSQL database integration
* Advanced product segmentation
* Sales anomaly detection
* Automated email reports
* Cloud deployment
* Role-based dashboards
* Real-time analytics
* Advanced forecasting visualizations

---

# 🎯 Learning Outcomes

This project demonstrates practical experience with:

* Full-stack application architecture
* REST API development
* Data cleaning with Pandas
* Numerical analysis with NumPy
* Data visualization
* Exploratory data analysis
* Machine Learning with Scikit-learn
* Linear Regression
* Model evaluation
* PDF report generation
* React frontend development
* FastAPI backend development
* API integration
* Automated testing
* Business analytics

---

# 👩‍💻 Author

**Amna Shakeel**

BS Software Engineering Student | Python Developer | Full-Stack Developer | AI/ML Enthusiast

GitHub:
https://github.com/amnashakeel487

---

# ⭐ Project Goal

The goal of Tally is to demonstrate how **raw business data can be transformed into useful insights through data engineering, analytics, visualization, and machine learning**.

From uploading a CSV to generating a forecast and downloadable business report, Tally provides a complete data analytics workflow in a single application.
