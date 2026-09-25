import { useEffect, useState } from 'react';

// Diagramme en bandes verticales (barres montant depuis une ligne de base commune) — utilisé
// pour comparer des grandeurs de même nature (ex: dossiers KYC vs KYB en attente). Contrairement
// à BarCompareChart (barres horizontales façon jauge), ce composant donne une vraie lecture de
// diagramme en bâtons avec grille de fond, axe de base et libellés sous chaque bande.
export default function BandBarChart({ items, height = 96 }) {
  const [grown, setGrown] = useState(false);
  const maxValue = Math.max(1, ...items.map((it) => it.value));
  const valuesKey = items.map((it) => it.value).join(',');
  const gridLines = [25, 50, 75, 100];

  useEffect(() => {
    setGrown(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
    return () => cancelAnimationFrame(id);
  }, [valuesKey]);

  return (
    <div className="band-chart">
      <div className="band-chart-plot" style={{ height }}>
        <div className="band-chart-grid">
          {gridLines.map((g) => (
            <div key={g} className="band-chart-gridline" style={{ bottom: `${g}%` }} />
          ))}
          <div className="band-chart-gridline band-chart-baseline" style={{ bottom: 0 }} />
        </div>
        <div className="band-chart-bars">
          {items.map((item, i) => {
            const pct = Math.max(2, Math.round((item.value / maxValue) * 100));
            return (
              <div key={item.label} className="band-chart-col">
                <span className="band-chart-value">{item.formatted}</span>
                <div className="band-chart-bar-track">
                  <div
                    className="band-chart-bar-fill"
                    style={{
                      height: grown ? `${pct}%` : 0,
                      backgroundColor: item.color,
                      color: item.color,
                      transitionDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="band-chart-labels">
        {items.map((item) => (
          <span key={item.label} className="band-chart-label-item">
            <span className="band-chart-dot" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
