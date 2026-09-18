import { useState } from 'react'
import Modal from '../common/Modal'
import IconButton from '../common/IconButton'
import { parseCurrencyInput, formatNumber } from '../../utils/formatCurrency'

export default function BudgetCategoryForm({ initial, onClose, onSubmit }) {
  const [name, setName] = useState(initial?.name || '')
  const [plannedAmount, setPlannedAmount] = useState(initial?.planned_amount || 0)
  const [vendor, setVendor] = useState(initial?.vendor || '')
  const [subItems, setSubItems] = useState(initial?.sub_items || [])
  const [newSubItem, setNewSubItem] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEdit = Boolean(initial?.id)

  function addSubItem() {
    const text = newSubItem.trim()
    if (!text) return
    setSubItems((items) => [...items, text])
    setNewSubItem('')
  }

  function removeSubItem(idx) {
    setSubItems((items) => items.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Vui lòng nhập tên hạng mục.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        planned_amount: plannedAmount,
        vendor: vendor.trim(),
        sub_items: subItems,
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Sửa hạng mục dự trù' : 'Thêm hạng mục dự trù'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button type="submit" form="budget-category-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu hạng mục'}
          </button>
        </>
      }
    >
      {error && <div className="banner-error">{error}</div>}
      <form id="budget-category-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Tên hạng mục</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Trang trí" />
        </div>
        <div className="input-group">
          <div className="field">
            <label>Số tiền dự trù (VNĐ)</label>
            <input
              className="input"
              inputMode="numeric"
              value={formatNumber(plannedAmount)}
              onChange={(e) => setPlannedAmount(parseCurrencyInput(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Đơn vị / Nhà cung cấp</label>
            <input className="input" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Tùy chọn" />
          </div>
        </div>

        <div className="field">
          <label>Hạng mục con (ghi chú, không bắt buộc)</label>
          <div className="stack">
            {subItems.map((item, idx) => (
              <div key={idx} className="flex-between" style={{ padding: '8px 12px', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 13.5 }}>{item}</span>
                <IconButton icon="trash" label="Xóa hạng mục con" danger onClick={() => removeSubItem(idx)} />
              </div>
            ))}
          </div>
          <div className="flex-between mt-8" style={{ gap: 8 }}>
            <input
              className="input"
              value={newSubItem}
              onChange={(e) => setNewSubItem(e.target.value)}
              placeholder="Thêm ghi chú hạng mục con…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSubItem()
                }
              }}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={addSubItem}>+ Thêm</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
