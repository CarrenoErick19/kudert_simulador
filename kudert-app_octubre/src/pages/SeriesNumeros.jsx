import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// --- Configuración de tiempos por dificultad ---
const TIME_LIMITS = {
  easy: 12,
  medium: 8,
  hard: 6,
};

// --- Funciones auxiliares ---
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Generadores de problemas ---
const problemGenerators = {
  // ✅ Serie de repetición tipo examen Kudert
  repeticion: () => {
    const ascending = Math.random() > 0.5; // Ascendente o descendente
    const start = ascending ? getRandomInt(2, 4) : getRandomInt(5, 9);
    const end = ascending ? start + getRandomInt(2, 3) : start - getRandomInt(2, 3);
    const series = [];

    if (ascending) {
      for (let i = start; i <= end; i++) {
        series.push(String(i).repeat(i - start + 1));
      }
      const answer = String(end + 1).repeat(end - start + 2);
      return {
        series,
        answer,
        explanation:
          "Serie de repetición ascendente: cada número se repite una vez más que el anterior.",
        difficulty: "easy",
      };
    } else {
      for (let i = start; i >= end; i--) {
        series.push(String(i).repeat(start - i + 1));
      }
      const answer = String(end - 1).repeat(start - end + 2);
      return {
        series,
        answer,
        explanation:
          "Serie de repetición descendente: cada número se repite una vez más que el anterior en orden descendente.",
        difficulty: "easy",
      };
    }
  },

  // ✅ Serie aritmética tipo examen Kudert
  aritmetica: () => {
    const type = randomFrom(["constante", "decreciente", "variable"]);
    let series = [];
    let answer = 0;
    let explanation = "";

    if (type === "constante") {
      const start = getRandomInt(5, 20);
      const step = getRandomInt(3, 10);
      series = Array.from({ length: 6 }, (_, i) => start + i * step);
      answer = start + 6 * step;
      explanation = `Serie aritmética con razón constante +${step}.`;
    } else if (type === "decreciente") {
      const start = getRandomInt(100, 150);
      const step = -getRandomInt(10, 20);
      series = Array.from({ length: 4 }, (_, i) => start + i * step);
      answer = start + 4 * step;
      explanation = `Serie aritmética decreciente con razón ${step}.`;
    } else {
      const start = getRandomInt(40, 70);
      series = [start];
      let diff = 1;
      for (let i = 1; i < 6; i++) {
        series.push(series[i - 1] - diff);
        diff++;
      }
      answer = series[series.length - 1] - diff;
      explanation =
        "Serie aritmética variable: el número restado aumenta progresivamente (-1, -2, -3...).";
    }

    return { series, answer, explanation, difficulty: "easy" };
  },

  // 🔸 Serie geométrica
  geometrica: () => {
    const start = getRandomInt(2, 4);
    const ratio = getRandomInt(2, 3);
    const series = Array.from({ length: 6 }, (_, i) => start * ratio ** i);
    const answer = start * ratio ** 6;
    return {
      series,
      answer,
      explanation: `Serie geométrica: cada término se multiplica por ${ratio}.`,
      difficulty: "medium",
    };
  },

  // 🔸 Serie alternante
  alternante: () => {
    const base1 = getRandomInt(1, 10);
    const base2 = base1 + getRandomInt(2, 5);
    const step1 = getRandomInt(1, 3);
    const step2 = getRandomInt(1, 3);
    const series = [];

    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) series.push(base1 + Math.floor(i / 2) * step1);
      else series.push(base2 + Math.floor(i / 2) * step2);
    }

    const answer =
      series.length % 2 === 0
        ? base1 + (series.length / 2) * step1
        : base2 + Math.floor(series.length / 2) * step2;

    return {
      series,
      answer,
      explanation: `Serie alternante: alterna entre +${step1} y +${step2}.`,
      difficulty: "medium",
    };
  },

  // 🔹 Serie especial (Fibonacci)
  especial: () => {
    const a = getRandomInt(1, 5);
    const b = getRandomInt(2, 8);
    const mod = Math.random() > 0.5 ? getRandomInt(1, 2) : 0;
    const series = [a, b];
    for (let i = 2; i < 6; i++) series.push(series[i - 1] + series[i - 2] + mod);
    const answer = series[series.length - 1] + series[series.length - 2] + mod;
    return {
      series,
      answer,
      explanation:
        mod > 0
          ? `Serie tipo Fibonacci con incremento fijo +${mod}.`
          : "Serie de Fibonacci pura.",
      difficulty: "hard",
    };
  },

  // 🔹 Serie mixta (letra-número)
  mixta: () => {
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
    const start = getRandomInt(1, 10);
    const step = getRandomInt(1, 3);
    const startLetter = getRandomInt(0, letras.length - 10);
    const series = [];

    for (let i = 0; i < 5; i++) {
      series.push(`${letras[startLetter + i * step]}${start + i}`);
    }

    const answer = `${letras[startLetter + 5 * step]}${start + 5}`;
    return {
      series,
      answer,
      explanation:
        "Serie mixta letra-número: las letras avanzan con salto fijo y los números suben de uno en uno.",
      difficulty: "hard",
    };
  },
};

// --- Generador de opciones ---
const generateOptions = (correct) => {
  if (isNaN(correct)) {
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
    const options = new Set([correct]);
    while (options.size < 4) {
      const idx = letras.indexOf(correct[0].toUpperCase());
      const rand = letras[getRandomInt(Math.max(0, idx - 3), Math.min(idx + 3, letras.length - 1))];
      options.add(rand);
    }
    return shuffleArray([...options]);
  }
  const options = new Set([correct]);
  while (options.size < 4) {
    const deviation = getRandomInt(1, 10);
    const trap = Math.random() > 0.5 ? correct + deviation : correct - deviation;
    if (trap > 0) options.add(trap);
  }
  return shuffleArray([...options]);
};

