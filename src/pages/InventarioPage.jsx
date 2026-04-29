// src/pages/InventarioPage.jsx
import { useState, useEffect } from "react";
import axios from "../api/axios";

import SummaryCards from "../components/SummaryCards";
import InventoryTable from "../components/InventoryTable";
import MovementModal from "../components/MovementModal";
import ProductEditModal from "../components/ProductEditModal";
import LowStockAlert from "../components/LowStockAlert";
import ReportPanel from "../components/ReportPanel";

function InventarioPage({
  products,
  movements = [],
  categories,
  setProducts,
  currentUser,
  showAlert,
}) {
  const [movement, setMovement] = useState({
    productId: "",
    type: "Entrada",
    date: "",
    qty: "",
    reason: "",
    doc: "",
  });

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const role = currentUser?.role || "Invitado";
  const canEditProduct = role === "Dueno" || role === "Ejecutivo";

  // 🔥 CARGAR PRODUCTOS DESDE BACKEND
  const obtenerProductos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/productos`);

      const productosAdaptados = res.data.map((p) => ({
        ...p,
        name: p.nombre,
        category: p.categoria,
        sku: p.id,
        code: `P-${p.id}`,
        status: p.activo ? "Activo" : "Inactivo",
      }));

      setProducts(productosAdaptados);
    } catch (error) {
      console.error(error);
      showAlert?.("Error al cargar productos", "Error");
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  // 🔥 KPIs
  const productosActivos = products.filter((p) => p.activo === true);
  const productosInactivos = products.filter((p) => p.activo === false);

  const totalProductosActivos = productosActivos.length;
  const totalProductosInactivos = productosInactivos.length;

  const totalStock = productosActivos.reduce((acc, p) => acc + p.stock, 0);

  const lowStockItems = productosActivos.filter(
    (p) => p.stock <= p.minStock
  );

  const lowStockCount = lowStockItems.length;

  const handleNotify = (ok, message) => {
    if (!showAlert) return;
    showAlert(message, ok ? "Aviso" : "Atención");
  };

  const handleMovementChange = (e) => {
    const { name, value } = e.target;
    setMovement((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenMovementModal = () => {
    if (!movement.productId && products[0]) {
      setMovement((prev) => ({ ...prev, productId: products[0].id }));
    }
    setIsMovementModalOpen(true);
  };

  const handleSelectMovementFromTable = (productId, type) => {
    setMovement((prev) => ({
      ...prev,
      productId,
      type,
    }));
    setIsMovementModalOpen(true);
  };

  // 🔥 MOVIMIENTO REAL (BACKEND MANDA)
  const handleMovementSubmit = async (e) => {
    e.preventDefault();

    const productIdNum = Number(movement.productId);
    const qty = Number(movement.qty);

    if (!productIdNum || !qty || qty <= 0) {
      showAlert(
        "Selecciona un producto y una cantidad válida.",
        "Movimiento inválido"
      );
      return;
    }

    if (!movement.date) {
      showAlert("Debes seleccionar la fecha.", "Fecha requerida");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/inventario/movimiento`, {
        productoId: productIdNum,
        tipo: movement.type.toLowerCase(),
        cantidad: qty,
        motivo: movement.reason.trim(),
        documento: movement.doc.trim(),
      });

      await obtenerProductos();

      showAlert("Movimiento registrado correctamente", "Éxito");

      setMovement({
        productId: products[0]?.id ?? "",
        type: "Entrada",
        date: "",
        qty: "",
        reason: "",
        doc: "",
      });

      setIsMovementModalOpen(false);
    } catch (error) {
      console.error(error);
      showAlert("Error al registrar movimiento", "Error");
    }
  };

  const handleEditProductFromTable = (productId) => {
    if (!canEditProduct) {
      showAlert("No tienes permisos.", "Permisos");
      return;
    }
    setEditingProductId(productId);
    setIsEditModalOpen(true);
  };

  const productToEdit =
    products.find((p) => p.id === editingProductId) || null;

  const handleSaveEditedProduct = async (updatedProduct) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/productos/${updatedProduct.id}`,
        updatedProduct
      );

      await obtenerProductos();

      setIsEditModalOpen(false);
      showAlert("Producto actualizado correctamente", "Éxito");
    } catch (error) {
      console.error(error);
      showAlert("Error al actualizar producto", "Error");
    }
  };

  return (
    <>
      <SummaryCards
        productsCount={totalProductosActivos}
        lowStockCount={lowStockCount}
        totalStock={totalStock}
        inactiveCount={totalProductosInactivos}
      />

      <LowStockAlert items={lowStockItems} onNotify={handleNotify} />

      <ReportPanel
        products={products}
        movements={movements}
        categories={categories}
        onNotify={handleNotify}
      />

      <InventoryTable
        products={products}
        onSelectMovement={handleSelectMovementFromTable}
        onEditProduct={handleEditProductFromTable}
        canEditProduct={canEditProduct}
        onNewMovement={handleOpenMovementModal}
      />

      <MovementModal
        open={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        products={products}
        movement={movement}
        onChange={handleMovementChange}
        onSubmit={handleMovementSubmit}
      />

      <ProductEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={productToEdit}
        categories={categories}
        onSave={handleSaveEditedProduct}
      />
    </>
  );
}

export default InventarioPage;