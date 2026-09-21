import { useEffect, useState } from 'react';
import { faUsers, faStore } from '@fortawesome/free-solid-svg-icons';
import { api } from '../api/client';
import Banner from '../components/Banner';
import StatCard from '../components/StatCard';
import DateRangeFilter from '../components/DateRangeFilter';
import { formatDate, formatFcfa } from '../utils/format';

const TYPES = [
  { value: '', label: 'Tous les portefeuilles' },
  { value: 'client', label: 'Clients' },
  { value: 'marchand', label: 'Marchands' },
];

const PAGE_SIZE = 25;

export default function Wallets() {
  const [type, setType] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [list, setList] = useState([]);
  const [totals, setTotals] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  function buildQuery(currentOffset) {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (search) params.set('search', search);
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
      .get(`/admin/wallets?${buildQuery(0)}`)
      .then((data) => {
        if (cancelled) return;
        setList(data.items);
        setTotals(data.totals);
        setOffset(data.items.length);
        setHasMore(data.items.length === PAGE_SIZE);
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
  }, [type, search, dateDebut, dateFin]);

  async function loadMore() {
    setLoadingMore(true);
    setError('');
    try {
      const data = await api.get(`/admin/wallets?${buildQuery(offset)}`);
      setList((prev) => [...prev, ...data.items]);
      setOffset((prev) => prev + data.items.length);
      setHasMore(data.items.length === PAGE_SIZE);
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
          <h1>Wallets</h1>
          <p>Portefeuilles électroniques et soldes de l'ensemble des comptes AfriPay.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />

      {totals && (
        <div className="stat-grid">
          <StatCard
            label="Solde cumulé — Clients"
            value={formatFcfa(totals.clients.total)}
            sub={`${totals.clients.nombre} portefeuille(s)`}
            accent="var(--blue)"
            icon={faUsers}
          />
          <StatCard
            label="Solde cumulé — Marchands"
            value={formatFcfa(totals.marchands.total)}
            sub={`${totals.marchands.nombre} portefeuille(s)`}
            accent="var(--violet)"
            icon={faStore}
          />
        </div>
      )}

      <div className="filters-bar">
        <input
          className="input"
          type="search"
          placeholder="Rechercher (nom, raison sociale, téléphone)…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select className="input" style={{ maxWidth: 220 }} value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
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
        <div className="empty-state">Aucun portefeuille ne correspond à ces critères.</div>
      )}

      {!loading && list.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Titulaire</th>
                  <th>Type</th>
                  <th>Téléphone</th>
                  <th>Solde</th>
                  <th>Dernière mise à jour</th>
                </tr>
              </thead>
              <tbody>
                {list.map((w) => (
                  <tr key={w.id}>
                    <td>
                      {w.proprietaire_nom
                        ? `${w.proprietaire_prenom ? `${w.proprietaire_prenom} ` : ''}${w.proprietaire_nom}`
                        : <span className="text-muted">Marchand particulier</span>}
                    </td>
                    <td>
                      <span className={`badge badge-${w.type_propriétaire === 'client' ? 'blue' : 'violet'}`}>
                        {w.type_propriétaire === 'client' ? 'Client' : 'Marchand'}
                      </span>
                    </td>
                    <td className="text-secondary">{w.proprietaire_telephone}</td>
                    <td style={{ fontWeight: 600 }}>{formatFcfa(w.solde)}</td>
                    <td className="text-secondary">{formatDate(w.date_maj)}</td>
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
