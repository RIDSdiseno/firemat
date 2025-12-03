import { useMemo, useState } from "react";
import { motion } from "framer-motion";

function InventoryTable({
  products,
  onSelectMovement,
  onEditProduct,
  canEditProduct,
  onNewMovement,
}) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      [p.code, p.sku, p.name, p.category, p.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [products, search]);

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-4 rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur shadow-lg"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-red-600 font-semibold">
            Inventario
          </p>
          <h3 className="text-base font-bold text-neutral-900">
            Tabla de productos
          </h3>
          <p className="text-xs text-neutral-500">
            Resalta los productos con stock bajo y permite movimientos rapidos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-600">
            Animado con framer-motion
          </div>
          {onNewMovement && (
            <button
              type="button"
              onClick={onNewMovement}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow"
            >
              + Nuevo movimiento
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por codigo, SKU o nombre..."
          className="w-full max-w-sm rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-red-400 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-neutral-900 text-white">
            <tr>
              <th className="text-left px-3 py-2">Foto</th>
              <th className="text-left px-3 py-2">Codigo</th>
              <th className="text-left px-3 py-2">SKU</th>
              <th className="text-left px-3 py-2">Nombre</th>
              <th className="text-left px-3 py-2">Categoria</th>
              <th className="text-left px-3 py-2">Stock</th>
              <th className="text-left px-3 py-2">Minimo</th>
              <th className="text-left px-3 py-2">Ubicacion</th>
              <th className="text-left px-3 py-2">Estado</th>
              <th className="text-left px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr className="bg-white">
                <td
                  colSpan={10}
                  className="px-3 py-3 text-center text-neutral-500"
                >
                  No hay productos que coincidan con la busqueda.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p, idx) => {
                const isLow = p.stock < p.minStock;
                return (
                  <motion.tr
                    key={p.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.25, delay: idx * 0.02 }}
                    className={
                      (idx % 2 === 0 ? "bg-white" : "bg-neutral-50") +
                      (isLow ? " bg-red-50/60" : "")
                    }
                    whileHover={{ scale: 1.002 }}
                  >
                    <td className="px-3 py-2">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-8 w-8 object-contain border border-neutral-200 bg-white rounded-md shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/40?text=IMG";
                          }}
                        />
                      ) : (
                        <span className="inline-flex items-center justify-center h-8 w-8 text-[9px] text-neutral-400 border border-dashed border-neutral-300 rounded-md">
                          Sin foto
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-semibold text-neutral-900">
                      {p.code}
                    </td>
                    <td className="px-3 py-2 text-neutral-700">
                      {p.sku || "-"}
                    </td>
                    <td className="px-3 py-2 text-neutral-800">{p.name}</td>
                    <td className="px-3 py-2 text-neutral-700">
                      {p.category}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900">
                          {p.stock}
                        </span>
                        <div className="h-2 w-16 rounded-full bg-neutral-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isLow ? "bg-red-500" : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  5,
                                  (p.stock / Math.max(p.minStock || 1, 1)) * 100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-800">{p.minStock}</span>
                        {isLow && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-100 text-[10px] font-semibold text-red-700 whitespace-nowrap">
                            BAJO
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-2 text-neutral-700">
                      {p.location || "-"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          p.status === "Activo"
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectMovement(p.id, "Entrada")}
                          className="w-full px-2.5 py-1 rounded-md text-[11px] font-semibold bg-green-700 hover:bg-green-800 text-white shadow-sm text-center"
                        >
                          Entrada
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectMovement(p.id, "Salida")}
                          className="w-full px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm text-center"
                        >
                          Salida
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectMovement(p.id, "Ajuste")}
                          className="w-full px-2.5 py-1 rounded-md text-[11px] font-semibold bg-neutral-800 hover:bg-neutral-900 text-white shadow-sm text-center"
                        >
                          Ajuste
                        </button>

                        {canEditProduct && (
                          <button
                          type="button"
                          onClick={() => onEditProduct(p.id)}
                          className="w-full px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-center"
                        >
                          Editar
                        </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

export default InventoryTable;
