import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// `roles`, si fourni, restreint l'accès aux comptes admin dont le rôle est dans la liste — réservé
// aux pages qui doivent rester réservées en dur à super_admin (ex. /permissions), sans dépendre de
// la matrice de permissions configurable.
// `permission`, si fourni, restreint l'accès aux comptes dont les permissions effectives
// (renvoyées par /admin/login et /admin/me, voir backend adminController.toPublicAdmin)
// contiennent ce code — même logique que le filtrage de la barre de navigation dans Layout.jsx.
// Dans les deux cas : sans ce garde-fou, un compte sans le droit voyait la page se charger avant
// que l'appel API échoue en 403, exposant inutilement la structure d'écrans qui ne le concernent pas.
export default function ProtectedRoute({ children, roles, permission }) {
  const { isAuthenticated, ready, admin } = useAuth();

  if (!ready) {
    return (
      <div className="loading-block" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(admin?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (permission && !admin?.permissions?.includes(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
