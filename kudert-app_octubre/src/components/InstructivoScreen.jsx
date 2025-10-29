// src/components/InstructivoScreen.jsx
import React from "react";

export default function InstructivoModal({ visible, onClose }) {
  if (!visible) return null; // Si no está visible, no renderiza nada

  const pdfUrl =
    "https://drive.google.com/file/d/1GHuEhRRr1sJaJVCAgEq91mdrI-H-cNne/preview"; // enlace de Google Drive en modo preview

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 h-4/5 rounded shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Instructivo</h2>
          <button
            onClick={onClose}
            className="text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded"
          >
            X
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="Instructivo"
          ></iframe>
        </div>

        {/* Botón de respaldo */}
        <div className="p-4 text-center border-t">
          <a
            href="https://drive.google.com/file/d/1GHuEhRRr1sJaJVCAgEq91mdrI-H-cNne/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white"
          >
            Abrir en otra pestaña
          </a>
        </div>
      </div>
    </div>
  );
}
