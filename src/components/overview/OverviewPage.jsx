import { useState } from 'react'
import { useExpenses } from '../../hooks/useExpenses'
import { useBudgetCategories } from '../../hooks/useBudgetCategories'
import { useTasks } from '../../hooks/useTasks'
import { useSettings } from '../../hooks/useSettings'
import { sumExpensesTotal, sumPlannedBudget } from '../../utils/calculations'
import { formatCurrency } from '../../utils/formatCurrency'
import { PaymentStatusBadge } from '../common/StatusBadge'
import IconButton from '../common/IconButton'
import SummaryCards from './SummaryCards'
import OverviewPreviewModal from './OverviewPreviewModal'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export default function OverviewPage() {
  const { expenses, loading: loadingExpenses, error } = useExpenses()
  const { categories } = useBudgetCategories()
  const { tasks } = useTasks()
  const { totalBudget } = useSettings()
  const [previewing, setPreviewing] = useState(null)

  const totalPlanned = sumPlannedBudget(categories)
  const budget = totalBudget || totalPlanned
  const totalSpent = sumExpensesTotal(expenses)

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Chỉ xem — không nhập liệu</div>
          <h2>Tổng quan</h2>
          <p className="subtitle">Bức tranh toàn cảnh về ngân sách, chi phí thực tế và tiến độ của lễ đính hôn.</p>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="banner-error">
          Chưa kết nối Supabase. Tạo file <code>.env</code> từ <code>.env.example</code> để sử dụng đầy đủ chức năng.
        </div>
      )}
      {error && <div className="banner-error">Lỗi tải dữ liệu: {error}</div>}

      <SummaryCards budget={budget} totalSpent={totalSpent} />

      <div className="section-title" style={{ marginBottom: 12 }}>Chi tiết theo công việc</div>
      {loadingExpenses ? (
        <div className="center-note">Đang tải dữ liệu…</div>
      ) : expenses.length === 0 ? (
        <div className="card empty-state">Chưa có công việc chi phí nào được ghi nhận.</div>
      ) : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 56 }}>STT</th>
                <th>Công việc</th>
                <th>Hạng mục</th>
                <th className="cell-num">Tổng tiền</th>
                <th>Trạng thái</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, idx) => (
                <tr key={expense.id}>
                  <td>{idx + 1}</td>
                  <td>{expense.work_name}</td>
                  <td className="text-soft">{categoryById[expense.category_id]?.name || '—'}</td>
                  <td className="cell-num">{formatCurrency(expense.total_amount)}</td>
                  <td><PaymentStatusBadge status={expense.payment_status} /></td>
                  <td>
                    <div className="row-actions">
                      <IconButton icon="eye" label="Xem chi tiết" onClick={() => setPreviewing(expense)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewing && (
        <OverviewPreviewModal
          expense={previewing}
          category={categoryById[previewing.category_id]}
          relatedTasks={tasks.filter((t) => t.expense_id === previewing.id)}
          onClose={() => setPreviewing(null)}
        />
      )}
    </div>
  )
}
