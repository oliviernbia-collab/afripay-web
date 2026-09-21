import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Banner from '../components/Banner';
import DateRangeFilter from '../components/DateRangeFilter';
import { formatDate } from '../utils/format';

const ACTION_LABELS = {
  'kyc.decision': 'Décision KYC',
  'kyb.decision': 'Décision KYB',
  'notification.envoi': 'Envoi de notification',
  'admin.creation': "Création d'un compte interne",
  'admin.maj': "Modification d'un compte interne",
};

const ACTIONS = ['', ...Object.keys(ACTION_LABELS)];

const PAGE_SIZE = 40;

function formatDetails(raw) {
  if (!raw) return '—';
  try {
    const obj = JSON.parse(raw);
    return Object.entries(obj)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${v}`)
      .join(' · ');
  } catch {
    return raw;
  }
}

export default function AuditLogs() {
  const [action, setAction] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [list, setList] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  function buildQuery(currentOffset) {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(currentOffset) });
    if (action) params.set('action', action);
    if (dateDebut) params.set('dateDebut', dateDebut);
    if (dateFin) params.set('dateFin', dateFin);
    return params.toString();
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get(`/admin/audit-logs?${buildQuery(0)}`)
      .then((data) => {
        if (cancelled) return;
        setList(data);
        setOffset(data.length);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, dateDebut, dateFin]);

  async function loadMore() {
    setLoadingMore(true);
    setError('');
    try {
      const data = await api.get(`/admin/audit-logs?${buildQuery(offset)}`);
      setList((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Audit Logs</h1>
          <p>Journal des actions sensibles effectuées depuis le back-office AfriPay.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />

      <div className="filters-bar">
        <div className="tabs">
          {ACTIONS.map((a) => (
            <button key={a} type="button" className={`tab${action === a ? ' active' : ''}`} onClick={() => setAction(a)}>
              {a ? ACTION_LABELS[a] : 'Toutes les actions'}
            </button>
          ))}
        </div>
        <DateRangeFilter
          dateDebut={dateDebut}
          dateFin={dateFin}
          onDateDebutChange={setDateDebut}
          onDateFinChange={setDateFin}
        />
      </div>

      {loading && (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      )}

      {!loading && list.length === 0 && !error && <div className="empty-state">Aucune entrée dans le journal.</div>}

      {!loading && list.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Effectuée par</th>
                  <th>Cible</th>
                  <th>Détails</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {list.map((log) => (
                  <tr key={log.id}>
                    <td><span className="badge badge-violet">{ACTION_LABELS[log.action] || log.action}</span></td>
                    <td>{log.admin_nom || <span className="text-muted">—</span>}</td>
                    <td className="text-secondary">{log.cible_type ? `${log.cible_type} · ${log.cible_id?.slice(0, 8)}…` : '—'}</td>
                    <td className="text-secondary" style={{ maxWidth: 320 }}>{formatDetails(log.détails)}</td>
                    <td className="text-secondary">{formatDate(log.date_heure)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="pagination-bar">
              <button type="button" className="btn btn-ghost" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Chargement…' : 'Charger plus'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
