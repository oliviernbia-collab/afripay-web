import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { api, fileUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Banner from '../components/Banner';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import DocImage from '../components/DocImage';
import { formatDate } from '../utils/format';

const KYB_DECISION_ROLES = ['super_admin', 'conformite'];

const DOC_LABELS = {
  cni: "Carte nationale d'identité",
  passeport: 'Passeport',
  carte_sejour: 'Carte de séjour',
  selfie: 'Selfie',
  rccm: 'RCCM',
  ncc: 'NCC',
  justificatif_domicile: 'Justificatif de domicile',
  justificatif_activite: "Justificatif d'activité",
};

export default function MarchandDetail() {
  const { id } = useParams();
  const { admin } = useAuth();
  const canDecide = KYB_DECISION_ROLES.includes(admin?.role);
  const [merchant, setMerchant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return api
      .get(`/admin/marchands/${id}`)
      .then((data) => {
        setMerchant(data.merchant);
        setDocuments(data.documents || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDecision(decision) {
    let motif;
    if (decision === 'rejeté' || decision === 'suspendu') {
      motif = window.prompt(
        decision === 'rejeté'
          ? 'Motif du rejet (visible par le marchand) :'
          : 'Motif de la suspension (visible par le marchand) :',
      );
      if (motif === null) return;
      if (!motif.trim()) {
        setError('Un motif est requis pour cette action.');
        return;
      }
    }
    setActionLoading(decision);
    setError('');
    setSuccess('');
    try {
      await api.post(`/admin/marchands/${id}/kyb`, { decision, motif });
      setSuccess(`Statut KYB mis à jour : ${decision}.`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading('');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/marchands" className="back-link text-secondary" style={{ fontSize: '0.82rem' }}>
            <Icon icon={faArrowLeft} /> Retour aux marchands
          </Link>
          <h1 style={{ marginTop: 8 }}>
            {merchant ? merchant.raison_sociale || `${merchant.type === 'entreprise' ? 'Entreprise' : 'Marchand particulier'}` : 'Détail marchand'}
          </h1>
        </div>
        {merchant && <StatusBadge status={merchant.statut_kyb} />}
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />
      <Banner type="success" message={success} onClose={() => setSuccess('')} />

      {loading && (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      )}

      {!loading && merchant && (
        <div className="detail-grid">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Informations marchand</h3>
            <dl className="info-list">
              <div>
                <dt>Type</dt>
                <dd>{merchant.type === 'entreprise' ? 'Entreprise' : 'Particulier'}</dd>
              </div>
              <div>
                <dt>Raison sociale</dt>
                <dd>{merchant.raison_sociale || '—'}</dd>
              </div>
              <div>
                <dt>RCCM</dt>
                <dd>{merchant.rccm || '—'}</dd>
              </div>
              <div>
                <dt>NCC</dt>
                <dd>{merchant.ncc || '—'}</dd>
              </div>
              <div>
                <dt>Téléphone</dt>
                <dd>{merchant.telephone}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{merchant.email || '—'}</dd>
              </div>
              <div>
                <dt>Catégorie d'activité</dt>
                <dd>{merchant.categorie_activite || '—'}</dd>
              </div>
              <div>
                <dt>Adresse</dt>
                <dd>{merchant.adresse || '—'}</dd>
              </div>
              <div>
                <dt>Inscrit le</dt>
                <dd>{formatDate(merchant.date_creation)}</dd>
              </div>
            </dl>

            {canDecide ? (
              <div className="action-row">
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={!!actionLoading}
                  onClick={() => handleDecision('validé')}
                >
                  {actionLoading === 'validé' ? 'Validation…' : 'Valider'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={!!actionLoading}
                  onClick={() => handleDecision('rejeté')}
                >
                  {actionLoading === 'rejeté' ? 'Rejet…' : 'Rejeter'}
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  disabled={!!actionLoading}
                  onClick={() => handleDecision('suspendu')}
                >
                  {actionLoading === 'suspendu' ? 'Suspension…' : 'Suspendre'}
                </button>
              </div>
            ) : (
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                Les décisions KYB sont réservées aux rôles Conformité et Super admin.
              </p>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Documents KYB soumis</h3>
            {documents.length === 0 && <p className="text-secondary">Aucun document soumis pour le moment.</p>}
            {documents.length > 0 && (
              <div className="doc-grid">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    className="doc-tile"
                    href={fileUrl(doc.fichier_ref)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <DocImage fichierRef={doc.fichier_ref} alt={DOC_LABELS[doc.type_document] || doc.type_document} />
                    <div className="doc-tile-label">
                      <span>{DOC_LABELS[doc.type_document] || doc.type_document}</span>
                      <StatusBadge status={doc.statut} />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
