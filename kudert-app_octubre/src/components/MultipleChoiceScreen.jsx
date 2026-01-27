// src/components/MultipleChoiceScreen.jsx
import React, { useState, useEffect, useCallback } from "react";
import Timer from "./Timer";
import ResultsScreen from "./ResultsScreen";
import { generateMultipleChoiceSet } from "../utils/sumasGenerators";

export default function MultipleChoiceScreen({ onBack, total }) {
  const TIME = 8;
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(TIME);
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total });

  const start = useCallback(() => {
    setQuestions(generateMultipleChoiceSet(total));
    setIndex(0);
    setTime(TIME);
    setActive(true);
    setStats({ correct: 0, incorrect: 0, total });
    setSelected(null);
    setFinished(false);
  }, [total]);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    if (!active || time <= 0) return;
    const timer = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [time, active]);

  useEffect(() => {
    if (time === 0 && active) handleTimeOut();
  }, [time, active]);

  const handleTimeOut = () => {
    setActive(false);
    setSelected("timeout");
    setStats((s) => ({ ...s, incorrect: s.incorrect + 1 }));
  };

  const answer = (opt) => {
    if (!active || time <= 0) return;
    setSelected(opt);
    setActive(false);
    const q = questions[index];
    const correct = opt === q.sum;
    setStats((s) => ({
      ...s,
      correct: correct ? s.correct + 1 : s.correct,
      incorrect: !correct ? s.incorrect + 1 : s.incorrect,
    }));
  };

  const next = () => {
    if (index + 1 >= total) return setFinished(true);
    setIndex((i) => i + 1);
    setTime(TIME);
    setActive(true);
    setSelected(null);
  };

  if (finished)
    return (
      <ResultsScreen stats={stats} onRestart={start} onGoToMenu={onBack} />
    );
  if (!questions.length) return <div className="text-white">Cargando...</div>;

  const q = questions[index];
  const isTimeout = selected === "timeout";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <div className="w-full flex justify-start mb-4">
        <button
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
        >
          ← Volver al Menú
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-2">Opción Múltiple</h2>
      <Timer timeLeft={time} />
      <div className="text-2xl font-mono mb-4 bg-black px-4 py-2 rounded">
        {q.nums.join(" + ")} = ?
      </div>

      <div className="flex flex-col gap-3">
        {q.options.map((opt) => {
          let className = "px-4 py-2 rounded text-white";
          if (selected !== null) {
            if (opt === q.sum) className += " bg-green-600";
            else if (opt === selected && !isTimeout) className += " bg-red-600";
            else className += " bg-gray-700";
          } else {
            className += " bg-gray-800 hover:bg-gray-700";
          }
          return (
            <button
              key={opt}
              onClick={() => answer(opt)}
              disabled={selected !== null}
              className={className}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="mt-2 text-lg">
          {isTimeout ? (
            <p className="text-red-400 font-bold">
              ¡Tiempo agotado! La respuesta correcta era {q.sum}
            </p>
          ) : selected === q.sum ? (
            <p className="text-green-400 font-bold">
              ¡Correcto! La respuesta es {q.sum}
            </p>
          ) : (
            <p className="text-red-400 font-bold">
              Incorrecto. La respuesta correcta es {q.sum}
            </p>
          )}
        </div>
      )}

      {selected !== null && (
        <button
          onClick={next}
          className="mt-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
        >
          Siguiente
        </button>
      )}
    </div>
  );
}
