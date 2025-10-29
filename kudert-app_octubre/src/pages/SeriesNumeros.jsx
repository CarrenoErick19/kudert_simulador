import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TIME_LIMIT = 7;

// -------- FUNCIONES AUXILIARES -------- //
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// -------- GENERADORES DE SERIES -------- //
const problemGenerators = {
  // 1️⃣ Serie de repetición (10%)
  repeticion: () => {
    const num = getRandomInt(2, 9);
    const series = Array(6).fill(num);
    const answer = num;
    return {
      series,
      answer,
      explanation: "Serie de repetición: todos los términos son iguales.",
    };
  },

  // 2️⃣ Serie geométrica (20%)
  geometrica: () => {
    const start = getRandomInt(2, 6);
    const ratio = getRandomInt(2, 3);
    const series = Array.from({ length: 6 }, (_, i) => start * ratio ** i);
    const answer = start * ratio ** 6;
    return {
      series,
      answer,
      explanation: `Serie geométrica: cada término se multiplica por ${ratio}.`,
    };
  },

  // 3️⃣ Serie alternante (30%)
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
    };
  },

  // 4️⃣ Serie especial (10%) — tipo Fibonacci o con variación
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
          : "Serie de Fibonacci pura: cada término es la suma de los dos anteriores.",
    };
  },

  // 5️⃣ Serie mixta (30%) — ahora realista tipo Kudert
  mixta: () => {
    const type = getRandomInt(1, 3);
    let series = [];
    let answer = "";
    let explanation = "";

    if (type === 1) {
      // Ejemplo: C4 F5 I6 L7 → O
      const letras = ["C", "F", "I", "L"];
      const numeros = [4, 5, 6, 7];
      for (let i = 0; i < letras.length; i++) {
        series.push(letras[i]);
        series.push(numeros[i]);
      }
      answer = "O";
      explanation =
        "Serie mixta que alterna letra y número. Las letras avanzan +3 posiciones en el alfabeto (C→F→I→L→O).";
    } else if (type === 2) {
      // Ejemplo: 2 b 4 e e 6 h h h 8 k k k → kkkk
      series = ["2", "b", "4", "e", "e", "6", "h", "h", "h", "8", "k", "k", "k"];
      answer = "kkkk";
      explanation =
        "Serie que alterna número ascendente con letras repetidas. Cada bloque repite una vez más la letra que el anterior.";
    } else {
      // Ejemplo: d d f 1 2 h h j 1 2 → L
      series = ["d", "d", "f", "1", "2", "h", "h", "j", "1", "2"];
      answer = "L";
      explanation =
        "Serie mixta con patrón doble: las letras avanzan saltando una (d→f→h→j→L) y los números se repiten como 1,2.";
    }

    return { series, answer, explanation };
  },
};

// -------- GENERADOR DE OPCIONES -------- //
const generateOptions = (correct) => {
  // Si la respuesta es letra o cadena, se generan distractores similares
  if (isNaN(correct)) {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const options = new Set([correct]);
    while (options.size < 4) {
      const baseIndex = letras.indexOf(correct[0].toUpperCase());
      const randomOffset = getRandomInt(-2, 2);
      const char = letras[Math.max(0, Math.min(25, baseIndex + randomOffset))];
      options.add(char.repeat(correct.length));
    }
    return shuffleArray([...options]);
  }

  // Caso numérico tradicional
  const options = new Set([correct]);
  while (options.size < 4) {
    const deviation = getRandomInt(10, 50);
    const trap = Math.random() > 0.5 ? correct + deviation : correct - deviation;
    if (trap > 0) options.add(trap);
  }
  return shuffleArray([...options]);
};

