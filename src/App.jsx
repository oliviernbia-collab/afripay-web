import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Marchands from './pages/Marchands';
import MarchandDetail from './pages/MarchandDetail';
import Kyc from './pages/Kyc';
import Kyb from './pages/Kyb';
import Transactions from './pages/Transactions';
import Wallets from './pages/Wallets';
import Recharges from './pages/Recharges';
import Biometrie from './pages/Biometrie';
import Fraude from './pages/Fraude';
import Notifications from './pages/Notifications';
import Internes from './pages/Internes';
import AuditLogs from './pages/AuditLogs';
import Profil from './pages/Profil';

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
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/marchands" element={<Marchands />} />
            <Route path="/marchands/:id" element={<MarchandDetail />} />
            <Route path="/kyc" element={<Kyc />} />
            <Route path="/kyb" element={<Kyb />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/recharges" element={<Recharges />} />
            <Route path="/biometrie" element={<Biometrie />} />
            <Route
              path="/fraude"
              element={
                <ProtectedRoute roles={['super_admin', 'conformite']}>
                  <Fraude />
                </ProtectedRoute>
              }
            />
            <Route path="/notifications" element={<Notifications />} />
            <Route
              path="/internes"
              element={
                <ProtectedRoute roles={['super_admin']}>
                  <Internes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute roles={['super_admin', 'conformite']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route path="/profil" element={<Profil />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
