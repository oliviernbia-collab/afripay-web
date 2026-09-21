/**
 * Filtre par plage de dates réutilisable (deux <input type="date"> + lien "Effacer").
 * `dateDebut`/`dateFin` sont des chaînes "YYYY-MM-DD" ou ''.
 *
 * `onDateDebutChange`/`onDateFinChange` sont appelés indépendamment, chacun avec la
 * seule nouvelle valeur de SON champ — jamais avec un objet combinant les deux. C'est
 * volontaire : si on composait un objet {dateDebut, dateFin} à partir des props reçues,
 * deux changements rapprochés (l'un juste après l'autre, avant que React ne re-rende)
 * risqueraient de lire une valeur pas encore à jour pour le champ voisin et l'effacer
 * involontairement. En laissant chaque champ mettre à jour uniquement sa propre valeur
 * (au besoin via la forme fonctionnelle de setSearchParams/setState côté appelant), ce
 * risque de condition de course disparaît.
 */
export default function DateRangeFilter({ dateDebut, dateFin, onDateDebutChange, onDateFinChange, onClear }) {
  const hasValue = !!(dateDebut || dateFin);

  return (
    <div className="row gap-8" style={{ alignItems: 'center' }}>
      <div className="field" style={{ gap: 2 }}>
        <label style={{ fontSize: '0.72rem' }}>Du</label>
        <input
          className="input"
          type="date"
          value={dateDebut || ''}
          max={dateFin || undefined}
          onChange={(e) => onDateDebutChange(e.target.value)}
          style={{ width: 152 }}
        />
      </div>
      <div className="field" style={{ gap: 2 }}>
        <label style={{ fontSize: '0.72rem' }}>Au</label>
        <input
          className="input"
          type="date"
          value={dateFin || ''}
          min={dateDebut || undefined}
          onChange={(e) => onDateFinChange(e.target.value)}
          style={{ width: 152 }}
        />
      </div>
      {hasValue && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 18 }}
          onClick={onClear || (() => { onDateDebutChange(''); onDateFinChange(''); })}
        >
          Effacer
        </button>
      )}
    </div>
  );
}
