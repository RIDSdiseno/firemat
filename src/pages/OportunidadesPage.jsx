import { useEffect, useState } from "react";
import axios from "../api/axios";

function OportunidadesPage() {
    
    const [oportunidades, setOportunidades] = useState([]);
    const [loading, setLoading] = useState(true);

  // 🔥 cargar oportunidades
    const obtenerOportunidades = async () => {
        try {
            const res = await axios.get("/api/oportunidades");
            
            setOportunidades(res.data);
        
        } catch (error) {
            console.error("Error cargando oportunidades:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        obtenerOportunidades();
    }, []);

  // 🔥 cambiar etapa
    const cambiarEtapa = async (id, etapa) => {
    try {

        await axios.patch(`/api/oportunidades/${id}/etapa`, {
            etapa
        });

      // recargar
        obtenerOportunidades();

    } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Error");
    }
    };

    if (loading) {
    return <div>Cargando oportunidades...</div>;
    }

    return (
    <div>

        <h1 className="text-2xl font-bold mb-6">
            Oportunidades CRM
        </h1>

        <div className="space-y-4">

        {oportunidades.map((oportunidad) => (

            <div
            key={oportunidad.id}
            className="bg-white rounded-xl shadow p-4 border"
            >

            <div className="flex justify-between items-start">

                <div>
                    <h2 className="text-lg font-semibold">
                    {oportunidad.titulo}
                </h2>

                <p className="text-sm text-neutral-600">
                    Cliente: {oportunidad.cliente?.nombre}
                </p>

                <p className="text-sm text-neutral-600">
                    Producto: {oportunidad.producto?.nombre || "Sin producto"}
                </p>

                <p className="text-sm text-neutral-600">
                    Etapa: {oportunidad.etapa}
                </p>

                <p className="text-sm text-neutral-600">
                    Probabilidad: {oportunidad.probabilidad}%
                </p>

                <p className="text-sm font-semibold mt-2">
                    ${oportunidad.montoEstimado}
                </p>
                </div>

                <div className="flex gap-2">

                <button
                    onClick={() =>
                    cambiarEtapa(oportunidad.id, "NEGOCIACION")
                    }
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                    Negociación
                </button>

                <button
                    onClick={() =>
                    cambiarEtapa(oportunidad.id, "GANADA")
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                    GANADA
                </button>

                </div>

            </div>

            </div>

        ))}

        </div>

    </div>
    );
}

export default OportunidadesPage;