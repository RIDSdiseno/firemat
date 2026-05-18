import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const idRef = useRef(`qr-reader-${Math.random().toString(36).slice(2)}`);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  const [error, setError] = useState(null);

  useEffect(() => {
    onScanRef.current = onScan;
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    let isMounted = true;
    const scanner = new Html5Qrcode(idRef.current);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().then(() => {
            if (!isMounted) return;
            onScanRef.current(decodedText);
            onCloseRef.current();
          }).catch(() => {});
        },
        () => {}
      )
      .catch(() => {
        if (isMounted) setError("No se pudo acceder a la cámara. Verifica los permisos.");
      });

    return () => {
      isMounted = false;
      if (scanner.isRunning()) scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Escanear código QR</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-md bg-neutral-200 hover:bg-neutral-300"
          >
            Cerrar
          </button>
        </div>

        {error ? (
          <p className="text-sm text-red-600 text-center py-4">{error}</p>
        ) : (
          <div id={idRef.current} className="w-full rounded-lg overflow-hidden" />
        )}

        <p className="text-xs text-neutral-500 text-center mt-3">
          Apunta la cámara al código QR del producto
        </p>
      </div>
    </div>
  );
}

export default QRScanner;
