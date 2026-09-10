import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { MembershipProvider } from './context/MembershipProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MembershipProvider>
        <App />
      </MembershipProvider>
    </BrowserRouter>
  </StrictMode>,
)
