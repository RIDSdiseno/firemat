// src/pages/CategoriasPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

// 🔧 Normalizador global
const normalize = (str) =>
  str.trim().toLowerCase().replace(/\s+/g, " ");

function CategoriasPage({ categories, setCategories, products, showAlert }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const obtenerCategorias = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/categorias`
  );
  setCategories(res.data);
};

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
    setCategoryName(categories[index]?.nombre || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  import axios from "axios";

const handleSubmit = async (e) => {
  e.preventDefault();

  const nameClean = categoryName.trim();

  // ✅ VALIDACIONES
  if (!nameClean) {
    showAlert("El nombre de la categoria es obligatorio.", "Datos incompletos");
    return;
  }

  if (nameClean.length < 2) {
    showAlert("La categoria debe tener al menos 2 caracteres.", "Error");
    return;
  }

  const exists = categories.some((cat, i) => {
    if (editingIndex !== null && i === editingIndex) return false;
    return normalize(cat.nombre) === normalize(nameClean);
  });

  if (exists) {
    showAlert(
      `Ya existe una categoria con el nombre "${nameClean}".`,
      "Nombre duplicado"
    );
    return;
  }

  try {
    if (editingIndex === null) {
      // 🔥 CREAR
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/categorias`,
        { nombre: nameClean }
      );

      showAlert(
        `Categoria "${nameClean}" creada correctamente.`,
        "Categoria creada"
      );
    } else {
      // 🔥 EDITAR
      const categoria = categories[editingIndex]; // 👈 OBJETO COMPLETO

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/categorias/${categoria.id}`,
        { nombre: nameClean }
      );

      showAlert(
        "Categoria actualizada correctamente.",
        "Categoria actualizada"
      );
    }

    // 🔥 RECARGAR
    await obtenerCategorias();

    closeModal();
  } catch (error) {
    console.error(error);
    showAlert("Error al guardar categoria", "Error");
  }
};

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/categorias/${id}`, {
        nombre: nuevoNombre,
      });

      setEditingIndex(null);
      setNuevoNombre("");
      obtenerCategorias(); // recargar lista
    } catch(error) {
      console.error(error);
      alert("Error al actualizar categoria");
    }
  };

  const handleDelete = (index) => {
    const name = categories[index].nombre;

    if (!window.confirm(`¿Seguro que deseas eliminar la categoria "${name}"?`)) {
      return;
    }

    const usedByProducts = products.some(
      (p) => normalize(p.category) === normalize(name)
    );

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
                  <td colSpan={4} className="px-3 py-3 text-center text-neutral-500">
                    No hay categorias configuradas.
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => {
                  // 🔥 CORRECCIÓN CLAVE AQUÍ
                  const count = products.filter(
                    (p) => normalize(p.category) === normalize(cat.nombre)
                  ).length;

                  return (
                    <motion.tr
                      key={`${cat.id}-${idx}`}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      whileHover={{ scale: 1.002 }}
                      className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                    >
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2">
                        {editingIndex === idx ? (
                          <input
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          className="border px-2 py-1 rounded text-sm"
                          />
                        ) : (
                          cat.nombre
                          )}
                          </td>
                      
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
                        {editingIndex === idx ? (
                        <>
                        <button
                        onClick={handleSubmit}
                        className="px-2.5 py-1 bg-green-600 text-white rounded text-xs"
                        >
                          Guardar
                          </button>
                          
                        <button
                        onClick={() => setEditingIndex(null)}
                        className="px-2.5 py-1 bg-gray-400 text-white rounded text-xs"
                        >
                          Cancelar
                        </button>
                        </>
                        ) : (
                        <>
                        <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(idx);
                          setCategoryName(cat.nombre);
                        }}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Editar
                        </button>

                        <button
                        type="button"
                        onClick={() => handleDelete(idx)}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                        >
                          Eliminar
                        </button>
                        </>
                      )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold">
            Nueva categoría
          </h3>

          <button
            onClick={closeModal}
            className="text-xs px-2 py-1 bg-gray-200 rounded"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-3 py-2 bg-gray-400 text-white rounded"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-3 py-2 bg-red-600 text-white rounded"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

      {/* Modal igual que antes */}
    </motion.section>
  );
}

export default CategoriasPage;