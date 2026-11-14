import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="bg-background font-body-md text-ink antialiased selection:bg-sun selection:text-ink min-h-screen">
      <Sidebar />
      <main className="relative mx-auto w-full max-w-5xl min-h-screen px-margin sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
