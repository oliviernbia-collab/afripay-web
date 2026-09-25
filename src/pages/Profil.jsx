import { useCallback, useEffect, useRef, useState } from 'react';
import { faClipboardList, faPen, faLock, faUserShield, faCamera, faTrash } from '@fortawesome/free-solid-svg-icons';
import { api, fileUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Banner from '../components/Banner';
import Icon from '../components/Icon';
import PasswordInput from '../components/PasswordInput';
import { formatDate } from '../utils/format';

const MAX_PHOTO_SIZE = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ROLE_LABELS = {
  super_admin: 'Super administrateur',
  conformite: 'Conformité',
  support: 'Support',
};

const ACTION_LABELS = {
  'kyc.decision': 'Décision KYC',
  'kyb.decision': 'Décision KYB',
  'notification.envoi': 'Envoi de notification',
  'admin.creation': "Création d'un compte interne",
  'admin.maj': "Modification d'un compte interne",
  'admin.profil.maj': 'Mise à jour du profil',
  'admin.mot_de_passe.maj': 'Changement de mot de passe',
};

function ProfileForm({ admin, onUpdated }) {
  const [nom, setNom] = useState(admin.nom);
  const [email, setEmail] = useState(admin.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await api.patch('/admin/me', { nom, email });
      onUpdated(updated);
      setSuccess('Profil mis à jour avec succès.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>
        <Icon icon={faPen} style={{ marginRight: 8, color: 'var(--turquoise)' }} />
        Informations personnelles
      </h3>
      <Banner type="error" message={error} onClose={() => setError('')} />
      <Banner type="success" message={success} onClose={() => setSuccess('')} />
      <form onSubmit={handleSubmit} className="stack gap-12">
        <div className="row gap-12 wrap">
          <div className="field" style={{ flex: 1, minWidth: 200 }}>
            <label>Nom complet</label>
            <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 220 }}>
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div>
          <button type="submit" className="btn btn-cta" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordForm() {
  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (nouveauMotDePasse !== confirmation) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/me/mot-de-passe', { motDePasseActuel, nouveauMotDePasse });
      setSuccess('Mot de passe changé avec succès.');
      setMotDePasseActuel('');
      setNouveauMotDePasse('');
      setConfirmation('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>
        <Icon icon={faLock} style={{ marginRight: 8, color: 'var(--gold)' }} />
        Sécurité — changer mon mot de passe
      </h3>
      <Banner type="error" message={error} onClose={() => setError('')} />
      <Banner type="success" message={success} onClose={() => setSuccess('')} />
      <form onSubmit={handleSubmit} className="stack gap-12">
        <div className="field">
          <label>Mot de passe actuel</label>
          <PasswordInput
            autoComplete="current-password"
            value={motDePasseActuel}
            onChange={(e) => setMotDePasseActuel(e.target.value)}
            required
          />
        </div>
        <div className="row gap-12 wrap">
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label>Nouveau mot de passe (8 caractères min.)</label>
            <PasswordInput
              autoComplete="new-password"
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label>Confirmer le nouveau mot de passe</label>
            <PasswordInput
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              required
              minLength={8}
            />
          </div>
        </div>
        <div>
          <button type="submit" className="btn btn-cta" disabled={saving}>
            {saving ? 'Mise à jour…' : 'Changer le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  );
}

function formatDetails(raw) {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    return Object.entries(obj)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${v}`)
      .join(' · ');
  } catch {
    return null;
  }
}

function ProfilePhoto({ admin, initials, onUpdated }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de resélectionner le même fichier plus tard
    if (!file) return;

    setError('');
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setError('Format non pris en charge : utilisez une image JPEG, PNG ou WebP.');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setError('Le fichier dépasse la taille maximale autorisée (4 Mo).');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      const updated = await api.post('/admin/me/photo', formData, { isForm: true });
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setError('');
    setUploading(true);
    try {
      const updated = await api.del('/admin/me/photo');
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="stack" style={{ gap: 6 }}>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        {admin.photo_url ? (
          <img
            src={fileUrl(admin.photo_url)}
            alt={admin.nom}
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.3rem' }}>
            {initials}
          </div>
        )}
        <button
          type="button"
          className="photo-edit-btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          title="Changer la photo"
          aria-label="Changer la photo"
        >
          <Icon icon={faCamera} size="xs" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={handleFileChange}
        />
      </div>
      {admin.photo_url && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleRemove}
          disabled={uploading}
          style={{ alignSelf: 'flex-start' }}
        >
          <Icon icon={faTrash} size="xs" /> Retirer
        </button>
      )}
      {error && <span style={{ color: 'var(--red)', fontSize: '0.76rem', maxWidth: 200 }}>{error}</span>}
    </div>
  );
}

export default function Profil() {
  const { admin, updateAdmin } = useAuth();
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const loadActivity = useCallback(() => {
    setLoadingActivity(true);
    api
      .get('/admin/me/activite?limit=15')
      .then(setActivity)
      .catch(() => setActivity([]))
      .finally(() => setLoadingActivity(false));
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  if (!admin) return null;

  const initials = admin.nom
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function handleUpdated(updated) {
    updateAdmin(updated);
    loadActivity();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Mon profil</h1>
          <p>Vos informations de compte, votre sécurité et votre activité récente sur le back-office.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row gap-16 wrap" style={{ alignItems: 'center' }}>
          <ProfilePhoto admin={admin} initials={initials} onUpdated={handleUpdated} />
          <div className="stack" style={{ gap: 4, flex: 1, minWidth: 200 }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{admin.nom}</span>
            <span className="text-secondary">{admin.email}</span>
          </div>
          <div className="row gap-8 wrap">
            <span className="badge badge-violet">
              <Icon icon={faUserShield} size="xs" /> {ROLE_LABELS[admin.role] || admin.role}
            </span>
            <span className={`badge badge-${admin.actif ? 'green' : 'grey'}`}>{admin.actif ? 'Actif' : 'Désactivé'}</span>
          </div>
        </div>
        <dl className="info-list" style={{ marginTop: 20 }}>
          <div>
            <dt>Membre depuis</dt>
            <dd>{formatDate(admin.date_creation)}</dd>
          </div>
          <div>
            <dt>Identifiant du compte</dt>
            <dd style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{admin.id}</dd>
          </div>
        </dl>
      </div>

      <div className="section-grid">
        <ProfileForm admin={admin} onUpdated={handleUpdated} />
        <PasswordForm />
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>
          <Icon icon={faClipboardList} style={{ marginRight: 8, color: 'var(--text-secondary)' }} />
          Mon activité récente
        </h3>
        {loadingActivity && (
          <div className="loading-block">
            <div className="spinner" />
          </div>
        )}
        {!loadingActivity && activity.length === 0 && (
          <p className="text-secondary">Aucune action enregistrée pour le moment.</p>
        )}
        {!loadingActivity && activity.length > 0 && (
          <div className="table-wrap">
            <table className="data-table data-table-stack">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Détails</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((log) => (
                  <tr key={log.id}>
                    <td data-label="Action"><span className="badge badge-blue">{ACTION_LABELS[log.action] || log.action}</span></td>
                    <td className="text-secondary" data-label="Détails">{formatDetails(log.détails) || '—'}</td>
                    <td className="text-secondary" data-label="Date">{formatDate(log.date_heure)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