// --- Componente principal ---
export default function SeriesNumeros() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("modeSelection");
  const [gameMode, setGameMode] = useState("practice");
  const [difficulty, setDifficulty] = useState("medium");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [explanation, setExplanation] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("");
  const [timeLeft, setTimeLeft] = useState(7);
  const [showNext, setShowNext] = useState(false);
  const [questionsInput, setQuestionsInput] = useState(10);
  const timerRef = useRef(null);
  const answeredRef = useRef(false);

  // --- Selección según modo ---
  const getAvailableTypes = () => {
    if (gameMode === "realistic") {
      // Distribución 30/40/30 (fácil/intermedio/difícil)
      const roll = Math.random() * 100;
      if (roll < 30) return randomFrom(["repeticion", "aritmetica"]);
      else if (roll < 70) return randomFrom(["geometrica", "alternante"]);
      else return randomFrom(["especial", "mixta"]);
    } else {
      if (difficulty === "easy") {
        return Math.random() < 0.4 ? "repeticion" : "aritmetica";
      } else if (difficulty === "medium") {
        return randomFrom(["geometrica", "alternante"]);
      } else {
        return randomFrom(["especial", "mixta"]);
      }
    }
  };

  const generateProblem = () => {
    const key = getAvailableTypes();
    const generated = problemGenerators[key]();
    const options = generateOptions(generated.answer);
    setProblem({ ...generated, options });
    setFeedback("");
    setFeedbackColor("");
    setExplanation("");
    setShowNext(false);
    setTimeLeft(TIME_LIMITS[generated.difficulty]);
    answeredRef.current = false;
  };

  // --- Timer ---
  useEffect(() => {
    if (!problem || screen !== "game") return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [problem, screen]);

  // --- Evaluar respuesta ---
  const handleAnswer = (selected) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearInterval(timerRef.current);

    const correct = selected === problem.answer;
    if (correct) {
      setScore((s) => s + 1);
      setFeedback("✅ ¡Correcto!");
      setFeedbackColor("text-green-600");
    } else {
      setFeedback(
        selected === null
          ? `⏱ Tiempo agotado. Era ${problem.answer}`
          : `❌ Incorrecto. Era ${problem.answer}`
      );
      setFeedbackColor("text-red-600");
    }

    if (gameMode === "practice") setExplanation(problem.explanation);
    setShowNext(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= totalQuestions) setScreen("end");
    else {
      setCurrentQuestion((q) => q + 1);
      generateProblem();
    }
  };

  const startGame = () => {
    setScore(0);
    setCurrentQuestion(0);
    setTotalQuestions(Number(questionsInput));
    setScreen("game");
    generateProblem();
  };

  // --- Render ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <h1 className="text-2xl font-bold mb-6">🔢 Series Numéricas</h1>
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-4"
      >
        Volver
      </button>

      {/* Selección de modo */}
      {screen === "modeSelection" && (
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={() => {
              setGameMode("practice");
              setScreen("settings");
            }}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg"
          >
            🧠 Modo Práctica
          </button>
          <button
            onClick={() => {
              setGameMode("realistic");
              setScreen("settings");
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
          >
            ⏱️ Modo Realista
          </button>
        </div>
      )}

      {/* Configuración */}
      {screen === "settings" && (
        <div className="flex flex-col items-center gap-3">
          {gameMode === "practice" && (
            <>
              <label className="font-semibold">Dificultad:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Intermedio</option>
                <option value="hard">Difícil</option>
              </select>
            </>
          )}
          <label className="font-semibold">Preguntas:</label>
          <input
            type="number"
            value={questionsInput}
            onChange={(e) => setQuestionsInput(e.target.value)}
            className="border p-2 rounded text-center w-20"
          />
          <button
            onClick={startGame}
            className="bg-green-600 text-white px-6 py-2 rounded-lg mt-2"
          >
            Comenzar
          </button>
        </div>
      )}

      {/* Juego */}
      {screen === "game" && problem && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl text-center">
          <div className="text-xl mb-4 font-semibold">
            {problem.series.join(" - ")} - ¿?
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {problem.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={showNext}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="text-lg mb-2">⏳ Tiempo: {timeLeft}s</div>
          {explanation && (
            <div className="text-slate-700 bg-slate-100 p-3 rounded mb-2">
              {explanation}
            </div>
          )}

          {showNext && (
            <button
              onClick={nextQuestion}
              className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2"
            >
              {currentQuestion + 1 >= totalQuestions ? "Ver resultados" : "Siguiente"}
            </button>
          )}

          <div className={`text-lg font-bold mt-3 ${feedbackColor}`}>
            {feedback}
          </div>

          <div className="text-slate-700 mt-2">
            Pregunta {currentQuestion + 1} / {totalQuestions}
          </div>
        </div>
      )}

      {/* Pantalla final */}
      {screen === "end" && (
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-3">🎯 Resultado final</h2>
          <p className="text-lg mb-2">
            Puntaje: {score} / {totalQuestions}
          </p>
          <p className="text-lg text-indigo-600 font-semibold mb-4">
            Porcentaje de aciertos: {((score / totalQuestions) * 100).toFixed(1)}%
          </p>
          <button
            onClick={() => setScreen("modeSelection")}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Volver al menú
          </button>
        </div>
      )}
    </div>
  );
}
