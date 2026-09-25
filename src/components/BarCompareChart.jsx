import { useEffect, useState } from 'react';

// Barres horizontales comparant 2-3 grandeurs de même nature (volumes FCFA, nombre de
// dossiers...). La valeur formatée est toujours affichée en clair à côté de chaque barre —
// jamais seulement la longueur/couleur — pour rester lisible même sans distinguer les teintes.
// Les barres partent de 0 et se remplissent à l'affichage (délai en cascade par ligne).
export default function BarCompareChart({ items }) {
  const [grown, setGrown] = useState(false);
  const maxValue = Math.max(1, ...items.map((it) => it.value));
  const valuesKey = items.map((it) => it.value).join(',');

  useEffect(() => {
    setGrown(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
    return () => cancelAnimationFrame(id);
  }, [valuesKey]);

  return (
    <div className="cmp-bar-chart">
      {items.map((item, i) => {
        const pct = Math.max(2, Math.round((item.value / maxValue) * 100));
        return (
          <div key={item.label} className="cmp-bar-row">
            <div className="cmp-bar-row-head">
              <span className="cmp-bar-dot" style={{ background: item.color }} />
              <span className="cmp-bar-label">{item.label}</span>
              <span className="cmp-bar-value">{item.formatted}</span>
            </div>
            <div className="cmp-bar-track">
              <div
                className="cmp-bar-fill"
                style={{
                  width: grown ? `${pct}%` : 0,
                  backgroundColor: item.color,
                  color: item.color,
                  transitionDelay: `${i * 90}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
