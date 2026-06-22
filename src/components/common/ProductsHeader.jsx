/**
 * @fileoverview Encabezado de la página de productos.
 * Muestra título, contador, botón de exportar PDF y botón de nuevo producto.
 */

import { Link } from 'react-router-dom';

/**
 * Barra superior de la página de productos.
 * @param {Object} props
 * @param {number} props.totalProducts - Total de productos registrados.
 * @param {number} props.selectedCount - Cantidad de productos seleccionados.
 * @param {Function} props.onDownloadPDF - Callback para generar el reporte PDF.
 * @returns {JSX.Element}
 */
export default function ProductsHeader({ totalProducts, selectedCount, onDownloadPDF }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 className="fw-bold mb-1">Productos</h4>
        <p className="text-muted mb-0 small">{totalProducts} productos registrados</p>
      </div>
      <div className="d-flex gap-2">
        {selectedCount > 0 && (
          <button
            className="btn btn-danger btn-sm d-flex align-items-center gap-2"
            onClick={onDownloadPDF}
          >
            <i className="bi bi-file-earmark-pdf"></i>
            Descargar PDF ({selectedCount})
          </button>
        )}
        <Link to="/products/new" className="btn btn-primary btn-sm d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i>
          Nuevo Producto
        </Link>
      </div>
    </div>
  );
}
