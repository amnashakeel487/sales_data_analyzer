import pytest
import pandas as pd
from app.services.analytics import compute_kpis, compute_monthly_trend, compute_quarterly, compute_correlation_matrix, compute_top_products
from app.services.predictor import predict_next_month_sales
from app.services.pdf_exporter import generate_pdf_report

@pytest.fixture
def sample_dataframe():
    dates = pd.date_range("2024-01-01", periods=100, freq="D")
    df = pd.DataFrame({
        "date": dates,
        "product": ["Widget A" if i % 2 == 0 else "Widget B" for i in range(100)],
        "units": [10 + i for i in range(100)],
        "price": [50.0 for _ in range(100)],
        "discount": [0.05 for _ in range(100)],
        "marketing_spend": [100.0 for _ in range(100)],
        "returned": [0 for _ in range(100)],
        "seasonality_index": [1.0 for _ in range(100)]
    })
    df["revenue"] = df["units"] * df["price"] * (1.0 - df["discount"])
    return df

def test_analytics_computations(sample_dataframe):
    kpis = compute_kpis(sample_dataframe, sample_dataframe)
    assert len(kpis) == 4
    assert kpis[0]["label"] == "Total Revenue"

    monthly = compute_monthly_trend(sample_dataframe)
    assert len(monthly) >= 3

    quarterly = compute_quarterly(sample_dataframe)
    assert len(quarterly) == 4

    labels, matrix = compute_correlation_matrix(sample_dataframe)
    assert len(labels) > 0
    assert len(matrix) == len(labels)

    top_prods = compute_top_products(sample_dataframe, sample_dataframe)
    assert len(top_prods) == 2

def test_prediction_service(sample_dataframe):
    pred, forecast = predict_next_month_sales(sample_dataframe)
    assert "value" in pred
    assert "r2" in pred
    assert forecast["revenue"] > 0

def test_pdf_report_generation(sample_dataframe):
    kpis = compute_kpis(sample_dataframe, sample_dataframe)
    monthly = compute_monthly_trend(sample_dataframe)
    top_prods = compute_top_products(sample_dataframe, sample_dataframe)
    pred, _ = predict_next_month_sales(sample_dataframe)

    pdf_bytes = generate_pdf_report("2024-01-01 to 2024-04-09", kpis, top_prods, monthly, pred)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")
