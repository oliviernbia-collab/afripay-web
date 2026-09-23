import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import Banner from '../components/Banner';
import Icon from '../components/Icon';
import PasswordInput from '../components/PasswordInput';
import logo from '../assets/logo.png';

export default function Login() {
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (ready && isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), motDePasse);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <div className="login-avatar">
            <img src={logo} alt="AfriPay" />
          </div>
          <h1>Back-office AfriPay</h1>
          <p>Espace réservé à l'équipe conformité pour la validation des dossiers KYC/KYB.</p>
        </div>

        <Banner type="error" message={error} onClose={() => setError('')} />

        <div className="field">
          <label htmlFor="email">Adresse e-mail</label>
          <div className="icon-field">
            <Icon icon={faEnvelope} size="sm" className="field-icon" />
            <input
              id="email"
              className="input input-with-icon"
              type="email"
              autoComplete="username"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <PasswordInput
            id="password"
            icon={faLock}
            autoComplete="current-password"
            placeholder="••••••••"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-cta" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
