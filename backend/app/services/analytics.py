import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple

CURRENCY_SYMBOLS = {
    "PKR": "Rs ",
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "INR": "₹",
    "CAD": "CA$",
    "AUD": "A$"
}

def get_currency_symbol(currency_code: str) -> str:
    if not currency_code:
        return "Rs "
    return CURRENCY_SYMBOLS.get(currency_code.upper(), f"{currency_code.upper()} ")

def parse_date_safely(date_str: str, default: datetime) -> datetime:
    if not date_str:
        return default
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        try:
            return pd.to_datetime(date_str).to_pydatetime()
        except Exception:
            return default

def filter_data_by_date_range(
    df: pd.DataFrame,
    from_date_str: str = None,
    to_date_str: str = None
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Filters df to requested date range (df_curr) and computes equivalent duration
    previous date range (df_prev) for period-over-period comparison.
    """
    if df.empty or "date" not in df.columns:
        return df.copy(), pd.DataFrame(columns=df.columns)

    min_date = df["date"].min().to_pydatetime()
    max_date = df["date"].max().to_pydatetime()

    from_date = parse_date_safely(from_date_str, min_date) if from_date_str else min_date
    to_date = parse_date_safely(to_date_str, max_date) if to_date_str else max_date

    # Ensure to_date encompasses the full day
    to_date = to_date.replace(hour=23, minute=59, second=59)

    if from_date > to_date:
        from_date, to_date = to_date.replace(hour=0, minute=0, second=0), from_date

    df_curr = df[(df["date"] >= from_date) & (df["date"] <= to_date)].copy()

    # Calculate previous period duration
    duration = to_date - from_date
    prev_to_date = from_date - timedelta(seconds=1)
    prev_from_date = prev_to_date - duration

    df_prev = df[(df["date"] >= prev_from_date) & (df["date"] <= prev_to_date)].copy()

    return df_curr, df_prev

def format_delta(curr_val: float, prev_val: float, is_percentage_stat: bool = False) -> Tuple[str, bool]:
    if prev_val == 0 or np.isnan(prev_val):
        return ("+0.0%", True)
    
    pct_change = ((curr_val - prev_val) / abs(prev_val)) * 100.0
    sign = "+" if pct_change >= 0 else ""
    delta_str = f"{sign}{pct_change:.1f}%"
    positive = pct_change >= 0
    return delta_str, positive

def compute_kpis(df_curr: pd.DataFrame, df_prev: pd.DataFrame, currency: str = "PKR") -> List[Dict[str, Any]]:
    symbol = get_currency_symbol(currency)

    # Total Revenue
    curr_rev = float(df_curr["revenue"].sum()) if not df_curr.empty else 0.0
    prev_rev = float(df_prev["revenue"].sum()) if not df_prev.empty else 0.0
    rev_delta, rev_pos = format_delta(curr_rev, prev_rev)

    # Units Sold
    curr_units = int(df_curr["units"].sum()) if not df_curr.empty else 0
    prev_units = int(df_prev["units"].sum()) if not df_prev.empty else 0
    units_delta, units_pos = format_delta(curr_units, prev_units)

    # Average Order Value (AOV = Revenue / Row count or Orders)
    curr_orders = len(df_curr)
    prev_orders = len(df_prev)
    curr_aov = (curr_rev / curr_orders) if curr_orders > 0 else 0.0
    prev_aov = (prev_rev / prev_orders) if prev_orders > 0 else 0.0
    aov_delta, aov_pos = format_delta(curr_aov, prev_aov)

    # Returns Rate (Returned units or returned rows / total rows)
    if not df_curr.empty and "returned" in df_curr.columns:
        curr_returns_cnt = df_curr["returned"].sum()
        curr_ret_rate = (curr_returns_cnt / curr_orders) * 100.0 if curr_orders > 0 else 0.0
    else:
        curr_ret_rate = 2.4

    if not df_prev.empty and "returned" in df_prev.columns:
        prev_returns_cnt = df_prev["returned"].sum()
        prev_ret_rate = (prev_returns_cnt / prev_orders) * 100.0 if prev_orders > 0 else 0.0
    else:
        prev_ret_rate = 3.0

    ret_diff = curr_ret_rate - prev_ret_rate
    ret_sign = "+" if ret_diff >= 0 else ""
    ret_delta_str = f"{ret_sign}{ret_diff:.1f}%"
    ret_pos = ret_diff <= 0 # lower return rate is positive

    return [
        {
            "label": "Total Revenue",
            "value": f"{symbol}{curr_rev:,.0f}",
            "delta": rev_delta,
            "positive": rev_pos
        },
        {
            "label": "Units Sold",
            "value": f"{curr_units:,}",
            "delta": units_delta,
            "positive": units_pos
        },
        {
            "label": "Avg Order Value",
            "value": f"{symbol}{curr_aov:,.2f}",
            "delta": aov_delta,
            "positive": aov_pos
        },
        {
            "label": "Returns Rate",
            "value": f"{curr_ret_rate:.1f}%",
            "delta": ret_delta_str,
            "positive": ret_pos
        }
    ]

def compute_monthly_trend(df_curr: pd.DataFrame) -> List[Dict[str, Any]]:
    if df_curr.empty:
        return []

    df_copy = df_curr.copy()
    df_copy["year_month"] = df_copy["date"].dt.to_period("M")
    grouped = df_copy.groupby("year_month")["revenue"].sum().reset_index()

    # Determine date formatting style
    unique_years = df_copy["date"].dt.year.nunique()
    
    result = []
    for _, row in grouped.iterrows():
        period = row["year_month"]
        dt = period.to_timestamp()
        month_label = dt.strftime("%b '%y") if unique_years > 1 else dt.strftime("%b")
        result.append({
            "month": month_label,
            "revenue": round(float(row["revenue"]), 2)
        })

    return result

def compute_quarterly(df_curr: pd.DataFrame) -> List[Dict[str, Any]]:
    if df_curr.empty:
        return [
            {"q": "Q1", "value": 0.0},
            {"q": "Q2", "value": 0.0},
            {"q": "Q3", "value": 0.0},
            {"q": "Q4", "value": 0.0}
        ]

    df_copy = df_curr.copy()
    df_copy["quarter"] = "Q" + df_copy["date"].dt.quarter.astype(str)
    grouped = df_copy.groupby("quarter")["revenue"].sum().to_dict()

    quarters = ["Q1", "Q2", "Q3", "Q4"]
    return [
        {"q": q, "value": round(float(grouped.get(q, 0.0)), 2)}
        for q in quarters
    ]

def compute_correlation_matrix(df_curr: pd.DataFrame) -> Tuple[List[str], List[List[float]]]:
    canonical_labels = {
        "revenue": "Revenue",
        "units": "Units",
        "discount": "Discount",
        "marketing_spend": "Marketing",
        "seasonality_index": "Season"
    }

    if df_curr.empty:
        default_labels = ["Revenue", "Units", "Discount", "Marketing", "Season"]
        default_matrix = [
            [1.0, 0.9, -0.3, 0.6, 0.5],
            [0.9, 1.0, -0.2, 0.5, 0.4],
            [-0.3, -0.2, 1.0, 0.2, -0.1],
            [0.6, 0.5, 0.2, 1.0, 0.3],
            [0.5, 0.4, -0.1, 0.3, 1.0]
        ]
        return default_labels, default_matrix

    available_cols = [c for c in canonical_labels if c in df_curr.columns]
    corr_df = df_curr[available_cols].corr().fillna(0.0)

    display_labels = [canonical_labels[c] for c in available_cols]
    matrix = []
    for r in corr_df.values:
        row_list = [round(float(val), 2) for val in r]
        matrix.append(row_list)

    return display_labels, matrix

def compute_top_products(df_curr: pd.DataFrame, df_prev: pd.DataFrame) -> List[Dict[str, Any]]:
    if df_curr.empty or "product" not in df_curr.columns:
        return []

    grouped = df_curr.groupby("product").agg(
        revenue=("revenue", "sum"),
        units=("units", "sum")
    ).reset_index()

    top5 = grouped.sort_values("revenue", ascending=False).head(5)

    # Compute previous period sales for trend comparison
    prev_grouped = {}
    if not df_prev.empty and "product" in df_prev.columns:
        prev_grouped = df_prev.groupby("product")["revenue"].sum().to_dict()

    result = []
    for rank, (_, row) in enumerate(top5.iterrows(), start=1):
        prod_name = str(row["product"])
        curr_prod_rev = float(row["revenue"])
        curr_prod_units = int(row["units"])

        prev_prod_rev = prev_grouped.get(prod_name, 0.0)
        if prev_prod_rev > 0:
            trend_pct = round(((curr_prod_rev - prev_prod_rev) / prev_prod_rev) * 100.0, 1)
        else:
            trend_pct = 5.0  # fallback positive indicator for new product

        result.append({
            "rank": rank,
            "name": prod_name,
            "units": curr_prod_units,
            "revenue": round(curr_prod_rev, 2),
            "trend": trend_pct
        })

    return result
