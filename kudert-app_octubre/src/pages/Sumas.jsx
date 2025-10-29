// src/pages/Sumas.jsx
import React, { useState } from "react";
import CorrectIncorrectScreen from "../components/CorrectIncorrectScreen";
import MultipleChoiceScreen from "../components/MultipleChoiceScreen";
import InstructivoModal from "../components/InstructivoScreen";

const MenuScreen = ({ onSelectMode, totalQuestions, setTotalQuestions }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white gap-4">
    <h1 className="text-3xl font-bold">Entrenador de Sumas</h1>
    <input
      type="number"
      min="1"
      max="50"
      value={totalQuestions}
      onChange={(e) => setTotalQuestions(Number(e.target.value))}
      className="bg-gray-800 text-white px-3 py-2 rounded text-center"
      placeholder="Cantidad de ejercicios"
    />
    <div className="flex gap-4">
      <button
        onClick={() => onSelectMode("correct-incorrect")}
        className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
      >
        Correcto / Incorrecto
      </button>
      <button
        onClick={() => onSelectMode("multiple-choice")}
        className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded"
      >
        Opción Múltiple
      </button>
    </div>
    <button
      onClick={() => onSelectMode("instructivo")}
      className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded mt-4"
    >
      Ver Instructivo
    </button>
  </div>
);

export default function Sumas() {
  const [mode, setMode] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [showInstructivo, setShowInstructivo] = useState(false);

  const onSelectMode = (selectedMode) => {
    if (selectedMode === "instructivo") {
      setShowInstructivo(true);
    } else {
      setMode(selectedMode);
    }
  };

  const onGoToMenu = () => setMode(null);

  return (
    <>
      {/* Pantallas principales */}
      {!mode && (
        <MenuScreen
          onSelectMode={onSelectMode}
          totalQuestions={totalQuestions}
          setTotalQuestions={setTotalQuestions}
        />
      )}
      {mode === "correct-incorrect" && (
        <CorrectIncorrectScreen onBack={onGoToMenu} total={totalQuestions} />
      )}
      {mode === "multiple-choice" && (
        <MultipleChoiceScreen onBack={onGoToMenu} total={totalQuestions} />
      )}

      {/* Modal instructivo */}
      <InstructivoModal
        visible={showInstructivo}
        onClose={() => setShowInstructivo(false)}
      />
    </>
  );
}
