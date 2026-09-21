import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Banner from '../components/Banner';
import StatusBadge from '../components/StatusBadge';
import DateRangeFilter from '../components/DateRangeFilter';
import { formatDate, formatFcfa } from '../utils/format';

const PROVIDERS = [
  { value: '', label: 'Tous les fournisseurs' },
  { value: 'wave', label: 'Wave' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'moov_money', label: 'Moov Money' },
  { value: 'mtn_money', label: 'MTN Mobile Money' },
  { value: 'djamo', label: 'Djamo' },
  { value: 'visa', label: 'Carte Visa' },
];

const STATUSES = [
  { value: '', label: 'Tous les statuts' },
  { value: 'réussi', label: 'Réussi' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'échoué', label: 'Échoué' },
];

const PAGE_SIZE = 25;

export default function Recharges() {
  const [fournisseur, setFournisseur] = useState('');
  const [statut, setStatut] = useState('');
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
    if (fournisseur) params.set('fournisseur', fournisseur);
    if (statut) params.set('statut', statut);
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
      .get(`/admin/recharges?${buildQuery(0)}`)
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
  }, [fournisseur, statut, dateDebut, dateFin]);

  async function loadMore() {
    setLoadingMore(true);
    setError('');
    try {
      const data = await api.get(`/admin/recharges?${buildQuery(offset)}`);
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
          <h1>Recharges</h1>
          <p>Journal des recharges de portefeuille via Mobile Money et carte Visa.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />

      <div className="filters-bar">
        <select className="input" style={{ maxWidth: 220 }} value={fournisseur} onChange={(e) => setFournisseur(e.target.value)}>
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select className="input" style={{ maxWidth: 220 }} value={statut} onChange={(e) => setStatut(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
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
        <div className="empty-state">Aucune recharge ne correspond à ces critères.</div>
      )}

      {!loading && list.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Fournisseur</th>
                  <th>Référence externe</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td>{r.prenom} {r.nom}<div className="text-muted" style={{ fontSize: '0.76rem' }}>{r.telephone}</div></td>
                    <td>{PROVIDERS.find((p) => p.value === r.fournisseur)?.label || r.fournisseur}</td>
                    <td className="text-secondary">{r.référence_externe}</td>
                    <td style={{ fontWeight: 600 }}>{formatFcfa(r.montant)}</td>
                    <td><StatusBadge status={r.statut} /></td>
                    <td className="text-secondary">{formatDate(r.date_creation)}</td>
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
