import { createRoot } from 'react-dom/client'
import './styles.css'
import { Dialer } from './Dialer'

const projectKey = import.meta.env.VITE_PHONON_PROJECT_KEY || 'ph_dev_test';
const apiBaseUrl = import.meta.env.VITE_PHONON_API_URL || 'http://localhost:8000';

createRoot(document.getElementById('root')!).render(
  <div className="phonon-dev-page">
    <h1 className="phonon-dev-title">Phonon Dev</h1>
    <Dialer projectKey={projectKey} apiBaseUrl={apiBaseUrl} mode="panel" theme="dark" />
  </div>,
)
