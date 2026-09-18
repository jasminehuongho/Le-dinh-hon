import { useMemo, useState } from 'react'
import Modal from '../common/Modal'
import { formatCurrency, formatNumber, parseCurrencyInput } from '../../utils/formatCurrency'
import { getExpenseVariancePercent, PAYMENT_STATUS_OPTIONS } from '../../utils/calculations'

export default function ExpenseFormModal({ initial, categories, expenses, onClose, onSubmit }) {
  const isEdit = Boolean(initial?.id)
  const [categoryId, setCategoryId] = useState(initial?.category_id || categories[0]?.id || '')
  const [workName, setWorkName] = useState(initial?.work_name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [vendor, setVendor] = useState(initial?.vendor || '')
  const [totalAmount, setTotalAmount] = useState(initial?.total_amount || 0)
  const [paymentStatus, setPaymentStatus] = useState(initial?.payment_status || 'unpaid')
  const [depositAmount, setDepositAmount] = useState(initial?.deposit_amount || 0)
  const [note, setNote] = useState(initial?.note || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const selectedCategory = categories.find((c) => c.id === categoryId)

  const variancePercent = useMemo(
    () => getExpenseVariancePercent(selectedCategory, expenses, totalAmount, initial?.id),
    [selectedCategory, expenses, totalAmount, initial?.id]
  )

  const remainingAfterDeposit = Math.max(Number(totalAmount || 0) - Number(depositAmount || 0), 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!workName.trim()) {
      setError('Vui lòng nhập tên công việc.')
      return
    }
    if (!categoryId) {
      setError('Vui lòng chọn hạng mục dự trù liên kết.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        category_id: categoryId,
        work_name: workName.trim(),
        description: description.trim(),
        vendor: vendor.trim(),
        total_amount: totalAmount,
        payment_status: paymentStatus,
        deposit_amount: paymentStatus === 'deposited' ? depositAmount : 0,
        note: note.trim(),
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
      title={isEdit ? 'Sửa công việc' : 'Thêm công việc'}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button type="submit" form="expense-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu công việc'}
          </button>
        </>
      }
    >
      {error && <div className="banner-error">{error}</div>}
      <form id="expense-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Hạng mục dự trù liên kết</label>
          <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.length === 0 && <option value="">Chưa có hạng mục nào</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <div className="field">
            <label>Công việc</label>
            <input className="input" value={workName} onChange={(e) => setWorkName(e.target.value)} placeholder="VD: Đặt mâm trầu cau" />
          </div>
          <div className="field">
            <label>Nhà cung cấp</label>
            <input className="input" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Tùy chọn" />
          </div>
        </div>

        <div className="field">
          <label>Mô tả</label>
          <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="input-group">
          <div className="field">
            <label>Tổng tiền (VNĐ)</label>
            <input
              className="input"
              inputMode="numeric"
              value={formatNumber(totalAmount)}
              onChange={(e) => setTotalAmount(parseCurrencyInput(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Chênh lệch so với dự trù</label>
            <div
              className="input"
              style={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600,
                color:
                  variancePercent === null
                    ? 'var(--color-ink-faint)'
                    : variancePercent > 0
                    ? 'var(--color-danger)'
                    : 'var(--color-success)',
                background: 'var(--color-surface-muted)',
              }}
            >
              {variancePercent === null
                ? 'Hạng mục chưa có dự trù'
                : `${variancePercent > 0 ? '+' : ''}${variancePercent.toFixed(1)}%`}
            </div>
            <span className="hint">
              So với phần dự trù còn lại của hạng mục sau khi trừ các khoản đã chi trước đó.
            </span>
          </div>
        </div>

        <div className="field">
          <label>Trạng thái thanh toán</label>
          <select className="select" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            {PAYMENT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {paymentStatus === 'deposited' && (
          <div className="input-group">
            <div className="field">
              <label>Số tiền đã cọc (VNĐ)</label>
              <input
                className="input"
                inputMode="numeric"
                value={formatNumber(depositAmount)}
                onChange={(e) => setDepositAmount(parseCurrencyInput(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Còn thiếu</label>
              <div className="input" style={{ display: 'flex', alignItems: 'center', fontWeight: 600, background: 'var(--color-surface-muted)' }}>
                {formatCurrency(remainingAfterDeposit)}
              </div>
            </div>
          </div>
        )}

        <div className="field">
          <label>Ghi chú</label>
          <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </form>
    </Modal>
  )
}
