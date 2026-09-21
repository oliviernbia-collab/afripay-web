import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { api, fileUrl } from '../api/client';
import Banner from '../components/Banner';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import { formatDate } from '../utils/format';

const DOC_LABELS = {
  cni: "Carte nationale d'identité",
  passeport: 'Passeport',
  carte_sejour: 'Carte de séjour',
  selfie: 'Selfie',
};

export default function UtilisateurDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return api
      .get(`/admin/utilisateurs/${id}`)
      .then((data) => {
        setUser(data.user);
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
          ? 'Motif du rejet (visible par le client) :'
          : 'Motif de la suspension (visible par le client) :',
      );
      if (motif === null) return; // annulé
      if (!motif.trim()) {
        setError('Un motif est requis pour cette action.');
        return;
      }
    }
    setActionLoading(decision);
    setError('');
    setSuccess('');
    try {
      await api.post(`/admin/utilisateurs/${id}/kyc`, { decision, motif });
      setSuccess(`Statut KYC mis à jour : ${decision}.`);
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
          <Link to="/clients" className="back-link text-secondary" style={{ fontSize: '0.82rem' }}>
            <Icon icon={faArrowLeft} /> Retour aux clients
          </Link>
          <h1 style={{ marginTop: 8 }}>
            {user ? `${user.prenom} ${user.nom}` : 'Détail utilisateur'}
          </h1>
        </div>
        {user && <StatusBadge status={user.statut_kyc} />}
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />
      <Banner type="success" message={success} onClose={() => setSuccess('')} />

      {loading && (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      )}

      {!loading && user && (
        <div className="detail-grid">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Informations personnelles</h3>
            <dl className="info-list">
              <div>
                <dt>Téléphone</dt>
                <dd>{user.telephone}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email || '—'}</dd>
              </div>
              <div>
                <dt>Date de naissance</dt>
                <dd>{user.date_naissance || '—'}</dd>
              </div>
              <div>
                <dt>Adresse</dt>
                <dd>{user.adresse || '—'}</dd>
              </div>
              <div>
                <dt>Téléphone vérifié</dt>
                <dd>{user.telephone_verifie ? 'Oui' : 'Non'}</dd>
              </div>
              <div>
                <dt>Inscrit le</dt>
                <dd>{formatDate(user.date_creation)}</dd>
              </div>
            </dl>

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
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Documents KYC soumis</h3>
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
                    <img src={fileUrl(doc.fichier_ref)} alt={DOC_LABELS[doc.type_document] || doc.type_document} />
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
