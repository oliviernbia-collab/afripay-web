import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import Banner from '../components/Banner';
import StatusBadge from '../components/StatusBadge';
import DateRangeFilter from '../components/DateRangeFilter';
import { formatDate } from '../utils/format';

const TABS = [
  { value: '', label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'validé', label: 'Validé' },
  { value: 'rejeté', label: 'Rejeté' },
  { value: 'suspendu', label: 'Suspendu' },
];

export default function Marchands() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statutKyb = searchParams.get('statutKyb') || '';
  const dateDebut = searchParams.get('dateDebut') || '';
  const dateFin = searchParams.get('dateFin') || '';
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput) next.set('search', searchInput);
        else next.delete('search');
        return next;
      }, { replace: true });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const search = searchParams.get('search') || '';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (statutKyb) params.set('statutKyb', statutKyb);
    if (search) params.set('search', search);
    if (dateDebut) params.set('dateDebut', dateDebut);
    if (dateFin) params.set('dateFin', dateFin);
    api
      .get(`/admin/marchands?${params.toString()}`)
      .then((data) => {
        if (!cancelled) setList(data);
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
  }, [statutKyb, search, dateDebut, dateFin]);

  function setTab(value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('statutKyb', value);
      else next.delete('statutKyb');
      return next;
    });
  }

  // Chaque champ met à jour uniquement sa propre clé d'URL, via la forme fonctionnelle
  // de setSearchParams (toujours basée sur le `prev` le plus récent) — deux changements
  // rapprochés (Du puis Au) ne peuvent donc jamais s'écraser l'un l'autre.
  function setDateDebut(value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('dateDebut', value);
      else next.delete('dateDebut');
      return next;
    });
  }

  function setDateFin(value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('dateFin', value);
      else next.delete('dateFin');
      return next;
    });
  }

  function clearDateRange() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('dateDebut');
      next.delete('dateFin');
      return next;
    });
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Marchands</h1>
          <p>Consultez et validez les dossiers KYB des marchands AfriPay.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />

      <div className="filters-bar">
        <input
          className="input"
          type="search"
          placeholder="Rechercher (raison sociale, téléphone, email)…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`tab${statutKyb === tab.value ? ' active' : ''}`}
              onClick={() => setTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <DateRangeFilter
          dateDebut={dateDebut}
          dateFin={dateFin}
          onDateDebutChange={setDateDebut}
          onDateFinChange={setDateFin}
          onClear={clearDateRange}
        />
      </div>

      {loading && (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      )}

      {!loading && list.length === 0 && !error && (
        <div className="empty-state">Aucun marchand ne correspond à ces critères.</div>
      )}

      {!loading && list.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Marchand</th>
                <th>Type</th>
                <th>Téléphone</th>
                <th>Statut KYB</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id} className="clickable" onClick={() => navigate(`/marchands/${m.id}`)}>
                  <td>{m.raison_sociale || <span className="text-muted">Particulier</span>}</td>
                  <td className="text-secondary">{m.type === 'entreprise' ? 'Entreprise' : 'Particulier'}</td>
                  <td>{m.telephone}</td>
                  <td><StatusBadge status={m.statut_kyb} /></td>
                  <td className="text-secondary">{formatDate(m.date_creation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
