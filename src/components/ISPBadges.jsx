export default function ISPBadges({ ispStatus }) {
  if (!ispStatus) return null;
  let parsed = ispStatus;
  if (typeof ispStatus === 'string') {
    try { parsed = JSON.parse(ispStatus); } catch { return null; }
  }

  const ISP_CONFIG = {
    telkomsel: 'Tsel', indihome: 'IndiHome', xl: 'XL',
    im3: 'IM3', tri: 'Tri', smartfren: 'Smartfren',
  };

  return (
    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:6 }}>
      {Object.entries(parsed).map(([isp, status]) => {
        const isBlocked = status === 'blocked';
        return (
          <span key={isp} title={`${isp}: ${status}`} style={{
            fontSize: 10, fontWeight: 500,
            padding: '2px 7px',
            borderRadius: 20,
            background: isBlocked ? 'var(--red-dim)' : 'var(--green-dim)',
            color: isBlocked ? 'var(--red)' : 'var(--green)',
            border: `1px solid ${isBlocked ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)'}`,
          }}>
            {ISP_CONFIG[isp] || isp} {isBlocked ? '✕' : '✓'}
          </span>
        );
      })}
    </div>
  );
}
