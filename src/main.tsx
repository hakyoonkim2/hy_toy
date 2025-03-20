import { createRoot } from 'react-dom/client'
import './index.scss'
import ProjectRouter from './components/ProjectRouter.tsx'

createRoot(document.getElementById('root')!).render(
    <ProjectRouter />
)
