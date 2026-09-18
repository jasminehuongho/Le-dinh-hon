import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  {
    to: '/du-tru',
    label: 'Dự trù kinh phí',
    icon: (
      <path d="M3 15V5a1 1 0 0 1 1-1h6l2 2h4a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    ),
  },
  {
    to: '/chi-phi',
    label: 'Quản lý chi phí chi tiết',
    icon: (
      <path d="M4 3h9l3 3v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z M13 3v3h3 M6.5 9h7 M6.5 12h7 M6.5 15h4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    ),
  },
  {
    to: '/tien-do',
    label: 'Quản lý tiến độ',
    icon: (
      <path d="M10 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z M10 6.5V10l2.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    to: '/tong-quan',
    label: 'Tổng quan',
    icon: (
      <path d="M3 16.5V9.5 M8 16.5V4.5 M13 16.5V11 M17 16.5V7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    ),
  },
]

export default function Sidebar({ open, onNavigate }) {
  return (
    <nav className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <div className="eyebrow">LỄ ĐÍNH HÔN</div>
        <h1>Ngân sách &amp; Chi phí</h1>
        <div className="date">02 · 01 · 2027 — Xã Tân Thủy, Vĩnh Long</div>
      </div>
      <div className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <svg className="icon" viewBox="0 0 20 20">{item.icon}</svg>
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="sidebar-foot">Dữ liệu đồng bộ trực tiếp cho mọi người tham gia.</div>
    </nav>
  )
}
