// src/components/ResultsScreen.jsx
import React from "react";

export default function ResultsScreen({ stats, onRestart, onGoToMenu }) {
  const percentage = ((stats.correct / stats.total) * 100).toFixed(0);
  const message =
    percentage === "100"
      ? "¡Perfecto!"
      : percentage >= 80
      ? "¡Excelente trabajo!"
      : percentage >= 60
      ? "¡Buen intento!"
      : "¡Sigue practicando!";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-2">Sesión Completada</h2>
      <p className="text-xl mb-4">
        {stats.correct} / {stats.total} correctas
      </p>
      <p className="text-lg mb-6">{message}</p>
      <div className="flex flex-col gap-3">
        <button
          onClick={onRestart}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
        >
          Volver a Jugar
        </button>
        <button
          onClick={onGoToMenu}
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Ir al Menú
        </button>
      </div>
    </div>
  );
}
