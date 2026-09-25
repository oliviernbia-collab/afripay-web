import Icon from './Icon';

export default function StatCard({ label, value, sub, accent, icon, compact }) {
  return (
    <div
      className={compact ? 'stat-card stat-card-compact' : 'stat-card'}
      style={accent ? { '--accent': accent } : undefined}
    >
      {icon && (
        <span className="stat-icon">
          <Icon icon={icon} />
        </span>
      )}
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}
