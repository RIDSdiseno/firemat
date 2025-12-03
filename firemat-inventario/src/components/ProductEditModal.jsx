// src/components/ProductEditModal.jsx

function ProductEditModal({ open, onClose, product, categories, onSave }) {
  if (!open || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const updated = {
      ...product,
      code: String(formData.get("code") || "").trim(),
      sku: String(formData.get("sku") || "").trim(), // 👈 nuevo
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || product.category),
      stock: Number(formData.get("stock") || product.stock),
      minStock: Number(formData.get("minStock") || product.minStock),
      location: String(formData.get("location") || "").trim(),
      status: String(formData.get("status") || product.status),
      docRef: String(formData.get("docRef") || "").trim(),
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold">Editar producto</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-md bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
          >
            Cerrar
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs"
        >
          <label className="flex flex-col gap-1">
            Código
            <input
              name="code"
              defaultValue={product.code}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            SKU
            <input
              name="sku"
              defaultValue={product.sku || ""}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
              placeholder="SKU-CT-001"
            />
          </label>

          <label className="flex flex-col gap-1">
            Nombre
            <input
              name="name"
              defaultValue={product.name}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            Categoría
            <select
              name="category"
              defaultValue={product.category}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            >
              {categories.length === 0 ? (
                <option value="">Sin categorías</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            Stock
            <input
              type="number"
              name="stock"
              min="0"
              defaultValue={product.stock}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            Stock mínimo
            <input
              type="number"
              name="minStock"
              min="0"
              defaultValue={product.minStock}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            Ubicación
            <input
              name="location"
              defaultValue={product.location}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            Estado
            <select
              name="status"
              defaultValue={product.status}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            Documento de referencia
            <input
              name="docRef"
              defaultValue={product.docRef || ""}
              className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
              placeholder="Factura 123, OC 456, Guía 789..."
            />
          </label>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-2">
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
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEditModal;
