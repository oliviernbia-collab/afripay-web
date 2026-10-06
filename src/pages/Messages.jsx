import { Fragment, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { socket } from '../realtime/socket';
import Banner from '../components/Banner';
import Icon from '../components/Icon';
import DateRangeFilter from '../components/DateRangeFilter';
import { formatDate } from '../utils/format';
import { faChevronDown, faChevronUp, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

const TABS = [
  { value: '', label: 'Tous' },
  { value: 'false', label: 'Non répondus' },
  { value: 'true', label: 'Répondus' },
];

const PAGE_SIZE = 25;

function ReplyRow({ message, onReplied }) {
  const [reponse, setReponse] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const data = await api.post(`/admin/messages/${message.id}/repondre`, { reponse });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (result) {
    let feedback;
    if (!result.aUnEmail) {
      feedback = {
        type: 'success',
        text: "Réponse enregistrée. Ce visiteur n'a laissé qu'un téléphone — contactez-le directement, aucun e-mail n'a été envoyé.",
      };
    } else if (result.emailEnvoyé) {
      feedback = { type: 'success', text: `Réponse enregistrée et e-mail envoyé à ${message.email}.` };
    } else if (result.emailSimulé) {
      feedback = {
        type: 'success',
        text:
          "Réponse enregistrée. Aucun serveur d'e-mail n'est configuré (SMTP_* dans .env) : l'e-mail n'a " +
          "pas été réellement envoyé, mais son contenu a été affiché dans les logs du serveur.",
      };
    } else {
      feedback = {
        type: 'error',
        text: `Réponse enregistrée, mais l'envoi de l'e-mail à ${message.email} a échoué — contactez ce visiteur autrement.`,
      };
    }
    return (
      <div className="stack gap-12">
        <Banner type={feedback.type} message={feedback.text} />
        <div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onReplied?.()}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="stack gap-12">
      <Banner type="error" message={error} onClose={() => setError('')} />
      <div className="field">
        <label>Votre réponse</label>
        <textarea
          className="input"
          rows={3}
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
          required
          maxLength={2000}
          placeholder={
            message.email
              ? `Sera envoyée par e-mail à ${message.email}…`
              : 'Ce visiteur n\'a laissé que son téléphone — notez votre réponse ici pour mémoire, puis contactez-le directement…'
          }
        />
      </div>
      <div>
        <button type="submit" className="btn btn-cta btn-sm" disabled={sending}>
          {sending ? 'Envoi…' : message.email ? 'Envoyer la réponse par e-mail' : 'Marquer comme répondu'}
        </button>
      </div>
    </form>
  );
}

export default function Messages() {
  const [repondu, setRepondu] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [list, setList] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedId, setExpandedId] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: '0' });
    if (repondu) params.set('repondu', repondu);
    if (dateDebut) params.set('dateDebut', dateDebut);
    if (dateFin) params.set('dateFin', dateFin);
    return api
      .get(`/admin/messages?${params.toString()}`)
      .then((data) => {
        setList(data);
        setOffset(data.length);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [repondu, dateDebut, dateFin]);

  useEffect(() => {
    load();
  }, [load]);

  // Temps réel (voir backend/src/services/contactMessageService.js) : un nouveau message de
  // contact apparaît dès son envoi, sans recharger la page. On ne recharge QUE si le filtre actif
  // peut l'inclure (un nouveau message est toujours "non répondu" et toujours daté d'aujourd'hui) —
  // inutile de rafraîchir une liste filtrée sur "répondus" ou une plage passée.
  useEffect(() => {
    const onNew = () => {
      const matchesRepondu = repondu !== 'true';
      const matchesDate = !dateFin || dateFin >= new Date().toISOString().slice(0, 10);
      if (matchesRepondu && matchesDate) load();
    };
    socket.on('admin:contact_new', onNew);
    return () => socket.off('admin:contact_new', onNew);
  }, [load, repondu, dateFin]);

  async function loadMore() {
    setLoadingMore(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
      if (repondu) params.set('repondu', repondu);
      if (dateDebut) params.set('dateDebut', dateDebut);
      if (dateFin) params.set('dateFin', dateFin);
      const data = await api.get(`/admin/messages?${params.toString()}`);
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
          <h1>Messages</h1>
          <p>Messages envoyés par les visiteurs via le formulaire de contact du site public.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />

      <div className="filters-bar">
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`tab${repondu === tab.value ? ' active' : ''}`}
              onClick={() => setRepondu(tab.value)}
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
        <div className="empty-state">Aucun message ne correspond à ces critères.</div>
      )}

      {!loading && list.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table data-table-stack">
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Nom</th>
                  <th>Contact</th>
                  <th>Message</th>
                  <th>Reçu le</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => {
                  const expanded = expandedId === m.id;
                  return (
                    <Fragment key={m.id}>
                      <tr
                        className="clickable"
                        onClick={() => setExpandedId(expanded ? '' : m.id)}
                      >
                        <td data-label="Statut">
                          <span className={`badge ${m.repondu ? 'badge-green' : 'badge-gold'}`}>
                            {m.repondu ? 'Répondu' : 'Non répondu'}
                          </span>
                        </td>
                        <td data-label="Nom">{m.nom}</td>
                        <td className="text-secondary" data-label="Contact">
                          <div className="stack gap-8">
                            {m.email && (
                              <span className="row gap-8" style={{ alignItems: 'center' }}>
                                <Icon icon={faEnvelope} size="xs" /> {m.email}
                              </span>
                            )}
                            {m.telephone && (
                              <span className="row gap-8" style={{ alignItems: 'center' }}>
                                <Icon icon={faPhone} size="xs" /> {m.telephone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-secondary" data-label="Message">
                          {m.message.length > 80 ? `${m.message.slice(0, 80)}…` : m.message}
                        </td>
                        <td className="text-secondary" data-label="Reçu le">{formatDate(m.date_creation)}</td>
                        <td data-label="">
                          <Icon icon={expanded ? faChevronUp : faChevronDown} className="text-muted" />
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={6} style={{ background: 'var(--bg-alt)' }}>
                            <div className="stack gap-12" style={{ padding: '12px 4px' }}>
                              <div>
                                <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: 4 }}>
                                  Message complet
                                </div>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.message}</p>
                              </div>
                              {m.repondu ? (
                                <div>
                                  <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: 4 }}>
                                    Réponse envoyée {m.date_reponse ? `le ${formatDate(m.date_reponse)}` : ''}
                                  </div>
                                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.reponse}</p>
                                </div>
                              ) : (
                                <ReplyRow message={m} onReplied={() => { setExpandedId(''); load(); }} />
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
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
