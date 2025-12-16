// src/pages/MovimientosPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";

// Funcion auxiliar: cuanto cambia el stock este movimiento
function computeDelta(tipo, cantidad, stockAnterior) {
  switch (tipo) {
    case "Entrada":
    case "Alta de producto":
      return cantidad; // suma
    case "Salida":
      return -cantidad; // resta
    case "Ajuste":
      // Ajuste = se fija el stock a "cantidad"
      // delta = nuevoStock - stockAnterior
      return cantidad - stockAnterior;
    default:
      return 0;
  }
}

function MovimientosPage({
  movements,
  setMovements,
  currentUser,
  products,
  setProducts,
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fecha: "",
    tipo: "",
    cantidad: "",
    motivo: "",
    documento: "",
  });

  const role = currentUser?.role || "Dueno";
  // Solo Dueno/Ejecutivo pueden editar o eliminar; Gerente solo consulta
  const canEditMovement = role === "Dueno" || role === "Ejecutivo";

  // --- editar ---
  const handleEditClick = (movement) => {
    if (!canEditMovement) {
      alert("Tu rol no permite modificar movimientos.");
      return;
    }

    setEditingId(movement.id);
    setForm({
      fecha: movement.fecha || "",
      tipo: movement.tipo || "Entrada",
      cantidad: String(movement.cantidad ?? ""),
      motivo: movement.motivo || "",
      documento: movement.documento || "",
    });
  };

  // --- eliminar ---
  const handleDeleteClick = (id) => {
    if (!canEditMovement) {
      alert("Tu rol no permite eliminar movimientos.");
      return;
    }

    const mv = movements.find((m) => m.id === id);
    const ok = window.confirm(
      "Seguro que quieres eliminar este movimiento del historial? Esto ajustara el stock del producto."
    );
    if (!ok) return;

    if (mv && mv.productoId != null) {
      const stockAnterior = mv.stockAnterior ?? 0;
      const deltaOld = computeDelta(mv.tipo, mv.cantidad, stockAnterior);

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== mv.productoId) return p;
          const raw = (p.stock ?? 0) - deltaOld;
          const newStock = Math.max(0, raw);
          return { ...p, stock: newStock };
        })
      );
    }

    setMovements((prev) => prev.filter((m) => m.id !== id));
  };

  // --- formulario edicion ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canEditMovement) {
      alert("Tu rol no permite modificar movimientos.");
      return;
    }

    const old = movements.find((m) => m.id === editingId);
    if (!old) {
      setEditingId(null);
      return;
    }

    const cantidadNumber = Number(form.cantidad);
    if (!cantidadNumber || cantidadNumber <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }

    const newTipo = form.tipo || old.tipo;
    const stockAnterior = old.stockAnterior ?? 0;

    const deltaOld = computeDelta(old.tipo, old.cantidad, stockAnterior);
    const deltaNew = computeDelta(newTipo, cantidadNumber, stockAnterior);

    // 1) Actualizar el stock del producto segun la diferencia de deltas
    if (old.productoId != null) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== old.productoId) return p;
          const raw = (p.stock ?? 0) - deltaOld + deltaNew;
          const newStock = Math.max(0, raw);
          return { ...p, stock: newStock };
        })
      );
    }

    // 2) Actualizar el movimiento en el historial
    const fechaNueva = form.fecha || old.fecha;
    const motivoNuevo = form.motivo.trim();
    const documentoNuevo = form.documento.trim();
    const nuevoStockNuevo = stockAnterior + deltaNew;

    setMovements((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? {
              ...m,
              fecha: fechaNueva,
              tipo: newTipo,
              cantidad: cantidadNumber,
              motivo: motivoNuevo,
              documento: documentoNuevo,
              stockNuevo: nuevoStockNuevo,
            }
          : m
      )
    );

    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-red-600 font-semibold">
            Movimientos
          </p>
          <h2 className="text-lg font-semibold">Historial de movimientos</h2>
          <p className="text-xs text-neutral-500">
            Revisa entradas, salidas y ajustes recientes del inventario.
          </p>
        </div>
        {!canEditMovement && (
          <span className="text-[11px] text-neutral-500">
            Rol <strong>{role}</strong>: solo lectura (no puede modificar ni
            eliminar movimientos).
          </span>
        )}
      </div>

      <motion.div
        className="bg-white rounded-xl shadow-md p-5 border border-neutral-200"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        {movements.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Aun no se han registrado movimientos de inventario.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead className="bg-neutral-800 text-white">
                <tr>
                  <th className="text-left px-3 py-2">Fecha</th>
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-left px-3 py-2">Tipo</th>
                  <th className="text-left px-3 py-2">Cantidad</th>
                  <th className="text-left px-3 py-2">Stock antes</th>
                  <th className="text-left px-3 py-2">Stock despues</th>
                  <th className="text-left px-3 py-2">Motivo</th>
                  <th className="text-left px-3 py-2">Documento</th>
                  <th className="text-left px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movements
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((m, idx) => (
                    <motion.tr
                      key={m.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                      whileHover={{ scale: 1.002 }}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        {m.fecha}
                      </td>
                      <td className="px-3 py-2">{m.producto}</td>
                      <td className="px-3 py-2">{m.tipo}</td>
                      <td className="px-3 py-2">{m.cantidad}</td>
                      <td className="px-3 py-2">{m.stockAnterior}</td>
                      <td className="px-3 py-2">{m.stockNuevo}</td>
                      <td className="px-3 py-2">
                        {m.motivo || (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {m.documento || (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap space-x-1">
                        <button
                          type="button"
                          disabled={!canEditMovement}
                          onClick={() => handleEditClick(m)}
                          className={
                            "px-2.5 py-1 rounded-md text-[11px] font-semibold text-white " +
                            (canEditMovement
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-neutral-500 cursor-not-allowed opacity-60")
                          }
                          title={
                            canEditMovement
                              ? "Editar movimiento"
                              : "Tu rol no permite modificar movimientos"
                          }
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={!canEditMovement}
                          onClick={() => handleDeleteClick(m.id)}
                          className={
                            "px-2.5 py-1 rounded-md text-[11px] font-semibold text-white " +
                            (canEditMovement
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-neutral-500 cursor-not-allowed opacity-60")
                          }
                          title={
                            canEditMovement
                              ? "Eliminar movimiento"
                              : "Tu rol no permite eliminar movimientos"
                          }
                        >
                          Eliminar
                        </button>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal edicion de movimiento */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-md font-semibold mb-3">
              Editar movimiento #{editingId}
            </h3>

            <p className="text-[11px] text-neutral-500 mb-3">
              Al modificar el tipo o la cantidad, el stock del producto se
              ajustara automaticamente segun el nuevo movimiento.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <label className="flex flex-col gap-1">
                Fecha
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  Tipo de movimiento
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
                  >
                    <option value="Entrada">Entrada</option>
                    <option value="Salida">Salida</option>
                    <option value="Ajuste">Ajuste</option>
                    <option value="Alta de producto">Alta de producto</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  Cantidad
                  <input
                    type="number"
                    name="cantidad"
                    min="1"
                    value={form.cantidad}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                Motivo
                <textarea
                  name="motivo"
                  value={form.motivo}
                  onChange={handleChange}
                  rows={3}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
                  placeholder="Correccion, ajuste, anulacion, etc."
                />
              </label>

              <label className="flex flex-col gap-1">
                Documento de referencia
                <input
                  type="text"
                  name="documento"
                  value={form.documento}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
                  placeholder="Factura 123, Guia 456..."
                />
              </label>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-md bg-neutral-500 hover:bg-neutral-600 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}

export default MovimientosPage;
