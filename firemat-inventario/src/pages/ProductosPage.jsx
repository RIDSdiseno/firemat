// src/pages/ProductosPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";

function ProductosPage({
  products,
  setProducts,
  categories,
  addMovement,
  currentUser,
  showAlert,
}) {
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    code: "",
    sku: "",
    name: "",
    category: categories[0] ?? "",
    stock: "",
    minStock: "",
    location: "",
    status: "Activo",
    docRef: "",
    imageUrl: "",
  });

  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const role = currentUser?.role || "Dueno";
  const canEditOrCreate = role === "Dueno" || role === "Ejecutivo";

  const resetForm = () => {
    setForm({
      code: "",
      sku: "",
      name: "",
      category: categories[0] ?? "",
      stock: "",
      minStock: "",
      location: "",
      status: "Activo",
      docRef: "",
      imageUrl: "",
    });
    setEditingId(null);
    setImagePreview("");
  };

  const openCreateModal = () => {
    if (!canEditOrCreate) {
      showAlert(
        "Tu rol no permite crear productos.",
        "Permisos insuficientes"
      );
      return;
    }
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

    if (name === "imageUrl") {
      setImagePreview(value);
    }
  };

  const handleFileChange = (e) => {
    if (!canEditOrCreate) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setForm((prev) => ({ ...prev, imageUrl: objectUrl }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canEditOrCreate) {
      showAlert(
        "Tu rol no permite crear ni editar productos.",
        "Permisos insuficientes"
      );
      return;
    }

    if (!form.code.trim() || !form.name.trim()) {
      showAlert(
        "El codigo y el nombre son obligatorios.",
        "Datos incompletos"
      );
      return;
    }

    const stock = Number(form.stock) || 0;
    const minStock = Number(form.minStock) || 0;
    const docRefClean = form.docRef.trim();
    const imageClean = form.imageUrl.trim();

    if (!docRefClean) {
      showAlert(
        "El documento de referencia es obligatorio.",
        "Datos incompletos"
      );
      return;
    }

    if (editingId === null) {
      const newId =
        products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

      const newProduct = {
        id: newId,
        code: form.code.trim(),
        sku: form.sku.trim(),
        name: form.name.trim(),
        category: form.category,
        stock,
        minStock,
        location: form.location.trim(),
        status: form.status,
        docRef: docRefClean,
        imageUrl: imageClean,
      };

      setProducts([...products, newProduct]);

      if (typeof addMovement === "function") {
        const now = new Date();
        const fechaISO = now.toISOString().slice(0, 10);

        const movementRecord = {
          id: Date.now(),
          fecha: fechaISO,
          productoId: newProduct.id,
          producto: `${newProduct.code} - ${newProduct.name}`,
          tipo: "Alta de producto",
          cantidad: stock,
          stockAnterior: 0,
          stockNuevo: stock,
          motivo: "Creacion de nuevo producto",
          documento: docRefClean,
        };

        addMovement(movementRecord);
      }

      showAlert("Producto creado correctamente.", "Producto creado");
    } else {
      const updated = products.map((p) =>
        p.id === editingId
          ? {
              ...p,
              code: form.code.trim(),
              sku: form.sku.trim(),
              name: form.name.trim(),
              category: form.category,
              stock,
              minStock,
              location: form.location.trim(),
              status: form.status,
              docRef: docRefClean,
              imageUrl: imageClean,
            }
          : p
      );
      setProducts(updated);

      showAlert("Producto actualizado correctamente.", "Producto actualizado");
    }

    closeModal();
  };

  const handleEditClick = (product) => {
    if (!canEditOrCreate) {
      showAlert(
        "Tu rol no permite editar productos.",
        "Permisos insuficientes"
      );
      return;
    }

    setEditingId(product.id);
    setForm({
      code: product.code,
      sku: product.sku || "",
      name: product.name,
      category: product.category,
      stock: String(product.stock),
      minStock: String(product.minStock),
      location: product.location,
      status: product.status,
      docRef: product.docRef || "",
      imageUrl: product.imageUrl || "",
    });
    setImagePreview(product.imageUrl || "");
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (!canEditOrCreate) {
      showAlert(
        "Tu rol no permite eliminar productos.",
        "Permisos insuficientes"
      );
      return;
    }
    const ok = window.confirm("Seguro que quieres eliminar este producto?");
    if (!ok) return;
    setProducts(products.filter((p) => p.id !== id));
  };

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesText =
      !q ||
      p.code.toLowerCase().includes(q) ||
      (p.sku?.toLowerCase().includes(q) ?? false) ||
      p.name.toLowerCase().includes(q);

    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;

    return matchesText && matchesCategory && matchesStatus;
  });

  const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-md p-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Productos</h2>
            <p className="text-xs text-neutral-500">
              Administracion de catalogo de productos Firemat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="text"
              placeholder="Buscar por codigo, SKU o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded-md border border-neutral-300 bg-neutral-100 text-sm w-full sm:w-72"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-neutral-300 bg-neutral-100 text-sm w-full sm:w-48"
              >
                <option value="">Todas las categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-neutral-300 bg-neutral-100 text-sm w-full sm:w-40"
              >
                <option value="">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {canEditOrCreate && (
              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold"
              >
                + Nuevo producto
              </button>
            )}
          </div>
        </div>

        {!canEditOrCreate && (
          <p className="mb-3 text-xs text-neutral-600 bg-neutral-100 border border-neutral-300 rounded-md px-3 py-2">
            Tu rol <strong>{role}</strong> solo permite consultar productos. No
            puedes crear, editar ni eliminar.
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-neutral-800 text-white">
              <tr>
                <th className="text-left px-3 py-2">Foto</th>
                <th className="text-left px-3 py-2">Codigo</th>
                <th className="text-left px-3 py-2">SKU</th>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-left px-3 py-2">Categoria</th>
                <th className="text-left px-3 py-2">Stock</th>
                <th className="text-left px-3 py-2">Minimo</th>
                <th className="text-left px-3 py-2">Ubicacion</th>
                <th className="text-left px-3 py-2">Estado</th>
                <th className="text-left px-3 py-2">Doc. ref.</th>
                <th className="text-left px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr className="bg-white">
                  <td
                    colSpan={11}
                    className="px-3 py-3 text-center text-neutral-500"
                  >
                    No hay productos que coincidan con la busqueda.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => (
                  <motion.tr
                    key={p.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                    whileHover={{ scale: 1.002 }}
                  >
                    <td className="px-3 py-2">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-10 w-10 object-contain border border-neutral-300 bg-white rounded-md"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/40?text=IMG";
                          }}
                        />
                      ) : (
                        <span className="inline-flex items-center justify-center h-10 w-10 text-[10px] text-neutral-400 border border-dashed border-neutral-300 rounded-md">
                          Sin foto
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{p.code}</td>
                    <td className="px-3 py-2">{p.sku || "N/D"}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.category}</td>
                    <td className="px-3 py-2">{p.stock}</td>
                    <td className="px-3 py-2">{p.minStock}</td>
                    <td className="px-3 py-2">{p.location}</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2">
                      {p.docRef ? (
                        p.docRef
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 space-x-1">
                      {canEditOrCreate ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditClick(p)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(p.id)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                          >
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-neutral-500">
                          Solo lectura
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-5 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold">
                {editingId ? "Editar producto" : "Nuevo producto"}
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
              className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-xs"
            >
              <label className="flex flex-col gap-1">
                Codigo
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
                  placeholder="FM-CT-001"
                />
              </label>

              <label className="flex flex-col gap-1">
                SKU
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
                  placeholder="SKU-CT-001"
                />
              </label>

              <label className="flex flex-col gap-1">
                Nombre
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
                  placeholder="Metacaulk 1200"
                />
              </label>

              <label className="flex flex-col gap-1">
                Categoria
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
                >
                  {categories.length === 0 ? (
                    <option value="">Sin categorias</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                Stock
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
                />
              </label>

              <label className="flex flex-col gap-1">
                Stock minimo
                <input
                  type="number"
                  name="minStock"
                  min="0"
                  value={form.minStock}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
                />
              </label>

              <label className="flex flex-col gap-1">
                Ubicacion
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
                  placeholder="B1 - Rack A2"
                />
              </label>

              <label className="flex flex-col gap-1">
                Estado
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                Documento de referencia
                <input
                  type="text"
                  name="docRef"
                  value={form.docRef}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
                  placeholder="Factura 123, OC 456, Guia 789..."
                />
              </label>

              <label className="flex flex-col gap-1">
                URL de imagen
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-md border border-neutral-400 bg-neutral-800 text-white text-sm placeholder:text-neutral-300"
                  placeholder="/img/products/metacaulk-1200.png"
                />
              </label>

              <label className="flex flex-col gap-1">
                Subir imagen de producto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-xs text-neutral-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-red-600 file:text-white file:text-xs hover:file:bg-red-700"
                />
                <span className="text-[10px] text-neutral-500 mt-1">
                  En este prototipo el archivo no se guarda en el servidor; solo
                  se usa para mostrar la imagen mientras la app esta abierta.
                </span>
              </label>

              <div className="sm:col-span-2 lg:col-span-3">
                {imagePreview ? (
                  <div className="flex items-center gap-3 text-xs text-neutral-600">
                    <span>Vista previa:</span>
                    <img
                      src={imagePreview}
                      alt="Preview producto"
                      className="h-16 w-16 object-contain border border-neutral-300 bg-white rounded-md"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/64?text=IMG";
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500">
                    Puedes usar una URL directa o subir una imagen para
                    previsualizar el producto.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-2">
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
                  {editingId ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}

export default ProductosPage;
