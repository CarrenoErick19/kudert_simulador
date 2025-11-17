import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ALPHABETS = {
  EN: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  ES: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split(""),
};

// Función para mezclar un array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function Entrenamiento() {
  const navigate = useNavigate();
  const [alphabetType, setAlphabetType] = useState("ES");
  const [mode, setMode] = useState("letterToNumber");
  const [screen, setScreen] = useState("settings");
  const [shuffledIndices, setShuffledIndices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6);
  const [showNext, setShowNext] = useState(false);
  const timerRef = useRef(null);
  const answeredRef = useRef(false);

  // --- Generar opciones cercanas a la correcta ---
  const generateCloseNumbers = (correct, max) => {
    const numbers = new Set([correct]);
    while (numbers.size < 4) {
      // Variación aleatoria de -3 a +3
      const offset = Math.floor(Math.random() * 7) - 3;
      const value = correct + offset;
      if (value > 0 && value <= max) numbers.add(value);
    }
    return Array.from(numbers).sort(() => Math.random() - 0.5);
  };

  const generateCloseLetters = (correctIndex, alphabet) => {
    const letters = new Set([alphabet[correctIndex]]);
    while (letters.size < 4) {
      // Variación de ±3 posiciones
      const offset = Math.floor(Math.random() * 7) - 3;
      const newIndex = correctIndex + offset;
      if (newIndex >= 0 && newIndex < alphabet.length)
        letters.add(alphabet[newIndex]);
    }
    return Array.from(letters).sort(() => Math.random() - 0.5);
  };

  // --- Generar opciones según el modo ---
  const generateOptions = (correctIndex, alphabet) => {
    if (mode === "letterToNumber") {
      const correctNumber = correctIndex + 1;
      return generateCloseNumbers(correctNumber, alphabet.length);
    } else {
      return generateCloseLetters(correctIndex, alphabet);
    }
  };

  // --- Generar nueva pregunta ---
  const generateQuestion = () => {
    const alphabet = ALPHABETS[alphabetType];
    const index = shuffledIndices[currentIndex];

    const correctLetter = alphabet[index];
    const correctNumber = index + 1;

    const question = mode === "letterToNumber" ? correctLetter : correctNumber;
    const answer = mode === "letterToNumber" ? correctNumber : correctLetter;

    const opts = generateOptions(index, alphabet);

    setCurrent({ question, answer });
    setOptions(opts);
    setFeedback("");
    setShowNext(false);
    answeredRef.current = false;
    setTimeLeft(6);
  };

  // --- Iniciar temporizador ---
  useEffect(() => {
    if (!current) return;
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
  }, [current]);

  // --- Manejar respuesta ---
  const handleAnswer = (selected) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearInterval(timerRef.current);

    const correct = selected === current.answer;
    if (correct) {
      setFeedback("✅ ¡Correcto!");
      setScore((s) => s + 1);
    } else {
      setFeedback(
        selected === null
          ? `⏱ Tiempo agotado. Era ${current.answer}`
          : `❌ Incorrecto. Era ${current.answer}`
      );
    }
    setTotal((t) => t + 1);
    setShowNext(true);
  };

  // --- Pasar a la siguiente pregunta ---
  const nextQuestion = () => {
    if (currentIndex + 1 < shuffledIndices.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setFeedback("🎉 ¡Has completado todas las letras del alfabeto!");
      clearInterval(timerRef.current);
      setShowNext(false);
    }
  };

  // --- Iniciar entrenamiento ---
  const startTraining = () => {
    const alphabet = ALPHABETS[alphabetType];
    const indices = Array.from({ length: alphabet.length }, (_, i) => i);
    const shuffled = shuffleArray(indices);

    setShuffledIndices(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setTotal(0);
    setScreen("training");
  };

  // --- Cargar la primera pregunta ---
  useEffect(() => {
    if (screen === "training" && shuffledIndices.length > 0) {
      generateQuestion();
    }
  }, [screen, shuffledIndices, currentIndex]);

  // --- INTERFAZ ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
      <h1 className="text-2xl font-bold mb-4">🔤 Entrenamiento ABC</h1>

      <button
        onClick={() => navigate(-1)}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-4"
      >
        Volver
      </button>

      {/* --- PANTALLA DE CONFIGURACIÓN --- */}
      {screen === "settings" && (
        <div className="flex flex-col items-center gap-4">
          <div>
            <label className="mr-2 font-semibold">Alfabeto:</label>
            <select
              value={alphabetType}
              onChange={(e) => setAlphabetType(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="ES">Español (con Ñ)</option>
              <option value="EN">Inglés</option>
            </select>
          </div>

          <div>
            <label className="mr-2 font-semibold">Modo:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="letterToNumber">Letra → Número</option>
              <option value="numberToLetter">Número → Letra</option>
            </select>
          </div>

          <button
            onClick={startTraining}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            Iniciar Entrenamiento
          </button>
        </div>
      )}

      {/* --- PANTALLA DE ENTRENAMIENTO --- */}
      {screen === "training" && current && (
        <div className="bg-white p-6 rounded-xl shadow-lg text-center w-full max-w-md">
          <h2 className="text-3xl font-bold mb-4">{current.question}</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={answeredRef.current}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="text-lg mb-2">⏳ Tiempo: {timeLeft}s</div>
          <div className="text-lg font-bold mt-3">{feedback}</div>
          <p className="mt-2 text-gray-600">
            Aciertos: {score} / {total}
          </p>

          {showNext && (
            <button
              onClick={nextQuestion}
              className="bg-green-600 text-white px-4 py-2 rounded-lg mt-4"
            >
              Siguiente
            </button>
          )}
        </div>
      )}
    </div>
  );
}
