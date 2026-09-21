import { useEffect, useState } from 'react';
import { faFingerprint, faCircleCheck, faCircleXmark, faListCheck } from '@fortawesome/free-solid-svg-icons';
import { api } from '../api/client';
import Banner from '../components/Banner';
import StatCard from '../components/StatCard';
import DateRangeFilter from '../components/DateRangeFilter';
import { formatDate, percent } from '../utils/format';

const RESULT_TABS = [
  { value: '', label: 'Toutes les tentatives' },
  { value: 'succes', label: 'Succès' },
  { value: 'echec', label: 'Échecs' },
];

export default function Biometrie() {
  const [resultat, setResultat] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [stats, setStats] = useState(null);
  const [enrolments, setEnrolments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ limit: '50' });
    if (resultat) params.set('resultat', resultat);
    if (dateDebut) params.set('dateDebut', dateDebut);
    if (dateFin) params.set('dateFin', dateFin);
    api
      .get(`/admin/biometrie?${params.toString()}`)
      .then((data) => {
        if (cancelled) return;
        setStats(data.stats);
        setEnrolments(data.enrolments);
        setLogs(data.logs);
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
  }, [resultat, dateDebut, dateFin]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Biométrie</h1>
          <p>Enrôlements de la paume de main et journal des tentatives de reconnaissance.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />

      {stats && (
        <div className="stat-grid">
          <StatCard label="Clients enrôlés" value={stats.enrolled} accent="var(--blue)" icon={faFingerprint} />
          <StatCard
            label="Tentatives réussies"
            value={stats.success}
            sub={`${percent(stats.success, stats.attempts)} des tentatives`}
            accent="var(--green)"
            icon={faCircleCheck}
          />
          <StatCard
            label="Tentatives échouées"
            value={stats.failed}
            sub={`${percent(stats.failed, stats.attempts)} des tentatives`}
            accent="var(--red)"
            icon={faCircleXmark}
          />
          <StatCard label="Total tentatives" value={stats.attempts} accent="var(--turquoise)" icon={faListCheck} />
        </div>
      )}

      <div className="section-grid">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Derniers enrôlements actifs</h3>
          {enrolments.length === 0 && <p className="text-secondary">Aucun enrôlement pour le moment.</p>}
          {enrolments.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Code de paiement</th>
                    <th>Enrôlé le</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolments.map((e) => (
                    <tr key={e.id}>
                      <td>{e.prenom} {e.nom}<div className="text-muted" style={{ fontSize: '0.76rem' }}>{e.telephone}</div></td>
                      <td className="text-secondary" style={{ fontFamily: 'monospace' }}>{e.palm_code}</td>
                      <td className="text-secondary">{formatDate(e.date_enrôlement)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="row wrap gap-12" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ margin: 0 }}>Journal des tentatives</h3>
            <div className="row wrap gap-12">
              <div className="tabs">
                {RESULT_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    className={`tab${resultat === tab.value ? ' active' : ''}`}
                    onClick={() => setResultat(tab.value)}
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
          </div>

          {loading && (
            <div className="loading-block">
              <div className="spinner" />
            </div>
          )}

          {!loading && logs.length === 0 && <p className="text-secondary">Aucune tentative enregistrée.</p>}

          {!loading && logs.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Résultat</th>
                    <th>Client identifié</th>
                    <th>Marchand</th>
                    <th>Motif</th>
                    <th>IP</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <span className={`badge badge-${l.resultat === 'succes' ? 'green' : 'red'}`}>
                          {l.resultat === 'succes' ? 'Succès' : 'Échec'}
                        </span>
                      </td>
                      <td>{l.user_nom ? `${l.user_prenom} ${l.user_nom}` : <span className="text-muted">—</span>}</td>
                      <td>{l.marchand_nom || <span className="text-muted">—</span>}</td>
                      <td className="text-secondary">{l.motif || '—'}</td>
                      <td className="text-secondary">{l.adresse_ip || '—'}</td>
                      <td className="text-secondary">{formatDate(l.date_heure)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
