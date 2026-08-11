import io
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any

COLUMN_ALIASES = {
    "date": ["date", "transaction_date", "order_date", "timestamp", "dt", "sale_date", "created_at", "invoicedate", "day"],
    "product": ["product", "product_name", "item", "product_title", "name", "sku", "description", "stockcode"],
    "units": ["units", "quantity", "units_sold", "qty", "count", "number_of_items", "volume"],
    "price": ["price", "unit_price", "price_per_unit", "cost_per_unit", "unitprice", "rate", "cost"],
    "revenue": ["revenue", "total_revenue", "sales", "total_sales", "amount", "order_value", "total", "line_total"],
    "discount": ["discount", "discount_rate", "discount_percent", "discount_pct", "discounts"],
    "marketing_spend": ["marketing_spend", "marketing", "ad_spend", "ad_cost", "promotion_spend", "spend"],
    "region": ["region", "location", "area", "zone", "territory", "country", "state", "city"],
    "returned": ["returned", "is_returned", "return_status", "returns", "return_flag", "cancelled"],
    "seasonality_index": ["seasonality_index", "seasonality", "season", "season_index"]
}

def identify_columns(df: pd.DataFrame) -> Dict[str, str]:
    """Map canonical column names to actual CSV column names using aliases."""
    normalized_cols = {col.strip().lower().replace(" ", "_"): col for col in df.columns}
    mapping = {}

    for canonical, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in normalized_cols:
                mapping[canonical] = normalized_cols[alias]
                break

    return mapping

def clean_sales_data(csv_bytes_or_buffer) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans raw retail sales CSV data:
    - Normalizes column names
    - Validates schema with smart fallback
    - Removes duplicates
    - Imputes missing values safely
    - Computes revenue/units/price
    - Returns cleaned DataFrame and cleaning summary dict
    """
    if isinstance(csv_bytes_or_buffer, bytes):
        buffer = io.BytesIO(csv_bytes_or_buffer)
    else:
        buffer = csv_bytes_or_buffer

    try:
        df_raw = pd.read_csv(buffer)
    except Exception as e:
        raise ValueError(f"Invalid CSV file format: {str(e)}")

    if df_raw.empty:
        raise ValueError("Uploaded CSV file is empty.")

    rows_before = len(df_raw)
    col_mapping = identify_columns(df_raw)

    # Minimum schema requirement check
    if "date" not in col_mapping:
        raise ValueError(
            f"CSV is missing a date column. Found columns: {list(df_raw.columns)}"
        )

    # Rename matched columns to canonical names
    rename_dict = {col_mapping[k]: k for k in col_mapping}
    df = df_raw.rename(columns=rename_dict).copy()

    # Track duplicates
    duplicates_removed = int(df.duplicated().sum())
    df = df.drop_duplicates().copy()

    nulls_count = 0

    # Clean & parse dates
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    null_dates = df["date"].isna().sum()
    if null_dates > 0:
        nulls_count += int(null_dates)
        df = df.dropna(subset=["date"]).copy()

    if df.empty:
        raise ValueError("No valid date rows found in CSV dataset.")

    df = df.sort_values("date").reset_index(drop=True)

    # Categorical columns
    if "product" not in df.columns:
        df["product"] = "General Retail Item"
    else:
        null_prods = df["product"].isna().sum()
        nulls_count += int(null_prods)
        df["product"] = df["product"].fillna("Unknown Product").astype(str)

    if "region" not in df.columns:
        df["region"] = "General"
    else:
        null_regions = df["region"].isna().sum()
        nulls_count += int(null_regions)
        df["region"] = df["region"].fillna("General").astype(str)

    # Numeric columns
    for num_col in ["units", "price", "revenue", "discount", "marketing_spend", "returned", "seasonality_index"]:
        if num_col in df.columns:
            col_nulls = df[num_col].isna().sum()
            nulls_count += int(col_nulls)
            df[num_col] = pd.to_numeric(df[num_col], errors="coerce")

    # Units imputation
    if "units" not in df.columns:
        df["units"] = 1
    else:
        median_units = df["units"].median()
        df["units"] = df["units"].fillna(median_units if not np.isnan(median_units) else 1).clip(lower=1)

    # Discount imputation
    if "discount" in df.columns:
        df["discount"] = df["discount"].fillna(0.0)
        if df["discount"].max() > 1.0:
            df["discount"] = df["discount"] / 100.0
        df["discount"] = df["discount"].clip(lower=0.0, upper=0.99)
    else:
        df["discount"] = 0.0

    # Price & Revenue calculation
    if "revenue" in df.columns and df["revenue"].notna().any():
        df["revenue"] = df["revenue"].fillna(0.0).clip(lower=0.0)
        if "price" not in df.columns:
            df["price"] = (df["revenue"] / df["units"]).round(2).fillna(10.0)
    else:
        if "price" not in df.columns:
            df["price"] = 50.0
        else:
            product_prices = df.groupby("product")["price"].transform("median")
            df["price"] = df["price"].fillna(product_prices)
            overall_price = df["price"].median()
            df["price"] = df["price"].fillna(overall_price if not np.isnan(overall_price) else 20.0).clip(lower=0.01)

        df["revenue"] = (df["units"] * df["price"] * (1.0 - df["discount"])).round(2)

    if "marketing_spend" in df.columns:
        median_mkt = df["marketing_spend"].median()
        df["marketing_spend"] = df["marketing_spend"].fillna(median_mkt if not np.isnan(median_mkt) else 0.0).clip(lower=0.0)
    else:
        df["marketing_spend"] = 0.0

    if "returned" in df.columns:
        df["returned"] = df["returned"].fillna(0).astype(int).clip(lower=0, upper=1)
    else:
        df["returned"] = 0

    if "seasonality_index" in df.columns:
        median_season = df["seasonality_index"].median()
        df["seasonality_index"] = df["seasonality_index"].fillna(median_season if not np.isnan(median_season) else 1.0)
    else:
        df["seasonality_index"] = df["date"].dt.month.map(
            lambda m: 1.3 if m in [11, 12] else (1.1 if m in [5, 6, 7] else 0.9)
        )

    rows_after = len(df)
    date_min = df["date"].min().strftime("%Y-%m-%d")
    date_max = df["date"].max().strftime("%Y-%m-%d")

    summary = {
        "rows_before": int(rows_before),
        "rows_after": int(rows_after),
        "nulls_imputed": int(nulls_count),
        "duplicates_removed": int(duplicates_removed),
        "date_min": date_min,
        "date_max": date_max,
        "columns_found": list(df_raw.columns)
    }

    return df, summary
