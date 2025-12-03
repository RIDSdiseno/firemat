// src/data.js
export const INITIAL_PRODUCTS = [
  {
    id: 1,
    code: "FM-CT-001",
    sku: "SKU-CT-001",
    name: "Metacaulk 1200",
    category: "Cintas / Wraps",
    stock: 25,
    minStock: 30,
    location: "B1 - Rack A2",
    status: "Activo",
    docRef: "",
    imageUrl:
      "/img/products/Blaze-Foam-Intumescent-Compressible-Firestop-Foam-300x300.jpg",
  },
  {
    id: 2,
    code: "FM-SL-010",
    sku: "SKU-SL-010",
    name: "Metacaulk MC 150+",
    category: "Sellos y Spray",
    stock: 120,
    minStock: 40,
    location: "B1 - Rack B1",
    status: "Activo",
    docRef: "",
    imageUrl: "/img/products/Metacaulk-1200-Firestop-Sealant.png",
  },
  {
    id: 3,
    code: "FM-AC-005",
    sku: "SKU-AC-005",
    name: "Accesorio generico",
    category: "Accesorios",
    stock: 60,
    minStock: 20,
    location: "B2 - Rack C3",
    status: "Activo",
    docRef: "",
    imageUrl:
      "/img/products/Blaze-Foam-Intumescent-Compressible-Firestop-Foam-300x300.jpg",
  },
];

export const INITIAL_CATEGORIES = [
  "Sellos y Spray",
  "Grandes Pasadas",
  "Cintas / Wraps",
  "Accesorios",
];

export const INITIAL_ROLES = [
  { id: 1, name: "Dueno" },
  { id: 2, name: "Ejecutivo" },
  { id: 3, name: "Gerente" },
];
