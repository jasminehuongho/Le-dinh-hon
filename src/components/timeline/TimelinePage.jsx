import { useMemo, useState } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { useBudgetCategories } from '../../hooks/useBudgetCategories'
import { useExpenses } from '../../hooks/useExpenses'
import {
  sortTasksByDeadline,
  isTaskOverdue,
  isTaskUrgent,
  getDaysUntil,
} from '../../utils/calculations'
import { TaskStatusBadge } from '../common/StatusBadge'
import { formatDateVN } from '../../utils/formatCurrency'
import IconButton from '../common/IconButton'
import TaskFormModal from './TaskFormModal'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

function DeadlineTag({ task }) {
  if (!task.deadline) return <span className="text-faint">Chưa đặt deadline</span>
  const overdue = isTaskOverdue(task)
  const urgent = isTaskUrgent(task)
  const days = getDaysUntil(task.deadline)
  let text = formatDateVN(task.deadline)
  if (overdue) text += ` · Trễ ${Math.abs(days)} ngày`
  else if (urgent) text += days === 0 ? ' · Hôm nay' : ` · Còn ${days} ngày`
  return <span className={`deadline-flag${overdue ? ' overdue' : urgent ? ' urgent' : ''}`}>{text}</span>
}

function TaskItem({ task, category, expense, onEdit, onDelete }) {
  const overdue = isTaskOverdue(task)
  const urgent = isTaskUrgent(task)
  return (
    <div className={`task-card${overdue ? ' overdue' : urgent ? ' urgent' : ''}`}>
      <div className="task-main">
        <div className="task-name">{task.task_name}</div>
        <div className="task-meta">
          <DeadlineTag task={task} />
          <TaskStatusBadge status={task.status} />
          {category && <span>Hạng mục: {category.name}</span>}
          {expense && <span>Thuộc: {expense.work_name}</span>}
          {task.assignee && <span>Phụ trách: {task.assignee}</span>}
        </div>
        {task.note && <div className="text-soft mt-8" style={{ fontSize: 13 }}>{task.note}</div>}
      </div>
      <div className="row-actions">
        <IconButton icon="edit" label="Sửa" onClick={() => onEdit(task)} />
        <IconButton icon="trash" label="Xóa" danger onClick={() => onDelete(task)} />
      </div>
    </div>
  )
}

export default function TimelinePage() {
  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTasks()
  const { categories } = useBudgetCategories()
  const { expenses } = useExpenses()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const sortedTasks = useMemo(() => sortTasksByDeadline(tasks), [tasks])
  const overdueTasks = useMemo(() => sortedTasks.filter(isTaskOverdue), [sortedTasks])

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))
  const expenseById = Object.fromEntries(expenses.map((e) => [e.id, e]))

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(task) {
    setEditing(task)
    setShowForm(true)
  }

  async function handleDelete(task) {
    if (!window.confirm(`Xóa công việc tiến độ "${task.task_name}"?`)) return
    await deleteTask(task.id)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Kế hoạch chuẩn bị</div>
          <h2>Quản lý tiến độ</h2>
          <p className="subtitle">Theo dõi deadline từng công việc chuẩn bị, sắp xếp theo hạn gần nhất.</p>
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

      {overdueTasks.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 22, borderColor: 'var(--color-danger)', background: 'var(--color-danger-bg)' }}>
          <div className="section-title" style={{ color: 'var(--color-danger)' }}>
            ⚠ Đã quá hạn ({overdueTasks.length})
          </div>
          <p className="text-soft" style={{ fontSize: 13, marginBottom: 14 }}>Các công việc sau đã trễ deadline và chưa hoàn thành — cần xử lý ngay.</p>
          <div>
            {overdueTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                category={categoryById[task.category_id]}
                expense={expenseById[task.expense_id]}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      <div className="section-title" style={{ marginBottom: 12 }}>Tất cả công việc</div>
      {loading ? (
        <div className="center-note">Đang tải dữ liệu…</div>
      ) : sortedTasks.length === 0 ? (
        <div className="card empty-state">Chưa có công việc tiến độ nào. Bấm "Thêm công việc" để bắt đầu.</div>
      ) : (
        <div>
          {sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              category={categoryById[task.category_id]}
              expense={expenseById[task.expense_id]}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TaskFormModal
          initial={editing}
          categories={categories}
          expenses={expenses}
          onClose={() => setShowForm(false)}
          onSubmit={async (payload) => {
            if (editing) await updateTask(editing.id, payload)
            else await addTask(payload)
          }}
        />
      )}
    </div>
  )
}
