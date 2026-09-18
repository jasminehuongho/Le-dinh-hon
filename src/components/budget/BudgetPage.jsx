import { useState } from 'react'
import { useBudgetCategories } from '../../hooks/useBudgetCategories'
import { useSettings } from '../../hooks/useSettings'
import { useExpenses } from '../../hooks/useExpenses'
import { formatCurrency, formatNumber, parseCurrencyInput } from '../../utils/formatCurrency'
import { sumPlannedBudget, sumCategorySpent } from '../../utils/calculations'
import IconButton from '../common/IconButton'
import BudgetCategoryForm from './BudgetCategoryForm'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export default function BudgetPage() {
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useBudgetCategories()
  const { totalBudget, updateTotalBudget } = useSettings()
  const { expenses } = useExpenses()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [budgetDraft, setBudgetDraft] = useState(null)

  const totalPlanned = sumPlannedBudget(categories)
  const displayedTotalBudget = budgetDraft !== null ? budgetDraft : totalBudget

  async function handleBudgetBlur() {
    if (budgetDraft === null) return
    if (budgetDraft !== totalBudget) {
      await updateTotalBudget(budgetDraft)
    }
    setBudgetDraft(null)
  }

  function openEdit(category) {
    setEditing(category)
    setShowForm(true)
  }

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  async function handleDelete(category) {
    const spent = sumCategorySpent(category.id, expenses)
    const warn = spent > 0
      ? `Hạng mục "${category.name}" đã có ${formatCurrency(spent)} chi phí liên kết. Xóa hạng mục sẽ không xóa các công việc đó, nhưng chúng sẽ mất liên kết hạng mục. Vẫn xóa?`
      : `Xóa hạng mục "${category.name}"?`
    if (!window.confirm(warn)) return
    await deleteCategory(category.id)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Kế hoạch tài chính</div>
          <h2>Dự trù kinh phí</h2>
          <p className="subtitle">Thiết lập ngân sách dự kiến và phân bổ dự trù cho từng hạng mục của lễ đính hôn.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <svg viewBox="0 0 20 20" width="16" height="16"><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          Thêm hạng mục
        </button>
      </div>

      {!isSupabaseConfigured && (
        <div className="banner-error">
          Chưa kết nối Supabase. Tạo file <code>.env</code> từ <code>.env.example</code> và điền URL / anon key của project Supabase để sử dụng đầy đủ chức năng.
        </div>
      )}
      {error && <div className="banner-error">Lỗi tải dữ liệu: {error}</div>}

      <div className="summary-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        <div className="card card-pad">
          <div className="section-title">Ngân sách dự kiến tổng</div>
          <p className="text-soft mt-8" style={{ marginBottom: 14, fontSize: 13 }}>Nhập tay, có thể sửa bất cứ lúc nào.</p>
          <input
            className="input"
            style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 600, padding: '12px 14px' }}
            inputMode="numeric"
            value={formatNumber(displayedTotalBudget)}
            onChange={(e) => setBudgetDraft(parseCurrencyInput(e.target.value))}
            onBlur={handleBudgetBlur}
          />
        </div>
        <div className="card card-pad" style={{ background: 'var(--color-brand-tint)', borderColor: 'var(--color-brand-soft)' }}>
          <div className="section-title">Tổng dự trù</div>
          <p className="text-soft mt-8" style={{ marginBottom: 14, fontSize: 13 }}>Tự động cộng dồn từ tất cả hạng mục bên dưới.</p>
          <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-brand-dark)' }}>
            {formatCurrency(totalPlanned)}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="center-note">Đang tải dữ liệu…</div>
      ) : categories.length === 0 ? (
        <div className="card empty-state">Chưa có hạng mục dự trù nào. Bấm "Thêm hạng mục" để bắt đầu.</div>
      ) : (
        <div className="stack">
          {categories.map((cat) => (
            <div key={cat.id} className="card card-pad">
              <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div className="section-title">{cat.name}</div>
                  {cat.vendor && <div className="text-soft" style={{ fontSize: 13, marginTop: 2 }}>{cat.vendor}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600 }}>{formatCurrency(cat.planned_amount)}</div>
                  </div>
                  <div className="row-actions">
                    <IconButton icon="edit" label="Sửa hạng mục" onClick={() => openEdit(cat)} />
                    <IconButton icon="trash" label="Xóa hạng mục" danger onClick={() => handleDelete(cat)} />
                  </div>
                </div>
              </div>
              {cat.sub_items?.length > 0 && (
                <>
                  <hr className="divider" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {cat.sub_items.map((item, idx) => (
                      <span key={idx} className="badge badge-neutral">{item}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BudgetCategoryForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSubmit={async (payload) => {
            if (editing) await updateCategory(editing.id, payload)
            else await addCategory({ ...payload, sort_order: categories.length + 1 })
          }}
        />
      )}
    </div>
  )
}
