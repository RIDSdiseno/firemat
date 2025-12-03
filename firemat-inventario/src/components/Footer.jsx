// src/components/Footer.jsx

function Footer({ currentUser }) {
  const year = new Date().getFullYear();
  const role = currentUser?.role ?? "—";

  return (
    <footer className="mt-8 border-t border-neutral-800 bg-neutral-900">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-300">
        <div className="text-center sm:text-left">
          <span className="font-semibold text-white">
            Firemat Inventario
          </span>{" "}
          · Sistema interno de gestión de stock y movimientos.
          <div className="mt-0.5 text-neutral-400">
            &copy; {year} Firemat Chile. Todos los derechos reservados.
          </div>
        </div>

        <div className="text-center sm:text-right text-neutral-300">
          <div>
            Usuario:{" "}
            <span className="font-medium text-white">
              {currentUser?.name ?? "—"}
            </span>
          </div>
          <div>
            Rol:{" "}
            <span className="font-medium text-white">
              {role}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
