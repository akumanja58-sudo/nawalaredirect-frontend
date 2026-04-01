import { useState, useEffect, useCallback } from 'react';
import { domainAPI } from '../api';
import StatCard from '../components/StatCard';
import DomainRow from '../components/DomainRow';
import AddDomainForm from '../components/AddDomainForm';

const API_URL = import.meta.env.VITE_API_URL || 'https://nawalaredirect-backend-production.up.railway.app';

export default function Dashboard({ onLogout, onStats }) {
  const [domains, setDomains] = useState([]);
  const [stats, setStats] = useState(null);
  const [groupStats, setGroupStats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAll, setCheckingAll] = useState(false);
  const [checkingAllISP, setCheckingAllISP] = useState(false);
  const [filter, setFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [dRes, sRes, gRes] = await Promise.all([
        domainAPI.getAll(),
        domainAPI.getStats(),
        domainAPI.getGroups(),
      ]);
      setDomains(dRes.data.data || []);
      setStats(sRes.data.stats);
      setGroupStats(sRes.data.groupStats || []);
      setGroups(gRes.data.groups || []);
      setLastUpdate(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const t = setInterval(fetchData, 60000);
    return () => clearInterval(t);
  }, [fetchData]);

  async function handleCheckAll() {
    setCheckingAll(true);
    try { await domainAPI.checkAll(); await fetchData(); }
    catch { alert('Check gagal'); }
    finally { setCheckingAll(false); }
  }

  async function handleCheckAllISP() {
    setCheckingAllISP(true);
    try { await domainAPI.checkAllISP(); await fetchData(); }
    catch { alert('ISP check gagal'); }
    finally { setCheckingAllISP(false); }
  }

  // Group domains
  const noGroup = domains.filter(d => !d.group_name || d.group_name === '');
  const groupMap = {};
  groups.forEach(g => {
    groupMap[g] = domains.filter(d => d.group_name === g);
  });

  // Filter function
  const applyFilter = (list) => list.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'active') return d.is_active === 1 && d.is_blocked === 0;
    if (filter === 'blocked') return d.is_blocked === 1;
    if (filter === 'inactive') return d.is_active === 0;
    return true;
  });

  // Semua group + tanpa group
  const allGroupEntries = [
    ...groups.map(g => ({ name: g, domains: groupMap[g] || [] })),
    ...(noGroup.length > 0 ? [{ name: '', domains: noGroup }] : []),
  ];

  const filteredGroupEntries = allGroupEntries
    .map(e => ({ ...e, domains: applyFilter(e.domains) }))
    .filter(e => e.domains.length > 0);

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.logoMark}>⬡</div>
          <div>
            <div style={S.logoTitle}>NawalaRedirect</div>
            <div style={S.logoSub}>Domain Gateway Control Panel</div>
          </div>
        </div>
        <div style={S.headerRight}>
          <div style={S.clockBox}>
            <div style={S.clock}>{time.toLocaleTimeString('id-ID', { hour12: false })}</div>
            <div style={S.clockDate}>{time.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </div>
          <div style={S.gatewayBox}>
            <div style={S.gatewayLabel}>Gateway URL</div>
            <a href={API_URL} target="_blank" rel="noreferrer" style={S.gatewayUrl}>{API_URL.replace('https://', '')}</a>
          </div>
          <button onClick={onStats} style={{ ...S.logoutBtn, marginRight: 4, color: 'var(--blue)', borderColor: 'rgba(37,99,235,0.3)' }}>📊 Statistik</button>
          <button onClick={onLogout} style={S.logoutBtn}>Keluar</button>
        </div>
      </header>

      <div style={S.divider} />

      <main style={S.main}>
        {/* Stats global */}
        {stats && (
          <div style={S.statsRow}>
            <StatCard label="Total Domain" value={stats.total} icon="◈" />
            <StatCard label="Aktif" value={stats.active} icon="●" color="var(--green)" />
            <StatCard label="Nawala" value={stats.blocked} icon="✕" color="var(--red)" />
            <StatCard label="Nonaktif" value={stats.inactive} icon="⏸" color="var(--text-muted)" />
            <StatCard label="Redirect Hari Ini" value={stats.todayRedirects} icon="⇒" color="var(--blue)" />
            <StatCard label="Total Redirect" value={stats.totalRedirects} icon="∑" color="var(--text-dim)" />
          </div>
        )}

        {/* Add form */}
        <AddDomainForm onAdded={fetchData} groups={groups} />

        {/* List header */}
        <div style={S.listHeader}>
          <div style={S.listTitle}>
            Daftar Domain
            {lastUpdate && <span style={S.lastUpdate}> · diperbarui {lastUpdate.toLocaleTimeString('id-ID')}</span>}
          </div>
          <div style={S.controls}>
            <div style={S.tabs}>
              {[['all', 'Semua'], ['active', 'Aktif'], ['blocked', 'Nawala'], ['inactive', 'Nonaktif']].map(([v, l]) => (
                <button key={v} style={{ ...S.tab, ...(filter === v ? S.tabActive : {}) }} onClick={() => setFilter(v)}>{l}</button>
              ))}
            </div>
            <button style={{ ...S.checkBtn, color: 'var(--blue)', borderColor: 'rgba(37,99,235,0.3)', background: 'var(--blue-dim)', opacity: checkingAllISP ? 0.6 : 1 }} onClick={handleCheckAllISP} disabled={checkingAllISP}>
              {checkingAllISP ? 'Checking...' : '🇮🇩 Cek ISP'}
            </button>
            <button style={{ ...S.checkBtn, opacity: checkingAll ? 0.6 : 1 }} onClick={handleCheckAll} disabled={checkingAll}>
              {checkingAll ? 'Checking...' : '↻ Cek Semua'}
            </button>
          </div>
        </div>

        {/* Domain grid per group */}
        {loading ? (
          <div style={S.emptyFull}>Memuat data...</div>
        ) : filteredGroupEntries.length === 0 ? (
          <div style={S.emptyFull}>Tidak ada domain ditemukan.</div>
        ) : (
          <div style={S.groupGrid}>
            {filteredGroupEntries.map(entry => {
              const gStats = groupStats.find(g => g.group === entry.name);
              const priorityDomain = entry.domains.find(d => d.is_priority === 1);
              return (
                <div key={entry.name || '__nogroup__'} style={S.groupBox}>
                  {/* Group card header */}
                  <div style={S.groupBoxHeader}>
                    <div style={S.groupBoxLeft}>
                      <div style={S.groupBoxName}>{entry.name || 'Tanpa Group'}</div>
                      {entry.name && (
                        <a href={`${API_URL}/${entry.name}`} target="_blank" rel="noreferrer" style={S.groupBoxLink}>
                          /{entry.name} ↗
                        </a>
                      )}
                    </div>
                    <div style={S.groupBoxStats}>
                      {gStats && <>
                        <span style={{ color: 'var(--green)', fontSize: 12 }}>✓ {gStats.active}</span>
                        <span style={{ color: 'var(--red)', fontSize: 12 }}>✕ {gStats.blocked}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>∑ {gStats.total}</span>
                      </>}
                    </div>
                  </div>

                  {/* Prioritas info */}
                  {priorityDomain && (
                    <div style={S.priorityInfo}>
                      <span style={S.priorityInfoLabel}>⭐ Aktif:</span>
                      <span style={S.priorityInfoUrl}>{priorityDomain.url.replace('https://', '')}</span>
                    </div>
                  )}

                  {/* Domain list */}
                  <div style={S.groupBoxList}>
                    {entry.domains.map(d => (
                      <DomainRow key={d.id} domain={d} onRefresh={fetchData} groups={groups} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={S.footer}>
          Auto-refresh setiap 60 detik · Health check setiap 30 menit · Laporan Telegram setiap 4 jam
        </div>
      </main>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  logoMark: { width: 36, height: 36, background: 'var(--accent)', color: 'white', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
  logoTitle: { fontWeight: 600, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.3px' },
  logoSub: { fontSize: 11, color: 'var(--text-muted)', marginTop: 1 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  clockBox: { textAlign: 'right' },
  clock: { fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 500, color: 'var(--text)', letterSpacing: 2 },
  clockDate: { fontSize: 11, color: 'var(--text-muted)', marginTop: 1 },
  gatewayBox: { borderLeft: '1px solid var(--border)', paddingLeft: 16 },
  gatewayLabel: { fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 },
  gatewayUrl: { fontSize: 12, color: 'var(--blue)', textDecoration: 'none', fontFamily: 'var(--mono)' },
  logoutBtn: { background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-dim)', padding: '7px 14px', cursor: 'pointer', fontSize: 13, borderRadius: 'var(--radius)', fontWeight: 500 },
  divider: { height: 1, background: 'var(--border)' },
  main: { flex: 1, padding: '20px 24px', maxWidth: 1200, width: '100%', margin: '0 auto' },
  statsRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 },
  listHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  listTitle: { fontWeight: 600, fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  lastUpdate: { color: 'var(--text-muted)', fontSize: 12, fontWeight: 400 },
  controls: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: 2, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 3 },
  tab: { background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 500, borderRadius: 6, transition: 'all .15s' },
  tabActive: { background: 'var(--bg2)', color: 'var(--text)', boxShadow: 'var(--shadow)' },
  checkBtn: { background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text-dim)', padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 500, borderRadius: 'var(--radius)' },

  // Group grid - 2 kolom
  groupGrid: { columns: 2, columnGap: 16, marginBottom: 8 },

  // Group card
  groupBox: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', breakInside: 'avoid', marginBottom: 16, display: 'inline-block', width: '100%' },
  groupBoxHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' },
  groupBoxLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
  groupBoxName: { fontWeight: 600, fontSize: 14, color: 'var(--text)', textTransform: 'capitalize' },
  groupBoxLink: { fontSize: 11, color: 'var(--blue)', textDecoration: 'none', fontFamily: 'var(--mono)' },
  groupBoxStats: { display: 'flex', gap: 10, fontWeight: 500 },
  priorityInfo: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: 'rgba(245,158,11,0.05)', borderBottom: '1px solid rgba(245,158,11,0.15)' },
  priorityInfoLabel: { fontSize: 11, color: '#f59e0b', fontWeight: 600, flexShrink: 0 },
  priorityInfoUrl: { fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  groupBoxList: { overflow: 'hidden' },

  emptyFull: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '48px 24px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' },
  footer: { marginTop: 16, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' },
};
