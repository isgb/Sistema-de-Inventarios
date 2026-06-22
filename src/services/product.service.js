/**
 * @fileoverview Servicio de productos con datos mock.
 * Simula operaciones CRUD mientras el backend no está disponible.
 */

import api from './api';

/** @type {boolean} Cambiar a false cuando el backend esté disponible */
const USE_MOCK = true;

/** Catálogo de productos mock */
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Laptop Dell Inspiron 15',
    sku: 'LAP-DELL-001',
    category: 'Electrónica',
    price: 15999.99,
    stock: 24,
    minStock: 5,
    description: 'Laptop Dell con procesador Intel i7, 16GB RAM, 512GB SSD.',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    name: 'Mouse Logitech MX Master 3',
    sku: 'MOU-LOG-002',
    category: 'Periféricos',
    price: 1899.50,
    stock: 58,
    minStock: 10,
    description: 'Mouse ergonómico inalámbrico con sensor de alta precisión.',
    createdAt: '2026-02-08',
  },
  {
    id: '3',
    name: 'Monitor Samsung 27" 4K',
    sku: 'MON-SAM-003',
    category: 'Electrónica',
    price: 8499.00,
    stock: 3,
    minStock: 5,
    description: 'Monitor UHD 4K IPS, 60Hz, HDR10.',
    createdAt: '2026-03-01',
  },
  {
    id: '4',
    name: 'Teclado Mecánico Keychron K2',
    sku: 'TEC-KEY-004',
    category: 'Periféricos',
    price: 2350.00,
    stock: 0,
    minStock: 8,
    description: 'Teclado mecánico 75%, switches Gateron Brown, retroiluminado RGB.',
    createdAt: '2026-03-12',
  },
  {
    id: '5',
    name: 'Silla Ergonómica Herman Miller',
    sku: 'SIL-HER-005',
    category: 'Mobiliario',
    price: 28500.00,
    stock: 7,
    minStock: 3,
    description: 'Silla de oficina ergonómica con soporte lumbar ajustable.',
    createdAt: '2026-04-20',
  },
  {
    id: '6',
    name: 'Cable HDMI 2.1 (2m)',
    sku: 'CAB-HDM-006',
    category: 'Accesorios',
    price: 349.99,
    stock: 142,
    minStock: 20,
    description: 'Cable HDMI 2.1 con soporte 8K/60Hz.',
    createdAt: '2026-05-02',
  },
  {
    id: '7',
    name: 'Webcam Logitech C920',
    sku: 'WEB-LOG-007',
    category: 'Periféricos',
    price: 1750.00,
    stock: 15,
    minStock: 5,
    description: 'Webcam Full HD 1080p con micrófono estéreo integrado.',
    createdAt: '2026-05-18',
  },
  {
    id: '8',
    name: 'Disco SSD NVMe 1TB Samsung',
    sku: 'SSD-SAM-008',
    category: 'Almacenamiento',
    price: 2199.00,
    stock: 4,
    minStock: 10,
    description: 'SSD NVMe M.2 con velocidad de lectura 7000 MB/s.',
    createdAt: '2026-06-01',
  },
];

/**
 * Obtiene la lista de todos los productos.
 * @returns {Promise<Array<Object>>} Lista de productos.
 */
export async function getProducts() {
  if (USE_MOCK) {
    await _simulateDelay();
    return [...MOCK_PRODUCTS];
  }
  return api.get('/products');
}

/**
 * Obtiene un producto por su ID.
 * @param {string} id - ID del producto.
 * @returns {Promise<Object>} Producto encontrado.
 * @throws {Error} Si el producto no existe.
 */
export async function getProductById(id) {
  if (USE_MOCK) {
    await _simulateDelay();
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!product) throw new Error('Producto no encontrado');
    return { ...product };
  }
  return api.get(`/products/${id}`);
}

/**
 * Crea un nuevo producto.
 * @param {Object} data - Datos del producto a crear.
 * @returns {Promise<Object>} Producto creado con ID asignado.
 */
export async function createProduct(data) {
  if (USE_MOCK) {
    await _simulateDelay();
    const newProduct = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    };
    MOCK_PRODUCTS.push(newProduct);
    return newProduct;
  }
  return api.post('/products', data);
}

/**
 * Actualiza un producto existente.
 * @param {string} id - ID del producto.
 * @param {Object} data - Datos a actualizar.
 * @returns {Promise<Object>} Producto actualizado.
 */
export async function updateProduct(id, data) {
  if (USE_MOCK) {
    await _simulateDelay();
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...data };
    return { ...MOCK_PRODUCTS[index] };
  }
  return api.put(`/products/${id}`, data);
}

/**
 * Elimina un producto.
 * @param {string} id - ID del producto.
 * @returns {Promise<{message: string}>} Confirmación de eliminación.
 */
export async function deleteProduct(id) {
  if (USE_MOCK) {
    await _simulateDelay();
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    MOCK_PRODUCTS.splice(index, 1);
    return { message: 'Producto eliminado correctamente' };
  }
  return api.delete(`/products/${id}`);
}

/**
 * Obtiene estadísticas resumidas del inventario.
 * @returns {Promise<Object>} Estadísticas del dashboard.
 */
export async function getStats() {
  if (USE_MOCK) {
    await _simulateDelay();
    const products = MOCK_PRODUCTS;
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const categories = [...new Set(products.map((p) => p.category))].length;

    return {
      totalProducts,
      totalStock,
      totalValue,
      lowStock,
      outOfStock,
      categories,
    };
  }
  return api.get('/products/stats');
}

/** @private */
function _simulateDelay() {
  return new Promise((resolve) => setTimeout(resolve, 400));
}
