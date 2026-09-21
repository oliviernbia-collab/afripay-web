import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import Icon from './Icon';
import {
  faGauge,
  faUsers,
  faStore,
  faReceipt,
  faRightFromBracket,
  faBars,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', color: 'var(--turquoise)', icon: faGauge },
  { to: '/utilisateurs', label: 'Utilisateurs', color: 'var(--blue)', icon: faUsers },
  { to: '/marchands', label: 'Marchands', color: 'var(--violet)', icon: faStore },
  { to: '/transactions', label: 'Transactions', color: 'var(--gold)', icon: faReceipt },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Ferme le tiroir mobile automatiquement à chaque changement de page.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const initials = admin?.nom
    ? admin.nom
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <div className="app-shell">
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="sidebar-logo">
            <img src={logo} alt="AfriPay" />
            <span>AfriPay</span>
          </div>
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Fermer le menu"
          >
            <Icon icon={faXmark} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-link-icon" style={{ color: item.color }}>
                <Icon icon={item.icon} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="sidebar-link" onClick={handleLogout}>
            <span className="sidebar-link-icon" style={{ color: 'var(--red)' }}>
              <Icon icon={faRightFromBracket} />
            </span>
            Déconnexion
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Icon icon={faBars} />
          </button>
          <div className="topbar-admin">
            <div className="stack" style={{ alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{admin?.nom || 'Administrateur'}</span>
              <span className="text-muted role-line" style={{ fontSize: '0.74rem' }}>
                {admin?.role || 'admin'}
              </span>
            </div>
            <div className="avatar">{initials}</div>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
