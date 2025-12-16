// src/pages/LoginPage.jsx
import { useState } from "react";

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    onLogin(form, (ok, message) => {
      if (!ok) {
        setError(message || "Credenciales incorrectas.");
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-700 rounded-2xl shadow-xl px-8 py-8 text-white">
      <div className="flex flex-col items-center mb-6">
        <img
          src="/img/logo_firemat.png"
          alt="Firemat"
          className="h-12 w-auto mb-3"
        />
        <h1 className="text-xl font-semibold">Panel de Inventario</h1>
        <p className="text-xs text-neutral-300">
          Inicia sesión para gestionar el inventario de Firemat
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col text-xs gap-1">
          Correo electrónico
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@firemat.cl"
            className="px-3 py-2 rounded-md border border-neutral-600 bg-neutral-800 text-sm text-white placeholder:text-neutral-500"
          />
        </div>

        <div className="flex flex-col text-xs gap-1">
          Contraseña
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
            className="px-3 py-2 rounded-md border border-neutral-600 bg-neutral-800 text-sm text-white placeholder:text-neutral-500"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-2 px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-sm font-semibold"
        >
          Iniciar sesión
        </button>

        {/* <div className="text-[11px] text-neutral-400 mt-4 space-y-1">
          <p className="font-semibold mb-1">Cuentas demo:</p>
          <p>
            <span className="font-mono">admin@firemat.cl</span> → Dueño (todo)
          </p>
          <p>
            <span className="font-mono">ejecutivo@firemat.cl</span> → Ejecutivo
            (todo excepto Roles)
          </p>
          <p>
            <span className="font-mono">gerente@firemat.cl</span> → Gerente
            (solo movimientos de inventario)
          </p>
          <p>
            Contraseña (todas):{" "}
            <span className="font-mono">123456</span>
          </p>
        </div> */}
      </form>
    </div>
  );
}

export default LoginPage;
