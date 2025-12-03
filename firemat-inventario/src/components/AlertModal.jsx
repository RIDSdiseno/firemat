// src/components/AlertModal.jsx

function AlertModal({ open, title = "Aviso", message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 text-neutral-100 rounded-xl shadow-xl w-full max-w-sm p-5">
        <h2 className="text-lg font-semibold mb-2 text-white">
          {title}
        </h2>
        <p className="text-sm text-neutral-200 mb-4 whitespace-pre-line">
          {message}
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
