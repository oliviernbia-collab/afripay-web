import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Thin wrapper around FontAwesomeIcon so the rest of the app imports
 * `Icon` instead of the Font Awesome library directly.
 *
 * Usage: <Icon icon={faUsers} /> — pass the icon object imported from
 * '@fortawesome/free-solid-svg-icons'. Color defaults to the parent
 * text color (currentColor); size follows the FontAwesomeIcon `size` prop.
 */
export default function Icon({ icon, size, className, ...rest }) {
  if (!icon) return null;
  return (
    <FontAwesomeIcon
      icon={icon}
      size={size}
      className={className}
      style={{ color: 'currentColor' }}
      {...rest}
    />
  );
}
