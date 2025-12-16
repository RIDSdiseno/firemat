// src/App.jsx
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AlertModal from "./components/AlertModal";

import InventarioPage from "./pages/InventarioPage";
import MovimientosPage from "./pages/MovimientosPage";
import ProductosPage from "./pages/ProductosPage";
import CategoriasPage from "./pages/CategoriasPage";
import RolesPage from "./pages/RolesPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ROLES,
} from "./data";

function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [movements, setMovements] = useState([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { email, name, role }

  // Estado para el modal de avisos
  const [alertConfig, setAlertConfig] = useState({
    open: false,
    title: "",
    message: "",
  });

  const showAlert = (message, title = "Aviso") => {
    setAlertConfig({
      open: true,
      title,
      message,
    });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, open: false }));
  };

  const addMovement = (movement) => {
    setMovements((prev) => [...prev, movement]);
  };

  const handleLogin = (form, callback) => {
    const { email, password } = form;

    if (password !== "123456") {
      callback?.(false, "Correo o contrasena incorrectos.");
      return;
    }

    let role = null;
    let name = "";

    if (email === "admin@firemat.cl") {
      role = "Dueno";
      name = "Dueno Firemat";
    } else if (email === "ejecutivo@firemat.cl") {
      role = "Ejecutivo";
      name = "Ejecutivo Comercial";
    } else if (email === "gerente@firemat.cl") {
      role = "Gerente";
      name = "Gerente de Operaciones";
    } else {
      callback?.(false, "Correo o contrasena incorrectos.");
      return;
    }

    setIsAuthenticated(true);
    setCurrentUser({ email, name, role });
    callback?.(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const role = currentUser?.role || "Dueno";
  const canManageRoles = role === "Dueno";
  const canManageCategories = role === "Dueno" || role === "Ejecutivo";

  // Si NO esta autenticado, solo mostramos Login (sin header/footer)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-neutral-100 flex flex-col">
        <Header onLogout={handleLogout} currentUser={currentUser} />

        {/* Menu de navegacion */}
        <nav className="bg-neutral-900 text-sm">
          <div className="max-w-5xl mx-auto px-4 flex gap-4 py-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-neutral-200 hover:bg-neutral-800"
                }`
              }
            >
              Inventario
            </NavLink>

            <NavLink
              to="/movimientos"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-neutral-200 hover:bg-neutral-800"
                }`
              }
            >
              Movimientos
            </NavLink>

            <NavLink
              to="/productos"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-neutral-200 hover:bg-neutral-800"
                }`
              }
            >
              Productos
            </NavLink>

            {canManageCategories && (
              <NavLink
                to="/categorias"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-neutral-200 hover:bg-neutral-800"
                  }`
                }
              >
                Categorias
              </NavLink>
            )}

            {canManageRoles && (
              <NavLink
                to="/roles"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "text-neutral-200 hover:bg-neutral-800"
                  }`
                }
              >
                Roles
              </NavLink>
            )}
          </div>
        </nav>

        {/* Contenido principal */}
        <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full">
          <Routes>
            {/* Inventario */}
            <Route
              path="/"
              element={
                <InventarioPage
                  products={products}
                  movements={movements}
                  categories={categories}
                  setProducts={setProducts}
                  addMovement={addMovement}
                  currentUser={currentUser}
                  showAlert={showAlert}
                />
              }
            />

            {/* Movimientos */}
            <Route
              path="/movimientos"
              element={
                <MovimientosPage
                  movements={movements}
                  setMovements={setMovements}
                  currentUser={currentUser}
                  products={products}
                  setProducts={setProducts}
                  showAlert={showAlert}
                />
              }
            />

            {/* Productos */}
            <Route
              path="/productos"
              element={
                <ProductosPage
                  products={products}
                  setProducts={setProducts}
                  categories={categories}
                  addMovement={addMovement}
                  currentUser={currentUser}
                  showAlert={showAlert}
                />
              }
            />

            {/* Categorias - solo Dueno/Ejecutivo; si no, 404 */}
            <Route
              path="/categorias"
              element={
                canManageCategories ? (
                  <CategoriasPage
                    categories={categories}
                    setCategories={setCategories}
                    products={products}
                    showAlert={showAlert}
                  />
                ) : (
                  <NotFoundPage />
                )
              }
            />

            {/* Roles - solo Dueno; si no, 404 */}
            <Route
              path="/roles"
              element={
                canManageRoles ? (
                  <RolesPage
                    roles={roles}
                    setRoles={setRoles}
                    showAlert={showAlert}
                  />
                ) : (
                  <NotFoundPage />
                )
              }
            />

            {/* Cualquier otra ruta => 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer currentUser={currentUser} />

        {/* Modal global de avisos */}
        <AlertModal
          open={alertConfig.open}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={closeAlert}
        />
      </div>
    </Router>
  );
}

export default App;
