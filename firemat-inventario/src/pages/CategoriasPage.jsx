// src/pages/CategoriasPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";

function CategoriasPage({ categories, setCategories, products, showAlert }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const resetForm = () => {
    setEditingIndex(null);
    setCategoryName("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (index) => {
    setEditingIndex(index);
    setCategoryName(categories[index] || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nameClean = categoryName.trim();
    if (!nameClean) {
      showAlert("El nombre de la categoria es obligatorio.", "Datos incompletos");
      return;
    }

    const exists = categories.some((cat, i) => {
      if (editingIndex !== null && i === editingIndex) return false;
      return cat.toLowerCase() === nameClean.toLowerCase();
    });

    if (exists) {
      showAlert(
        `Ya existe una categoria con el nombre "${nameClean}".`,
        "Nombre duplicado"
      );
      return;
    }

    if (editingIndex === null) {
      setCategories((prev) => [...prev, nameClean]);
      showAlert(`Categoria "${nameClean}" creada correctamente.`, "Categoria creada");
    } else {
      const oldName = categories[editingIndex];

      const updatedCategories = categories.map((cat, idx) =>
        idx === editingIndex ? nameClean : cat
      );
      setCategories(updatedCategories);

      showAlert(
        `Categoria actualizada de "${oldName}" a "${nameClean}".`,
        "Categoria actualizada"
      );
    }

    closeModal();
  };

  const handleDelete = (index) => {
    const name = categories[index];

    const usedByProducts = products.some((p) => p.category === name);
    if (usedByProducts) {
      showAlert(
        `No puedes eliminar la categoria "${name}" porque hay productos asociados a ella.\n\n` +
          `Primero reasigna o elimina esos productos.`,
        "Categoria en uso"
      );
      return;
    }

    setCategories((prev) => prev.filter((_, idx) => idx !== index));
    showAlert(`La categoria "${name}" ha sido eliminada.`, "Categoria eliminada");
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* LISTADO DE CATEGORIAS */}
      <motion.div
        className="bg-white rounded-xl shadow-md p-5 border border-neutral-200"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-red-600 font-semibold">
              Catalogo
            </p>
            <h2 className="text-lg font-semibold">Categorias</h2>
            <p className="text-xs text-neutral-500">
              Gestiona las categorias de productos de inventario Firemat.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow"
          >
            + Nueva categoria
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-neutral-800 text-white">
              <tr>
                <th className="text-left px-3 py-2 w-20">#</th>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-left px-3 py-2">Productos asociados</th>
                <th className="text-left px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr className="bg-white">
                  <td
                    colSpan={4}
                    className="px-3 py-3 text-center text-neutral-500"
                  >
                    No hay categorias configuradas.
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => {
                  const count = products.filter((p) => p.category === cat).length;
                  return (
                    <motion.tr
                      key={`${cat}-${idx}`}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      whileHover={{ scale: 1.002 }}
                      className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                    >
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2">{cat}</td>
                      <td className="px-3 py-2">
                        {count > 0 ? (
                          <span className="text-xs font-medium text-neutral-700">
                            {count} producto{count !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">Ninguno</span>
                        )}
                      </td>
                      <td className="px-3 py-2 space-x-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(idx)}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(idx)}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        >
                          Eliminar
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* MODAL CREAR / EDITAR CATEGORIA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold">
                {editingIndex === null ? "Nueva categoria" : "Editar categoria"}
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
                Nombre de la categoria
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
                  placeholder="Ej: Sellos y Spray, Cintas / Wraps..."
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
                  {editingIndex === null ? "Crear categoria" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}

export default CategoriasPage;
