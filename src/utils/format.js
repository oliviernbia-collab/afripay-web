export function formatFcfa(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return `${value ?? '—'} FCFA`;
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num)} FCFA`;
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function percent(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}
