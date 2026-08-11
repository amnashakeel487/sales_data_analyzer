import pytest
import io
import pandas as pd
from app.services.cleaner import clean_sales_data

def test_clean_sales_data_valid():
    csv_content = (
        "date,product,units,price,discount,marketing_spend\n"
        "2024-01-01,Widget A,10,100,0.1,500\n"
        "2024-01-01,Widget A,10,100,0.1,500\n" # duplicate
        "2024-01-02,Widget B,,50,0.0,200\n"    # missing units
    )
    df, summary = clean_sales_data(csv_content.encode("utf-8"))

    assert summary["rows_before"] == 3
    assert summary["rows_after"] == 2
    assert summary["duplicates_removed"] == 1
    assert summary["nulls_imputed"] >= 1
    assert "revenue" in df.columns
    assert df.loc[0, "revenue"] == 900.0  # 10 * 100 * 0.9

def test_clean_sales_data_missing_required_column():
    csv_content = "date,units,price\n2024-01-01,10,100\n"
    with pytest.raises(ValueError) as exc_info:
        clean_sales_data(csv_content.encode("utf-8"))
    assert "missing required column" in str(exc_info.value).lower()
