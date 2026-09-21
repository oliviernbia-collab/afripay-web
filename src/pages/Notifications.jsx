import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import Banner from '../components/Banner';
import DateRangeFilter from '../components/DateRangeFilter';
import { formatDate } from '../utils/format';

const TYPE_LABELS = {
  transaction: 'Transaction',
  sécurité: 'Sécurité',
  système: 'Système',
};

const PAGE_SIZE = 25;

function SendForm({ onSent }) {
  const [typeDestinataire, setTypeDestinataire] = useState('client');
  const [telephone, setTelephone] = useState('');
  const [type, setType] = useState('système');
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      // Résout le téléphone en identifiant via les listes Clients/Marchands déjà exposées.
      const searchPath =
        typeDestinataire === 'client'
          ? `/admin/utilisateurs?search=${encodeURIComponent(telephone)}&limit=5`
          : `/admin/marchands?search=${encodeURIComponent(telephone)}&limit=5`;
      const matches = await api.get(searchPath);
      const match = matches.find((m) => m.telephone === telephone) || matches[0];
      if (!match) throw new Error("Aucun compte trouvé avec ce numéro de téléphone.");

      await api.post('/admin/notifications', {
        destinataireId: match.id,
        typeDestinataire,
        type,
        titre,
        contenu,
      });
      setSuccess(`Notification envoyée à ${match.prenom ? `${match.prenom} ` : ''}${match.nom || match.raison_sociale}.`);
      setTelephone('');
      setTitre('');
      setContenu('');
      onSent?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Envoyer une notification manuelle</h3>
      <Banner type="error" message={error} onClose={() => setError('')} />
      <Banner type="success" message={success} onClose={() => setSuccess('')} />
      <form onSubmit={handleSubmit} className="stack gap-12">
        <div className="row gap-12 wrap">
          <div className="field" style={{ flex: 1, minWidth: 160 }}>
            <label>Destinataire</label>
            <select className="input" value={typeDestinataire} onChange={(e) => setTypeDestinataire(e.target.value)}>
              <option value="client">Client</option>
              <option value="marchand">Marchand</option>
            </select>
          </div>
          <div className="field" style={{ flex: 2, minWidth: 200 }}>
            <label>Téléphone</label>
            <input
              className="input"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+225 07 00 00 00 00"
              required
            />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 160 }}>
            <label>Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="système">Système</option>
              <option value="sécurité">Sécurité</option>
              <option value="transaction">Transaction</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Titre</label>
          <input className="input" value={titre} onChange={(e) => setTitre(e.target.value)} required maxLength={150} />
        </div>
        <div className="field">
          <label>Contenu</label>
          <textarea
            className="input"
            rows={3}
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            required
            maxLength={500}
          />
        </div>
        <div>
          <button type="submit" className="btn btn-cta" disabled={sending}>
            {sending ? 'Envoi…' : 'Envoyer la notification'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Notifications() {
  const [type, setType] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [list, setList] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: '0' });
    if (type) params.set('type', type);
    if (dateDebut) params.set('dateDebut', dateDebut);
    if (dateFin) params.set('dateFin', dateFin);
    return api
      .get(`/admin/notifications?${params.toString()}`)
      .then((data) => {
        setList(data);
        setOffset(data.length);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [type, dateDebut, dateFin]);

  useEffect(() => {
    load();
  }, [load]);

  async function loadMore() {
    setLoadingMore(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
      if (type) params.set('type', type);
      if (dateDebut) params.set('dateDebut', dateDebut);
      if (dateFin) params.set('dateFin', dateFin);
      const data = await api.get(`/admin/notifications?${params.toString()}`);
      setList((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Notifications envoyées aux clients et marchands sur la plateforme.</p>
        </div>
      </div>

      <SendForm onSent={load} />

      <Banner type="error" message={error} onClose={() => setError('')} />

      <div className="filters-bar" style={{ marginTop: 24 }}>
        <div className="tabs">
          {['', 'système', 'sécurité', 'transaction'].map((t) => (
            <button key={t} type="button" className={`tab${type === t ? ' active' : ''}`} onClick={() => setType(t)}>
              {t ? TYPE_LABELS[t] : 'Toutes'}
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

      {!loading && list.length === 0 && !error && <div className="empty-state">Aucune notification.</div>}

      {!loading && list.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Titre</th>
                  <th>Contenu</th>
                  <th>Destinataire</th>
                  <th>Lu</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {list.map((n) => (
                  <tr key={n.id}>
                    <td><span className="badge badge-blue">{TYPE_LABELS[n.type] || n.type}</span></td>
                    <td>{n.titre}</td>
                    <td className="text-secondary">{n.contenu}</td>
                    <td className="text-secondary">{n.type_destinataire}</td>
                    <td>{n.lu ? 'Oui' : <span className="text-muted">Non</span>}</td>
                    <td className="text-secondary">{formatDate(n.date_creation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="pagination-bar">
              <button type="button" className="btn btn-ghost" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Chargement…' : 'Charger plus'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
