import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import { authAPI } from './api';
import useAutoLogout from './hooks/useAutoLogout';

function AuthenticatedApp({ onLogout }) {
  const [page, setPage] = useState('dashboard');

  // Auto logout setelah 1 jam tidak aktif
  useAutoLogout(onLogout);

  if (page === 'statistics') return <Statistics onBack={() => setPage('dashboard')} />;
  return <Dashboard onLogout={onLogout} onStats={() => setPage('statistics')} />;
}

export default function App() {
  const [auth, setAuth] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nawala_token');
    if (!token) { setChecking(false); return; }
    authAPI.verify()
      .then(() => setAuth(true))
      .catch(() => localStorage.removeItem('nawala_token'))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 14 }}>
      Memuat...
    </div>
  );

  function handleLogout() {
    localStorage.removeItem('nawala_token');
    setAuth(false);
  }

  if (!auth) return <Login onLogin={() => setAuth(true)} />;
  return <AuthenticatedApp onLogout={handleLogout} />;
}