// src/components/CorrectIncorrectScreen.jsx
import React, { useState, useEffect, useCallback } from "react";
import Timer from "./Timer";
import ResultsScreen from "./ResultsScreen";
import { generateCorrectIncorrectSet } from "../utils/sumasGenerators";

export default function CorrectIncorrectScreen({ onBack, total }) {
  const TIME = 8;
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(TIME);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState(null);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total });

  const start = useCallback(() => {
    setQuestions(generateCorrectIncorrectSet(total));
    setIndex(0);
    setTime(TIME);
    setActive(true);
    setStats({ correct: 0, incorrect: 0, total });
    setResult(null);
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
    const q = questions[index];
    setStats((s) => ({ ...s, incorrect: s.incorrect + 1 }));
    setResult({ correct: false, actual: q.proposed, timeout: true });
  };

  const answer = (choice) => {
    if (!active || time <= 0) return;
    setActive(false);
    const q = questions[index];
    const correct = choice === q.isCorrect;
    setStats((s) => ({
      ...s,
      correct: correct ? s.correct + 1 : s.correct,
      incorrect: !correct ? s.incorrect + 1 : s.incorrect,
    }));
    setResult({ correct, actual: q.proposed, timeout: false });
  };

  const next = () => {
    if (index + 1 >= total) return setFinished(true);
    setIndex((i) => i + 1);
    setTime(TIME);
    setActive(true);
    setResult(null);
  };

  if (finished)
    return (
      <ResultsScreen stats={stats} onRestart={start} onGoToMenu={onBack} />
    );
  if (!questions.length) return <div className="text-white">Cargando...</div>;

  const q = questions[index];

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

      <h2 className="text-2xl font-bold mb-2">Correcto / Incorrecto</h2>
      <Timer timeLeft={time} />
      <div className="text-2xl font-mono mb-4 bg-black px-4 py-2 rounded">
        {q.nums.join(" + ")} = {q.proposed}
      </div>

      {!result ? (
        <div className="flex gap-4">
          <button
            onClick={() => answer(true)}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
          >
            Correcto
          </button>
          <button
            onClick={() => answer(false)}
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
          >
            Incorrecto
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl">
            {result.timeout
              ? `¡Tiempo agotado! El resultado correcto era ${q.nums.reduce(
                  (a, b) => a + b,
                  0
                )}`
              : result.correct
              ? "¡Correcto!"
              : `Incorrecto. Resultado real: ${q.nums.reduce(
                  (a, b) => a + b,
                  0
                )}`}
          </p>
          <button
            onClick={next}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
