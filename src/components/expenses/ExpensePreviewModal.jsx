import Modal from '../common/Modal'
import { PaymentStatusBadge } from '../common/StatusBadge'
import { formatCurrency } from '../../utils/formatCurrency'

function Row({ label, children }) {
  return (
    <div className="flex-between" style={{ alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-soft" style={{ fontSize: 13, flexShrink: 0, width: 160 }}>{label}</span>
      <span style={{ textAlign: 'right', fontWeight: 500 }}>{children}</span>
    </div>
  )
}

export default function ExpensePreviewModal({ expense, category, onClose }) {
  if (!expense) return null
  const remaining = expense.payment_status === 'deposited'
    ? Number(expense.total_amount || 0) - Number(expense.deposit_amount || 0)
    : null

  return (
    <Modal title={expense.work_name} onClose={onClose} footer={<button className="btn btn-secondary" onClick={onClose}>Đóng</button>}>
      <div>
        <Row label="Hạng mục dự trù">{category?.name || '—'}</Row>
        <Row label="Mô tả">{expense.description || '—'}</Row>
        <Row label="Nhà cung cấp">{expense.vendor || '—'}</Row>
        <Row label="Tổng tiền">{formatCurrency(expense.total_amount)}</Row>
        <Row label="Trạng thái thanh toán"><PaymentStatusBadge status={expense.payment_status} /></Row>
        {expense.payment_status === 'deposited' && (
          <>
            <Row label="Số tiền đã cọc">{formatCurrency(expense.deposit_amount)}</Row>
            <Row label="Còn thiếu">{formatCurrency(remaining)}</Row>
          </>
        )}
        <Row label="Ghi chú">{expense.note || '—'}</Row>
      </div>
    </Modal>
  )
}
