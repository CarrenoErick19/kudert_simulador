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
  // Serie de repetición tipo examen Kudert (mejorada: cadena única, offsets variables)
  repeticion: () => {
    const ascending = Math.random() > 0.5;
    const start = ascending ? getRandomInt(1, 9) : getRandomInt(1, 9);
    const offset = getRandomInt(0, 2); // Offset para repeticiones no estrictas
    const length = getRandomInt(3, 5); // Longitud variable de grupos
    const seriesParts = [];
    let currentReps = 1 + offset;

    if (ascending) {
      let currentNum = start;
      for (let i = 0; i < length; i++) {
        seriesParts.push(String(currentNum).repeat(currentReps));
        currentNum++;
        currentReps++;
      }
      const answer = String(currentNum).repeat(currentReps);
      return {
        series: [seriesParts.join("")], // Como cadena única
        answer,
        explanation: `Serie de repetición ascendente como cadena continua: cada dígito se repite incrementando desde ${1 + offset} veces.`,
        difficulty: "easy",
      };
    } else {
      let currentNum = start;
      for (let i = 0; i < length; i++) {
        seriesParts.push(String(currentNum).repeat(currentReps));
        currentNum--;
        currentReps++;
      }
      const answer = String(currentNum).repeat(currentReps);
      return {
        series: [seriesParts.join("")],
        answer,
        explanation: `Serie de repetición descendente como cadena continua: cada dígito se repite incrementando desde ${1 + offset} veces.`,
        difficulty: "easy",
      };
    }
  },

  // Serie aritmética tipo examen Kudert (mejorada: más variabilidad, longitudes variables)
  aritmetica: () => {
    const type = randomFrom(["constante", "decreciente", "variable_asc", "variable_desc", "mixed"]);
    let series = [];
    let answer = 0;
    let explanation = "";
    const length = getRandomInt(3, 8); // Longitud variable

    if (type === "constante") {
      const start = getRandomInt(5, 20);
      const step = getRandomInt(3, 10);
      series = Array.from({ length }, (_, i) => start + i * step);
      answer = start + length * step;
      explanation = `Serie aritmética constante: suma +${step} cada vez.`;
    } else if (type === "decreciente") {
      const start = getRandomInt(100, 150);
      const step = -getRandomInt(10, 20);
      series = Array.from({ length }, (_, i) => start + i * step);
      answer = start + length * step;
      explanation = `Serie aritmética decreciente: resta ${-step} cada vez.`;
    } else if (type === "variable_asc") {
      const start = getRandomInt(40, 70);
      series = [start];
      let diff = 1;
      for (let i = 1; i < length; i++) {
        series.push(series[i - 1] + diff);
        diff++;
      }
      answer = series[series.length - 1] + diff;
      explanation = "Serie aritmética variable ascendente: suma creciente (+1, +2, +3...).";
    } else if (type === "variable_desc") {
      const start = getRandomInt(40, 70);
      series = [start];
      let diff = 1;
      for (let i = 1; i < length; i++) {
        series.push(series[i - 1] - diff);
        diff++;
      }
      answer = series[series.length - 1] - diff;
      explanation = "Serie aritmética variable descendente: resta creciente (-1, -2, -3...).";
    } else { // mixed
      const start = getRandomInt(20, 50);
      const constStep = getRandomInt(5, 10);
      series = Array.from({ length: Math.floor(length / 2) }, (_, i) => start + i * constStep);
      let diff = 1;
      for (let i = Math.floor(length / 2); i < length; i++) {
        series.push(series[i - 1] - diff);
        diff++;
      }
      answer = series[series.length - 1] - diff;
      explanation = "Serie aritmética mixta: constante al inicio, luego variable descendente.";
    }

    return { series, answer, explanation, difficulty: "easy" };
  },

  // Serie geométrica (MODIFICADA: Garantiza enteros en respuestas descendentes)
  geometrica: () => {
    const ascending = Math.random() > 0.5;
    const length = getRandomInt(3, 5);
    const ratio = getRandomInt(2, 4); // Ratio limitado a 4 para evitar números gigantes

    if (ascending) {
      const start = getRandomInt(2, 6);
      const series = Array.from({ length }, (_, i) => start * (ratio ** i));
      const answer = series[series.length - 1] * ratio;
      return {
        series,
        answer,
        explanation: `Serie geométrica ascendente: multiplica por ${ratio}.`,
        difficulty: "medium",
      };
    } else {
      // Lógica inversa para evitar decimales:
      // Elegimos primero la RESPUESTA (entero pequeño)
      const finalAnswer = getRandomInt(1, 9); 
      
      // Construimos la serie hacia atrás multiplicando, así aseguramos que al dividir sea exacto
      const tempSeries = [finalAnswer];
      for (let i = 0; i < length; i++) {
        tempSeries.push(tempSeries[tempSeries.length - 1] * ratio);
      }
      
      // tempSeries ahora es [Respuesta, ..., Inicio]
      // Invertimos y quitamos la respuesta para mostrar el problema
      const fullSeries = tempSeries.reverse(); // [Inicio, ..., Final, Respuesta]
      const answer = fullSeries.pop(); // Sacamos la respuesta
      const series = fullSeries; // Lo que queda es la serie

      return {
        series,
        answer,
        explanation: `Serie geométrica descendente: divide por ${ratio}.`,
        difficulty: "medium",
      };
    }
  },

  // Serie alternante (mejorada: basada en grupos con permutaciones)
  alternante: () => {
    const ascending = Math.random() > 0.5;
    const groupSize = 3; // Como en PDF
    const numGroups = getRandomInt(2, 3);
    const start = ascending ? getRandomInt(1, 5) : getRandomInt(20, 30);
    const series = [];
    let current = start;

    for (let g = 0; g < numGroups; g++) {
      const group = [];
      for (let i = 0; i < groupSize; i++) {
        group.push(ascending ? current + i : current - i);
      }
      // Permutación: primero-último-medio (como 2-4-3 para 2-3-4)
      series.push(group[0], group[2], group[1]);
      current = ascending ? current + groupSize : current - groupSize;
    }

    // Siguiente grupo permutado, pero solo el primero o completo según PDF
    const nextGroup = [];
    for (let i = 0; i < groupSize; i++) {
      nextGroup.push(ascending ? current + i : current - i);
    }
    const answer = nextGroup[0]; // Como en PDF, a veces solo el primero

    return {
      series: series.flat(),
      answer,
      explanation: `Serie alternante en grupos de 3 con permutación (primero-último-medio). Separa en grupos para ver el patrón ${ascending ? "ascendente" : "descendente"}.`,
      difficulty: "medium",
    };
  },

  // Serie especial (mejorada: Fibonacci + e/pi con sumas)
  especial: () => {
    const type = Math.random() > 0.5 ? "fibonacci" : "constant"; // 50% cada uno
    if (type === "fibonacci") {
      const a = getRandomInt(1, 5);
      const b = getRandomInt(2, 8);
      const mod = Math.random() > 0.5 ? getRandomInt(1, 2) : 0;
      const series = [a, b];
      for (let i = 2; i < 8; i++) series.push(series[i - 1] + series[i - 2] + mod);
      const answer = series[series.length - 1] + series[series.length - 2] + mod;
      return {
        series,
        answer,
        explanation: mod > 0 ? `Serie tipo Fibonacci con +${mod}. Suma los dos anteriores.` : "Serie de Fibonacci pura: suma de los dos anteriores.",
        difficulty: "hard",
      };
    } else {
      const isEuler = Math.random() > 0.5;
      // CORRECCIÓN: Se extendieron las cadenas de dígitos para evitar índices fuera de rango que colgaban el simulador
      const digits = isEuler 
        ? "718281828459045235360287471352" 
        : "141592653589793238462643383279"; 
      
      const groupSize = getRandomInt(1, 2) + 1; // Pares o singles
      const targetSum = isEuler ? 9 : 10; // Como en PDF
      const numGroups = getRandomInt(4, 6);
      const series = [];
      let index = 0;
      for (let g = 0; g < numGroups; g++) {
        // Validación extra de seguridad
        if (index + groupSize > digits.length) break; 
        
        const group = digits.slice(index, index + groupSize).split("").map(Number);
        series.push(...group);
        index += groupSize;
      }
      
      // Aseguramos que existan dígitos para el siguiente grupo
      let nextGroup;
      if (index + groupSize <= digits.length) {
         nextGroup = digits.slice(index, index + groupSize).split("").map(Number);
      } else {
         // Fallback de seguridad por si acaso llegara al límite (aunque con strings largos no debería)
         nextGroup = [0]; 
      }
      
      const answer = nextGroup[nextGroup.length - 1]; // Último dígito para completar suma
      return {
        series,
        answer,
        explanation: `Serie basada en dígitos de ${isEuler ? "e" : "π"} agrupados en ${groupSize}s que suman ~${targetSum}. Separa y suma para ver.`,
        difficulty: "hard",
      };
    }
  },

  // Serie mixta (mejorada: subtipos para repeticiones, skips, posiciones)
  mixta: () => {
    const type = randomFrom(["repeticion", "skips", "posiciones"]);
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

    if (type === "repeticion") {
      const startNum = getRandomInt(2, 6) * 2; // Pares
      const startLetterIdx = getRandomInt(0, letras.length - 10);
      const series = [];
      let reps = 1;
      for (let i = 0; i < 4; i++) {
        series.push(startNum + i * 2);
        series.push(...Array(reps).fill(letras[startLetterIdx + i * 3].toLowerCase()));
        reps++;
      }
      const answer = letras[startLetterIdx + 4 * 3].toLowerCase();
      return {
        series,
        answer,
        explanation: "Serie mixta con números pares ascendentes y letras repetidas incrementando (b, ee, hhh...).",
        difficulty: "hard",
      };
    } else if (type === "skips") {
      const series = ["d", "d", "f", 1, 2, "h", "h", "j", 1, 2];
      const answer = "l";
      return {
        series,
        answer,
        explanation: "Serie mixta con skips alfabéticos (skip e, g, i...): d d f (skip e), h h j (skip i), intercalado con 1 2.",
        difficulty: "hard",
      };
    } else { // posiciones
      const startLetterIdx = 2; // C=3 (posición 3)
      const step = 3;
      const startNum = 4;
      const series = [];
      for (let i = 0; i < 4; i++) {
        series.push(letras[startLetterIdx + i * step].toUpperCase());
        series.push(startNum + i);
      }
      const answer = letras[startLetterIdx + 4 * step].toUpperCase();
      return {
        series: series.slice(0, -1), // Quita el último número para preguntar por letra
        answer,
        explanation: `Serie mixta alternante letra-número; letras por posiciones múltiplos de ${step} (C=3, F=6, I=9...). Siguiente letra posición ${3 + 4 * step}.`,
        difficulty: "hard",
      };
    }
  },
};