// -------- COMPONENTE PRINCIPAL -------- //
export default function SeriesNumeros() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("modeSelection");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [questionsNumberInput, setQuestionsNumberInput] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [explanation, setExplanation] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [showNext, setShowNext] = useState(false);
  const [showInstructivo, setShowInstructivo] = useState(false);

  const timerRef = useRef(null);
  const answeredRef = useRef(false);
  const lastProblemsRef = useRef([]);

  const instructivoUrl =
    "https://drive.google.com/file/d/1Nf4iN5RSr2yGhpM2IlJc995VGDw7x2IY/preview";
  const instructivoBackupUrl =
    "https://drive.google.com/file/d/1Nf4iN5RSr2yGhpM2IlJc995VGDw7x2IY/view?usp=sharing";

  // 🎯 Distribución por tipo
  const baseDistribution = [
    ...Array(1).fill("repeticion"),
    ...Array(2).fill("geometrica"),
    ...Array(3).fill("alternante"),
    ...Array(1).fill("especial"),
    ...Array(3).fill("mixta"),
  ];

  const typeQueueRef = useRef(shuffleArray([...baseDistribution]));
  const getNextType = () => {
    if (typeQueueRef.current.length === 0)
      typeQueueRef.current = shuffleArray([...baseDistribution]);
    return typeQueueRef.current.shift();
  };

  const generateProblem = () => {
    let type = getNextType();
    let generated;
    let tries = 0;
    do {
      generated = problemGenerators[type]();
      generated.id = generated.series.join(",") + "-" + generated.answer;
      tries++;
    } while (lastProblemsRef.current.includes(generated.id) && tries < 10);

    lastProblemsRef.current.push(generated.id);
    if (lastProblemsRef.current.length > 15) lastProblemsRef.current.shift();

    const options = generateOptions(generated.answer);
    setProblem({ ...generated, options });
    setFeedback("");
    setFeedbackColor("");
    setExplanation("");
    setShowNext(false);
    setTimeLeft(TIME_LIMIT);
    answeredRef.current = false;
  };

  // Timer
  useEffect(() => {
    if (!problem) return;
    clearInterval(timerRef.current);
    setTimeLeft(TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!answeredRef.current) handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [problem]);

  const handleAnswer = (selected) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearInterval(timerRef.current);

    if (!problem) return;

    const correct = selected === problem.answer;
    if (correct) {
      setScore((prev) => prev + 1);
      setFeedback("¡Correcto!");
      setFeedbackColor("text-green-600");
    } else {
      setFeedback(
        selected === null
          ? `¡Se acabó el tiempo! Era ${problem.answer}`
          : `Incorrecto, era ${problem.answer}`
      );
      setFeedbackColor("text-red-600");
    }

    setExplanation(problem.explanation);
    setShowNext(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= totalQuestions) setScreen("end");
    else {
      setCurrentQuestion((prev) => prev + 1);
      generateProblem();
    }
  };

  const startGame = () => {
    setTotalQuestions(Number(questionsNumberInput));
    setScore(0);
    setCurrentQuestion(0);
    lastProblemsRef.current = [];
    typeQueueRef.current = shuffleArray([...baseDistribution]);
    setScreen("game");
    generateProblem();
  };

  // -------- INTERFAZ -------- //
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Series Numéricas</h1>
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-4"
      >
        Volver
      </button>

      {screen === "modeSelection" && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setScreen("settings")}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg"
          >
            Modo Práctica / Realista
          </button>
          <button
            onClick={() => setShowInstructivo(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Instructivo
          </button>
        </div>
      )}

      {showInstructivo && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 h-4/5 rounded shadow-lg flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Instructivo Series Numéricas</h2>
              <button
                onClick={() => setShowInstructivo(false)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg"
              >
                Cerrar
              </button>
            </div>
            <iframe
              src={instructivoUrl}
              className="w-full h-full"
              title="Instructivo Series Numéricas"
            />
            <div className="p-2 text-right">
              <a
                href={instructivoBackupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Abrir en otra pestaña
              </a>
            </div>
          </div>
        </div>
      )}

      {screen === "settings" && (
        <div className="flex flex-col items-center gap-4">
          <label className="text-lg font-medium">Número de preguntas:</label>
          <input
            type="number"
            min="5"
            max="30"
            value={questionsNumberInput}
            onChange={(e) => setQuestionsNumberInput(e.target.value)}
            className="w-32 text-center text-lg p-2 border border-slate-300 rounded-lg"
          />
          <button
            onClick={startGame}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
          >
            Comenzar
          </button>
        </div>
      )}

      {screen === "game" && problem && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl text-center">
          <div className="text-xl mb-6 font-semibold">
            {problem.series.join(" - ")} - ¿?
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {problem.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={showNext}
                onClick={() => handleAnswer(opt)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`text-xl font-bold mb-3 ${feedbackColor}`}>
              {feedback}
            </div>
          )}

          {explanation && (
            <div className="bg-slate-100 text-slate-700 p-3 mb-4 rounded-lg">
              {explanation}
            </div>
          )}

          {showNext && (
            <button
              onClick={nextQuestion}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              {currentQuestion + 1 >= totalQuestions
                ? "Ver resultados"
                : "Siguiente"}
            </button>
          )}

          <div className="flex justify-between items-center mt-4 text-slate-600">
            <div>
              Tiempo: <span className="font-bold">{timeLeft}s</span>
            </div>
            <div>
              Pregunta{" "}
              <span className="font-bold">{currentQuestion + 1}</span> /{" "}
              {totalQuestions}
            </div>
            <div>
              Puntaje: <span className="font-bold">{score}</span>
            </div>
          </div>
        </div>
      )}

      {screen === "end" && (
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-4">¡Juego terminado!</h2>
          <p className="text-xl mb-2">Puntaje final:</p>
          <p className="text-2xl font-bold text-indigo-600 mb-6">
            {score} / {totalQuestions}
          </p>
          <p className="text-lg mb-6">
            {score >= totalQuestions * 0.8
              ? "¡Excelente! 🎉"
              : score >= totalQuestions * 0.6
              ? "¡Buen trabajo! 👍"
              : "Sigue practicando 💪"}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setScreen("modeSelection")}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg"
            >
              Volver al menú
            </button>
            <button
              onClick={startGame}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
            >
              Jugar otra vez
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
