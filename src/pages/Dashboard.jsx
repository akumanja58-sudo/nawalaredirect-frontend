import { useState, useEffect, useCallback } from 'react';
import { domainAPI } from '../api';
import StatCard from '../components/StatCard';
import DomainRow from '../components/DomainRow';
import AddDomainForm from '../components/AddDomainForm';

const API_URL = import.meta.env.VITE_API_URL || 'https://nawalaredirect-backend-production.up.railway.app';

export default function Dashboard({ onLogout }) {
  const [domains, setDomains] = useState([]);
  const [stats, setStats] = useState(null);
  const [groupStats, setGroupStats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAll, setCheckingAll] = useState(false);
  const [checkingAllISP, setCheckingAllISP] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeGroup, setActiveGroup] = useState('');
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

  // Filter domain
  const filtered = domains.filter(d => {
    const groupMatch = activeGroup === '' || d.group_name === activeGroup;
    const statusMatch =
      filter === 'all' ? true :
        filter === 'active' ? (d.is_active === 1 && d.is_blocked === 0) :
          filter === 'blocked' ? d.is_blocked === 1 :
            filter === 'inactive' ? d.is_active === 0 : true;
    return groupMatch && statusMatch;
  });

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

        {/* Group stats cards */}
        {groupStats.length > 0 && (
          <div style={S.groupSection}>
            <div style={S.groupSectionTitle}>Status per Group</div>
            <div style={S.groupCards}>
              {groupStats.map(g => (
                <div key={g.group} style={{ ...S.groupCard, borderColor: activeGroup === g.group ? '#6366f1' : 'var(--border)' }}
                  onClick={() => setActiveGroup(activeGroup === g.group ? '' : g.group)}>
                  <div style={S.groupCardName}>{g.group || 'Tanpa Group'}</div>
                  <div style={S.groupCardPath}>
                    <a href={`${API_URL}/${g.group}`} target="_blank" rel="noreferrer" style={S.groupLink}
                      onClick={e => e.stopPropagation()}>
                      /{g.group} ↗
                    </a>
                  </div>
                  <div style={S.groupCardStats}>
                    <span style={{ color: 'var(--green)' }}>✓ {g.active}</span>
                    <span style={{ color: 'var(--red)' }}>✕ {g.blocked}</span>
                    <span style={{ color: 'var(--text-muted)' }}>∑ {g.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add form */}
        <AddDomainForm onAdded={fetchData} groups={groups} />

        {/* List header */}
        <div style={S.listHeader}>
          <div style={S.listTitle}>
            Daftar Domain
            {activeGroup && <span style={S.activeGroupBadge}>Group: {activeGroup} <span style={{ cursor: 'pointer' }} onClick={() => setActiveGroup('')}>✕</span></span>}
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

        {/* Domain list */}
        <div style={S.listBox}>
          {loading ? (
            <div style={S.empty}>Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>Tidak ada domain ditemukan.</div>
          ) : (
            filtered.map(d => <DomainRow key={d.id} domain={d} onRefresh={fetchData} groups={groups} />)
          )}
        </div>

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
  main: { flex: 1, padding: '20px 24px', maxWidth: 1100, width: '100%', margin: '0 auto' },
  statsRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 },
  groupSection: { marginBottom: 16 },
  groupSectionTitle: { fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  groupCards: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  groupCard: { background: 'var(--bg2)', border: '2px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', minWidth: 140, cursor: 'pointer', transition: 'border-color .15s' },
  groupCardName: { fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4, textTransform: 'capitalize' },
  groupCardPath: { marginBottom: 8 },
  groupLink: { fontSize: 11, color: 'var(--blue)', textDecoration: 'none', fontFamily: 'var(--mono)' },
  groupCardStats: { display: 'flex', gap: 10, fontSize: 12, fontWeight: 500 },
  listHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  listTitle: { fontWeight: 600, fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  activeGroupBadge: { fontSize: 11, background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)', padding: '2px 8px', borderRadius: 20, cursor: 'pointer' },
  lastUpdate: { color: 'var(--text-muted)', fontSize: 12, fontWeight: 400 },
  controls: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: 2, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 3 },
  tab: { background: 'transparent', border: 'none', color: 'var(--text-dim)', padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 500, borderRadius: 6, transition: 'all .15s' },
  tabActive: { background: 'var(--bg2)', color: 'var(--text)', boxShadow: 'var(--shadow)' },
  checkBtn: { background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text-dim)', padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 500, borderRadius: 'var(--radius)' },
  listBox: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', minHeight: 200, overflow: 'hidden', boxShadow: 'var(--shadow)' },
  empty: { padding: '48px 24px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' },
  footer: { marginTop: 16, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' },
};
