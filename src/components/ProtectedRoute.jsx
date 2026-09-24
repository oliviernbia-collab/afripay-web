import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// `roles`, si fourni, restreint l'accès aux comptes admin dont le rôle est dans la liste (même
// logique que le filtrage de la barre de navigation dans Layout.jsx — sans ce garde-fou, un
// compte "support" voyait la page se charger avant que l'appel API échoue en 403, exposant
// inutilement la structure d'écrans réservés à super_admin/conformite).
export default function ProtectedRoute({ children, roles }) {
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

  return children;
}
