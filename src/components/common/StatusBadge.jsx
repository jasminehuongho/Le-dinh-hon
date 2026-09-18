import { PAYMENT_STATUS_OPTIONS, TASK_STATUS_OPTIONS } from '../../utils/calculations'

const PAYMENT_TONE = {
  unpaid: 'danger',
  deposited: 'warning',
  paid: 'success',
}

const TASK_TONE = {
  not_started: 'neutral',
  in_progress: 'brand',
  done: 'success',
  overdue: 'danger',
}

export function PaymentStatusBadge({ status }) {
  const opt = PAYMENT_STATUS_OPTIONS.find((o) => o.value === status)
  return <span className={`badge badge-${PAYMENT_TONE[status] || 'neutral'}`}><span className="badge-dot" />{opt?.label || status}</span>
}

export function TaskStatusBadge({ status }) {
  const opt = TASK_STATUS_OPTIONS.find((o) => o.value === status)
  return <span className={`badge badge-${TASK_TONE[status] || 'neutral'}`}><span className="badge-dot" />{opt?.label || status}</span>
}
