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

export default function Utilisateurs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statutKyc = searchParams.get('statutKyc') || '';
  const dateDebut = searchParams.get('dateDebut') || '';
  const dateFin = searchParams.get('dateFin') || '';
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Débounce de la recherche vers l'URL
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
    if (statutKyc) params.set('statutKyc', statutKyc);
    if (search) params.set('search', search);
    if (dateDebut) params.set('dateDebut', dateDebut);
    if (dateFin) params.set('dateFin', dateFin);
    api
      .get(`/admin/utilisateurs?${params.toString()}`)
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
  }, [statutKyc, search, dateDebut, dateFin]);

  function setTab(value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('statutKyc', value);
      else next.delete('statutKyc');
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
          <h1>Clients</h1>
          <p>Consultez les comptes Client AfriPay et leur statut KYC.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />

      <div className="filters-bar">
        <input
          className="input"
          type="search"
          placeholder="Rechercher (nom, téléphone, email)…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`tab${statutKyc === tab.value ? ' active' : ''}`}
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
        <div className="empty-state">Aucun utilisateur ne correspond à ces critères.</div>
      )}

      {!loading && list.length > 0 && (
        <div className="table-wrap">
          <table className="data-table data-table-stack">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Statut KYC</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="clickable" onClick={() => navigate(`/clients/${u.id}`)}>
                  <td data-label="Nom">{u.prenom} {u.nom}</td>
                  <td data-label="Téléphone">{u.telephone}</td>
                  <td data-label="Email">{u.email || <span className="text-muted">—</span>}</td>
                  <td data-label="Statut KYC"><StatusBadge status={u.statut_kyc} /></td>
                  <td className="text-secondary" data-label="Inscrit le">{formatDate(u.date_creation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
