import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout() {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased selection:bg-primary selection:text-on-primary min-h-screen">
      <Sidebar />
      <div className="pl-64">
        <Topbar />
        <main className="relative pt-16 w-full bg-surface min-h-screen px-margin-lg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
