import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LostCardsScreen } from './screens/LostCardsScreen';
import { MainLayout } from './components/MainLayout';
import './i18n';

const PrivateRoute = () => {
  const { user } = useAuth();
  return user ? <MainLayout /> : <Navigate to="/login" replace />;
};

const LoginRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <LoginScreen />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/lost" element={<LostCardsScreen />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
