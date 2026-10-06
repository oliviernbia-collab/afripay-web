import { forwardRef, useEffect, useRef, useState } from 'react';

/**
 * Révèle son contenu (fondu + léger glissement) quand il entre dans le viewport au défilement —
 * via IntersectionObserver plutôt qu'un écouteur `scroll` (aucun recalcul de layout répété pendant
 * le défilement). Se déclenche une seule fois (observer déconnecté dès l'apparition) : on ne veut
 * pas que les cartes disparaissent/réapparaissent en remontant la page, ce qui lasserait vite.
 *
 * `variant` : 'up' (défaut, glissement vertical — sections/listes), 'left'/'right' (glissement
 * horizontal — paire de cartes côte à côte, voir .lp-apps-grid) ou 'scale' (léger zoom — badges/
 * icônes isolés). `delay` (ms) decale le départ d'un élément dans une grille pour obtenir une
 * cascade au lieu d'un bloc qui apparaît d'un coup (voir les .map() dans Landing.jsx).
 *
 * Respecte prefers-reduced-motion (voir le reste de landing.css) : le contenu est alors visible
 * immédiatement, sans transition ni dépendance à l'observer.
 */
const Reveal = forwardRef(function Reveal(
  { as: Tag = 'div', children, className = '', variant = 'up', delay = 0, style, ...rest },
  forwardedRef
) {
  const localRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }
    const el = localRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={(node) => {
        localRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={`lp-reveal lp-reveal-${variant} ${visible ? 'lp-reveal-visible' : ''} ${className}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default Reveal;
