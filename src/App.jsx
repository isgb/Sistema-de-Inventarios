/**
 * @fileoverview Componente raíz con la configuración de rutas.
 * Define las rutas públicas (login, registro) y protegidas (dashboard, productos).
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import PrivateRoute from './components/common/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CreateProductPage from './pages/CreateProductPage';

/**
 * Componente principal que define el árbol de rutas.
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas protegidas dentro del layout principal */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<CreateProductPage />} />
        
      </Route>

      {/* Ruta fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
