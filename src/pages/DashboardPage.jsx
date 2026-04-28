// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios.js";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MovementsChart from "../components/MovementsCharts";
import LowStockChart from "../components/LowStockChart";

function DashboardPage() {
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [movimientos, setMovimientos] = useState([]);

  // 🔥 CARGAR DATOS
    const cargarDatos = async () => {
  try {
    // 1. Usamos rutas cortas. El token se inyecta solo gracias al interceptor.
    const [resProductos, resMovimientos] = await Promise.all([
      axios.get("/api/productos"),
      axios.get("/api/movimientos"),
    ]);

    // 2. Verificamos que los datos sean arrays antes de guardarlos
    setProductos(Array.isArray(resProductos.data) ? resProductos.data : []);
    setMovimientos(Array.isArray(resMovimientos.data) ? resMovimientos.data : []);

  } catch (error) {
    console.error("Error cargando dashboard:", error);
    
    // 3. Si hay error (401 o caída del server), limpiamos los estados
    // Esto evita que los .map() del render exploten
    setProductos([]);
    setMovimientos([]);

    if (error.response?.status === 401) {
      showAlert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", "Sesión Expirada");
    }
  }
};

    useEffect(() => {
        cargarDatos();

    const interval = setInterval(() => {
    cargarDatos();
  }, 10000); // cada 10 segundos

    return () => clearInterval(interval);
}, []);

  // 🔥 FILTRO SEGURO (fix activo)
    const productosActivos = productos.filter(
    (p) => p.activo === true || p.activo === true
    );

  // 🔥 KPI NUEVO
    const productosInactivos = productos.filter(
    (p) => p.activo === false
    ).length;

  // 🔥 KPIs
    const totalProductos = productosActivos.length;

    const stockTotal = productosActivos.reduce(
    (acc, p) => acc + p.stock,
    0
    );

    const bajoStock = productosActivos.filter(
    (p) => p.stock <= p.minStock
    ).length;

    const productosCriticos = productosActivos.filter(
        (p) => p.criticidad == "Alta" 
    ).length;

    const criticidadStats = {
        alta: productosActivos.filter(p => p.criticidad === "Alta").length,
        media: productosActivos.filter(p => p.criticidad === "Media").length,
        baja: productosActivos.filter(p => p.criticidad === "Baja").length,
    };

  // 🔥 ORDEN SEGURO
    const movimientosOrdenados = [...movimientos].sort(
    (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    const ultimoMovimiento =
    movimientosOrdenados.length > 0
        ? movimientosOrdenados[0]
        : null;

    return (
    <motion.section
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
      {/* 🔹 HEADER */}
        <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>

        <p className="text-sm text-neutral-500">
            Resumen general del sistema
        </p>

        {productos.length > 0 && (
    <p className="text-xs mt-2 text-neutral-600">
    {productosCriticos > 0
        ? "⚠️ Existen productos críticos que requieren atención inmediata."
        : bajoStock > 0
        ? "Hay productos con bajo stock."
        : "Inventario en estado óptimo."}
    </p>
)}

        {/* 🔥 ALERTA */}
        {bajoStock > 0 && (
            <div
            onClick={() => navigate("/inventario")}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between mt-3 cursor-pointer"
            >
            <div className="text-sm">
                ⚠️ Hay <strong>{bajoStock}</strong> productos con bajo stock
            </div>

            <span className="text-xs bg-red-100 px-2 py-1 rounded-md font-semibold">
                Revisar inventario
            </span>
            </div>
        )}
        </div>

        {productos.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl">
                No hay productos cargados en el sistema.
                </div>
)}

      {/* 🔥 KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-xs text-gray-500">Productos activos</p>
            <h3 className="text-xl font-bold">{totalProductos}</h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-xs text-gray-500">Stock total</p>
            <h3 className="text-xl font-bold">{stockTotal.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-xs text-gray-500">Bajo stock</p>
            <h3 className="text-xl font-bold text-red-600">
            {bajoStock}
            </h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-xs text-gray-500">Críticos</p>
            <h3 className="text-xl font-bold text-red-600">
            {productosCriticos}
            </h3>
        </div>

        {/* 🔥 NUEVO KPI */}
        <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-xs text-gray-500">Inactivos</p>
            <h3 className="text-xl font-bold text-gray-500">
            {productosInactivos}
            </h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-xs text-gray-500">Último movimiento</p>
            <h3 className="text-sm font-semibold">
            {ultimoMovimiento
                ? `${
                    ultimoMovimiento.producto?.nombre || "Producto"
                } - ${ultimoMovimiento.tipo} (${ultimoMovimiento.cantidad})`
                : "Sin datos"}
            </h3>
        </div>
        </div>

        {/* Criticidad */}
        <div className="bg-white p-4 rounded-xl shadow">
    <p className="text-xs text-gray-500 mb-2">
    Distribución por criticidad
    </p>

    <div className="flex gap-4 text-sm">
    <span className="text-red-600 font-semibold">
        Alta: {criticidadStats.alta}
    </span>

    <span className="text-yellow-600 font-semibold">
        Media: {criticidadStats.media}
    </span>

    <span className="text-green-600 font-semibold">
        Baja: {criticidadStats.baja}
    </span>
    </div>
</div>

        {/* 📊 gráficos */}
        <div className="grid md:grid-cols-2 gap-4">
        <MovementsChart movimientos={movimientos} />
        <LowStockChart productos={productos} />
        </div>

      {/* 🔥 TABLA MOVIMIENTOS */}
        <div className="bg-white p-5 rounded-2xl shadow-md border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
            Últimos movimientos
            </h3>
            <span className="text-[11px] text-neutral-400">
            Últimos 5 registros
            </span>
        </div>

        {movimientosOrdenados.length === 0 ? (
            <p className="text-xs text-gray-500">
            No hay movimientos recientes
            </p>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
                <thead>
                <tr className="text-left text-neutral-500 border-b">
                    <th className="py-2">Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Fecha</th>
                </tr>
                </thead>

                <tbody>
                {movimientosOrdenados.slice(0, 5).map((m, idx) => (
                    <tr
                    key={m.id}
                    className={`transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-neutral-50"
                    } hover:bg-neutral-100`}
                    >
                    <td className="py-2 font-medium">
                        {m.producto?.nombre || `ID ${m.productoId}`}
                    </td>

                    <td>
                        <span
                        className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                            m.tipo === "entrada"
                            ? "bg-green-100 text-green-700"
                            : m.tipo === "salida"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                        >
                        {m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1)}
                        </span>
                    </td>

                    <td className="font-semibold">
                        {m.tipo === "salida" ? "-" : ""}
                        {m.cantidad}
                    </td>

                    <td className="text-neutral-500">
                        {new Date(
                        m.createdAt || Date.now()
                        ).toLocaleDateString()}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </div>
    </motion.section>
    );
}

export default DashboardPage;