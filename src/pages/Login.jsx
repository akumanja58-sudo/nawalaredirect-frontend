import { useState } from 'react';
import { authAPI } from '../api';

export default function Login({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await authAPI.login(u, p);
      localStorage.setItem('nawala_token', res.data.token);
      onLogin();
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Koneksi gagal');
    } finally { setLoading(false); }
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoIcon}>⬡</div>
          <div>
            <div style={S.logoTitle}>NawalaRedirect</div>
            <div style={S.logoSub}>Domain Gateway System</div>
          </div>
        </div>

        <div style={S.divider} />

        <form onSubmit={handleSubmit} style={S.form}>
          <div style={S.field}>
            <label style={S.label}>Username</label>
            <input style={S.input} value={u} onChange={e=>setU(e.target.value)} autoFocus autoComplete="username" placeholder="admin" />
          </div>
          <div style={S.field}>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" value={p} onChange={e=>setP(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
          </div>
          {err && <div style={S.err}>⚠ {err}</div>}
          <button style={{...S.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div style={S.footer}>Unauthorized access is prohibited</div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:16 },
  card: { width:'100%', maxWidth:380, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'32px 28px', boxShadow:'var(--shadow-md)', animation:'fadeUp .3s ease' },
  logo: { display:'flex', alignItems:'center', gap:12, marginBottom:20 },
  logoIcon: { width:40, height:40, background:'var(--accent)', color:'white', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  logoTitle: { fontWeight:600, fontSize:17, color:'var(--text)', letterSpacing:'-0.3px' },
  logoSub: { fontSize:12, color:'var(--text-muted)', marginTop:1 },
  divider: { height:1, background:'var(--border)', marginBottom:24 },
  form: { display:'flex', flexDirection:'column', gap:14 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:13, fontWeight:500, color:'var(--text-dim)' },
  input: { border:'1px solid var(--border2)', borderRadius:'var(--radius)', padding:'10px 12px', fontSize:14, outline:'none', color:'var(--text)', background:'var(--bg3)', transition:'border .15s' },
  err: { fontSize:13, color:'var(--red)', background:'var(--red-dim)', border:'1px solid rgba(220,38,38,0.15)', borderRadius:'var(--radius)', padding:'10px 12px' },
  btn: { background:'var(--accent)', color:'white', border:'none', borderRadius:'var(--radius)', padding:'11px', fontSize:14, fontWeight:500, cursor:'pointer', transition:'opacity .15s', marginTop:4 },
  footer: { marginTop:20, fontSize:11, color:'var(--text-muted)', textAlign:'center' },
};
