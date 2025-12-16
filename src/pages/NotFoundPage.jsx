// src/pages/NotFoundPage.jsx
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-sm text-neutral-500 mb-4">
        La página que estás intentando acceder no existe.
      </p>
      <Link
        to="/"
        className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default NotFoundPage;
