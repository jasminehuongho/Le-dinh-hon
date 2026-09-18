import IconButton from '../common/IconButton'
import { PaymentStatusBadge } from '../common/StatusBadge'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ExpenseTable({ expenses, onPreview, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return <div className="card empty-state">Chưa có công việc nào. Bấm "+ Thêm công việc" để bắt đầu.</div>
  }

  return (
    <div className="card table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 56 }}>STT</th>
            <th>Công việc</th>
            <th className="cell-num">Tổng tiền</th>
            <th>Trạng thái thanh toán</th>
            <th style={{ width: 140 }}></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, idx) => (
            <tr key={expense.id}>
              <td>{idx + 1}</td>
              <td>{expense.work_name}</td>
              <td className="cell-num">{formatCurrency(expense.total_amount)}</td>
              <td><PaymentStatusBadge status={expense.payment_status} /></td>
              <td>
                <div className="row-actions">
                  <IconButton icon="eye" label="Xem chi tiết" onClick={() => onPreview(expense)} />
                  <IconButton icon="edit" label="Sửa" onClick={() => onEdit(expense)} />
                  <IconButton icon="trash" label="Xóa" danger onClick={() => onDelete(expense)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
