import { useState } from 'react';
import { fileUrl } from '../api/client';
import logo from '../assets/logo.png';

// Affiche le logo AfriPay à la place de l'icône "image cassée" du navigateur quand un document
// ne peut pas être chargé (fichier corrompu/manquant côté stockage — ça arrive avec d'anciens
// tests d'upload, indépendamment du code d'affichage).
export default function DocImage({ fichierRef, alt = '', style }) {
  const [broken, setBroken] = useState(false);
  const isFallback = broken || !fichierRef;

  return (
    <img
      src={isFallback ? logo : fileUrl(fichierRef)}
      alt={alt}
      style={isFallback ? { ...style, objectFit: 'contain', background: '#000' } : style}
      onError={() => setBroken(true)}
    />
  );
}
