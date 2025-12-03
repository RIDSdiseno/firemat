// src/pages/RolesPage.jsx
import { useState } from "react";

function RolesPage({ roles, setRoles, showAlert }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // Modal crear / editar
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal de confirmación para eliminar
  const [confirmState, setConfirmState] = useState({
    open: false,
    roleId: null,
    roleName: "",
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (role) => {
    setEditingId(role.id);
    setForm({
      name: role.name || "",
      description: role.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showAlert("El nombre del rol es obligatorio.", "Datos incompletos");
      return;
    }

    if (editingId === null) {
      // Crear nuevo rol
      const newId =
        roles.length > 0 ? Math.max(...roles.map((r) => r.id)) + 1 : 1;

      const newRole = {
        id: newId,
        name: form.name.trim(),
        description: form.description.trim(),
      };

      setRoles((prev) => [...prev, newRole]);
      showAlert("Rol creado correctamente.", "Rol creado");
    } else {
      // Actualizar rol existente
      const updated = roles.map((r) =>
        r.id === editingId
          ? {
              ...r,
              name: form.name.trim(),
              description: form.description.trim(),
            }
          : r
      );
      setRoles(updated);
      showAlert("Rol actualizado correctamente.", "Rol actualizado");
    }

    closeModal();
  };

  const openDeleteConfirm = (role) => {
    setConfirmState({
      open: true,
      roleId: role.id,
      roleName: role.name,
    });
  };

  const closeDeleteConfirm = () => {
    setConfirmState({
      open: false,
      roleId: null,
      roleName: "",
    });
  };

  const handleDeleteConfirmed = () => {
    const { roleId, roleName } = confirmState;
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    closeDeleteConfirm();
    showAlert(`El rol "${roleName}" ha sido eliminado.`, "Rol eliminado");
  };

  return (
    <section className="space-y-5">
      {/* LISTA DE ROLES */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-semibold">Administración de roles</h2>
            <p className="text-xs text-neutral-500">
              Define los roles de acceso para el sistema de inventario Firemat.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold"
          >
            + Nuevo rol
          </button>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead className="bg-neutral-800 text-white">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Nombre</th>
              <th className="text-left px-3 py-2">Descripción</th>
              <th className="text-left px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr className="bg-white">
                <td
                  colSpan={4}
                  className="px-3 py-3 text-center text-neutral-500"
                >
                  No hay roles configurados.
                </td>
              </tr>
            ) : (
              roles.map((role, idx) => (
                <tr
                  key={role.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                >
                  <td className="px-3 py-2">{role.id}</td>
                  <td className="px-3 py-2">{role.name}</td>
                  <td className="px-3 py-2 text-xs text-neutral-700">
                    {role.description || (
                      <span className="text-neutral-400">Sin descripción</span>
                    )}
                  </td>
                  <td className="px-3 py-2 space-x-1">
                    <button
                      type="button"
                      onClick={() => handleEditClick(role)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteConfirm(role)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR / EDITAR ROL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold">
                {editingId ? "Editar rol" : "Nuevo rol"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-xs px-2 py-1 rounded-md bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
              >
                Cerrar
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-3 text-xs"
            >
              <label className="flex flex-col gap-1">
                Nombre del rol
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
                  placeholder="Dueño, Ejecutivo, Gerente..."
                />
              </label>

              <label className="flex flex-col gap-1">
                Descripción
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300 resize-none"
                  placeholder="Ej: Acceso total al sistema, puede gestionar roles, categorías, productos e inventario."
                />
              </label>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-md bg-neutral-500 hover:bg-neutral-600 text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  {editingId ? "Guardar cambios" : "Crear rol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN ELIMINAR */}
      {confirmState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-neutral-900 text-neutral-100 rounded-xl shadow-xl w-full max-w-sm p-5">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Confirmar eliminación
            </h2>
            <p className="text-sm text-neutral-200 mb-4">
              ¿Estás seguro de que quieres eliminar el rol{" "}
              <span className="font-semibold">
                "{confirmState.roleName}"
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="px-4 py-2 rounded-md bg-neutral-600 hover:bg-neutral-700 text-white text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                Eliminar rol
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default RolesPage;
