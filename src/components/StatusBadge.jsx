import {
  faClock,
  faCircleCheck,
  faCircleXmark,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
import Icon from './Icon';

const STATUS_MAP = {
  // KYC / KYB
  'en_attente': { label: 'En attente', tone: 'gold', icon: faClock },
  'validé': { label: 'Validé', tone: 'green', icon: faCircleCheck },
  'rejeté': { label: 'Rejeté', tone: 'red', icon: faCircleXmark },
  'suspendu': { label: 'Suspendu', tone: 'grey', icon: faBan },
  // Transactions
  'réussi': { label: 'Réussi', tone: 'green', icon: faCircleCheck },
  'échoué': { label: 'Échoué', tone: 'red', icon: faCircleXmark },
};

const TYPE_LABELS = {
  achat: 'Achat',
  recharge: 'Recharge',
  transfert: 'Transfert',
};

const METHOD_LABELS = {
  paume_de_main: 'Scan de paiement',
  mobile_money: 'Mobile Money',
  carte_visa: 'Carte Visa',
  interne: 'Interne',
};

export default function StatusBadge({ status }) {
  const meta = STATUS_MAP[status] || { label: status || '—', tone: 'grey', icon: faBan };
  return (
    <span className={`badge badge-${meta.tone}`}>
      <Icon icon={meta.icon} size="xs" />
      {meta.label}
    </span>
  );
}

export function typeLabel(type) {
  return TYPE_LABELS[type] || type;
}

export function methodLabel(method) {
  return METHOD_LABELS[method] || method || '—';
}
