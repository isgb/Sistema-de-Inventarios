/**
 * @fileoverview Barra lateral de navegación.
 * Contiene los enlaces principales del sistema.
 */

import { NavLink } from 'react-router-dom';

/** Elementos del menú de navegación */
const NAV_ITEMS = [
  { path: '/', icon: 'bi-speedometer2', label: 'Dashboard' },
  { path: '/products', icon: 'bi-box-seam', label: 'Productos' },
  { path: '/products/new', icon: 'bi-plus-circle', label: 'Nuevo Producto' },
];

/**
 * Sidebar de navegación lateral.
 * @param {Object} props
 * @param {boolean} props.collapsed - Si el sidebar está oculto.
 * @param {Function} props.onClose - Callback para cerrar en mobile.
 * @returns {JSX.Element}
 */
export default function Sidebar({ collapsed, onClose }) {
  const sidebarClass = [
    'sidebar',
    collapsed && 'hidden',
    !collapsed && 'show-mobile',
  ]
    .filter(Boolean)
    .join(' ');

  /** Solo cierra el sidebar en pantallas mobile (< 768px) */
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {!collapsed && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1035 }}
          onClick={onClose}
        />
      )}

      <aside className={sidebarClass}>
        <div className="sidebar-header">Menú principal</div>
        <nav className="nav flex-column">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={handleNavClick}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-header mt-4">Sistema</div>
        <nav className="nav flex-column">
          <span className="nav-link" style={{ cursor: 'default', opacity: 0.5 }}>
            <i className="bi bi-gear"></i>
            Configuración
            <span className="badge bg-secondary ms-auto" style={{ fontSize: '0.65rem' }}>
              Pronto
            </span>
          </span>
        </nav>
      </aside>
    </>
  );
}
