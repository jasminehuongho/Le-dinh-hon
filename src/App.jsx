import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import BudgetPage from './components/budget/BudgetPage'
import ExpensesPage from './components/expenses/ExpensesPage'
import TimelinePage from './components/timeline/TimelinePage'
import OverviewPage from './components/overview/OverviewPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/du-tru" replace />} />
          <Route path="/du-tru" element={<BudgetPage />} />
          <Route path="/chi-phi" element={<ExpensesPage />} />
          <Route path="/tien-do" element={<TimelinePage />} />
          <Route path="/tong-quan" element={<OverviewPage />} />
          <Route path="*" element={<Navigate to="/du-tru" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
