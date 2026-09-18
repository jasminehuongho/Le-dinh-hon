import { useState } from 'react'
import { useExpenses } from '../../hooks/useExpenses'
import { useBudgetCategories } from '../../hooks/useBudgetCategories'
import { sumExpensesTotal } from '../../utils/calculations'
import { formatCurrency } from '../../utils/formatCurrency'
import ExpenseTable from './ExpenseTable'
import ExpenseFormModal from './ExpenseFormModal'
import ExpensePreviewModal from './ExpensePreviewModal'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export default function ExpensesPage() {
  const { expenses, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses()
  const { categories } = useBudgetCategories()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [previewing, setPreviewing] = useState(null)

  const totalSpent = sumExpensesTotal(expenses)

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(expense) {
    setEditing(expense)
    setShowForm(true)
  }

  async function handleDelete(expense) {
    if (!window.confirm(`Xóa công việc "${expense.work_name}"?`)) return
    await deleteExpense(expense.id)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Chi tiêu thực tế</div>
          <h2>Quản lý chi phí chi tiết</h2>
          <p className="subtitle">Theo dõi từng công việc đã chi, liên kết với hạng mục dự trù và trạng thái thanh toán.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <svg viewBox="0 0 20 20" width="16" height="16"><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          Thêm công việc
        </button>
      </div>

      {!isSupabaseConfigured && (
        <div className="banner-error">
          Chưa kết nối Supabase. Tạo file <code>.env</code> từ <code>.env.example</code> để sử dụng đầy đủ chức năng.
        </div>
      )}
      {error && <div className="banner-error">Lỗi tải dữ liệu: {error}</div>}

      <div className="card card-pad" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span className="text-soft" style={{ fontSize: 13.5, fontWeight: 600 }}>Tổng cộng {expenses.length} công việc</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>{formatCurrency(totalSpent)}</span>
      </div>

      {loading ? (
        <div className="center-note">Đang tải dữ liệu…</div>
      ) : (
        <ExpenseTable expenses={expenses} onPreview={setPreviewing} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {showForm && (
        <ExpenseFormModal
          initial={editing}
          categories={categories}
          expenses={expenses}
          onClose={() => setShowForm(false)}
          onSubmit={async (payload) => {
            if (editing) await updateExpense(editing.id, payload)
            else await addExpense(payload)
          }}
        />
      )}

      {previewing && (
        <ExpensePreviewModal
          expense={previewing}
          category={categories.find((c) => c.id === previewing.category_id)}
          onClose={() => setPreviewing(null)}
        />
      )}
    </div>
  )
}
