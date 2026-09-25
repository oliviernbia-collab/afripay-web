import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { api } from '../api/client';
import Banner from '../components/Banner';
import Icon from '../components/Icon';
import { formatDate, formatFcfa } from '../utils/format';

export default function Fraude() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return api
      .get('/admin/fraude')
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function reactivate(kind, id) {
    setActionId(id);
    setError('');
    setSuccess('');
    try {
      if (kind === 'client') {
        await api.post(`/admin/utilisateurs/${id}/kyc`, { decision: 'validé' });
      } else {
        await api.post(`/admin/marchands/${id}/kyb`, { decision: 'validé' });
      }
      setSuccess('Compte réactivé avec succès.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId('');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Fraude</h1>
          <p>Signaux de sécurité : échecs de reconnaissance biométrique, transactions échouées et comptes suspendus.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />
      <Banner type="success" message={success} onClose={() => setSuccess('')} />

      {loading && (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      )}

      {!loading && data && (
        <div className="stack gap-16">
          {data.echecsRepetes.length > 0 && (
            <div className="alert-callout">
              <div className="alert-icon"><Icon icon={faTriangleExclamation} /></div>
              <div>
                <strong>{data.echecsRepetes.length} adresse(s) IP</strong> avec 3 tentatives d'identification biométrique échouées ou plus.
              </div>
            </div>
          )}

          <div className="section-grid">
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Comptes Clients suspendus ({data.usersSuspendus.length})</h3>
              {data.usersSuspendus.length === 0 && <p className="text-secondary">Aucun compte client suspendu.</p>}
              {data.usersSuspendus.length > 0 && (
                <div className="table-wrap">
                  <table className="data-table data-table-stack">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Téléphone</th>
                        <th>Suspendu le</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.usersSuspendus.map((u) => (
                        <tr key={u.id}>
                          <td data-label="Client"><Link to={`/clients/${u.id}`}>{u.prenom} {u.nom}</Link></td>
                          <td className="text-secondary" data-label="Téléphone">{u.telephone}</td>
                          <td className="text-secondary" data-label="Suspendu le">{formatDate(u.date_maj)}</td>
                          <td data-label="Action">
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              disabled={actionId === u.id}
                              onClick={() => reactivate('client', u.id)}
                            >
                              {actionId === u.id ? '…' : 'Réactiver'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0 }}>Comptes Marchands suspendus ({data.merchantsSuspendus.length})</h3>
              {data.merchantsSuspendus.length === 0 && <p className="text-secondary">Aucun compte marchand suspendu.</p>}
              {data.merchantsSuspendus.length > 0 && (
                <div className="table-wrap">
                  <table className="data-table data-table-stack">
                    <thead>
                      <tr>
                        <th>Marchand</th>
                        <th>Téléphone</th>
                        <th>Suspendu le</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.merchantsSuspendus.map((m) => (
                        <tr key={m.id}>
                          <td data-label="Marchand"><Link to={`/marchands/${m.id}`}>{m.raison_sociale || 'Particulier'}</Link></td>
                          <td className="text-secondary" data-label="Téléphone">{m.telephone}</td>
                          <td className="text-secondary" data-label="Suspendu le">{formatDate(m.date_maj)}</td>
                          <td data-label="Action">
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              disabled={actionId === m.id}
                              onClick={() => reactivate('marchand', m.id)}
                            >
                              {actionId === m.id ? '…' : 'Réactiver'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Adresses IP avec échecs répétés</h3>
            {data.echecsRepetes.length === 0 && <p className="text-secondary">Aucune adresse suspecte détectée.</p>}
            {data.echecsRepetes.length > 0 && (
              <div className="table-wrap">
                <table className="data-table data-table-stack">
                  <thead>
                    <tr>
                      <th>Adresse IP</th>
                      <th>Tentatives échouées</th>
                      <th>Dernière tentative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.echecsRepetes.map((row) => (
                      <tr key={row.adresse_ip}>
                        <td style={{ fontFamily: 'monospace' }} data-label="Adresse IP">{row.adresse_ip}</td>
                        <td data-label="Tentatives échouées">{row.tentatives}</td>
                        <td className="text-secondary" data-label="Dernière tentative">{formatDate(row.derniere_tentative)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Transactions échouées récentes</h3>
            {data.transactionsEchouees.length === 0 && <p className="text-secondary">Aucune transaction échouée récente.</p>}
            {data.transactionsEchouees.length > 0 && (
              <div className="table-wrap">
                <table className="data-table data-table-stack">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Type</th>
                      <th>Montant</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactionsEchouees.map((tx) => (
                      <tr key={tx.id}>
                        <td data-label="Référence">{tx.reference}</td>
                        <td data-label="Type">{tx.type}</td>
                        <td data-label="Montant">{formatFcfa(tx.montant)}</td>
                        <td className="text-secondary" data-label="Date">{formatDate(tx.date_heure)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
