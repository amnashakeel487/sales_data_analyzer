// Placeholder data shaped the way the real backend response should look.
// Replace this file's exports with live API calls once the backend is wired up.

export const monthlyTrend = [
  { month: 'Jan', revenue: 42100 }, { month: 'Feb', revenue: 39800 },
  { month: 'Mar', revenue: 45600 }, { month: 'Apr', revenue: 48200 },
  { month: 'May', revenue: 51900 }, { month: 'Jun', revenue: 55400 },
  { month: 'Jul', revenue: 58100 }, { month: 'Aug', revenue: 60300 },
  { month: 'Sep', revenue: 57200 }, { month: 'Oct', revenue: 62800 },
  { month: 'Nov', revenue: 71400 }, { month: 'Dec', revenue: 84900 },
]

// Forecast continues the line — dashed segment on the chart
export const forecastPoint = { month: 'Jan (fc)', revenue: 79600, low: 71200, high: 87900 }

export const quarterly = [
  { q: 'Q1', value: 127500 },
  { q: 'Q2', value: 155500 },
  { q: 'Q3', value: 175600 },
  { q: 'Q4', value: 219100 },
]

export const topProducts = [
  { rank: 1, name: 'Wireless Earbuds Pro', units: 4820, revenue: 192800, trend: 12.4 },
  { rank: 2, name: 'Insulated Steel Bottle', units: 4310, revenue: 86200, trend: 8.1 },
  { rank: 3, name: 'Aroma Diffuser Mini', units: 3960, revenue: 118800, trend: -3.2 },
  { rank: 4, name: 'Bluetooth Speaker XS', units: 3540, revenue: 141600, trend: 21.7 },
  { rank: 5, name: 'Ceramic Knife Set', units: 3105, revenue: 93150, trend: 4.6 },
]

// Correlation matrix used for the heatmap (values from -1 to 1)
export const correlationLabels = ['Revenue', 'Units', 'Discount', 'Marketing', 'Season']
export const correlationMatrix = [
  [1.00, 0.91, -0.34, 0.62, 0.48],
  [0.91, 1.00, -0.21, 0.55, 0.41],
  [-0.34, -0.21, 1.00, 0.18, -0.09],
  [0.62, 0.55, 0.18, 1.00, 0.27],
  [0.48, 0.41, -0.09, 0.27, 1.00],
]

export const kpis = [
  { label: 'Total Revenue', value: '$577,400', delta: '+14.2%', positive: true },
  { label: 'Units Sold', value: '38,942', delta: '+9.8%', positive: true },
  { label: 'Avg Order Value', value: '$61.20', delta: '+3.1%', positive: true },
  { label: 'Returns Rate', value: '2.4%', delta: '-0.6%', positive: true },
]

export const prediction = {
  nextMonth: 'January 2027',
  value: '$79,600',
  range: '$71,200 – $87,900',
  confidence: '91%',
  r2: '0.87',
  method: 'Linear Regression (scikit-learn)',
}
