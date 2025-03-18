import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ProjectRouter from './components/ProjectRouter.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectRouter />
  </StrictMode>,
)
