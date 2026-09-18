const vnNumberFormatter = new Intl.NumberFormat('vi-VN')

export function formatNumber(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return vnNumberFormatter.format(Math.round(n))
}

export function formatCurrency(value) {
  return `${formatNumber(value)} VNĐ`
}

// Chuyển chuỗi nhập ("20.000.000" hoặc "20000000") về number an toàn.
export function parseCurrencyInput(value) {
  if (typeof value === 'number') return value
  if (!value) return 0
  const digitsOnly = String(value).replace(/[^\d-]/g, '')
  const n = parseInt(digitsOnly, 10)
  return Number.isFinite(n) ? n : 0
}

export function formatDateVN(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('vi-VN')
}
