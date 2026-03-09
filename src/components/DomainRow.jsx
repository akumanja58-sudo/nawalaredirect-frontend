import { useState } from 'react';
import { domainAPI } from '../api';
import api from '../api';

export default function DomainRow({ domain, onRefresh, groups = [] }) {
  const [checking, setChecking] = useState(false);
  const [checkingISP, setCheckingISP] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [settingPriority, setSettingPriority] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false);
  const [groupInput, setGroupInput] = useState(domain.group_name || '');
  const [ispResult, setIspResult] = useState(null);

  const isBlocked = domain.is_blocked === 1;
  const isInactive = domain.is_active === 0;
  const isPriority = domain.is_priority === 1;
  const statusColor = isBlocked ? 'var(--red)' : isInactive ? 'var(--text-muted)' : 'var(--green)';
  const statusLabel = isBlocked ? 'Nawala' : isInactive ? 'Nonaktif' : 'Aktif';
  const statusBg = isBlocked ? 'var(--red-dim)' : isInactive ? '#f4f4f5' : 'var(--green-dim)';

  async function handleCheck() {
    setChecking(true);
    try { await domainAPI.checkOne(domain.id); await onRefresh(); }
    catch (e) { alert('Check gagal: ' + (e.response?.data?.error || e.message)); }
    finally { setChecking(false); }
  }

  async function handleCheckISP() {
    setCheckingISP(true);
    setIspResult(null);
    try {
      const res = await api.post(`/api/domains/${domain.id}/check-isp`);
      setIspResult(res.data);
      await onRefresh();
    } catch (e) {
      alert('Cek gagal: ' + (e.response?.data?.error || e.message));
    } finally { setCheckingISP(false); }
  }

  async function handleToggle() {
    setToggling(true);
    try { await domainAPI.update(domain.id, { is_active: domain.is_active === 1 ? 0 : 1 }); await onRefresh(); }
    catch { alert('Update gagal'); }
    finally { setToggling(false); }
  }

  async function handleDelete() {
    if (!confirm(`Hapus domain:\n${domain.url}?`)) return;
    setDeleting(true);
    try { await domainAPI.delete(domain.id); await onRefresh(); }
    catch { alert('Hapus gagal'); }
    finally { setDeleting(false); }
  }

  async function handleSetPriority() {
    if (isPriority) return; // udah prioritas
    setSettingPriority(true);
    try {
      await api.post(`/api/domains/${domain.id}/set-priority`);
      await onRefresh();
    } catch { alert('Gagal set prioritas'); }
    finally { setSettingPriority(false); }
  }

  async function handleSaveGroup() {
    try {
      await domainAPI.setGroup(domain.id, groupInput);
      setEditingGroup(false);
      await onRefresh();
    } catch { alert('Gagal simpan group'); }
  }

  return (
    <div style={{ ...S.row, borderLeft: isPriority ? '3px solid #f59e0b' : '3px solid transparent' }}>
      <div style={{ ...S.statusDot, background: statusColor }} />
      <div style={S.info}>
        <div style={S.urlRow}>
          {/* Bintang prioritas */}
          <button
            onClick={handleSetPriority}
            disabled={settingPriority || isPriority}
            title={isPriority ? 'Domain prioritas utama' : 'Jadikan prioritas'}
            style={{ ...S.starBtn, color: isPriority ? '#f59e0b' : 'var(--border2)', cursor: isPriority ? 'default' : 'pointer' }}
          >
            {isPriority ? '★' : '☆'}
          </button>
          <span style={S.url}>{domain.url}</span>
          {domain.group_name && <span style={S.groupTag}>{domain.group_name}</span>}
          {isPriority && <span style={S.priorityTag}>Prioritas</span>}
          <span style={{ ...S.badge, background: statusBg, color: statusColor }}>{statusLabel}</span>
        </div>
        <div style={S.meta}>
          {domain.label && <span style={S.metaLabel}>{domain.label}</span>}
          {domain.response_time && <span style={S.metaItem}>{domain.response_time}ms</span>}
          {domain.last_checked && <span style={S.metaItem}>Cek: {new Date(domain.last_checked).toLocaleTimeString('id-ID')}</span>}
          {domain.fail_count > 0 && <span style={{ ...S.metaItem, color: 'var(--red)' }}>Gagal: {domain.fail_count}x</span>}
        </div>

        {/* Hasil cek indiwtf */}
        {ispResult && (
          <div style={{ ...S.ispResult, background: ispResult.isBlocked ? 'var(--red-dim)' : 'var(--green-dim)', borderColor: ispResult.isBlocked ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)', color: ispResult.isBlocked ? 'var(--red)' : 'var(--green)' }}>
            {ispResult.isBlocked ? '🚫 Domain ini terkena Nawala/Kominfo!' : '✅ Domain ini aman, tidak terkena Nawala'}
          </div>
        )}

        {editingGroup && (
          <div style={S.editRow}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Group:</span>
            <input style={S.editInput} list="group-list" value={groupInput}
              onChange={e => setGroupInput(e.target.value)}
              placeholder="nama group" autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveGroup()} />
            <datalist id="group-list">
              {groups.map(g => <option key={g} value={g} />)}
            </datalist>
            <button style={S.saveBtn} onClick={handleSaveGroup}>Simpan</button>
            <button style={S.cancelBtn} onClick={() => setEditingGroup(false)}>Batal</button>
          </div>
        )}
      </div>
      <div style={S.actions}>
        <button style={S.actionBtn} onClick={() => setEditingGroup(!editingGroup)} title="Set group">Group</button>
        <button style={{ ...S.actionBtn, color: checkingISP ? 'var(--text-muted)' : 'var(--blue)' }} onClick={handleCheckISP} disabled={checkingISP} title="Cek Nawala">
          {checkingISP ? '...' : '🇮🇩'}
        </button>
        <button style={S.actionBtn} onClick={handleCheck} disabled={checking} title="Basic check">
          {checking ? '...' : '↻'}
        </button>
        <button style={S.actionBtn} onClick={handleToggle} disabled={toggling}>
          {domain.is_active === 1 ? '⏸' : '▶'}
        </button>
        <button style={{ ...S.actionBtn, color: 'var(--red)' }} onClick={handleDelete} disabled={deleting}>
          {deleting ? '...' : '✕'}
        </button>
      </div>
    </div>
  );
}

const S = {
  row: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', transition: 'border-left-color .2s' },
  statusDot: { width: 7, height: 7, borderRadius: '50%', marginTop: 6, flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  urlRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  starBtn: { background: 'transparent', border: 'none', fontSize: 16, padding: '0 2px', lineHeight: 1, flexShrink: 0 },
  url: { fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320, fontFamily: 'var(--mono)' },
  groupTag: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' },
  priorityTag: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
  badge: { fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20 },
  meta: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4, alignItems: 'center' },
  metaLabel: { fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 },
  metaItem: { fontSize: 11, color: 'var(--text-muted)' },
  ispResult: { marginTop: 8, fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 6, border: '1px solid' },
  actions: { display: 'flex', gap: 4, flexShrink: 0 },
  actionBtn: { background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-dim)', cursor: 'pointer', padding: '5px 9px', fontSize: 13, borderRadius: 6 },
  editRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 },
  editInput: { border: '1px solid var(--border2)', borderRadius: 6, padding: '5px 10px', fontSize: 12, outline: 'none', color: 'var(--text)', width: 160, background: 'var(--bg3)' },
  saveBtn: { background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  cancelBtn: { background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-dim)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12 },
};
