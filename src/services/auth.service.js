/**
 * @fileoverview Servicio de autenticación con datos mock.
 * Simula login/registro mientras el backend no está disponible.
 * Cuando el backend esté listo, reemplazar las funciones mock por llamadas reales.
 */

import api from './api';

/** Usuarios mock para desarrollo */
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@inventario.com',
    password: '123456',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Usuario Demo',
    email: 'demo@inventario.com',
    password: '123456',
    role: 'user',
  },
];

/** Token JWT simulado */
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluIiwicm9sZSI6ImFkbWluIn0.mock';

/** @type {boolean} Cambiar a false cuando el backend esté disponible */
const USE_MOCK = true;

/**
 * Inicia sesión con credenciales.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<{user: Object, token: string}>} Datos del usuario y token JWT.
 * @throws {Error} Si las credenciales son inválidas.
 */
export async function login(email, password) {
  if (USE_MOCK) {
    await _simulateDelay();
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      throw new Error('Credenciales inválidas. Prueba: admin@inventario.com / 123456');
    }
    const { password: _, ...userData } = user;
    return { user: userData, token: MOCK_TOKEN };
  }

  return api.post('/auth/login', { email, password });
}

/**
 * Registra un nuevo usuario.
 * @param {Object} data - Datos del registro.
 * @param {string} data.name - Nombre completo.
 * @param {string} data.email - Correo electrónico.
 * @param {string} data.password - Contraseña.
 * @returns {Promise<{user: Object, token: string}>} Datos del usuario creado y token.
 * @throws {Error} Si el email ya está registrado.
 */
export async function register(data) {
  if (USE_MOCK) {
    await _simulateDelay();
    const exists = MOCK_USERS.find((u) => u.email === data.email);
    if (exists) {
      throw new Error('Este correo ya está registrado');
    }
    const newUser = {
      id: String(MOCK_USERS.length + 1),
      name: data.name,
      email: data.email,
      role: 'user',
    };
    return { user: newUser, token: MOCK_TOKEN };
  }

  return api.post('/auth/register', data);
}

/**
 * Simula latencia de red para desarrollo.
 * @private
 * @returns {Promise<void>}
 */
function _simulateDelay() {
  return new Promise((resolve) => setTimeout(resolve, 600));
}
