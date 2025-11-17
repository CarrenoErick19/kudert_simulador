import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ALPHABETS = {
  EN: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  ES: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split(""),
};

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
  const [timeLeft, setTimeLeft] = useState(7);
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

  // --- GENERADORES DE PROBLEMAS (Modificados) ---
  const problemGenerators = {
    // ------- FÁCIL (Modificado: Paso mínimo es 2) -------
    simpleAsc: (alphabet) => {
      // ANTES: Math.floor(Math.random() * 2) + 1; (Daba 1 o 2)
      // AHORA: Math.floor(Math.random() * 2) + 2; (Da 2 o 3) -> Elimina paso +1
      const step = Math.floor(Math.random() * 2) + 2;
      const start = Math.floor(Math.random() * (alphabet.length - 10)); 
      const series = Array.from({ length: 5 }, (_, i) =>
        getLetter(start + i * step + 1, alphabet)
      );
      const answer = getLetter(start + 5 * step + 1, alphabet);
      return {
        series,
        answer,
        explanation: `Serie ascendente con paso +${step}.`,
      };
    },
    simpleDesc: (alphabet) => {
      // ANTES: Math.floor(Math.random() * 2) + 1;
      // AHORA: Math.floor(Math.random() * 2) + 2; -> Elimina paso -1
      const step = Math.floor(Math.random() * 2) + 2;
      const start = Math.floor(Math.random() * (alphabet.length - 6)) + 10;
      const series = Array.from({ length: 5 }, (_, i) =>
        getLetter(start - i * step, alphabet)
      );
      const answer = getLetter(start - 5 * step, alphabet);
      return {
        series,
        answer,
        explanation: `Serie descendente con paso -${step}.`,
      };
    },
    repeatPattern: (alphabet) => {
      // ANTES: Math.floor(Math.random() * 2) + 1;
      // AHORA: Math.floor(Math.random() * 2) + 2; -> Elimina incremento +1
      const step = Math.floor(Math.random() * 2) + 2;
      const start = Math.floor(Math.random() * (alphabet.length - 8));
      const letters = [];
      for (let i = 0; i < 5; i++) {
        const base = getLetter(start + Math.floor(i / 2) * step + 1, alphabet);
        letters.push(base);
      }
      const answer = getLetter(start + Math.ceil(5 / 2) * step + 1, alphabet);
      return {
        series: letters,
        answer,
        explanation: `Serie repetitiva por pares con incremento +${step}.`,
      };
    },

    // ------- MEDIO (Sin mirror) -------
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
    interleaved: (alphabet) => {
      const stepA = 2;
      const stepB = 3;
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
        explanation: "Serie intercalada con dos subseries distintas.",
      };
    },
    // mirror ELIMINADO COMPLETAMENTE

    // ------- DIFÍCIL -------
    doublePairs: (alphabet) => {
      const step = Math.floor(Math.random() * 3) + 1;
      let start = Math.floor(Math.random() * 10) + 1;
      const series = [];
      const visualPairs = [];
      for (let i = 0; i < 4; i++) {
        const first = getLetter(start, alphabet);
        const second = getLetter(start + step, alphabet);
        series.push(first + second);
        visualPairs.push(
          `${first}${second} = ${alphabet.indexOf(first) + 1};${
            alphabet.indexOf(second) + 1
          }`
        );
        start += step;
      }
      const answer =
        getLetter(start, alphabet) + getLetter(start + step, alphabet);
      return {
        series,
        answer,
        visualPairs,
        explanation: "Serie de pares con incremento doble.",
      };
    },
    descendingPairs: (alphabet) => {
      let idx = Math.floor(Math.random() * (alphabet.length - 10)) + 10;
      const series = [];
      const visualPairs = [];
      for (let i = 0; i < 4; i++) {
        const first = getLetter(idx - i * 2, alphabet);
        const second = getLetter(idx - i * 2 - 1, alphabet);
        series.push(first + second);
        visualPairs.push(
          `${first}${second} = ${alphabet.indexOf(first) + 1};${
            alphabet.indexOf(second) + 1
          }`
        );
      }
      const answer =
        getLetter(idx - 8, alphabet) + getLetter(idx - 9, alphabet);
      return {
        series,
        answer,
        visualPairs,
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

  // --- GENERAR NUEVO PROBLEMA (POOLS ACTUALIZADOS) ---
  const generateNewProblem = () => {
    const alphabet = ALPHABETS[alphabetType];
    let pool = [];
    let time = 6;
    let showVisuals = false;

    if (gameMode === "realistic") {
      const easy = ["simpleAsc", "simpleDesc", "repeatPattern"];
      // Se eliminó "mirror" de medium
      const medium = ["alternating", "interleaved"]; 
      const hard = ["doublePairs", "descendingPairs"];
      const rand = Math.random();
      if (rand < 0.2) pool = easy;
      else if (rand < 0.6) pool = medium;
      else pool = hard;
      time = 6;
      showVisuals = false;
    } else {
      switch (difficulty) {
        case "easy":
          pool = ["simpleAsc", "simpleDesc", "repeatPattern"];
          time = 10;
          showVisuals = true;
          break;
        case "medium":
          // Se eliminó "mirror"
          pool = ["alternating", "interleaved"];
          time = 8;
          showVisuals = true;
          break;
        case "hard":
          // Se eliminó "mirror"
          pool =
            Math.random() < 0.8
              ? ["doublePairs", "descendingPairs"]
              : ["alternating"];
          time = 6;
          showVisuals = true;
          break;
        case "expert":
          const rand = Math.random();
          if (rand < 0.2)
            pool = ["simpleAsc", "simpleDesc", "repeatPattern"];
          else if (rand < 0.6)
            // Se eliminó "mirror"
            pool = ["alternating", "interleaved"];
          else pool = ["doublePairs", "descendingPairs"];
          time = 6;
          showVisuals = true;
          break;
      }
    }

    const generator =
      problemGenerators[pool[Math.floor(Math.random() * pool.length)]];
    const problem = generator(alphabet);
    const options = generateOptions(problem.answer, alphabet);
    setCurrentProblem({
      ...problem,
      options,
      series: problem.series.join(", "),
      showVisuals,
    });
    setTimeLeft(time);
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
    if (currentQuestion + 1 >= totalQuestions) setScreen("end");
    else {
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
          <button
            onClick={() => navigate("/entrenamiento")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            🔤 Entrenamiento ABC
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
                  <option value="expert">Experto</option>
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
          <div className="text-xl mb-4">
            {currentProblem.series}
            {currentProblem.showVisuals && (
              <div className="text-sm text-gray-500 mt-2">
                {currentProblem.visualPairs
                  ? currentProblem.visualPairs.join(" | ")
                  : currentProblem.series
                      .split(",")
                      .map(
                        (l) =>
                          `${l.trim()} = ${
                            ALPHABETS[alphabetType].indexOf(l.trim()[0]) + 1
                          }`
                      )
                      .join(" | ")}
              </div>
            )}
          </div>

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

      {/* --- RESULTADO FINAL --- */}
      {screen === "end" && (
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-3">🎯 Resultado final</h2>
          <p className="text-lg mb-2">
            Puntaje: {score} / {totalQuestions}
          </p>
          <p className="text-lg mb-4 text-indigo-600 font-semibold">
            Porcentaje de aciertos:{" "}
            {((score / totalQuestions) * 100).toFixed(1)}%
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