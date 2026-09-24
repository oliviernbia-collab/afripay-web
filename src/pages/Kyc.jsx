import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Banner from '../components/Banner';
import StatusBadge from '../components/StatusBadge';
import DateRangeFilter from '../components/DateRangeFilter';
import DocImage from '../components/DocImage';
import { formatDate } from '../utils/format';

const DOC_LABELS = {
  cni: "Carte nationale d'identité",
  passeport: 'Passeport',
  carte_sejour: 'Carte de séjour',
  selfie: 'Selfie',
};

const TABS = [
  { value: '', label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'validé', label: 'Validé' },
  { value: 'rejeté', label: 'Rejeté' },
];

export default function Kyc() {
  const [statut, setStatut] = useState('en_attente');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ limit: '100' });
    if (statut) params.set('statut', statut);
    if (dateDebut) params.set('dateDebut', dateDebut);
    if (dateFin) params.set('dateFin', dateFin);
    api
      .get(`/admin/kyc/documents?${params.toString()}`)
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
  }, [statut, dateDebut, dateFin]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>KYC</h1>
          <p>File d'attente des documents d'identité soumis par les clients, tous dossiers confondus.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />

      <div className="filters-bar">
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`tab${statut === tab.value ? ' active' : ''}`}
              onClick={() => setStatut(tab.value)}
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
        />
      </div>

      {loading && (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      )}

      {!loading && list.length === 0 && !error && (
        <div className="empty-state">Aucun document ne correspond à ces critères.</div>
      )}

      {!loading && list.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Aperçu</th>
                <th>Client</th>
                <th>Téléphone</th>
                <th>Document</th>
                <th>Statut document</th>
                <th>Statut KYC</th>
                <th>Soumis le</th>
              </tr>
            </thead>
            <tbody>
              {list.map((doc) => (
                <tr key={doc.id} className="clickable" onClick={() => navigate(`/clients/${doc.user_id}`)}>
                  <td>
                    <DocImage
                      fichierRef={doc.fichier_ref}
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', display: 'block' }}
                    />
                  </td>
                  <td>{doc.prenom} {doc.nom}</td>
                  <td className="text-secondary">{doc.telephone}</td>
                  <td>{DOC_LABELS[doc.type_document] || doc.type_document}</td>
                  <td><StatusBadge status={doc.statut} /></td>
                  <td><StatusBadge status={doc.statut_kyc} /></td>
                  <td className="text-secondary">{formatDate(doc.date_soumission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
