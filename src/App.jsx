import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { authAPI } from './api';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nawala_token');
    if (!token) { setChecking(false); return; }
    authAPI.verify()
      .then(() => setAuthed(true))
      .catch(() => localStorage.removeItem('nawala_token'))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:16}}>
      <div style={{color:'var(--green)',fontFamily:'var(--mono)',fontSize:13,letterSpacing:2}}>
        INITIALIZING SYSTEM<span style={{animation:'blink 1s step-end infinite'}}>_</span>
      </div>
    </div>
  );

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => { localStorage.removeItem('nawala_token'); setAuthed(false); }} />;
}
