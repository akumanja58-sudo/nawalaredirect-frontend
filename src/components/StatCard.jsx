export default function StatCard({ label, value, color = 'var(--accent)', icon, bg }) {
  return (
    <div style={{
      background: bg || 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px 18px',
      flex: 1,
      minWidth: 110,
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500, letterSpacing:'0.3px', marginBottom:8, textTransform:'uppercase' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize:28, fontWeight:600, color, lineHeight:1, fontFamily:'var(--mono)' }}>
        {value}
      </div>
    </div>
  );
}
