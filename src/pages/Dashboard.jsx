import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  faTriangleExclamation,
  faUsers,
  faStore,
  faReceipt,
  faQrcode,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../api/client';
import StatCard from '../components/StatCard';
import Banner from '../components/Banner';
import Icon from '../components/Icon';
import { formatFcfa, percent } from '../utils/format';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/admin/dashboard')
      .then((d) => {
        if (!cancelled) setData(d);
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
  }, []);

  const kycEnAttente = data?.dossiersEnAttente?.kyc || 0;
  const kybEnAttente = data?.dossiersEnAttente?.kyb || 0;
  const hasPending = kycEnAttente > 0 || kybEnAttente > 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de l'activité de la plateforme AfriPay.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />

      {loading && (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      )}

      {!loading && data && (
        <>
          {hasPending && (
            <div className="alert-callout">
              <div className="alert-icon">
                <Icon icon={faTriangleExclamation} />
              </div>
              <div className="stack" style={{ gap: 2 }}>
                <strong>Dossiers en attente de validation</strong>
                <span className="text-secondary">
                  {kycEnAttente} dossier(s) KYC et {kybEnAttente} dossier(s) KYB nécessitent une revue.
                </span>
              </div>
              <div className="spacer" />
              <div className="row gap-8 wrap">
                {kycEnAttente > 0 && (
                  <Link className="btn btn-warning btn-sm" to="/clients?statutKyc=en_attente">
                    Voir les clients
                  </Link>
                )}
                {kybEnAttente > 0 && (
                  <Link className="btn btn-warning btn-sm" to="/marchands?statutKyb=en_attente">
                    Voir les marchands
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="stat-grid">
            <StatCard
              label="Utilisateurs (clients)"
              value={data.utilisateurs.total}
              sub={`${percent(data.utilisateurs.kycValides, data.utilisateurs.total)} KYC validé`}
              accent="var(--blue)"
              icon={faUsers}
            />
            <StatCard
              label="Marchands"
              value={data.marchands.total}
              sub={`${percent(data.marchands.kybValides, data.marchands.total)} KYB validé`}
              accent="var(--violet)"
              icon={faStore}
            />
            <StatCard
              label="Volume transactions réussies"
              value={formatFcfa(data.transactions.volumeFcfa)}
              sub={`${data.transactions.nombre} transaction(s) réussie(s)`}
              accent="var(--green)"
              icon={faReceipt}
            />
            <StatCard
              label="Volume des achats (paiement biométrique)"
              value={formatFcfa(data.achats.volumeFcfa)}
              sub={`${data.achats.nombre} achat(s) via scan de paiement`}
              accent="var(--orange)"
              icon={faQrcode}
            />
            <StatCard
              label="Dossiers KYC en attente"
              value={kycEnAttente}
              sub="Clients à valider"
              accent="var(--gold)"
              icon={faClock}
            />
            <StatCard
              label="Dossiers KYB en attente"
              value={kybEnAttente}
              sub="Marchands à valider"
              accent="var(--gold)"
              icon={faClock}
            />
          </div>
        </>
      )}
    </div>
  );
}
