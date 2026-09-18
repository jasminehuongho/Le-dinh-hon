// Tất cả công thức tính toán dùng chung — luôn tính lại từ dữ liệu gốc,
// không có số liệu hard-code.

export function sumPlannedBudget(categories) {
  return (categories || []).reduce((sum, c) => sum + Number(c.planned_amount || 0), 0)
}

export function sumExpensesTotal(expenses) {
  return (expenses || []).reduce((sum, e) => sum + Number(e.total_amount || 0), 0)
}

export function getDepositRemaining(expense) {
  if (!expense) return 0
  if (expense.payment_status !== 'deposited') return 0
  return Number(expense.total_amount || 0) - Number(expense.deposit_amount || 0)
}

// Ngân sách còn lại của 1 hạng mục, sau khi trừ lũy kế các khoản chi ĐÃ có
// (không tính khoản đang nhập/đang sửa — truyền excludeExpenseId khi edit).
export function getCategoryRemainingBudget(category, expenses, excludeExpenseId) {
  if (!category) return 0
  const spent = (expenses || [])
    .filter((e) => e.category_id === category.id && e.id !== excludeExpenseId)
    .reduce((sum, e) => sum + Number(e.total_amount || 0), 0)
  return Number(category.planned_amount || 0) - spent
}

// % chênh lệch của khoản đang nhập so với phần ngân sách CÒN LẠI của hạng mục
// (đã trừ lũy kế các khoản chi trước đó thuộc cùng hạng mục).
// > 0 : vượt phần ngân sách còn lại theo tỉ lệ %
// < 0 : vẫn còn dư trong ngân sách còn lại
// null: hạng mục còn lại = 0, không có cơ sở tính %
export function getExpenseVariancePercent(category, expenses, currentAmount, excludeExpenseId) {
  const remaining = getCategoryRemainingBudget(category, expenses, excludeExpenseId)
  const amount = Number(currentAmount || 0)
  if (!remaining) return remaining === 0 && amount === 0 ? 0 : null
  return ((amount - remaining) / Math.abs(remaining)) * 100
}

export function sumCategorySpent(categoryId, expenses) {
  return (expenses || [])
    .filter((e) => e.category_id === categoryId)
    .reduce((sum, e) => sum + Number(e.total_amount || 0), 0)
}

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Chưa thanh toán' },
  { value: 'deposited', label: 'Đã đặt cọc' },
  { value: 'paid', label: 'Đã thanh toán đủ' },
]

export const TASK_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Chưa bắt đầu' },
  { value: 'in_progress', label: 'Đang làm' },
  { value: 'done', label: 'Hoàn thành' },
  { value: 'overdue', label: 'Trễ hạn' },
]

const DAY_MS = 24 * 60 * 60 * 1000

export function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / DAY_MS)
}

// Task được coi là "quá hạn" khi deadline đã qua và chưa hoàn thành,
// bất kể trạng thái người dùng đang chọn là gì.
export function isTaskOverdue(task) {
  if (!task || !task.deadline || task.status === 'done') return false
  const days = getDaysUntil(task.deadline)
  return days !== null && days < 0
}

// Task khẩn cấp: deadline trong vòng 3 ngày tới (kể cả hôm nay), chưa hoàn thành.
export function isTaskUrgent(task) {
  if (!task || !task.deadline || task.status === 'done') return false
  const days = getDaysUntil(task.deadline)
  return days !== null && days >= 0 && days <= 3
}

export function sortTasksByDeadline(tasks) {
  return [...(tasks || [])].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return new Date(a.deadline) - new Date(b.deadline)
  })
}
