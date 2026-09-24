import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 900;
const EASE_OUT = (t) => 1 - (1 - t) ** 3;

// Anneau de proportion (valeur / total) — utilisé pour les taux de validation KYC/KYB sur le
// tableau de bord. Le pourcentage et la légende restent en texte normal (jamais la couleur
// seule) : le violet notamment n'a pas un contraste suffisant sur le fond sombre pour porter
// l'information à lui seule. L'anneau se dessine et le pourcentage s'incrémente à l'affichage
// (via requestAnimationFrame) plutôt que d'apparaître déjà plein.
export default function DonutChart({ value, total, color, caption, legend, size = 132, strokeWidth = 14 }) {
  const safeTotal = total > 0 ? total : 0;
  const pct = safeTotal > 0 ? Math.round((value / safeTotal) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const [displayPct, setDisplayPct] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    setDisplayPct(0);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      setDisplayPct(Math.round(EASE_OUT(t) * pct));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [pct]);

  const dash = (displayPct / 100) * circumference;

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
          {dash > 0 && (
            <circle
              className="donut-arc"
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform={`rotate(-90 ${center} ${center})`}
            />
          )}
        </svg>
        <div className="donut-center">
          <span className="donut-center-value">{displayPct}%</span>
          {caption && <span className="donut-center-caption">{caption}</span>}
        </div>
      </div>
      {legend && (
        <ul className="donut-legend">
          {legend.map((item) => (
            <li key={item.label} className="donut-legend-item">
              <span className="donut-legend-dot" style={{ background: item.color }} />
              <span className="donut-legend-label">{item.label}</span>
              <span className="donut-legend-value">{item.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
