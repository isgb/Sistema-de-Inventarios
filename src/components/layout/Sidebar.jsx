/**
 * @fileoverview Barra lateral de navegación con visibilidad por roles RBAC.
 * Los ítems del menú se muestran según los roles del usuario autenticado.
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ collapsed, onClose }) {
  const { hasRole } = useAuth();

  const navItems = [
    { path: '/', icon: 'bi-speedometer2', label: 'Dashboard', show: true },
    { path: '/products', icon: 'bi-box-seam', label: 'Productos', show: true },
    { path: '/products/new', icon: 'bi-plus-circle', label: 'Nuevo Producto', show: hasRole('ADMIN', 'SUPER_ADMIN') },
    { path: '/categories', icon: 'bi-tags', label: 'Categorías', show: true },
    { path: '/movements', icon: 'bi-arrow-left-right', label: 'Movimientos', show: true },
    { path: '/users', icon: 'bi-people', label: 'Usuarios', show: hasRole('ADMIN', 'SUPER_ADMIN') },
  ];

  const sidebarClass = ['sidebar', collapsed && 'hidden', !collapsed && 'show-mobile']
    .filter(Boolean)
    .join(' ');

  const handleNavClick = () => {
    if (window.innerWidth < 768) onClose();
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
          {navItems.filter((item) => item.show).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
