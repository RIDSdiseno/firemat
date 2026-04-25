import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function LowStockChart({ productos = [] }) {
  // 🔥 filtrar + ordenar correctamente
  const data = productos
    .filter((p) => p.activo && Number(p.stock) <= Number(p.minStock || 0))
    .map((p) => {
      const stock = Number(p.stock);
      const minStock = Number(p.minStock || 0);

      let estado = "ok";

      if (stock === 0) estado = "critico";
      else if (stock <= minStock) estado = "bajo";

      return {
        nombre: p.nombre,
        stock,
        minStock,
        estado,
      };
    })
    // 🔥 ORDEN INTELIGENTE (criticos arriba siempre)
    .sort((a, b) => {
      if (a.stock === 0) return -1;
      if (b.stock === 0) return 1;
      return a.stock - b.stock;
    })
    .slice(0, 5);

  // 🎨 color dinámico
  const getColor = (estado) => {
    if (estado === "critico") return "#dc2626"; // rojo
    if (estado === "bajo") return "#f59e0b"; // amarillo
    return "#16a34a";
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-neutral-200">
      <h3 className="text-sm font-semibold mb-4">
        Productos críticos (bajo stock)
      </h3>

      {data.length === 0 ? (
        <p className="text-xs text-gray-500">
          No hay productos en bajo stock
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" 
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <XAxis type="number" />

              {/* 🔥 CLAVE: orden visual correcto */}
              <YAxis
                dataKey="nombre"
                type="category"
                width={130}
                reversed={true}
              />

              <Tooltip />

              {/* STOCK */}
              <Bar dataKey="stock" name="Stock actual">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColor(entry.estado)}
                  />
                ))}
              </Bar>

              {/* MIN STOCK */}
              <Bar
                dataKey="minStock"
                name="Stock mínimo"
                fill="#94a3b8"
              />
            </BarChart>
          </ResponsiveContainer>

          {/* 🔥 LEYENDA SIMPLE */}
          <div className="flex gap-4 text-xs mt-1 ml-30">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              Bajo stock
            </div>

            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
              Stock mínimo
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LowStockChart;