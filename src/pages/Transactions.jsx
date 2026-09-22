import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Banner from '../components/Banner';
import StatusBadge, { methodLabel, typeLabel } from '../components/StatusBadge';
import DateRangeFilter from '../components/DateRangeFilter';
import { formatDate, formatFcfa } from '../utils/format';

const TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'achat', label: 'Achat' },
  { value: 'recharge', label: 'Recharge' },
  { value: 'transfert', label: 'Transfert' },
];

const STATUSES = [
  { value: '', label: 'Tous les statuts' },
  { value: 'réussi', label: 'Réussi' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'échoué', label: 'Échoué' },
];

const ACCOUNT_TYPES = [
  { value: '', label: 'Tous les comptes' },
  { value: 'client', label: 'Clients' },
  { value: 'marchand', label: 'Marchands' },
];

const PAGE_SIZE = 25;

export default function Transactions() {
  const [type, setType] = useState('');
  const [statut, setStatut] = useState('');
  const [typeCompte, setTypeCompte] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [list, setList] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  function buildQuery(currentOffset) {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (statut) params.set('statut', statut);
    if (typeCompte) params.set('typeCompte', typeCompte);
    if (dateDebut) params.set('dateDebut', dateDebut);
    if (dateFin) params.set('dateFin', dateFin);
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String(currentOffset));
    return params.toString();
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get(`/admin/transactions?${buildQuery(0)}`)
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
  }, [type, statut, typeCompte, dateDebut, dateFin]);

  async function loadMore() {
    setLoadingMore(true);
    setError('');
    try {
      const data = await api.get(`/admin/transactions?${buildQuery(offset)}`);
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
          <h1>Transactions</h1>
          <p>Historique des achats, recharges et transferts sur la plateforme.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />

      <div className="filters-bar">
        <select className="input" style={{ maxWidth: 220 }} value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select className="input" style={{ maxWidth: 220 }} value={statut} onChange={(e) => setStatut(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select className="input" style={{ maxWidth: 220 }} value={typeCompte} onChange={(e) => setTypeCompte(e.target.value)}>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
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

      {!loading && list.length === 0 && !error && (
        <div className="empty-state">Aucune transaction ne correspond à ces critères.</div>
      )}

      {!loading && list.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Méthode</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {list.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="stack" style={{ gap: 2 }}>
                        <span>{tx.reference || tx.id.slice(0, 8)}</span>
                        {tx.libelle && <span className="text-muted" style={{ fontSize: '0.76rem' }}>{tx.libelle}</span>}
                      </div>
                    </td>
                    <td>{typeLabel(tx.type)}</td>
                    <td>{formatFcfa(tx.montant)}</td>
                    <td className="text-secondary">{methodLabel(tx.méthode)}</td>
                    <td><StatusBadge status={tx.statut} /></td>
                    <td className="text-secondary">{formatDate(tx.date_heure)}</td>
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
