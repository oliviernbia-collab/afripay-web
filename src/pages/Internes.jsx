import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import Banner from '../components/Banner';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';

const ROLES = [
  { value: 'super_admin', label: 'Super administrateur' },
  { value: 'conformite', label: 'Conformité' },
  { value: 'support', label: 'Support' },
];

function CreateForm({ onCreated }) {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [role, setRole] = useState('support');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/internes', { nom, email, motDePasse, role });
      setSuccess(`Compte "${nom}" créé avec succès.`);
      setNom('');
      setEmail('');
      setMotDePasse('');
      setRole('support');
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Créer un compte interne</h3>
      <Banner type="error" message={error} onClose={() => setError('')} />
      <Banner type="success" message={success} onClose={() => setSuccess('')} />
      <form onSubmit={handleSubmit} className="row gap-12 wrap" style={{ alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: 1, minWidth: 160 }}>
          <label>Nom</label>
          <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 200 }}>
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 160 }}>
          <label>Mot de passe provisoire (8 caractères min.)</label>
          <PasswordInput
            autoComplete="new-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="field" style={{ minWidth: 180 }}>
          <label>Rôle</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-cta" disabled={saving}>
          {saving ? 'Création…' : 'Créer le compte'}
        </button>
      </form>
    </div>
  );
}

export default function Internes() {
  const { admin: currentAdmin } = useAuth();
  const [list, setList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return api
      .get('/admin/internes')
      .then((data) => setList(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(a) {
    setActionId(a.id);
    setError('');
    try {
      await api.patch(`/admin/internes/${a.id}`, { actif: !a.actif });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId('');
    }
  }

  async function changeRole(a, role) {
    if (role === a.role) return;
    setActionId(a.id);
    setError('');
    try {
      await api.patch(`/admin/internes/${a.id}`, { role });
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
          <h1>Utilisateurs internes</h1>
          <p>Comptes du back-office AfriPay et leurs droits d'accès.</p>
        </div>
      </div>

      <CreateForm onCreated={load} />

      <Banner type="error" message={error} onClose={() => setError('')} />

      {loading && (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="table-wrap" style={{ marginTop: 20 }}>
          <table className="data-table data-table-stack">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Créé le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td data-label="Nom">{a.nom} {a.id === currentAdmin?.id && <span className="text-muted">(vous)</span>}</td>
                  <td className="text-secondary" data-label="Email">{a.email}</td>
                  <td data-label="Rôle">
                    <select
                      className="input"
                      style={{ maxWidth: 200 }}
                      value={a.role}
                      disabled={actionId === a.id}
                      onChange={(e) => changeRole(a, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td data-label="Statut">
                    <span className={`badge badge-${a.actif ? 'green' : 'grey'}`}>{a.actif ? 'Actif' : 'Désactivé'}</span>
                  </td>
                  <td className="text-secondary" data-label="Créé le">{formatDate(a.date_creation)}</td>
                  <td data-label="Action">
                    <button
                      type="button"
                      className={`btn btn-sm ${a.actif ? 'btn-danger' : 'btn-success'}`}
                      disabled={actionId === a.id}
                      onClick={() => toggleActive(a)}
                    >
                      {actionId === a.id ? '…' : a.actif ? 'Désactiver' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
