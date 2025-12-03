// src/pages/InventarioPage.jsx
import { useState } from "react";
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
  addMovement,
  currentUser,
  showAlert,
}) {
  const [movement, setMovement] = useState({
    productId: products[0]?.id ?? "",
    type: "Entrada",
    date: "",
    qty: "",
    reason: "",
    doc: "",
  });
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  const [editingProductId, setEditingProductId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const role = currentUser?.role || "Dueno";
  const canEditProduct = role === "Dueno" || role === "Ejecutivo";

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock < p.minStock);
  const lowStockCount = lowStockItems.length;

  const handleNotify = (ok, message) => {
    if (typeof showAlert !== "function") return;
    const title = ok ? "Aviso" : "Atencion";
    const fallback = ok
      ? "Accion ejecutada correctamente."
      : "No hay datos para mostrar.";
    showAlert(message || fallback, title);
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

  const handleMovementSubmit = (e) => {
    e.preventDefault();

    const productIdNum = Number(movement.productId);
    const qty = Number(movement.qty);

    if (!productIdNum || !qty || qty <= 0) {
      showAlert(
        "Selecciona un producto y una cantidad mayor a 0.",
        "Movimiento invalido"
      );
      return;
    }

    if (!movement.date) {
      showAlert(
        "Debes seleccionar la fecha del movimiento.\nPor ejemplo, hoy para movimientos actuales o una fecha futura si quieres dejarlo planificado.",
        "Fecha requerida"
      );
      return;
    }

    const product = products.find((p) => p.id === productIdNum);
    if (!product) {
      showAlert("Producto no encontrado.", "Error");
      return;
    }

    if (movement.type === "Salida" && product.status !== "Activo") {
      showAlert(
        `No se puede registrar una SALIDA para el producto "${product.code}" porque esta inactivo.\n\nCambia el estado a "Activo" desde Productos o desde "Editar" en el inventario.`,
        "Producto inactivo"
      );
      return;
    }

    const fechaISO = movement.date;

    let newStock = product.stock;
    if (movement.type === "Entrada") {
      newStock = product.stock + qty;
    } else if (movement.type === "Salida") {
      newStock = Math.max(0, product.stock - qty);
    } else if (movement.type === "Ajuste") {
      newStock = qty;
    }

    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productIdNum ? { ...p, stock: newStock } : p
      )
    );

    const movementRecord = {
      id: Date.now(),
      fecha: fechaISO,
      productoId: productIdNum,
      producto: `${product.code} - ${product.name}`,
      tipo: movement.type,
      cantidad: qty,
      stockAnterior: product.stock,
      stockNuevo: newStock,
      motivo: movement.reason.trim(),
      documento: movement.doc.trim(),
    };

    addMovement(movementRecord);

    showAlert(
      `Movimiento registrado con fecha ${fechaISO}:\n${movement.type} de ${qty} unidades para el producto ${product.code}.`,
      "Movimiento registrado"
    );

    setMovement((prev) => ({
      ...prev,
      date: "",
      qty: "",
      reason: "",
      doc: "",
    }));

    setIsMovementModalOpen(false);
  };

  const handleEditProductFromTable = (productId) => {
    if (!canEditProduct) {
      showAlert(
        "Tu rol no permite editar productos.",
        "Permisos insuficientes"
      );
      return;
    }
    setEditingProductId(productId);
    setIsEditModalOpen(true);
  };

  const productToEdit =
    products.find((p) => p.id === editingProductId) || null;

  const handleSaveEditedProduct = (updatedProduct) => {
    if (!canEditProduct) {
      showAlert(
        "Tu rol no permite editar productos.",
        "Permisos insuficientes"
      );
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setIsEditModalOpen(false);
  };

  return (
    <>
      <SummaryCards
        productsCount={products.length}
        lowStockCount={lowStockCount}
        totalStock={totalStock}
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
