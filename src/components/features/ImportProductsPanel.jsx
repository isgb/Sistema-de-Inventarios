/**
 * @fileoverview Panel de importación de productos desde Excel (.xlsx).
 * Flujo: seleccionar archivo → previsualizar (valida sin guardar) → confirmar.
 * Se usa como sección inline en ProductsPage, no como modal de Bootstrap JS
 * (el proyecto solo carga el CSS de Bootstrap).
 */

import { useState } from 'react';
import { previewImportExcel, confirmImportExcel } from '../../services/product.service';
import toast from 'react-hot-toast';

const PREVIEW_ROWS_SHOWN = 8;

export default function ImportProductsPanel({ onImported, onClose }) {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [preview, setPreview] = useState(null);

  function handleFileChange(e) {
    setFile(e.target.files[0] || null);
    setPreview(null);
  }

  async function handleAnalyze() {
    if (!file) { toast.error('Selecciona un archivo .xlsx'); return; }

    setAnalyzing(true);
    try {
      const result = await previewImportExcel(file);
      setPreview(result);
      if (result.valid.length === 0) {
        toast.error('Ninguna fila pasó la validación');
      } else {
        toast.success(`${result.valid.length} de ${result.totalRows} filas listas para importar`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleConfirm() {
    if (!preview || preview.valid.length === 0) return;

    setConfirming(true);
    try {
      const result = await confirmImportExcel(preview.valid);
      toast.success(`${result.created} producto(s) importado(s)${result.failed > 0 ? `, ${result.failed} con error` : ''}`);
      onImported?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirming(false);
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
  }

  return (
    <div className="stat-card mb-4 border-start border-primary border-3">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h6 className="fw-bold mb-1"><i className="bi bi-file-earmark-excel me-2"></i>Importar productos desde Excel</h6>
          <p className="text-muted small mb-0">
            Columnas esperadas: Nombre, SKU, Categoría, Precio, Stock, Stock Mínimo, Descripción.
            La categoría debe coincidir con una ya existente. Máximo 500 filas.
          </p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose} title="Cerrar">
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="d-flex gap-2 align-items-center mb-3">
        <input
          type="file"
          accept=".xlsx"
          className="form-control form-control-sm"
          style={{ maxWidth: 320 }}
          onChange={handleFileChange}
        />
        <button className="btn btn-primary btn-sm" disabled={!file || analyzing} onClick={handleAnalyze}>
          {analyzing ? <><span className="spinner-border spinner-border-sm me-2" />Analizando...</> : 'Analizar archivo'}
        </button>
        {preview && (
          <button className="btn btn-outline-secondary btn-sm" onClick={reset}>
            <i className="bi bi-arrow-counterclockwise me-1"></i>Elegir otro archivo
          </button>
        )}
      </div>

      {preview && (
        <div>
          <div className="d-flex gap-3 small mb-2">
            <span className="text-muted">Filas leídas: <strong>{preview.totalRows}</strong></span>
            <span className="text-success">Válidas: <strong>{preview.valid.length}</strong></span>
            <span className="text-danger">Con error: <strong>{preview.errors.length}</strong></span>
          </div>

          {preview.valid.length > 0 && (
            <div className="table-responsive mb-3" style={{ maxHeight: 240, overflowY: 'auto' }}>
              <table className="table table-sm table-hover mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Categoría</th>
                    <th className="text-end">Precio</th>
                    <th className="text-center">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.valid.slice(0, PREVIEW_ROWS_SHOWN).map((row) => (
                    <tr key={row.row}>
                      <td>{row.name}</td>
                      <td><code className="small">{row.sku}</code></td>
                      <td>{row.categoryName}</td>
                      <td className="text-end">${row.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="text-center">{row.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.valid.length > PREVIEW_ROWS_SHOWN && (
                <p className="text-muted small mt-1 mb-0">...y {preview.valid.length - PREVIEW_ROWS_SHOWN} fila(s) más.</p>
              )}
            </div>
          )}

          {preview.errors.length > 0 && (
            <div className="alert alert-warning py-2 px-3 small mb-3" style={{ maxHeight: 160, overflowY: 'auto' }}>
              <strong>Filas con error (no se importarán):</strong>
              <ul className="mb-0 mt-1">
                {preview.errors.map((e, i) => (
                  <li key={i}>Fila {e.row}: {e.message}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="btn btn-success btn-sm"
            disabled={preview.valid.length === 0 || confirming}
            onClick={handleConfirm}
          >
            {confirming
              ? <><span className="spinner-border spinner-border-sm me-2" />Importando...</>
              : <><i className="bi bi-check-lg me-1"></i>Confirmar importación ({preview.valid.length})</>}
          </button>
        </div>
      )}
    </div>
  );
}
