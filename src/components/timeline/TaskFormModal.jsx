import { useState } from 'react'
import Modal from '../common/Modal'
import { TASK_STATUS_OPTIONS } from '../../utils/calculations'

export default function TaskFormModal({ initial, categories, expenses, onClose, onSubmit }) {
  const isEdit = Boolean(initial?.id)
  const [taskName, setTaskName] = useState(initial?.task_name || '')
  const [categoryId, setCategoryId] = useState(initial?.category_id || '')
  const [expenseId, setExpenseId] = useState(initial?.expense_id || '')
  const [deadline, setDeadline] = useState(initial?.deadline || '')
  const [status, setStatus] = useState(initial?.status || 'not_started')
  const [assignee, setAssignee] = useState(initial?.assignee || '')
  const [note, setNote] = useState(initial?.note || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!taskName.trim()) {
      setError('Vui lòng nhập tên công việc.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        task_name: taskName.trim(),
        category_id: categoryId || null,
        expense_id: expenseId || null,
        deadline: deadline || null,
        status,
        assignee: assignee.trim(),
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
      title={isEdit ? 'Sửa công việc tiến độ' : 'Thêm công việc tiến độ'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button type="submit" form="task-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu công việc'}
          </button>
        </>
      }
    >
      {error && <div className="banner-error">{error}</div>}
      <form id="task-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Tên công việc</label>
          <input className="input" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="VD: Đặt cổng hoa" />
        </div>

        <div className="input-group">
          <div className="field">
            <label>Hạng mục liên quan</label>
            <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">— Không chọn —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Thuộc Công việc (mục Chi phí chi tiết)</label>
            <select className="select" value={expenseId} onChange={(e) => setExpenseId(e.target.value)}>
              <option value="">— Không liên kết —</option>
              {expenses.map((e) => (
                <option key={e.id} value={e.id}>{e.work_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <div className="field">
            <label>Deadline</label>
            <input className="input" type="date" value={deadline || ''} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="field">
            <label>Trạng thái</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {TASK_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Người phụ trách</label>
          <input className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Tên người phụ trách" />
        </div>

        <div className="field">
          <label>Ghi chú</label>
          <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </form>
    </Modal>
  )
}
