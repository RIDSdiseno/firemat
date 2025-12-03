import { useMemo, useState } from "react";
import { motion } from "framer-motion";

function LowStockAlert({ items = [], onNotify }) {
  const [emailTo, setEmailTo] = useState("compras@firemat.cl");
  const [subject, setSubject] = useState("Alerta de stock bajo - Firemat");

  const bodyPreview = useMemo(() => {
    if (items.length === 0) {
      return "No hay productos bajo el minimo configurado.";
    }

    const lines = items.map((item) => {
      const location = item.location ? ` | Ubicacion: ${item.location}` : "";
      return `- ${item.code} | ${item.name} | Stock ${item.stock}/${item.minStock}${location}`;
    });

    return [
      "Hola equipo,",
      "",
      "Se detectaron productos bajo el stock minimo:",
      ...lines,
      "",
      "Favor revisar reposicion. Enviado desde Firemat Inventario.",
    ].join("\n");
  }, [items]);

  const hasLowStock = items.length > 0;

  const handleSend = () => {
    if (!hasLowStock) {
      onNotify?.(false, "No hay productos bajo minimo para notificar.");
      return;
    }

    if (!emailTo.trim()) {
      onNotify?.(false, "Agrega al menos un destinatario.");
      return;
    }

    const mailto = `mailto:${encodeURIComponent(
      emailTo.trim()
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      bodyPreview
    )}`;

    window.location.href = mailto;
    onNotify?.(true, "Abrimos tu cliente de correo con el resumen listo.");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bodyPreview);
      onNotify?.(true, "Texto copiado al portapapeles.");
    } catch (error) {
      onNotify?.(false, "No se pudo copiar el texto de la alerta.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-red-100 px-4 py-4 mb-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
            {hasLowStock
              ? `Stock bajo en ${items.length} producto${
                  items.length === 1 ? "" : "s"
                }`
              : "Sin productos bajo minimo"}
          </div>

          <p className="text-sm text-neutral-600 max-w-xl">
            Genera un correo rapido con el listado de productos que necesitan
            reposicion. Puedes editar el destinatario o copiar el cuerpo antes
            de enviar.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-neutral-600">
              Destinatario
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
                placeholder="correo@empresa.cl"
              />
            </label>
            <label className="text-xs text-neutral-600">
              Asunto
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-red-400 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="w-full md:max-w-sm">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700 shadow-inner">
            <div className="mb-2 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Vista previa del correo</span>
              <span>{hasLowStock ? `${items.length} item(s)` : "Vacio"}</span>
            </div>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-5 text-neutral-800">
              {bodyPreview}
            </pre>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 rounded-md text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            >
              Copiar texto
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasLowStock}
              className={`px-4 py-2 rounded-md text-xs font-semibold shadow ${
                hasLowStock
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-neutral-300 text-neutral-600 cursor-not-allowed"
              }`}
            >
              Enviar correo
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default LowStockAlert;
