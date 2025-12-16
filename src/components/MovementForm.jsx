// src/components/MovementForm.jsx
function MovementForm({ products, movement, onChange, onSubmit }) {
  return (
    <section className="bg-white rounded-xl shadow-md px-5 py-5">
      <h2 className="text-lg font-semibold mb-3">
        Registrar movimiento de inventario
      </h2>
      <form
        onSubmit={onSubmit}
        className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        <label className="flex flex-col text-xs gap-1">
          Producto
          <select
            name="productId"
            value={movement.productId}
            onChange={onChange}
            className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-xs gap-1">
          Tipo de movimiento
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

        <label className="flex flex-col text-xs gap-1">
          Fecha
          <input
            type="date"
            name="date"
            value={movement.date}
            onChange={onChange}
            className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
          />
        </label>

        <label className="flex flex-col text-xs gap-1">
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

        <label className="flex flex-col text-xs gap-1">
          Motivo
          <input
            type="text"
            name="reason"
            placeholder="Venta obra X, merma, ajuste, etc."
            value={movement.reason}
            onChange={onChange}
            className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
          />
        </label>

        <label className="flex flex-col text-xs gap-1">
          Documento referencia
          <input
            type="text"
            name="doc"
            placeholder="Factura 123, Guía 456, OC 789..."
            value={movement.doc}
            onChange={onChange}
            className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
          />
        </label>

        <div className="sm:col-span-2 lg:col-span-3 mt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
          >
            Guardar movimiento
          </button>
        </div>
      </form>
    </section>
  );
}

export default MovementForm;
