import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ProductoDetallePage() {
    const { id } = useParams();

    const [producto, setProducto] = useState(null);
    const [movimientos, setMovimientos] = useState([]);

    useEffect(() => {
    obtenerDetalle();
    }, [id]);

    const obtenerDetalle = async () => {
        try {
        const resProducto = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/productos/${id}`
        );

        const resMovimientos = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/movimientos`
        );

        const movimientosFiltrados = resMovimientos.data
            .filter((m) => m.productoId === Number(id))
            .sort(
            (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        ); // 🔥 ordenar por fecha

        setProducto(resProducto.data);
        setMovimientos(movimientosFiltrados);
        } catch (error) {
        console.error(error);
    }
    };

    if (!producto) return <p>Cargando...</p>;

    return (
    <div className="space-y-5">

      {/* 🔹 INFO PRODUCTO */}
        <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">
            {producto.nombre}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <p><strong>Stock:</strong> {producto.stock}</p>
            <p><strong>Mínimo:</strong> {producto.minStock}</p>
            <p><strong>Ubicación:</strong> {producto.ubicacion || "-"}</p>

            <p>
            <strong>Criticidad:</strong>{" "}
            <span
                className={`font-semibold ${
                producto.criticidad === "Alta"
                    ? "text-red-600"
                    : producto.criticidad === "Media"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
            >
                {producto.criticidad}
            </span>
            </p>
        </div>
        </div>

        {/* 🔥 RESUMEN */}
    <div className="flex gap-4 text-xs mb-3">
    <div className="bg-green-50 px-3 py-2 rounded">
    Entradas:{" "}
    <strong>
        {movimientos
        .filter((m) => m.tipo === "entrada")
        .reduce((acc, m) => acc + m.cantidad, 0)}
    </strong>
    </div>

    <div className="bg-red-50 px-3 py-2 rounded">
    Salidas:{" "}
    <strong>
        {movimientos
        .filter((m) => m.tipo === "salida")
        .reduce((acc, m) => acc + m.cantidad, 0)}
    </strong>
    </div>

    <div className="bg-yellow-50 px-3 py-2 rounded">
    Ajustes:{" "}
        <strong>
        Ajustes:{" "}
<strong>
    {movimientos
        .filter((m) => m.tipo === "ajuste")
        .reduce((acc, m) => acc + m.cantidad, 0)}
</strong>
        </strong>
    </div>
</div>

      {/* 🔹 HISTORIAL / KARDEX */}
        <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="font-semibold mb-3">
            Historial de movimientos
        </h3>

        {movimientos.length === 0 ? (
            <p className="text-sm text-gray-500">
            Sin movimientos
            </p>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead className="border-b text-left text-neutral-600">
                <tr>
                    <th className="py-2">Fecha</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Stock</th>
                </tr>
                </thead>

                <tbody>
                {movimientos.map((m, idx) => (
                    <tr
                    key={m.id}
                    className={
                        idx % 2 === 0
                        ? "bg-white"
                        : "bg-neutral-50"
                    }
                    >
                    <td className="py-2">
                        {m.createdAt
                        ? new Date(m.createdAt).toLocaleDateString()
                        : "Sin fecha"}
                    </td>

                    {/* 🔥 TIPO CON COLOR */}
                    <td>
                        <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                            m.tipo === "entrada"
                            ? "bg-green-100 text-green-700"
                            : m.tipo === "salida"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                        >
                        {m.tipo}
                        </span>
                    </td>

                    {/* 🔥 CANTIDAD CON SIGNO */}
                    <td className="font-semibold">
                        {m.tipo === "salida" ? "-" : " "}
                        {m.cantidad}
                    </td>

                    {/* 🔥 STOCK FINAL */}
                    <td className="font-semibold">
                        {m.stockNuevo ?? "-"}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </div>

    </div>
    );
}

export default ProductoDetallePage;