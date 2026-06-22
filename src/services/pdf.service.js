/**
 * @fileoverview Servicio de generación de reportes PDF del inventario.
 * Usa jsPDF con autoTable para crear tablas profesionales.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera y descarga un PDF con el reporte de los productos seleccionados.
 * @param {Array<Object>} products - Lista de productos a incluir en el reporte.
 */
export function generateInventoryPDF(products) {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // --- Encabezado ---
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text('InvenSys', 14, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Reporte de Inventario', 14, 28);

  doc.setFontSize(9);
  doc.text(`Fecha: ${dateStr} - ${timeStr}`, 14, 35);
  doc.text(`Productos incluidos: ${products.length}`, 14, 41);

  // --- Línea separadora ---
  doc.setDrawColor(52, 152, 219);
  doc.setLineWidth(0.8);
  doc.line(14, 44, 196, 44);

  // --- Tabla de productos ---
  const tableData = products.map((p, i) => [
    i + 1,
    p.name,
    p.sku,
    p.category,
    `$${p.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    p.stock,
    p.stock === 0 ? 'Sin stock' : p.stock <= p.minStock ? 'Stock bajo' : 'Disponible',
    new Date(p.createdAt).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  ]);

  autoTable(doc, {
    startY: 48,
    head: [['#', 'Producto', 'SKU', 'Categoría', 'Precio', 'Stock', 'Estado', 'Registro']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 22, font: 'courier' },
      3: { cellWidth: 22 },
      4: { halign: 'right', cellWidth: 22 },
      5: { halign: 'center', cellWidth: 14 },
      6: { halign: 'center', cellWidth: 20 },
      7: { cellWidth: 24 },
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw;
        if (val === 'Sin stock') {
          data.cell.styles.textColor = [231, 76, 60];
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'Stock bajo') {
          data.cell.styles.textColor = [243, 156, 18];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [39, 174, 96];
        }
      }
    },
  });

  // --- Resumen al final ---
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text('Resumen', 14, finalY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(`Total de unidades en stock: ${totalStock.toLocaleString()}`, 14, finalY + 7);
  doc.text(`Valor total del inventario: $${totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 14, finalY + 13);
  doc.text(`Productos con stock bajo: ${lowStock}`, 14, finalY + 19);
  doc.text(`Productos sin stock: ${outOfStock}`, 14, finalY + 25);

  // --- Pie de página ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `InvenSys - Reporte generado el ${dateStr} | Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  // --- Descargar ---
  const fileName = `inventario_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
