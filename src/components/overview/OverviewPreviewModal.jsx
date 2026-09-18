import Modal from '../common/Modal'
import { PaymentStatusBadge, TaskStatusBadge } from '../common/StatusBadge'
import { formatCurrency, formatDateVN } from '../../utils/formatCurrency'

function Row({ label, children }) {
  return (
    <div className="flex-between" style={{ alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-soft" style={{ fontSize: 13, flexShrink: 0, width: 160 }}>{label}</span>
      <span style={{ textAlign: 'right', fontWeight: 500 }}>{children}</span>
    </div>
  )
}

export default function OverviewPreviewModal({ expense, category, relatedTasks, onClose }) {
  if (!expense) return null
  const remaining = expense.payment_status === 'deposited'
    ? Number(expense.total_amount || 0) - Number(expense.deposit_amount || 0)
    : null

  return (
    <Modal title={expense.work_name} onClose={onClose} wide footer={<button className="btn btn-secondary" onClick={onClose}>Đóng</button>}>
      <div className="section-title" style={{ fontSize: 14.5, marginBottom: 4 }}>Chi phí chi tiết</div>
      <div style={{ marginBottom: 20 }}>
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

      <div className="section-title" style={{ fontSize: 14.5, marginBottom: 4 }}>Tiến độ liên quan</div>
      {relatedTasks.length === 0 ? (
        <p className="text-faint" style={{ fontSize: 13.5 }}>Chưa có công việc tiến độ nào liên kết đến mục này.</p>
      ) : (
        <div className="stack">
          {relatedTasks.map((t) => (
            <div key={t.id} className="card card-pad" style={{ padding: 14 }}>
              <div className="flex-between">
                <span style={{ fontWeight: 600, fontSize: 14 }}>{t.task_name}</span>
                <TaskStatusBadge status={t.status} />
              </div>
              <div className="text-soft" style={{ fontSize: 13, marginTop: 4 }}>
                Deadline: {t.deadline ? formatDateVN(t.deadline) : '—'}
                {t.assignee ? ` · Phụ trách: ${t.assignee}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
