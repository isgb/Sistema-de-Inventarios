# InvenSys — Sistema de Inventarios Empresarial

Frontend de un Sistema de Gestion de Inventarios Empresarial con autenticacion JWT, dashboard de estadisticas, gestion de productos y registro de actividad.

Aplicacion SPA con React 19 y Vite, UI con Bootstrap 5, arquitectura modular lista para conectar con backend REST.

## Tech Stack

| Tecnologia       | Uso                                |
| ---------------- | ---------------------------------- |
| React 19         | UI / componentes                   |
| Vite 8           | Build tool / dev server            |
| React Router 7   | Navegacion SPA / rutas protegidas  |
| Bootstrap 5      | Estilos y componentes UI           |
| Bootstrap Icons  | Iconografia                        |
| React Hot Toast  | Notificaciones toast               |

## Estructura del proyecto

```text
frontend/src/
├── components/
│   ├── common/
│   │   └── PrivateRoute.jsx        # Guardia de rutas autenticadas
│   └── layout/
│       ├── AppLayout.jsx            # Layout: Navbar + Sidebar + Outlet
│       ├── Navbar.jsx               # Barra superior con avatar y logout
│       └── Sidebar.jsx              # Menu lateral colapsable
├── context/
│   └── AuthContext.jsx              # Provider global de autenticacion
├── hooks/
│   └── useAuth.js                   # Hook para consumir AuthContext
├── pages/
│   ├── LoginPage.jsx                # Inicio de sesion
│   ├── RegisterPage.jsx             # Registro de usuario
│   ├── DashboardPage.jsx            # Panel con stats y actividad reciente
│   ├── ProductsPage.jsx             # Listado de productos con filtros
│   └── CreateProductPage.jsx        # Formulario de nuevo producto
├── services/
│   ├── api.js                       # Cliente HTTP con inyeccion de JWT
│   ├── auth.service.js              # Autenticacion (mock / API)
│   ├── product.service.js           # CRUD de productos (mock / API)
│   └── activity.service.js          # Registro de actividad en localStorage
├── styles/
│   └── global.css                   # Variables CSS y estilos globales
├── App.jsx                          # Definicion de rutas
└── main.jsx                         # Entry point
```

## Funcionalidades

- **Autenticacion**: Login, registro, JWT en localStorage, logout, rutas protegidas
- **Dashboard**: 6 tarjetas de estadisticas, actividad reciente, accesos rapidos
- **Productos**: Tabla con busqueda por nombre/SKU, filtro por categoria, eliminacion
- **Crear producto**: Formulario con validacion (nombre, SKU, categoria, precio, stock)
- **Layout**: Navbar fija + sidebar colapsable, responsive

## Credenciales Demo

| Email                  | Contrasena | Rol     |
| ---------------------- | ---------- | ------- |
| admin@inventario.com   | 123456     | Admin   |
| demo@inventario.com    | 123456     | Usuario |

## Getting Started

```bash
cd frontend
npm install
npm run dev
npm run build
```

### Requisitos

- Node.js 18+
- npm

## Conectar con Backend

1. Cambiar `USE_MOCK = false` en `auth.service.js` y `product.service.js`
2. Crear `.env` basado en `.env.example`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

### Endpoints esperados

| Metodo   | Endpoint              | Descripcion              |
| -------- | --------------------- | ------------------------ |
| POST     | /api/auth/login       | Iniciar sesion           |
| POST     | /api/auth/register    | Registrar usuario        |
| GET      | /api/products         | Listar productos         |
| POST     | /api/products         | Crear producto           |
| PUT      | /api/products/:id     | Actualizar producto      |
| DELETE   | /api/products/:id     | Eliminar producto        |
| GET      | /api/products/stats   | Estadisticas inventario  |

## Licencia

MIT
