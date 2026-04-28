// src/pages/MovimientosPage.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { motion } from "framer-motion";

function MovimientosPage() {
  const [movements, setMovements] = useState([]);
  const [productos, setProductos] = useState([]); // 🔥 NUEVO

  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const movimientosFiltrados = movements.filter((m) => {
  const matchTipo = filtroTipo ? m.tipo === filtroTipo : true;

  const matchProducto = filtroProducto
    ? (m.producto || "")
        .toLowerCase()
        .includes(filtroProducto.toLowerCase())
    : true;

  return matchTipo && matchProducto;
});

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst =indexOfLast - itemsPerPage;

  const movimientosPaginados = movimientosFiltrados.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(movimientosFiltrados.length / itemsPerPage);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    productoId: "",
    tipo: "entrada",
    cantidad: "",
    motivo: "",
    documento: "",
  });

  const selectedProduct = productos.find(
    (p) => p.id === Number(form.productoId)
  );

  const isStockError =
  form.tipo === "salida" &&
  selectedProduct &&
  Number(form.cantidad) > selectedProduct.stock; 

  // 🔹 obtener movimientos
  const obtenerMovimientos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/movimientos`);

      const data = res.data.map((m) => ({
  id: m.id,

  // 🔥 mejor manejo de fecha
  fecha: m.createdAt
    ? new Date(m.createdAt).toLocaleDateString()
    : "Sin fecha",

  productoId: m.productoId,

  // 🔥 fallback más limpio
  producto:
    m.producto?.nombre ??
    `Producto ID ${m.productoId}`,

  tipo: m.tipo,
  cantidad: m.cantidad,

  stockAnterior: m.stockAnterior ?? 0,
  stockNuevo: m.stockNuevo ?? 0,

  motivo: m.motivo ?? "",
  documento: m.documento ?? "",
}));

      setMovements(data);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    }
  };

  // 🔹 obtener productos
  const obtenerProductos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/productos`);
      setProductos(res.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  useEffect(() => {
  obtenerMovimientos();  // 🔥 ESTE ES EL CLAVE
  obtenerProductos();
}, []);

  // 🔹 manejar cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 crear movimiento
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const productoId = Number(form.productoId);
    const cantidad = Number(form.cantidad);

    const producto = productos.find((p) => p.id === productoId);

    if (!producto) {
      alert("Producto no encontrado");
      return;
    }

    let newStock = producto.stock;

    if (form.tipo === "entrada") {
      newStock = producto.stock + cantidad;
    } else if (form.tipo === "salida") {
      newStock = Math.max(0, producto.stock - cantidad);
    } else if (form.tipo === "ajuste") {
      newStock = cantidad;
    }

    // 🔥 1. Crear movimiento
    await axios.post(`${import.meta.env.VITE_API_URL}/api/movimientos`, {
      productoId,
      tipo: form.tipo,
      cantidad,
      motivo: form.motivo,
      documento: form.documento,
    });

    // 🔥 2. Actualizar stock en backend
    await axios.put(`${import.meta.env.VITE_API_URL}/api/productos/${productoId}`, {
      stock: newStock,
    });

    // 🔥 reset form
    setIsModalOpen(false);

    setForm({
      productoId: "",
      tipo: "entrada",
      cantidad: "",
      motivo: "",
      documento: "",
    });

    // 🔥 recargar todo
    await obtenerMovimientos();
    await obtenerProductos();

  } catch (error) {
    console.error(error);
    alert("Error al crear movimiento");
  }
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
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-red-600 font-semibold">
            Movimientos
          </p>
          <h2 className="text-lg font-semibold">
            Historial de movimientos
          </h2>
          <p className="text-xs text-neutral-500">
            Movimientos reales registrados en base de datos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-md font-semibold"
        >
          + Nuevo movimiento
        </button>
      </div>

      <motion.div
        className="bg-white rounded-xl shadow-md p-5 border border-neutral-200"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 🔍 FILTROS */}
        <div className="flex gap-2 mb-4">
          <select
          value={filtroTipo}
          onChange={(e) => {
            setFiltroTipo(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-2 py-1 rounded text-xs"
          >
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="ajuste">Ajuste</option>
          </select>

  <input
    type="text"
    placeholder="Buscar producto..."
    value={filtroProducto}
    onChange={(e) => {
  setFiltroProducto(e.target.value);
  setCurrentPage(1);
}}
    className="border px-2 py-1 rounded text-xs"
  />
</div>
        {movements.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No hay movimientos registrados.
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
                  <th className="text-left px-3 py-2">Stock después</th>
                  <th className="text-left px-3 py-2">Motivo</th>
                  <th className="text-left px-3 py-2">Documento</th>
                </tr>
              </thead>
              <tbody>
                {movimientosPaginados.map((m, idx) => (
                  <motion.tr
                    key={m.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                  >
                    <td className="px-3 py-2">{m.fecha}</td>
                    <td className="px-3 py-2 font-medium">{m.producto}</td>
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
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* 🔥 AQUÍ VA LA PAGINACIÓN */}
<div className="flex justify-between items-center mt-4 text-sm">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    className="px-3 py-1 bg-gray-200 rounded"
  >
    Anterior
  </button>

  <span>
    Página {currentPage} de {totalPages}
  </span>

  <button
    onClick={() =>
      setCurrentPage((prev) =>
        Math.min(prev + 1, totalPages)
      )
    }
    className="px-3 py-1 bg-gray-200 rounded"
  >
    Siguiente
  </button>
</div>
      </motion.div>

      {/* 🔥 MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Nuevo movimiento
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">

              {/* 🔥 SELECT DE PRODUCTOS */}
              <select
                name="productoId"
                value={form.productoId}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                required
              >
                <option value="">Seleccionar producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (Stock: {p.stock})
                  </option>
                ))}
              </select>

              {selectedProduct && (
                <p className="text-xs text-gray-500">
                  Stock actual: <strong>{selectedProduct.stock}</strong>
                  </p>
                )}

              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>

              <input
                type="number"
                name="cantidad"
                placeholder="Cantidad"
                value={form.cantidad}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
                required
              />

              {isStockError && (
                <p className="text-xs text-red-600">
                  Stock insuficiente. Disponible: {selectedProduct.stock}
                  </p>
                )}

              <input
                type="text"
                name="motivo"
                placeholder="Motivo"
                value={form.motivo}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />

              <input
                type="text"
                name="documento"
                placeholder="Documento"
                value={form.documento}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md"
                >
                  Cancelar
                </button>

                <button
                type="submit"
                disabled={isStockError}
                className={`px-4 py-2 text-white rounded-md ${
                  isStockError
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
                  >
                    Crear
                    </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.section>
  );
}

export default MovimientosPage;