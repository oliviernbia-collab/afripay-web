import { useState } from 'react';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Icon from './Icon';

/**
 * Password `<input>` with a show/hide toggle (eye icon). Drop-in
 * replacement for `<input type="password" className="input" ... />` —
 * forwards all other props (value, onChange, required, minLength, id,
 * autoComplete, etc.) to the underlying input. Pass `icon` (a Font Awesome
 * icon object) to also render a leading icon inside the field.
 */
export default function PasswordInput({ className = 'input', icon, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="icon-field">
      {icon && <Icon icon={icon} size="sm" className="field-icon" />}
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${className} input-with-toggle${icon ? ' input-with-icon' : ''}`}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        title={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        <Icon icon={visible ? faEyeSlash : faEye} size="sm" />
      </button>
    </div>
  );
}
