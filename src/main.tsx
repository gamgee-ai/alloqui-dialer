import { createRoot } from 'react-dom/client'
import './styles.css'
import { Dialer } from './Dialer'

const projectKey = import.meta.env.VITE_ALLOQUI_PROJECT_KEY || 'al_dev_test';
const apiBaseUrl = import.meta.env.VITE_ALLOQUI_API_URL || 'http://localhost:8000';

createRoot(document.getElementById('root')!).render(
  <div className="alloqui-dev-page">
    <h1 className="alloqui-dev-title">Alloqui Dev</h1>
    <Dialer projectKey={projectKey} apiBaseUrl={apiBaseUrl} mode="panel" theme="dark" />
  </div>,
)
