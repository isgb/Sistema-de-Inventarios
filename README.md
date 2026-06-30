# InvenSys — Sistema de Inventarios Empresarial

Frontend de un Sistema de Gestión de Inventarios Empresarial con autenticación JWT, RBAC por rol, dashboard con KPIs y gráfica, CRUD completo de productos/categorías/movimientos/usuarios, importación/exportación de inventario en Excel y registro de actividad compartido.

Aplicación SPA con React 19 y Vite, UI con Bootstrap 5, conectada 100% al backend REST (no tiene modo mock).

## Tech Stack

| Tecnología        | Uso                                          |
| ------------------ | --------------------------------------------- |
| React 19            | UI / componentes                              |
| Vite 8              | Build tool / dev server                       |
| React Router 7      | Navegación SPA / rutas protegidas por rol     |
| Bootstrap 5         | Estilos y componentes UI (solo CSS)           |
| Bootstrap Icons     | Iconografía                                    |
| React Hot Toast     | Notificaciones toast                          |
| jsPDF + jspdf-autotable | Exportar reporte PDF de productos seleccionados |

La importación/exportación a Excel se procesa en el **backend** (`exceljs`); el frontend solo sube el archivo y descarga el resultado, sin librerías de Excel propias.

## Estructura del proyecto

```text
frontend/src/
├── components/
│   ├── common/
│   │   ├── EmptyState.jsx          # Estado vacío reutilizable
│   │   ├── ProductsHeader.jsx      # Header de Productos (PDF, Excel, Nuevo)
│   │   └── PrivateRoute.jsx        # Guardia de rutas autenticadas
│   ├── features/
│   │   └── ImportProductsPanel.jsx # Importar productos desde Excel (preview → confirmar)
│   └── layout/
│       ├── AppLayout.jsx            # Layout: Navbar + Sidebar + Outlet
│       ├── Navbar.jsx               # Barra superior con avatar, roles y logout
│       └── Sidebar.jsx              # Menú lateral con visibilidad por rol
├── context/
│   └── AuthContext.jsx              # Provider global de autenticación y roles
├── hooks/
│   └── useAuth.js                   # Hook para consumir AuthContext
├── pages/
│   ├── LoginPage.jsx                # Inicio de sesión
│   ├── RegisterPage.jsx             # Registro de usuario
│   ├── DashboardPage.jsx            # KPIs, gráfica de movimientos, actividad reciente
│   ├── ProductsPage.jsx             # Listado paginado, filtros, import/export Excel
│   ├── CreateProductPage.jsx        # Crear y editar producto (mismo componente)
│   ├── CategoriesPage.jsx           # Tabla con búsqueda, edición inline, activar/desactivar
│   ├── MovementsPage.jsx            # Movimientos con filtros (producto/tipo/fechas) y paginación
│   └── UsersPage.jsx                # Usuarios con paginación, edición inline, asignar/revocar rol
├── services/
│   ├── api.js                       # Cliente HTTP: JWT, parseo de respuesta, logout en 401
│   ├── auth.service.js              # Login, registro, refresh, logout
│   ├── product.service.js           # CRUD paginado + import/export Excel
│   ├── category.service.js          # Listar/crear/actualizar categorías
│   ├── movement.service.js          # Listar (paginado/filtrado) y crear movimientos
│   ├── user.service.js              # CRUD paginado de usuarios
│   ├── role.service.js              # Listar roles, asignar/revocar
│   ├── activity.service.js          # Actividad reciente (desde el backend)
│   └── pdf.service.js               # Generar PDF de inventario en el cliente
├── styles/
│   └── global.css                   # Variables CSS y estilos globales
├── App.jsx                          # Definición de rutas
└── main.jsx                         # Entry point
```

## Funcionalidades

