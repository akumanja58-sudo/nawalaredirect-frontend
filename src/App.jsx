import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import { authAPI } from './api';

export default function App() {
  const [auth, setAuth] = useState(false);
  const [page, setPage] = useState('dashboard');
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

  if (!auth) return <Login onLogin={() => setAuth(true)} />;

  function handleLogout() {
    localStorage.removeItem('nawala_token');
    setAuth(false);
    setPage('dashboard');
  }

  if (page === 'statistics') return <Statistics onBack={() => setPage('dashboard')} />;

  return <Dashboard onLogout={handleLogout} onStats={() => setPage('statistics')} />;
}
