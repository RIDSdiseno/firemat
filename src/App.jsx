// src/App.jsx
import { useState, useEffect } from "react";
import axios from "./api/axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AlertModal from "./components/AlertModal";

import DashboardPage from "./pages/DashboardPage";
import InventarioPage from "./pages/InventarioPage";
import MovimientosPage from "./pages/MovimientosPage";
import ProductosPage from "./pages/ProductosPage";
import CategoriasPage from "./pages/CategoriasPage";
import RolesPage from "./pages/RolesPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductoDetallePage from "./pages/ProductoDetallePage";

import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ROLES,
} from "./data";

function App() {

  // 🔥 MOVER ARRIBA (CLAVE)
  const normalize = (str) =>
    str?.trim().toLowerCase().replace(/\s+/g, " ");

  // 🔥 STATES NORMALIZADOS
  const [products, setProducts] = useState([]);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [movements, setMovements] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // 🔐 Cargar sesión
  useEffect(() => {
  const init = async () => {
    const savedUser = sessionStorage.getItem("user");
    const token = localStorage.getItem("token");

    // 🔴 1. Si NO hay token → no llamar backend
    if (!token) {
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }

      setLoading(false);
      return;
    }

    try {
      // 🔥 2. Cargar categorías con token válido
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error backend:", data);
      } else {
        setCategories(data);
      }

    } catch (error) {
      console.error("Error cargando categorías:", error);
    }

    // 🔐 3. Restaurar sesión
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }

    // ⏳ 4. Terminar loading
    setLoading(false);
  };

  init();
}, []);
useEffect(() => {
  if (isAuthenticated) {
    obtenerProductosInicial();
  }
}, [isAuthenticated]);

  const obtenerProductosInicial = async () => {
  try {
    const res = await axios.get("/api/productos");

    const data = res.data.map((p) => ({
      id: p.id,
      code: p.id,
      sku: "",
      name: p.nombre,
      category: normalize(p.categoria),
      stock: p.stock,
      minStock: p.minStock ?? 0,
      location: p.ubicacion || "",
      status: p.activo ? "Activo" : "Inactivo",
      docRef: p.descripcion || "",
      imageUrl: p.imagen || "",
    }));

    setProducts(data);
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
};
  // Modal
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    title: "",
    message: "",
  });

  const showAlert = (message, title = "Aviso") => {
    setAlertConfig({ open: true, title, message });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, open: false }));
  };

  const addMovement = (movement) => {
    setMovements((prev) => [...prev, movement]);
  };

  // 🔐 LOGIN
  const handleLogin = async (form, callback) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      callback?.(false, data.error || "Correo o contraseña incorrectos");
      return;
    }

    // 🔥 GUARDAR TOKEN (CLAVE)
    localStorage.setItem("token", data.token);
    const role = data.user?.role || data.role;

    // 🔥 usuario (básico por ahora)
    const user = {
      id: data.user?.id,
      email: data.user?.email || form.email,
      role
    };
    console.log("LOGIN RESPONSE:", data);

    sessionStorage.setItem("user", JSON.stringify(user));

    setIsAuthenticated(true);
    setCurrentUser(user);

    callback?.(true);

  } catch (error) {
    console.error(error);
    callback?.(false, "Error de conexión");
  }
};

  // 🔐 LOGOUT
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const role = currentUser?.role || "Dueno";
  const canManageRoles = role === "Dueno";
  const canManageCategories = role === "Dueno" || role === "Ejecutivo";

  // ⏳ Loading
  if (loading) {
    return <div className="text-center mt-10">Cargando...</div>;
  }

  return (
    <Router>
      {!isAuthenticated ? (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
          <LoginPage onLogin={handleLogin} />
        </div>
      ) : (
        <div className="min-h-screen bg-neutral-100 flex flex-col">
          <Header onLogout={handleLogout} currentUser={currentUser} />

          <nav className="bg-neutral-900 text-sm">
            <div className="max-w-5xl mx-auto px-4 flex gap-4 py-2">
              <NavLink to="/dashboard" end className={({ isActive }) =>
                `px-3 py-1.5 rounded-md ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-neutral-200 hover:bg-neutral-800"
                }`
              }>
                Dashboard
              </NavLink>

              <NavLink to="/inventario" className={({ isActive }) =>
                `px-3 py-1.5 rounded-md ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-neutral-200 hover:bg-neutral-800"
                }`
              }>
                Inventario
              </NavLink>

              <NavLink to="/movimientos" className={({ isActive }) =>
                `px-3 py-1.5 rounded-md ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-neutral-200 hover:bg-neutral-800"
                }`
              }>
                Movimientos
              </NavLink>

              <NavLink to="/productos" className={({ isActive }) =>
                `px-3 py-1.5 rounded-md ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-neutral-200 hover:bg-neutral-800"
                }`
              }>
                Productos
              </NavLink>

              {canManageCategories && (
                <NavLink to="/categorias" className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-neutral-200 hover:bg-neutral-800"
                  }`
                }>
                  Categorias
                </NavLink>
              )}

              {canManageRoles && (
                <NavLink to="/roles" className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-neutral-200 hover:bg-neutral-800"
                  }`
                }>
                  Roles
                </NavLink>
              )}
            </div>
          </nav>

          <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/inventario" element={
                <InventarioPage
                  products={products}
                  movements={movements}
                  categories={categories}
                  setProducts={setProducts}
                  addMovement={addMovement}
                  currentUser={currentUser}
                  showAlert={showAlert}
                />
              } />

              <Route path="/movimientos" element={
                <MovimientosPage
                  movements={movements}
                  setMovements={setMovements}
                  currentUser={currentUser}
                  products={products}
                  setProducts={setProducts}
                  showAlert={showAlert}
                />
              } />

              <Route path="/productos" element={
                <ProductosPage
                  products={products}
                  setProducts={setProducts}
                  categories={categories}
                  addMovement={addMovement}
                  currentUser={currentUser}
                  showAlert={showAlert}
                />
              } />

              <Route path="/productos/:id" element={<ProductoDetallePage />} />

              <Route path="/categorias" element={
                canManageCategories
                  ? <CategoriasPage categories={categories} setCategories={setCategories} products={products} showAlert={showAlert} />
                  : <NotFoundPage />
              } />

              <Route path="/roles" element={
                canManageRoles
                  ? <RolesPage roles={roles} setRoles={setRoles} showAlert={showAlert} />
                  : <NotFoundPage />
              } />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer currentUser={currentUser} />

          <AlertModal
            open={alertConfig.open}
            title={alertConfig.title}
            message={alertConfig.message}
            onClose={closeAlert}
          />
        </div>
      )}
    </Router>
  );
}

export default App;