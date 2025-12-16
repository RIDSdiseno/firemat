// src/components/MovementModal.jsx

function MovementModal({
  open,
  onClose,
  products,
  movement,
  onChange,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold">Registrar movimiento</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-md bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
          >
            Cerrar
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"
        >
          <label className="flex flex-col gap-1">
            Producto
            <select
              name="productId"
              value={movement.productId}
              onChange={onChange}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code}
                  {p.sku ? ` / ${p.sku}` : ""} - {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            Tipo
            <select
              name="type"
              value={movement.type}
              onChange={onChange}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            >
              <option value="Entrada">Entrada</option>
              <option value="Salida">Salida</option>
              <option value="Ajuste">Ajuste</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            Fecha
            <input
              type="date"
              name="date"
              value={movement.date}
              onChange={onChange}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            Cantidad
            <input
              type="number"
              min="1"
              name="qty"
              value={movement.qty}
              onChange={onChange}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            />
          </label>

          <label className="flex flex-col gap-1 sm:col-span-2">
            Motivo
            <input
              type="text"
              name="reason"
              value={movement.reason}
              onChange={onChange}
              placeholder="Venta obra X, merma, ajuste, etc."
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
            />
          </label>

          <label className="flex flex-col gap-1 sm:col-span-2">
            Documento referencia
            <input
              type="text"
              name="doc"
              value={movement.doc}
              onChange={onChange}
              placeholder="Factura 123, Guía 456, OC 789..."
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
            />
          </label>

          <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-md bg-neutral-500 hover:bg-neutral-600 text-white text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              Guardar movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MovementModal;
