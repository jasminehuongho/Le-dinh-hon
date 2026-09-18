import { formatCurrency } from '../../utils/formatCurrency'

export default function SummaryCards({ budget, totalSpent }) {
  const diff = budget - totalSpent
  const isOver = diff < 0
  const pctUsed = budget > 0 ? Math.min((totalSpent / budget) * 100, 999) : 0

  return (
    <>
      <div className="summary-grid">
        <div className="summary-card accent">
          <div className="label">Ngân sách</div>
          <div className="value">{formatCurrency(budget)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Tổng chi phí</div>
          <div className="value">{formatCurrency(totalSpent)}</div>
          <div className="progress-track mt-8">
            <div className={`progress-fill${pctUsed > 100 ? ' danger' : ''}`} style={{ width: `${Math.min(pctUsed, 100)}%` }} />
          </div>
        </div>
        <div className="summary-card">
          <div className="label">{isOver ? 'Vượt ngân sách' : 'Thiếu / Đủ'}</div>
          <div className="value" style={{ color: isOver ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {formatCurrency(Math.abs(diff))}
          </div>
          <div className="note" style={{ color: isOver ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {isOver
              ? `Vượt ngân sách ${formatCurrency(Math.abs(diff))}`
              : `Còn dư ${formatCurrency(diff)}`}
          </div>
        </div>
      </div>
    </>
  )
}
