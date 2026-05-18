// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios.js";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import MovementsChart from "../components/MovementsCharts";
import LowStockChart from "../components/LowStockChart";

const COLORS = ["#ef4444", "#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];

const tipoBadge = (tipo) => {
  const t = tipo?.toLowerCase();
  if (t === "entrada") return "bg-green-100 text-green-700";
  if (t === "salida") return "bg-red-100 text-red-700";
  if (t === "ajuste") return "bg-yellow-100 text-yellow-700";
  return "bg-neutral-100 text-neutral-600";
};

function KpiCard({ label, value, sub, color, icon }) {
  return (
    <motion.div
      className={`rounded-2xl p-4 shadow flex items-center gap-4 ${color}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-xs font-medium opacity-70">{label}</p>
        <h3 className="text-2xl font-bold leading-tight">{value}</h3>
        {sub && <p className="text-[11px] opacity-60 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);

  const cargarDatos = async () => {
    try {
      const [resProductos, resMovimientos] = await Promise.all([
        axios.get("/api/productos"),
        axios.get("/api/movimientos"),
      ]);
      setProductos(Array.isArray(resProductos.data) ? resProductos.data : []);
      setMovimientos(Array.isArray(resMovimientos.data) ? resMovimientos.data : []);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      setProductos([]);
      setMovimientos([]);
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 10000);
    return () => clearInterval(interval);
  }, []);

  const productosActivos = productos.filter((p) => p.activo === true);
  const productosInactivos = productos.filter((p) => p.activo === false).length;
  const totalProductos = productosActivos.length;
  const stockTotal = productosActivos.reduce((acc, p) => acc + p.stock, 0);
  const bajoStock = productosActivos.filter((p) => p.stock <= p.minStock).length;

  const movimientosOrdenados = [...movimientos].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  // Stock por categoría para el pie chart
  const stockPorCategoria = Object.values(
    productosActivos.reduce((acc, p) => {
      const cat = p.categoria || "Sin categoría";
      if (!acc[cat]) acc[cat] = { name: cat, value: 0 };
      acc[cat].value += p.stock;
      return acc;
    }, {})
  );

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-neutral-500">Resumen general del sistema</p>

        {bajoStock > 0 && (
          <div
            onClick={() => navigate("/inventario")}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between mt-3 cursor-pointer"
          >
            <span className="text-sm">
              ⚠️ Hay <strong>{bajoStock}</strong> productos con bajo stock
            </span>
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

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Productos activos"
          value={totalProductos}
          sub="en catálogo"
          color="bg-blue-50 text-blue-800"
          icon="📦"
        />
        <KpiCard
          label="Stock total"
          value={stockTotal.toLocaleString()}
          sub="unidades disponibles"
          color="bg-green-50 text-green-800"
          icon="🏭"
        />
        <KpiCard
          label="Bajo stock"
          value={bajoStock}
          sub={bajoStock > 0 ? "requieren atención" : "todo en orden"}
          color={bajoStock > 0 ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}
          icon={bajoStock > 0 ? "⚠️" : "✅"}
        />
        <KpiCard
          label="Inactivos"
          value={productosInactivos}
          sub="fuera de catálogo"
          color="bg-neutral-100 text-neutral-700"
          icon="🔒"
        />
      </div>

      {/* GRÁFICOS FILA 1 */}
      <div className="grid md:grid-cols-2 gap-4">
        <MovementsChart movimientos={movimientos} />
        <LowStockChart productos={productos} />
      </div>

      {/* STOCK POR CATEGORÍA */}
      {stockPorCategoria.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-md border border-neutral-200">
            <p className="text-sm font-semibold mb-4">Stock por categoría</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stockPorCategoria} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stockPorCategoria.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-neutral-200">
            <p className="text-sm font-semibold mb-4">Distribución por categoría</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stockPorCategoria}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {stockPorCategoria.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TABLA MOVIMIENTOS */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Últimos movimientos</h3>
          <span className="text-[11px] text-neutral-400">Últimos 5 registros</span>
        </div>

        {movimientosOrdenados.length === 0 ? (
          <p className="text-xs text-gray-500">No hay movimientos recientes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-neutral-500 border-b">
                  <th className="py-2 pr-4">Producto</th>
                  <th className="pr-4">Tipo</th>
                  <th className="pr-4">Cantidad</th>
                  <th className="pr-4">Stock anterior</th>
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
                    <td className="py-2 pr-4 font-medium">
                      {m.producto?.nombre || `ID ${m.productoId}`}
                    </td>
                    <td className="pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] font-semibold ${tipoBadge(m.tipo)}`}
                      >
                        {m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1)}
                      </span>
                    </td>
                    <td className="pr-4 font-semibold">
                      <span
                        className={
                          m.tipo?.toLowerCase() === "salida"
                            ? "text-red-600"
                            : m.tipo?.toLowerCase() === "entrada"
                            ? "text-green-600"
                            : "text-neutral-700"
                        }
                      >
                        {m.tipo?.toLowerCase() === "salida" ? "-" : "+"}
                        {m.cantidad}
                      </span>
                    </td>
                    <td className="pr-4 text-neutral-500">{m.stockAnterior ?? "-"}</td>
                    <td className="text-neutral-500">
                      {new Date(m.createdAt || Date.now()).toLocaleDateString()}
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
