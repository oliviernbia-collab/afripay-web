import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Icon from './Icon';

export default function Banner({ type = 'success', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`banner banner-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="banner-close" onClick={onClose} aria-label="Fermer">
          <Icon icon={faXmark} />
        </button>
      )}
    </div>
  );
}
