import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Utilisateurs from './pages/Utilisateurs';
import UtilisateurDetail from './pages/UtilisateurDetail';
import Marchands from './pages/Marchands';
import MarchandDetail from './pages/MarchandDetail';
import Transactions from './pages/Transactions';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/utilisateurs" element={<Utilisateurs />} />
            <Route path="/utilisateurs/:id" element={<UtilisateurDetail />} />
            <Route path="/marchands" element={<Marchands />} />
            <Route path="/marchands/:id" element={<MarchandDetail />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
