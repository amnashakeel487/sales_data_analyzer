const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export async function fetchDashboard(fromDate, toDate, currency = 'PKR') {
  const params = new URLSearchParams()
  if (fromDate) params.append('from_date', fromDate)
  if (toDate) params.append('to_date', toDate)
  if (currency) params.append('currency', currency)

  const response = await fetch(`${API_BASE_URL}/dashboard?${params.toString()}`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Server error: ${response.status}`)
  }
  return await response.json()
}

export async function uploadCSVFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Upload failed: ${response.status}`)
  }

  return await response.json()
}

export async function downloadPDFReport(fromDate, toDate, currency = 'PKR') {
  const params = new URLSearchParams()
  if (fromDate) params.append('from_date', fromDate)
  if (toDate) params.append('to_date', toDate)
  if (currency) params.append('currency', currency)

  const response = await fetch(`${API_BASE_URL}/export-pdf?${params.toString()}`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `PDF export failed: ${response.status}`)
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tally_sales_report_${fromDate || 'all'}_to_${toDate || 'all'}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export async function fetchCurrencies() {
  const response = await fetch(`${API_BASE_URL}/currencies`)
  if (!response.ok) return []
  const data = await response.json()
  return data.currencies || []
}
