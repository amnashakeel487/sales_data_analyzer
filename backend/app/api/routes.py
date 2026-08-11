from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Response
from typing import Optional
from pathlib import Path
import pandas as pd
import io

from app.config import DATA_DIR
from app.schemas import DashboardDataResponse, CleaningSummary
from app.services.cleaner import clean_sales_data
from app.services.analytics import (
    filter_data_by_date_range,
    compute_kpis,
    compute_monthly_trend,
    compute_quarterly,
    compute_correlation_matrix,
    compute_top_products,
    get_currency_symbol
)
from app.services.predictor import predict_next_month_sales
from app.services.pdf_exporter import generate_pdf_report

router = APIRouter(prefix="/api")

ACTIVE_DATA_PATH = DATA_DIR / "active_sales_data.csv"
SAMPLE_DATA_PATH = DATA_DIR / "sample_retail_sales.csv"

# In-memory cached dataframe and cleaning summary
_active_df: Optional[pd.DataFrame] = None
_last_cleaning_summary: Optional[dict] = None

def get_active_dataframe() -> pd.DataFrame:
    global _active_df, _last_cleaning_summary
    if _active_df is not None and not _active_df.empty:
        return _active_df

    target_path = ACTIVE_DATA_PATH if ACTIVE_DATA_PATH.exists() else SAMPLE_DATA_PATH
    if target_path.exists():
        with open(target_path, "rb") as f:
            file_bytes = f.read()
        _active_df, _last_cleaning_summary = clean_sales_data(file_bytes)
        return _active_df

    raise HTTPException(status_code=404, detail="No sales dataset available. Please upload a CSV file.")

@router.get("/health")
def health_check():
    try:
        df = get_active_dataframe()
        return {
            "status": "ok",
            "dataset_loaded": True,
            "total_rows": len(df),
            "date_range": [df["date"].min().strftime("%Y-%m-%d"), df["date"].max().strftime("%Y-%m-%d")]
        }
    except Exception as e:
        return {"status": "ok", "dataset_loaded": False, "detail": str(e)}

@router.get("/currencies")
def list_currencies():
    return {
        "currencies": [
            {"code": "PKR", "symbol": "Rs ", "label": "Pakistani Rupee (PKR)"},
            {"code": "USD", "symbol": "$", "label": "US Dollar (USD)"},
            {"code": "EUR", "symbol": "€", "label": "Euro (EUR)"},
            {"code": "GBP", "symbol": "£", "label": "British Pound (GBP)"},
            {"code": "INR", "symbol": "₹", "label": "Indian Rupee (INR)"},
            {"code": "CAD", "symbol": "CA$", "label": "Canadian Dollar (CAD)"},
            {"code": "AUD", "symbol": "A$", "label": "Australian Dollar (AUD)"},
        ]
    }

@router.post("/upload", response_model=CleaningSummary)
async def upload_csv(file: UploadFile = File(...)):
    global _active_df, _last_cleaning_summary
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .csv files are supported.")

    try:
        contents = await file.read()
        cleaned_df, summary = clean_sales_data(contents)

        cleaned_df.to_csv(ACTIVE_DATA_PATH, index=False)
        _active_df = cleaned_df
        _last_cleaning_summary = summary

        return summary
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

@router.get("/dashboard", response_model=DashboardDataResponse)
def get_dashboard_metrics(
    from_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    to_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    currency: Optional[str] = Query("PKR", description="Currency code e.g. PKR, USD, EUR")
):
    df_raw = get_active_dataframe()
    df_curr, df_prev = filter_data_by_date_range(df_raw, from_date, to_date)

    if df_curr.empty:
        raise HTTPException(
            status_code=404,
            detail="No sales data found for the selected date range. Please adjust the range filters."
        )

    kpis = compute_kpis(df_curr, df_prev, currency=currency)
    monthly_trend = compute_monthly_trend(df_curr)
    quarterly = compute_quarterly(df_curr)
    corr_labels, corr_matrix = compute_correlation_matrix(df_curr)
    top_products = compute_top_products(df_curr, df_prev)
    prediction_card, forecast_point = predict_next_month_sales(df_curr, currency=currency)

    summary_obj = CleaningSummary(**_last_cleaning_summary) if _last_cleaning_summary else None

    return DashboardDataResponse(
        kpis=kpis,
        monthly_trend=monthly_trend,
        forecast=forecast_point,
        quarterly=quarterly,
        correlation_labels=corr_labels,
        correlation_matrix=corr_matrix,
        top_products=top_products,
        prediction=prediction_card,
        cleaning_summary=summary_obj
    )

@router.get("/export-pdf")
def export_pdf_report(
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    currency: Optional[str] = Query("PKR")
):
    df_raw = get_active_dataframe()
    df_curr, df_prev = filter_data_by_date_range(df_raw, from_date, to_date)

    if df_curr.empty:
        raise HTTPException(status_code=404, detail="No data available for PDF export in selected range.")

    kpis = compute_kpis(df_curr, df_prev, currency=currency)
    monthly_trend = compute_monthly_trend(df_curr)
    top_products = compute_top_products(df_curr, df_prev)
    prediction_card, _ = predict_next_month_sales(df_curr, currency=currency)

    min_d = df_curr["date"].min().strftime("%Y-%m-%d")
    max_d = df_curr["date"].max().strftime("%Y-%m-%d")
    date_range_str = f"{min_d} to {max_d}"

    pdf_bytes = generate_pdf_report(
        date_range_str=date_range_str,
        kpis=kpis,
        top_products=top_products,
        monthly_trend=monthly_trend,
        prediction=prediction_card
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="tally_sales_report.pdf"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
