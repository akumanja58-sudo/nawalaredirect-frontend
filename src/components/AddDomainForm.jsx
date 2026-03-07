import { useState, useEffect } from 'react';
import { domainAPI } from '../api';

export default function AddDomainForm({ onAdded, groups = [] }) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [group, setGroup] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [useNewGroup, setUseNewGroup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const finalGroup = useNewGroup ? newGroup : group;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) { setErr('URL wajib diisi'); return; }
    setErr(''); setOk(''); setLoading(true);
    try {
      await domainAPI.add(url.trim(), label.trim(), finalGroup.trim());
      setOk('Domain berhasil ditambahkan!');
      setUrl(''); setLabel('');
      await onAdded();
      setTimeout(() => setOk(''), 3000);
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Gagal tambah domain');
    } finally { setLoading(false); }
  }

  return (
    <div style={S.box}>
      <div style={S.title}>Tambah Domain</div>
      <form onSubmit={handleSubmit}>
        <div style={S.row}>
          <div style={S.fieldWide}>
            <label style={S.label}>URL Domain</label>
            <div style={S.inputGroup}>
              <span style={S.inputPrefix}>https://</span>
              <input style={S.inputInner} placeholder="contoh.com"
                value={url.replace(/^https?:\/\//, '')}
                onChange={e => setUrl('https://' + e.target.value)} />
            </div>
          </div>
          <div style={S.fieldMid}>
            <label style={S.label}>Label <span style={{ color: 'var(--text-muted)' }}>(opsional)</span></label>
            <input style={S.input} placeholder="nama toko" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div style={S.fieldMid}>
            <label style={S.label}>
              Group
              <button type="button" style={S.toggleBtn} onClick={() => setUseNewGroup(!useNewGroup)}>
                {useNewGroup ? '← Pilih existing' : '+ Group baru'}
              </button>
            </label>
            {useNewGroup ? (
              <input style={S.input} placeholder="nama group baru (cth: slot)" value={newGroup} onChange={e => setNewGroup(e.target.value)} />
            ) : (
              <select style={S.select} value={group} onChange={e => setGroup(e.target.value)}>
                <option value="">-- Tanpa group --</option>
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}
          </div>
          <div style={S.fieldBtn}>
            <label style={{ ...S.label, opacity: 0 }}>x</label>
            <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Menambahkan...' : '+ Tambah'}
            </button>
          </div>
        </div>
        {err && <div style={S.err}>⚠ {err}</div>}
        {ok && <div style={S.ok}>✓ {ok}</div>}
      </form>
    </div>
  );
}

const S = {
  box: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', marginBottom: 16, boxShadow: 'var(--shadow)' },
  title: { fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 14 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' },
  fieldWide: { flex: 2, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 5 },
  fieldMid: { flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 5 },
  fieldBtn: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 8 },
  toggleBtn: { fontSize: 10, background: 'transparent', border: '1px solid var(--border2)', color: 'var(--blue)', padding: '1px 6px', borderRadius: 4, cursor: 'pointer' },
  inputGroup: { display: 'flex', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg3)' },
  inputPrefix: { padding: '9px 10px', background: 'var(--bg)', borderRight: '1px solid var(--border2)', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  inputInner: { flex: 1, border: 'none', padding: '9px 12px', fontSize: 13, outline: 'none', color: 'var(--text)', background: 'var(--bg3)' },
  input: { border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '9px 12px', fontSize: 13, outline: 'none', color: 'var(--text)', background: 'var(--bg3)' },
  select: { border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '9px 12px', fontSize: 13, outline: 'none', color: 'var(--text)', background: 'var(--bg3)', cursor: 'pointer' },
  btn: { background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' },
  err: { marginTop: 10, fontSize: 12, color: 'var(--red)', background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 'var(--radius)', padding: '8px 12px' },
  ok: { marginTop: 10, fontSize: 12, color: 'var(--green)', background: 'var(--green-dim)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 'var(--radius)', padding: '8px 12px' },
};
