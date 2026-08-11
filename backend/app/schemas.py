from typing import List, Optional
from pydantic import BaseModel

class CleaningSummary(BaseModel):
    rows_before: int
    rows_after: int
    nulls_imputed: int
    duplicates_removed: int
    date_min: Optional[str] = None
    date_max: Optional[str] = None
    columns_found: List[str]

class KPISummaryItem(BaseModel):
    label: str
    value: str
    delta: str
    positive: bool

class MonthlyTrendPoint(BaseModel):
    month: str
    revenue: float

class ForecastPoint(BaseModel):
    month: str
    revenue: float
    low: float
    high: float

class QuarterlyPoint(BaseModel):
    q: str
    value: float

class CorrelationMatrixResponse(BaseModel):
    labels: List[str]
    matrix: List[List[float]]

class TopProductItem(BaseModel):
    rank: int
    name: str
    units: int
    revenue: float
    trend: float

class PredictionResult(BaseModel):
    nextMonth: str
    value: str
    range: str
    confidence: str
    r2: str
    method: str

class DashboardDataResponse(BaseModel):
    kpis: List[KPISummaryItem]
    monthly_trend: List[MonthlyTrendPoint]
    forecast: ForecastPoint
    quarterly: List[QuarterlyPoint]
    correlation_labels: List[str]
    correlation_matrix: List[List[float]]
    top_products: List[TopProductItem]
    prediction: PredictionResult
    cleaning_summary: Optional[CleaningSummary] = None
