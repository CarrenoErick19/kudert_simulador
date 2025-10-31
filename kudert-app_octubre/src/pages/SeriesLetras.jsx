import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ALPHABETS = {
  EN: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  ES: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split(""),
};

const TIME_LIMIT = 7;

export default function SeriesLetras() {
  const navigate = useNavigate();

  // --- ESTADOS GENERALES ---
  const [screen, setScreen] = useState("modeSelection");
  const [gameMode, setGameMode] = useState("realistic");
  const [difficulty, setDifficulty] = useState("medium");
  const [alphabetType, setAlphabetType] = useState("ES");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const timerRef = useRef(null);
  const [questionsInput, setQuestionsInput] = useState(10);
  const [showInstructivo, setShowInstructivo] = useState(false);

  const instructivoUrl =
    "https://drive.google.com/file/d/10fDxIdMrBatwk4vXrOmLkHft6gvAnKXp/preview";

  // --- FUNCIONES AUXILIARES ---
  const getLetter = (index, alphabet) => {
    const len = alphabet.length;
    const adjusted = ((index - 1) % len + len) % len;
    return alphabet[adjusted];
  };

  // --- GENERADORES DE PROBLEMAS ---
  const problemGenerators = {
    // 🔹 Serie aritmética (ascendente)
    arithmetic: (alphabet) => {
      const step = Math.floor(Math.random() * 3) + 2;
      const start = Math.floor(Math.random() * (alphabet.length - step * 5));
      const series = Array.from({ length: 5 }, (_, i) =>
        getLetter(start + i * step + 1, alphabet)
      );
      const answer = getLetter(start + 5 * step + 1, alphabet);
      return {
        series,
        answer,
        explanation: `Serie aritmética con salto +${step}.`,
      };
    },

    // 🔹 Serie decreciente
    decreasing: (alphabet) => {
      const step = Math.floor(Math.random() * 3) + 2;
      const start = Math.floor(Math.random() * (alphabet.length - 5)) + 6;
      const series = Array.from({ length: 5 }, (_, i) =>
        getLetter(start - i * step, alphabet)
      );
      const answer = getLetter(start - 5 * step, alphabet);
      return {
        series,
        answer,
        explanation: `Serie decreciente con salto -${step}.`,
      };
    },

    // 🔹 Serie alternante (+a, +b)
    alternating: (alphabet) => {
      const step1 = Math.floor(Math.random() * 2) + 2;
      const step2 = Math.floor(Math.random() * 2) + 3;
      let idx = Math.floor(Math.random() * 10) + 1;
      const series = [];
      for (let i = 0; i < 5; i++) {
        series.push(getLetter(idx, alphabet));
        idx += i % 2 === 0 ? step1 : step2;
      }
      const answer = getLetter(idx, alphabet);
      return {
        series,
        answer,
        explanation: `Serie alternante (+${step1}, +${step2}).`,
      };
    },

    // 🔹 Incremento variable (+1, +2, +3...)
    variableIncrement: (alphabet) => {
      let idx = Math.floor(Math.random() * 10) + 1;
      const series = [];
      for (let i = 0; i < 5; i++) {
        series.push(getLetter(idx, alphabet));
        idx += i + 1;
      }
      const answer = getLetter(idx, alphabet);
      return {
        series,
        answer,
        explanation: "Serie con incremento variable (+1, +2, +3...).",
      };
    },

    // 🔹 Serie intercalada (dos subseries alternas)
    interleavedSeries: (alphabet) => {
      const stepA = Math.floor(Math.random() * 2) + 2;
      const stepB = Math.floor(Math.random() * 2) + 2;
      let startA = Math.floor(Math.random() * 10) + 1;
      let startB = Math.floor(Math.random() * 10) + 1;
      const series = [];
      for (let i = 0; i < 6; i++) {
        if (i % 2 === 0) {
          series.push(getLetter(startA, alphabet));
          startA += stepA;
        } else {
          series.push(getLetter(startB, alphabet));
          startB += stepB;
        }
      }
      const answer =
        series.length % 2 === 0
          ? getLetter(startA, alphabet)
          : getLetter(startB, alphabet);
      return {
        series,
        answer,
        explanation: `Serie intercalada con dos subseries (+${stepA}, +${stepB}).`,
      };
    },

    // 🔹 Serie doble (dos letras en paralelo)
    pairedSeries: (alphabet) => {
      const step1 = Math.floor(Math.random() * 3) + 2;
      const step2 = Math.floor(Math.random() * 3) + 2;
      let start1 = Math.floor(Math.random() * 10) + 1;
      let start2 = Math.floor(Math.random() * 10) + 1;
      const series = [];
      for (let i = 0; i < 3; i++) {
        series.push(
          getLetter(start1, alphabet) + getLetter(start2, alphabet)
        );
        start1 += step1;
        start2 += step2;
      }
      const answer =
        getLetter(start1, alphabet) + getLetter(start2, alphabet);
      return {
        series,
        answer,
        explanation: `Serie doble con dos subseries paralelas.`,
      };
    },

    // 🔹 Serie descendente en pares
    descendingPairs: (alphabet) => {
      let idx = Math.floor(Math.random() * (alphabet.length - 10)) + 10;
      const series = [];
      for (let i = 0; i < 4; i++) {
        const first = getLetter(idx - i * 2, alphabet);
        const second = getLetter(idx - i * 2 - 1, alphabet);
        series.push(first + second);
      }
      const answer =
        getLetter(idx - 8, alphabet) + getLetter(idx - 9, alphabet);
      return {
        series,
        answer,
        explanation: "Serie descendente en pares consecutivos.",
      };
    },
  };

  // --- GENERACIÓN DE OPCIONES ---
  const generateOptions = (correct, alphabet) => {
    const options = new Set([correct]);
    const paired = correct.length > 1;
    while (options.size < 4) {
      let opt = "";
      if (paired) {
        opt =
          getLetter(Math.floor(Math.random() * alphabet.length) + 1, alphabet) +
          getLetter(Math.floor(Math.random() * alphabet.length) + 1, alphabet);
      } else {
        opt = getLetter(
          Math.floor(Math.random() * alphabet.length) + 1,
          alphabet
        );
      }
      options.add(opt);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  // --- GENERAR NUEVO PROBLEMA SEGÚN DIFICULTAD ---
  const generateNewProblem = () => {
    const alphabet = ALPHABETS[alphabetType];
    let availableGenerators = [];

    if (gameMode === "realistic") {
      availableGenerators = Object.keys(problemGenerators);
    } else {
      if (difficulty === "easy")
        availableGenerators = ["arithmetic", "decreasing"];
      else if (difficulty === "medium")
        availableGenerators = ["alternating", "variableIncrement", "interleavedSeries"];
      else
        availableGenerators = ["pairedSeries", "descendingPairs"];
    }

    const randomKey =
      availableGenerators[
        Math.floor(Math.random() * availableGenerators.length)
      ];

    const problem = problemGenerators[randomKey](alphabet);
    const options = generateOptions(problem.answer, alphabet);
    setCurrentProblem({
      ...problem,
      options,
      series: problem.series.join(", "),
    });

    setTimeLeft(TIME_LIMIT);
    setFeedback("");
    setFeedbackColor("");
    setShowNext(false);
    setShowExplanation(false);
  };

  // --- TEMPORIZADOR ---
  useEffect(() => {
    if (screen === "game" && currentProblem) {
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
    }
    return () => clearInterval(timerRef.current);
  }, [currentProblem, screen]);

  // --- RESPUESTA ---
  const handleAnswer = (option) => {
    clearInterval(timerRef.current);
    if (!currentProblem) return;

    const correct = option === currentProblem.answer;

    if (correct) {
      setScore((s) => s + 1);
      setFeedback("✅ ¡Correcto!");
      setFeedbackColor("text-green-600");
    } else {
      setFeedback(
        option === null
          ? `⏱ Tiempo agotado. Respuesta: ${currentProblem.answer}`
          : `❌ Incorrecto. Respuesta: ${currentProblem.answer}`
      );
      setFeedbackColor("text-red-600");
    }

    if (gameMode === "practice") setShowExplanation(true);
    setShowNext(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= totalQuestions) {
      setScreen("end");
    } else {
      setCurrentQuestion((q) => q + 1);
      generateNewProblem();
    }
  };

  const startGame = () => {
    setTotalQuestions(Number(questionsInput) || 10);
    setScore(0);
    setCurrentQuestion(0);
    setScreen("game");
    generateNewProblem();
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
      <h1 className="text-2xl font-bold mb-6">🧩 Series de Letras</h1>
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-4"
      >
        Volver
      </button>

      {/* --- SELECCIÓN DE MODO --- */}
      {screen === "modeSelection" && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => {
              setGameMode("practice");
              setScreen("settings");
            }}
            className="bg-sky-500 text-white px-6 py-4 rounded-lg"
          >
            🧠 Modo Práctica
          </button>
          <button
            onClick={() => {
              setGameMode("realistic");
              setScreen("settings");
            }}
            className="bg-indigo-600 text-white px-6 py-4 rounded-lg"
          >
            ⏱️ Modo Realista
          </button>
          <button
            onClick={() => setShowInstructivo(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg mt-2"
          >
            📘 Instructivo
          </button>
        </div>
      )}

      {/* --- MODAL INSTRUCTIVO --- */}
      {showInstructivo && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 h-4/5 rounded shadow-lg flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Instructivo Series de Letras</h2>
              <button
                onClick={() => setShowInstructivo(false)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg"
              >
                Cerrar
              </button>
            </div>
            <iframe src={instructivoUrl} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* --- CONFIGURACIÓN --- */}
      {screen === "settings" && (
        <div className="flex flex-col items-center gap-3">
          {gameMode === "practice" && (
            <>
              <div>
                <label className="mr-2 font-semibold">Dificultad:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Media</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>
              <div>
                <label className="mr-2 font-semibold">Alfabeto:</label>
                <select
                  value={alphabetType}
                  onChange={(e) => setAlphabetType(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="ES">Español</option>
                  <option value="EN">Inglés</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="mr-2 font-semibold">Preguntas:</label>
            <input
              type="number"
              value={questionsInput}
              onChange={(e) => setQuestionsInput(e.target.value)}
              className="w-20 text-center border p-2 rounded"
            />
          </div>
          <button
            onClick={startGame}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg mt-2"
          >
            Comenzar
          </button>
        </div>
      )}

      {/* --- PANTALLA DE JUEGO --- */}
      {screen === "game" && currentProblem && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl text-center">
          <div className="text-xl mb-4">{currentProblem.series}</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {currentProblem.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="text-lg mb-2">⏳ Tiempo: {timeLeft}s</div>
          {showExplanation && (
            <div className="text-slate-700 mb-2">
              {currentProblem.explanation}
            </div>
          )}
          {showNext && (
            <button
              onClick={nextQuestion}
              className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2"
            >
              Siguiente
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

      {/* --- PANTALLA FINAL --- */}
      {screen === "end" && (
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-3">🎯 Resultado final</h2>
          <p className="text-lg mb-4">
            Tu puntaje: {score} / {totalQuestions}
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
