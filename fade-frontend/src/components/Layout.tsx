import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased selection:bg-primary selection:text-on-primary min-h-screen">
      <Sidebar />
      <main className="relative mx-auto w-full max-w-5xl min-h-screen px-margin sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
