import React, { useState, useEffect, useRef } from "react";
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
  repeticion: () => {
    const ascending = Math.random() > 0.5;
    const start = ascending ? getRandomInt(1, 9) : getRandomInt(1, 9);
    const offset = getRandomInt(0, 2); 
    const length = getRandomInt(3, 5); 
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
        series: [seriesParts.join("")], 
        answer,
        explanation: `Serie de repetición ascendente: cada dígito se repite incrementando desde ${1 + offset} veces.`,
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
        explanation: `Serie de repetición descendente: cada dígito se repite incrementando desde ${1 + offset} veces.`,
        difficulty: "easy",
      };
    }
  },

  aritmetica: () => {
    const type = randomFrom(["constante", "decreciente", "variable_asc", "variable_desc", "mixed"]);
    let series = [];
    let answer = 0;
    let explanation = "";
    const length = getRandomInt(3, 8);

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
    } else { 
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

  // Serie geométrica (MODIFICADA SEGÚN SOLICITUD)
  geometrica: () => {
    const ascending = Math.random() > 0.5;

    if (ascending) {
      // MODIFICACIÓN: Solo se multiplica por 2 o 3
      const ratio = randomFrom([2, 3]);
      const length = getRandomInt(3, 4); // Limitamos longitud para evitar números gigantes
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
      // MODIFICACIÓN: Máximo 4 términos antes de la interrogante.
      const ratio = randomFrom([2, 3]); 
      const length = 4; // Longitud fija de 4 términos según solicitud
      
      // Para evitar que siempre termine en 1, el final (respuesta) será un valor aleatorio > 1
      const finalAnswer = getRandomInt(2, 10); 
      
      const tempSeries = [finalAnswer];
      for (let i = 0; i < length; i++) {
        tempSeries.push(tempSeries[tempSeries.length - 1] * ratio);
      }
      
      const fullSeries = tempSeries.reverse(); // [Inicio, ..., Respuesta]
      const answer = fullSeries.pop(); // Sacamos el último como respuesta
      const series = fullSeries; // Quedan 4 términos en la serie

      return {
        series,
        answer,
        explanation: `Serie geométrica descendente: divide por ${ratio}.`,
        difficulty: "medium",
      };
    }
  },

  alternante: () => {
    const ascending = Math.random() > 0.5;
    const groupSize = 3; 
    const numGroups = getRandomInt(2, 3);
    const start = ascending ? getRandomInt(1, 5) : getRandomInt(20, 30);
    const series = [];
    let current = start;

    for (let g = 0; g < numGroups; g++) {
      const group = [];
      for (let i = 0; i < groupSize; i++) {
        group.push(ascending ? current + i : current - i);
      }
      series.push(group[0], group[2], group[1]);
      current = ascending ? current + groupSize : current - groupSize;
    }

    const nextGroup = [];
    for (let i = 0; i < groupSize; i++) {
      nextGroup.push(ascending ? current + i : current - i);
    }
    const answer = nextGroup[0];

    return {
      series: series.flat(),
      answer,
      explanation: `Serie alternante en grupos de 3 con permutación. Separa en grupos para ver el patrón.`,
      difficulty: "medium",
    };
  },

  especial: () => {
    const type = Math.random() > 0.5 ? "fibonacci" : "constant";
    if (type === "fibonacci") {
      const a = getRandomInt(1, 5);
      const b = getRandomInt(2, 8);
      const mod = Math.random() > 0.5 ? getRandomInt(1, 2) : 0;
      const series = [a, b];
      for (let i = 2; i < 6; i++) series.push(series[i - 1] + series[i - 2] + mod);
      const answer = series[series.length - 1] + series[series.length - 2] + mod;
      return {
        series,
        answer,
        explanation: mod > 0 ? `Serie tipo Fibonacci con +${mod}.` : "Serie de Fibonacci pura.",
        difficulty: "hard",
      };
    } else {
      const isEuler = Math.random() > 0.5;
      const digits = isEuler 
        ? "718281828459045235360287471352" 
        : "141592653589793238462643383279"; 
      
      const groupSize = getRandomInt(1, 2) + 1;
      const numGroups = getRandomInt(4, 5);
      const series = [];
      let index = 0;
      for (let g = 0; g < numGroups; g++) {
        if (index + groupSize > digits.length) break; 
        const group = digits.slice(index, index + groupSize).split("").map(Number);
        series.push(...group);
        index += groupSize;
      }
      
      const nextDigit = digits[index] ? Number(digits[index]) : 0;
      const answer = nextDigit;
      return {
        series,
        answer,
        explanation: `Serie basada en dígitos de ${isEuler ? "e" : "π"}.`,
        difficulty: "hard",
      };
    }
  },

  mixta: () => {
    const type = randomFrom(["repeticion", "skips", "posiciones"]);
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

    if (type === "repeticion") {
      const startNum = getRandomInt(2, 6) * 2;
      const startLetterIdx = getRandomInt(0, letras.length - 12);
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
        explanation: "Serie mixta: números pares ascendentes y letras con repetición creciente.",
        difficulty: "hard",
      };
    } else if (type === "skips") {
      const series = ["d", "d", "f", 1, 2, "h", "h", "j", 1, 2];
      const answer = "l";
      return {
        series,
        answer,
        explanation: "Serie mixta con skips alfabéticos intercalados con 1, 2.",
        difficulty: "hard",
      };
    } else { 
      const startLetterIdx = 2; 
      const step = 3;
      const startNum = 4;
      const series = [];
      for (let i = 0; i < 4; i++) {
        series.push(letras[startLetterIdx + i * step].toUpperCase());
        series.push(startNum + i);
      }
      const answer = letras[startLetterIdx + 4 * step].toUpperCase();
      return {
        series: series.slice(0, -1),
        answer,
        explanation: `Serie mixta letra-número. Letras saltando de ${step} en ${step}.`,
        difficulty: "hard",
      };
    }
  },
};

