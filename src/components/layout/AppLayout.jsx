/**
 * @fileoverview Layout principal de la aplicación autenticada.
 * Combina Navbar, Sidebar y área de contenido principal.
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Layout wrapper para las páginas protegidas.
 * @returns {JSX.Element}
 */
export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const closeSidebar = () => setSidebarCollapsed(true);

  return (
    <div className="app-layout">
      <Navbar onToggleSidebar={toggleSidebar} />

      <Sidebar collapsed={sidebarCollapsed} onClose={closeSidebar} />

      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <div className="page-container">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}