- **Autenticación**: login, registro, JWT en localStorage, logout, rutas protegidas, expulsión automática a `/login` si el token expira o es inválido (401).
- **RBAC en UI**: visibilidad de menús y acciones según rol (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `USER`), sincronizada con los permisos reales del backend.
- **Dashboard**: 7 KPIs (productos, stock, valor de inventario, stock bajo, sin stock, categorías, movimientos recientes), gráfica de movimientos por tipo con filtro de fecha (Hoy/7d/30d/Todo), actividad reciente compartida entre usuarios.
- **Productos**: tabla paginada server-side con búsqueda, filtro por categoría/estado y orden por columna; crear, editar y eliminar; exportar inventario completo a Excel; importar productos desde Excel con preview de validación antes de confirmar; exportar PDF de los productos seleccionados.
- **Categorías**: tabla con búsqueda, crear, renombrar (edición inline) y activar/desactivar.
- **Movimientos**: registrar entradas/salidas/ajustes de stock; tabla paginada con filtros por producto, tipo y rango de fechas.
- **Usuarios**: tabla paginada, crear usuario con rol inicial, edición inline (nombre/email/contraseña/estado), asignar y revocar roles (solo `SUPER_ADMIN`, mismo permiso que exige el backend).
- **Layout**: Navbar fija + sidebar colapsable con menú filtrado por rol, responsive.

## Credenciales de prueba

Las crea el seed del **backend** (`npm run seed`, ver `backend/README.md`):

| Rol | Email | Contraseña |
| --- | --- | --- |
| SUPER_ADMIN | `admin@inventario.com` | `Admin123!` |
| ADMIN | `carlos.admin@inventario.com` | `Admin123!` |
| MANAGER | `laura.manager@inventario.com` | `Manager123!` |
| USER | `pedro.user@inventario.com` | `User123!` |

## Getting Started

Requiere el backend corriendo (ver `backend/README.md`) con el seed ya ejecutado.

```bash
cd frontend
npm install
cp .env.example .env   # Editar VITE_API_URL si el backend no corre en localhost:5000
npm run dev             # http://localhost:5173
```

Otros scripts:

```bash
npm run build           # Build de producción
npm run preview          # Sirve el build localmente
npm run lint             # ESLint
```

### Requisitos

- Node.js 18+
- npm
- Backend del sistema corriendo y accesible (ver `../backend/README.md`)

### Variable de entorno

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL del backend |

## Endpoints consumidos

Todas las rutas protegidas envían `Authorization: Bearer <token>` automáticamente (`services/api.js`).

| Método | Endpoint | Usado en |
| --- | --- | --- |
| POST | `/api/auth/login` | LoginPage |
| POST | `/api/auth/register` | RegisterPage |
| POST | `/api/auth/logout` | Navbar |
| GET | `/api/products` | ProductsPage (paginado, filtros) |
| GET | `/api/products/stats` | DashboardPage |
| GET | `/api/products/:id` | CreateProductPage (modo edición) |
| POST | `/api/products` | CreateProductPage (modo crear) |
| PUT | `/api/products/:id` | CreateProductPage (modo edición) |
| DELETE | `/api/products/:id` | ProductsPage |
| GET | `/api/products/export` | ProductsPage (botón Exportar Excel) |
| POST | `/api/products/import/preview` | ImportProductsPanel |
| POST | `/api/products/import/confirm` | ImportProductsPanel |
| GET | `/api/categories` | CategoriesPage, CreateProductPage |
| POST | `/api/categories` | CategoriesPage |
| PUT | `/api/categories/:id` | CategoriesPage |
| GET | `/api/movements` | MovementsPage (paginado, filtros), DashboardPage (gráfica) |
| POST | `/api/movements` | MovementsPage |
| GET | `/api/users` | UsersPage (paginado) |
| POST | `/api/users` | UsersPage |
| PUT | `/api/users/:id` | UsersPage |
| GET | `/api/roles` | UsersPage (asignar rol) |
| POST | `/api/roles/assign` | UsersPage |
| POST | `/api/roles/revoke` | UsersPage |
| GET | `/api/activity` | DashboardPage |

## Licencia

MIT