const generateOptions = (correct) => {
  if (typeof correct === "string" && isNaN(correct)) {
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
    const options = new Set([correct.toUpperCase()]);
    while (options.size < 4) {
      const idx = letras.indexOf(correct.toUpperCase());
      const rand = letras[getRandomInt(Math.max(0, idx - 5), Math.min(idx + 5, letras.length - 1))];
      options.add(rand);
    }
    return shuffleArray([...options]);
  }
  const options = new Set([correct]);
  let safetyCounter = 0;
  while (options.size < 4 && safetyCounter < 50) {
    const deviation = getRandomInt(1, 10);
    const trap = Math.random() > 0.5 ? correct + deviation : correct - deviation;
    if (trap >= 0) options.add(trap);
    safetyCounter++;
  }
  while(options.size < 4) {
      options.add(getRandomInt(1, 100));
  }
  return shuffleArray([...options]);
};

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

  const getAvailableTypes = () => {
    if (gameMode === "realistic") {
      const roll = Math.random() * 100;
      if (roll < 40) return randomFrom(["repeticion", "aritmetica"]);
      else if (roll < 70) return Math.random() < 0.75 ? "geometrica" : "alternante";
      else return randomFrom(["especial", "mixta"]);
    } else {
      if (difficulty === "easy") return randomFrom(["repeticion", "aritmetica"]);
      else if (difficulty === "medium") return Math.random() < 0.75 ? "geometrica" : "alternante";
      else return randomFrom(["especial", "mixta"]);
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

  const handleAnswer = (selected) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearInterval(timerRef.current);

    const correct = String(selected).toUpperCase() === String(problem.answer).toUpperCase();
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 font-sans text-slate-900">
      <h1 className="text-3xl font-bold mb-6 text-indigo-800">🔢 Series Numéricas</h1>
      
      <button
        onClick={() => navigate(-1)}
        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg mb-6 hover:bg-slate-50 shadow-sm transition-all"
      >
        ← Volver
      </button>

      {screen === "modeSelection" && (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => { setGameMode("practice"); setScreen("settings"); }}
            className="bg-sky-600 text-white px-6 py-4 rounded-xl shadow-md hover:bg-sky-700 transition-all font-bold text-lg"
          >
            🧠 Modo Práctica
          </button>
          <button
            onClick={() => { setGameMode("realistic"); setScreen("settings"); }}
            className="bg-indigo-600 text-white px-6 py-4 rounded-xl shadow-md hover:bg-indigo-700 transition-all font-bold text-lg"
          >
            ⏱️ Modo Realista
          </button>
        </div>
      )}

      {screen === "settings" && (
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-5 w-full max-w-sm">
          {gameMode === "practice" && (
            <div className="w-full">
              <label className="block text-sm font-bold text-slate-700 mb-2 text-center uppercase tracking-wider">Dificultad</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all text-center font-medium"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Intermedio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          )}
          <div className="w-full">
            <label className="block text-sm font-bold text-slate-700 mb-2 text-center uppercase tracking-wider">Número de Preguntas</label>
            <input
              type="number"
              value={questionsInput}
              onChange={(e) => setQuestionsInput(e.target.value)}
              className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all text-center text-xl font-bold"
            />
          </div>
          <button
            onClick={startGame}
            className="w-full bg-green-600 text-white px-6 py-4 rounded-xl font-black text-xl hover:bg-green-700 shadow-lg active:transform active:scale-95 transition-all"
          >
            ¡COMENZAR!
          </button>
        </div>
      )}

      {screen === "game" && problem && (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center border-t-8 border-indigo-500">
          <div className="flex justify-between items-center mb-6">
            <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500 uppercase">
              Pregunta {currentQuestion + 1} de {totalQuestions}
            </span>
            <div className={`text-xl font-mono font-bold ${timeLeft < 4 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
          </div>

          <div className="text-4xl md:text-5xl mb-10 font-black text-indigo-900 tracking-tight">
            {problem.series.join(" - ")} - <span className="text-indigo-500">¿?</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {problem.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={showNext}
                className="bg-slate-50 border-2 border-slate-200 text-slate-800 px-6 py-4 rounded-xl font-bold text-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:border-slate-200 shadow-sm"
              >
                {opt}
              </button>
            ))}
          </div>

          {explanation && (
            <div className="text-indigo-800 bg-indigo-50 p-4 rounded-xl mb-6 text-sm italic font-medium border border-indigo-100">
              💡 {explanation}
            </div>
          )}

          {showNext && (
            <button
              onClick={nextQuestion}
              className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-md"
            >
              {currentQuestion + 1 >= totalQuestions ? "Ver Resultados Finales" : "Siguiente Pregunta →"}
            </button>
          )}

          <div className={`text-2xl font-black mt-6 transition-all ${feedbackColor}`}>
            {feedback}
          </div>
        </div>
      )}

      {screen === "end" && (
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full border-b-8 border-indigo-600">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-3xl font-black mb-2 text-slate-800 uppercase tracking-tighter">¡Terminado!</h2>
          <div className="flex flex-col gap-2 mb-8 mt-6">
            <div className="flex justify-between p-4 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-500">Puntaje</span>
              <span className="font-black text-indigo-600 text-xl">{score} / {totalQuestions}</span>
            </div>
            <div className="flex justify-between p-4 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-500">Precisión</span>
              <span className="font-black text-indigo-600 text-xl">{((score / totalQuestions) * 100).toFixed(0)}%</span>
            </div>
          </div>
          <button
            onClick={() => setScreen("modeSelection")}
            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-xl hover:bg-indigo-700 shadow-lg transition-all"
          >
            Reiniciar Juego
          </button>
        </div>
      )}
    </div>
  );
}