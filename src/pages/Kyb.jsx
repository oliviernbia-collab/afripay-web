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
  rccm: 'RCCM',
  ncc: 'NCC / NIF',
  justificatif_domicile: 'Justificatif de domicile',
  justificatif_activite: "Justificatif d'activité",
};

const TABS = [
  { value: '', label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'validé', label: 'Validé' },
  { value: 'rejeté', label: 'Rejeté' },
];

export default function Kyb() {
  const [statut, setStatut] = useState('');
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
      .get(`/admin/kyb/documents?${params.toString()}`)
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
          <h1>KYB</h1>
          <p>File d'attente des documents d'activité soumis par les marchands, tous dossiers confondus.</p>
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
          <table className="data-table data-table-stack">
            <thead>
              <tr>
                <th>Aperçu</th>
                <th>Marchand</th>
                <th>Téléphone</th>
                <th>Document</th>
                <th>Statut document</th>
                <th>Statut KYB</th>
                <th>Soumis le</th>
              </tr>
            </thead>
            <tbody>
              {list.map((doc) => (
                <tr key={doc.id} className="clickable" onClick={() => navigate(`/marchands/${doc.merchant_id}`)}>
                  <td data-label="Aperçu">
                    <DocImage
                      fichierRef={doc.fichier_ref}
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', display: 'block' }}
                    />
                  </td>
                  <td data-label="Marchand">{doc.raison_sociale || <span className="text-muted">Particulier</span>}</td>
                  <td className="text-secondary" data-label="Téléphone">{doc.telephone}</td>
                  <td data-label="Document">{DOC_LABELS[doc.type_document] || doc.type_document}</td>
                  <td data-label="Statut document"><StatusBadge status={doc.statut} /></td>
                  <td data-label="Statut KYB"><StatusBadge status={doc.statut_kyb} /></td>
                  <td className="text-secondary" data-label="Soumis le">{formatDate(doc.date_soumission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
