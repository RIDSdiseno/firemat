import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function ReportPanel({ products = [], movements = [], categories = [], onNotify }) {
  const [scope, setScope] = useState("inventario");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const baseReport = useMemo(() => {
    if (scope === "bajo") {
      return {
        title: "Stock bajo",
        columns: ["Codigo", "Nombre", "Categoria", "Stock", "Minimo", "Ubicacion"],
        rows: products
          .filter((p) => p.stock < p.minStock)
          .map((p) => ({
            Codigo: p.code,
            Nombre: p.name,
            Categoria: p.category,
            Stock: p.stock,
            Minimo: p.minStock,
            Ubicacion: p.location || "",
          })),
      };
    }

    if (scope === "movimientos") {
      return {
        title: "Historial de movimientos",
        columns: [
          "Fecha",
          "Producto",
          "Tipo",
          "Cantidad",
          "Stock antes",
          "Stock despues",
          "Motivo",
          "Documento",
        ],
        rows: movements.map((m) => ({
          Fecha: m.fecha,
          Producto: m.producto,
          Tipo: m.tipo,
          Cantidad: m.cantidad,
          "Stock antes": m.stockAnterior,
          "Stock despues": m.stockNuevo,
          Motivo: m.motivo || "",
          Documento: m.documento || "",
        })),
      };
    }

    return {
      title: "Inventario actual",
      columns: ["Codigo", "SKU", "Nombre", "Categoria", "Stock", "Minimo", "Estado"],
      rows: products.map((p) => ({
        Codigo: p.code,
        SKU: p.sku || "",
        Nombre: p.name,
        Categoria: p.category,
        Stock: p.stock,
        Minimo: p.minStock,
        Estado: p.status,
      })),
    };
  }, [scope, products, movements]);

  const filteredRows = useMemo(() => {
    let rows = baseReport.rows;

    if (scope !== "movimientos" && category) {
      rows = rows.filter((row) => row.Categoria === category);
    }

    if (scope === "movimientos" && (dateFrom || dateTo)) {
      rows = rows.filter((row) => {
        const date = row.Fecha || "";
        if (dateFrom && date < dateFrom) return false;
        if (dateTo && date > dateTo) return false;
        return true;
      });
    }

    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) =>
      baseReport.columns.some((col) =>
        String(row[col] ?? "")
          .toLowerCase()
          .includes(term)
      )
    );
  }, [baseReport, category, scope, dateFrom, dateTo, search]);

  const previewRows = filteredRows.slice(0, 8);
  const fileName = `reporte-${scope}-${new Date().toISOString().slice(0, 10)}`;

  const exportPdf = () => {
    if (filteredRows.length === 0) {
      onNotify?.(false, "No hay datos para exportar en este reporte.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(baseReport.title, 14, 16);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      head: [baseReport.columns],
      body: filteredRows.map((row) =>
        baseReport.columns.map((col) => row[col] ?? "")
      ),
      startY: 28,
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [185, 28, 28] },
      theme: "striped",
      columnStyles: {
        0: { cellWidth: 34 },
      },
    });

    doc.save(`${fileName}.pdf`);
    onNotify?.(true, "PDF generado correctamente.");
  };

  const exportExcel = () => {
    if (filteredRows.length === 0) {
      onNotify?.(false, "No hay datos para exportar en este reporte.");
      return;
    }

    const sheet = XLSX.utils.json_to_sheet(filteredRows, {
      header: baseReport.columns,
    });
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Reporte");
    XLSX.writeFile(book, `${fileName}.xlsx`);
    onNotify?.(true, "Excel generado correctamente.");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/90 backdrop-blur rounded-2xl border border-neutral-200 shadow-md p-5 mb-6"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-red-600 font-semibold">
            Reportes
          </p>
          <h3 className="text-lg font-bold text-neutral-900">
            Previsualiza y exporta
          </h3>
          <p className="text-sm text-neutral-500">
            Elige el tipo de reporte, revisa la vista previa y descarga en PDF o
            Excel.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            <option value="inventario">Inventario actual</option>
            <option value="bajo">Stock bajo</option>
            <option value="movimientos">Movimientos</option>
          </select>

          {scope !== "movimientos" && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todas las categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {scope === "movimientos" && (
            <>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                aria-label="Fecha desde"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                aria-label="Fecha hasta"
              />
            </>
          )}

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-56 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            placeholder="Filtrar por texto..."
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
        <span>
          {baseReport.title} · {filteredRows.length} registro
          {filteredRows.length === 1 ? "" : "s"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportPdf}
            className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-red-700"
          >
            Exportar PDF
          </button>
          <button
            type="button"
            onClick={exportExcel}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50">
        {previewRows.length === 0 ? (
          <div className="p-6 text-center text-sm text-neutral-500">
            No hay datos para mostrar con los filtros actuales.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-900 text-white">
              <tr>
                {baseReport.columns.map((col) => (
                  <th key={col} className="px-3 py-2 text-left font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className={idx % 2 === 0 ? "bg-white" : "bg-neutral-100"}
                >
                  {baseReport.columns.map((col) => (
                    <td key={col} className="px-3 py-2 whitespace-nowrap">
                      {row[col] ?? "-"}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filteredRows.length > previewRows.length && (
        <p className="mt-2 text-[11px] text-neutral-500">
          Mostrando {previewRows.length} de {filteredRows.length} registros en
          vista previa.
        </p>
      )}
    </motion.section>
  );
}

export default ReportPanel;
