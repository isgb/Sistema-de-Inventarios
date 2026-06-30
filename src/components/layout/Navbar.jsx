/**
 * @fileoverview Barra de navegación superior con info del usuario y rol.
 */

import { useAuth } from '../../hooks/useAuth';

export default function Navbar({ onToggleSidebar }) {
  const { user, roles, logout } = useAuth();

  return (
    <nav className="top-navbar">
      <button className="btn btn-link text-dark p-1 me-3" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <i className="bi bi-list fs-4"></i>
      </button>

      <span className="fw-bold text-primary me-auto d-flex align-items-center gap-2">
        <i className="bi bi-box-seam"></i>
        InvenSys
      </span>

      <div className="dropdown">
        <button
          className="btn btn-light btn-sm dropdown-toggle d-flex align-items-center gap-2"
          type="button"
          onClick={(e) => e.currentTarget.nextElementSibling.classList.toggle('show')}
        >
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
            style={{ width: 28, height: 28, fontSize: '0.75rem' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="d-none d-md-inline">{user?.name || 'Usuario'}</span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          <li>
            <span className="dropdown-item-text small text-muted">{user?.email}</span>
          </li>
          <li>
            <span className="dropdown-item-text small">
              {(roles || []).map((role) => (
                <span key={role} className="badge bg-primary me-1" style={{ fontSize: '0.65rem' }}>{role}</span>
              ))}
            </span>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item text-danger" onClick={logout}>
              <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
