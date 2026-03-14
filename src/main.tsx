import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <h1 className="text-4xl font-bold text-white">Cookbook</h1>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
