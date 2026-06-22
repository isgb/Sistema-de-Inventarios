/**
 * @fileoverview Componente de ruta protegida.
 * Redirige al login si el usuario no está autenticado.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Envuelve rutas que requieren autenticación.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido protegido.
 * @returns {JSX.Element} Contenido o redirección al login.
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
