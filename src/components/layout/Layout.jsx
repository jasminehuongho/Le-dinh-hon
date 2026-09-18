import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import IconButton from '../common/IconButton'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-shell">
      <div className="topbar">
        <h1>Ngân sách Lễ đính hôn</h1>
        <IconButton icon={mobileOpen ? 'close' : 'menu'} label="Mở menu" onClick={() => setMobileOpen((v) => !v)} />
      </div>
      <Sidebar open={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
