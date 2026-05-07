import { useEffect, useState } from "react";
import axios from "../api/axios";

function OportunidadesPage() {
    
    const [oportunidades, setOportunidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);

    const [form, setForm] = useState({
        clienteId: "",
        productoId: "",
        titulo: "",
        unidadNegocio: "",
        monto:"",
    });

    const obtenerDatosFormulario = async () => {
        try {
            const [clientesRes, productosRes] = Promise.all([
                axios.get("/api/clientes"),
                axios.get("/api/productos")
            ]);

            setClientes(clientesRes.data);
            setProductos(productosRes.data);
        } catch (error){
            console.error(error);
        }
    }

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
        obtenerDatosFormulario();
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

    const crearOportunidad = async (e) => {
        e.preventDefault();

        try {

            await axios.post("/api/oportunidades", {
                clienteId: Number(form.clienteId),
                productoId: Number(form.productoId),
                titulo: form.titulo,
                unidadNegocio: form.unidadNegocio,
                monto: Number(form.monto)
            });

            //limpiar
            setForm({
                clienteId: "",
                productoId: "",
                titulo: "",
                unidadNegocio: "",
                monto: "",
            });

            //recargar
            obtenerOportunidades();

        }   catch (error) {
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

        <form
        onSubmit={crearOportunidad}
        className="bg-white p-4 rounded-xl shadow mb-6 space-y-4"
        >
            
            <h2 className="font-semibold text-lg">
                Nueva Oportunidad
            </h2>

    <div className="grid grid-cols-2 gap-4">
        
        <select
        value={form.clienteId}
        onChange={(e) =>
            setForm({
            ...form,
            clienteId: e.target.value
        })
        }
        className="border p-2 rounded"
        required
        >
        <option value="">Seleccione cliente</option>

        {clientes.map((cliente) => (
            <option
            key={cliente.id}
            value={cliente.id}
            >
            {cliente.nombre}
            </option>
        ))}
        </select>

        <select
        value={form.productoId}
        onChange={(e) =>
            setForm({
            ...form,
            productoId: e.target.value
        })
        }
        className="border p-2 rounded"
        required
        >
        <option value="">Seleccione producto</option>

        {productos.map((producto) => (
        <option
            key={producto.id}
            value={producto.id}
        >
            {producto.nombre}
        </option>
        ))}
        </select>

        <input
        type="text"
        placeholder="Título"
        value={form.titulo}
        onChange={(e) =>
            setForm({
            ...form,
            titulo: e.target.value
        })
        }
        className="border p-2 rounded"
        required
        />

        <input
        type="text"
        placeholder="Unidad de negocio"
        value={form.unidadNegocio}
        onChange={(e) =>
            setForm({
            ...form,
            unidadNegocio: e.target.value
        })
        }
        className="border p-2 rounded"
        required
        />

    <input
        type="number"
        placeholder="Monto"
        value={form.monto}
        onChange={(e) =>
            setForm({
            ...form,
            monto: e.target.value
        })
        }
        className="border p-2 rounded"
        required
    />

    </div>

    <button
        type="submit"
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
    >
        Crear Oportunidad
    </button>

    </form>

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