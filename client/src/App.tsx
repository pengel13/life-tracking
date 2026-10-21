import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './api/client.js'
import Shell from './components/Shell.js'
import Login from './components/Login.js'
import Dashboard from './components/dashboard/Dashboard.js'
import KanbanBoard from './components/kanban/KanbanBoard.js'
import SyncSettings from './components/sync/SyncSettings.js'

function AuthGuard() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return <Shell />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AuthGuard />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/area/:areaId" element={<KanbanBoard />} />
          <Route path="/sync" element={<SyncSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