// --- Generador de opciones (sin cambios mayores) ---
const generateOptions = (correct) => {
  if (typeof correct === "string" && isNaN(correct)) {
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
    const options = new Set([correct.toUpperCase()]);
    while (options.size < 4) {
      const idx = letras.indexOf(correct.toUpperCase());
      const rand = letras[getRandomInt(Math.max(0, idx - 3), Math.min(idx + 3, letras.length - 1))];
      options.add(rand);
    }
    return shuffleArray([...options]);
  }
  const options = new Set([correct]);
  // Safety break para evitar loops infinitos si correct es undefined/NaN
  let safetyCounter = 0;
  while (options.size < 4 && safetyCounter < 50) {
    const deviation = getRandomInt(1, 10);
    const trap = Math.random() > 0.5 ? correct + deviation : correct - deviation;
    if (trap > 0) options.add(trap);
    safetyCounter++;
  }
  // Si falló en generar suficientes opciones, rellenamos con randoms seguros
  while(options.size < 4) {
      options.add(getRandomInt(1, 20));
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

  // --- Selección según modo (ajustada para más énfasis en hard) ---
  const getAvailableTypes = () => {
    if (gameMode === "realistic") {
      // Distribución ajustada: 40% easy, 30% medium, 30% hard
      const roll = Math.random() * 100;
      if (roll < 40) return randomFrom(["repeticion", "aritmetica"]);
      else if (roll < 70) return randomFrom(["geometrica", "alternante"]);
      else return randomFrom(["especial", "mixta"]);
    } else {
      if (difficulty === "easy") {
        return randomFrom(["repeticion", "aritmetica"]);
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

    const correct = selected == problem.answer; // == para manejar num/string
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