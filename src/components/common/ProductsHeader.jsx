/**
 * @fileoverview Encabezado de la página de productos.
 */

import { Link } from 'react-router-dom';

export default function ProductsHeader({
  totalProducts,
  selectedCount,
  onDownloadPDF,
  onExportExcel,
  onToggleImport,
  showNewButton = true,
  showImportExport = true,
}) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h4 className="fw-bold mb-1">Productos</h4>
        <p className="text-muted mb-0 small">{totalProducts} productos registrados</p>
      </div>
      <div className="d-flex gap-2 flex-wrap">
        {selectedCount > 0 && (
          <button className="btn btn-danger btn-sm d-flex align-items-center gap-2" onClick={onDownloadPDF}>
            <i className="bi bi-file-earmark-pdf"></i>Descargar PDF ({selectedCount})
          </button>
        )}
        {showImportExport && (
          <>
            <button className="btn btn-outline-success btn-sm d-flex align-items-center gap-2" onClick={onExportExcel}>
              <i className="bi bi-file-earmark-spreadsheet"></i>Exportar Excel
            </button>
            <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" onClick={onToggleImport}>
              <i className="bi bi-upload"></i>Importar Excel
            </button>
          </>
        )}
        {showNewButton && (
          <Link to="/products/new" className="btn btn-primary btn-sm d-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i>Nuevo Producto
          </Link>
        )}
      </div>
    </div>
  );
}
