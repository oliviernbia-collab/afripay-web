import { io } from 'socket.io-client';
import { API_HOST, getAccessToken } from '../api/client';

/**
 * Instance Socket.IO UNIQUE pour toute la durée de vie de l'app (autoConnect: false — voir
 * connectRealtime ci-dessous). Les pages peuvent s'abonner (`socket.on(...)`) dès leur montage,
 * avant même que la connexion ne soit établie : socket.io-client ne perd aucun écouteur enregistré
 * tôt, il attend juste que `connect()` aboutisse.
 *
 * Voir backend/src/realtime/socket.js pour le pendant serveur. Un compte admin rejoint en plus la
 * room partagée `admin:all` (côté serveur) : les événements de supervision (nouveau message de
 * contact, nouveau document KYC/KYB soumis) atteignent toute session admin ouverte, pas seulement
 * celle qui a déclenché l'action.
 */
export const socket = io(API_HOST, {
  autoConnect: false,
  transports: ['websocket'],
  // Fonction plutôt qu'un objet statique : rappelée à CHAQUE tentative de connexion, y compris les
  // reconnexions automatiques — donc toujours le jeton d'accès COURANT (voir api/client.js,
  // rafraîchi silencieusement via le cookie httpOnly). Un objet figé au premier connect() ferait
  // silencieusement échouer toute reconnexion après l'expiration de ce jeton initial.
  auth: (cb) => cb({ token: getAccessToken() }),
});

export function connectRealtime() {
  if (!socket.connected) socket.connect();
}

export function disconnectRealtime() {
  socket.disconnect();
}
