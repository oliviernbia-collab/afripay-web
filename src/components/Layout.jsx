import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fileUrl } from '../api/client';
import logo from '../assets/logo.png';
import Icon from './Icon';
import {
  faGauge,
  faUsers,
  faStore,
  faIdCard,
  faShieldHalved,
  faReceipt,
  faWallet,
  faCreditCard,
  faFingerprint,
  faTriangleExclamation,
  faBell,
  faUserShield,
  faClipboardList,
  faRightFromBracket,
  faBars,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', color: 'var(--turquoise)', icon: faGauge },
  { to: '/clients', label: 'Clients', color: 'var(--blue)', icon: faUsers },
  { to: '/marchands', label: 'Marchands', color: 'var(--violet)', icon: faStore },
  { to: '/kyc', label: 'KYC', color: 'var(--green)', icon: faIdCard },
  { to: '/kyb', label: 'KYB', color: 'var(--magenta)', icon: faShieldHalved },
  { to: '/transactions', label: 'Transactions', color: 'var(--gold)', icon: faReceipt },
  { to: '/wallets', label: 'Wallets', color: 'var(--turquoise)', icon: faWallet },
  { to: '/recharges', label: 'Recharges', color: 'var(--orange)', icon: faCreditCard },
  { to: '/biometrie', label: 'Biométrie', color: 'var(--blue)', icon: faFingerprint },
  { to: '/fraude', label: 'Fraude', color: 'var(--red)', icon: faTriangleExclamation, roles: ['super_admin', 'conformite'] },
  { to: '/notifications', label: 'Notifications', color: 'var(--gold)', icon: faBell },
  { to: '/internes', label: 'Utilisateurs internes', color: 'var(--violet)', icon: faUserShield, roles: ['super_admin'] },
  { to: '/audit-logs', label: 'Audit Logs', color: 'var(--text-secondary)', icon: faClipboardList, roles: ['super_admin', 'conformite'] },
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

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(admin?.role));

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
          {visibleNavItems.map((item) => (
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
          <button
            type="button"
            className="topbar-admin topbar-admin-button"
            onClick={() => navigate('/profil')}
            title="Voir mon profil"
          >
            <div className="stack" style={{ alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{admin?.nom || 'Administrateur'}</span>
              <span className="text-muted role-line" style={{ fontSize: '0.74rem' }}>
                {admin?.role || 'admin'}
              </span>
            </div>
            {admin?.photo_url ? (
              <img
                src={fileUrl(admin.photo_url)}
                alt={admin.nom}
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div className="avatar">{initials}</div>
            )}
          </button>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
