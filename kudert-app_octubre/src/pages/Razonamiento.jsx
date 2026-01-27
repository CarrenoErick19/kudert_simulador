import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ==========================================
// COMPONENTES GRÁFICOS (SVG)
// ==========================================

// Renderiza una figura base según el tipo
const Shape = ({ type, x, y, size, fill, rotate = 0, stroke = "black", sides = 3 }) => {
  const transform = `translate(${x}, ${y}) rotate(${rotate})`;
  const s = size / 2; // radio aproximado

  let content;
  switch (type) {
    case "circle":
      content = <circle cx="0" cy="0" r={s} fill={fill} stroke={stroke} strokeWidth="2" />;
      break;
    case "square":
      content = <rect x={-s} y={-s} width={s * 2} height={s * 2} fill={fill} stroke={stroke} strokeWidth="2" />;
      break;
    case "polygon": // Para lógica de lados dinámicos
    case "triangle":
    case "pentagon":
    case "hexagon":
      const polySides = type === "triangle" ? 3 : type === "square" ? 4 : type === "pentagon" ? 5 : type === "hexagon" ? 6 : sides;
      const angleStep = (2 * Math.PI) / polySides;
      const points = Array.from({ length: polySides }).map((_, i) => {
        const ang = i * angleStep - Math.PI / 2; // Empezar arriba
        return `${Math.cos(ang) * s},${Math.sin(ang) * s}`;
      }).join(" ");
      content = <polygon points={points} fill={fill} stroke={stroke} strokeWidth="2" />;
      break;
    case "cross":
      content = (
        <g stroke={stroke} strokeWidth="3">
          <line x1={-s} y1="0" x2={s} y2="0" />
          <line x1="0" y1={-s} x2="0" y2={s} />
        </g>
      );
      break;
    case "arrow":
      content = (
         <path d={`M -${s/2} ${s} L 0 -${s} L ${s/2} ${s} M 0 -${s} L 0 ${s}`} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      );
      break;
    default:
      content = <circle cx="0" cy="0" r={s} fill={fill} />;
  }

  return <g transform={transform}>{content}</g>;
};

// ==========================================
// MOTORES DE LÓGICA (GENERADORES)
// ==========================================

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// TIPO 1: MATRIZ DE SUPERPOSICIÓN (Lógica PDF)
const generateMatrixLogic = () => {
  const shapeType = pickRandom(["circle", "square", "triangle", "cross"]);
  
  // Generar panel A y B aleatorios
  const panelA = Array(4).fill(0).map(() => Math.random() > 0.5);
  const panelB = Array(4).fill(0).map(() => Math.random() > 0.5);
  
  // Lógica XOR: Si aparece en uno pero no en el otro, se queda.
  const resultLogic = (a, b) => (a !== b); 
  const panelC = panelA.map((val, i) => resultLogic(val, panelB[i]));

  // Generar opciones incorrectas
  const generateWrong = () => Array(4).fill(0).map(() => Math.random() > 0.5);
  let options = [panelC];
  while (options.length < 4) {
    const wrong = generateWrong();
    if (!options.some(o => JSON.stringify(o) === JSON.stringify(wrong))) {
      options.push(wrong);
    }
  }
  
  options = options.sort(() => Math.random() - 0.5);
  const correctIndex = options.findIndex(o => JSON.stringify(o) === JSON.stringify(panelC));

  const renderGrid = (data) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" className="bg-white border-2 border-gray-300">
      {data.map((active, i) => {
        if (!active) return null;
        const col = i % 2;
        const row = Math.floor(i / 2);
        return <Shape key={i} type={shapeType} x={25 + col * 50} y={25 + row * 50} size={22} fill="black" />;
      })}
    </svg>
  );

  return {
    renderMain: () => (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-gray-500 uppercase">Matriz: Superposición</p>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-20 h-20 md:w-24 md:h-24">{renderGrid(panelA)}</div>
          <span className="text-2xl font-bold">+</span>
          <div className="w-20 h-20 md:w-24 md:h-24">{renderGrid(panelB)}</div>
          <span className="text-2xl font-bold">=</span>
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 flex items-center justify-center text-3xl font-bold">?</div>
        </div>
      </div>
    ),
    renderOption: (optIndex) => renderGrid(options[optIndex]),
    correctIndex,
    explanation: "Superposición (XOR): Las figuras que se repiten en la misma posición se eliminan; las que están en una sola posición se mantienen.",
  };
};

// TIPO 2: SECUENCIA DE ROTACIÓN DOBLE (Más dificultad)
// Un elemento gira horario, otro elemento pequeño gira antihorario.
const generateDualRotationLogic = () => {
  const startAngleA = getRandomInt(0, 3) * 90;
  const startAngleB = getRandomInt(0, 3) * 90;
  
  const stepA = 90; // Principal horario
  const stepB = -90; // Secundario antihorario

  const seq = [0, 1, 2].map(i => ({
    rotA: startAngleA + (i * stepA),
    rotB: startAngleB + (i * stepB)
  }));
  
  const correctState = {
    rotA: startAngleA + (3 * stepA),
    rotB: startAngleB + (3 * stepB)
  };

  // Opciones: Correcta, Solo A bien, Solo B bien, Ninguna bien
  let options = [
    correctState,
    { rotA: correctState.rotA + 90, rotB: correctState.rotB },
    { rotA: correctState.rotA, rotB: correctState.rotB + 90 },
    { rotA: correctState.rotA + 180, rotB: correctState.rotB + 180 }
  ];
  
  options = options.sort(() => Math.random() - 0.5);
  const correctIndex = options.findIndex(o => o.rotA === correctState.rotA && o.rotB === correctState.rotB);

  const renderSingle = (state) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" className="bg-white border-2 border-gray-300">
      {/* Figura principal centro */}
      <Shape type="arrow" x={50} y={50} size={35} rotate={state.rotA} stroke="black" />
      {/* Figura pequeña orbitando o rotando en esquina */}
      <g transform={`translate(50, 50) rotate(${state.rotB}) translate(0, -35)`}>
         <circle r="6" fill="red" />
      </g>
    </svg>
  );

  return {
    renderMain: () => (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-gray-500 uppercase">Secuencia: Rotación Doble</p>
        <div className="flex gap-2">
          {seq.map((s, i) => (
            <div key={i} className="w-20 h-20 md:w-24 md:h-24">{renderSingle(s)}</div>
          ))}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 flex items-center justify-center text-3xl font-bold">?</div>
        </div>
      </div>
    ),
    renderOption: (i) => renderSingle(options[i]),
    correctIndex,
    explanation: "La flecha gira 90° en sentido horario, mientras el punto rojo gira 90° en sentido antihorario.",
  };
};

// TIPO 3: SECUENCIA DE LADOS (Nuevo para variedad)
// Triangulo -> Cuadrado -> Pentágono -> ?
const generateSidesLogic = () => {
  const startSides = getRandomInt(3, 4); // Empieza en 3 o 4 lados
  const seq = [0, 1, 2].map(i => startSides + i);
  const correctSides = startSides + 3;

  // Opciones
  let options = [correctSides, correctSides - 1, correctSides + 1, correctSides - 2];
  // Asegurar que no haya duplicados raros y mezclar
  options = Array.from(new Set(options)).sort(() => Math.random() - 0.5);
  // Si por el Set bajó la cantidad, rellenar
  while(options.length < 4) options.push(getRandomInt(3,8));
  
  const correctIndex = options.findIndex(o => o === correctSides);

  const renderShape = (sides) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" className="bg-white border-2 border-gray-300">
       <Shape type="polygon" sides={sides} x={50} y={50} size={40} fill={sides % 2 === 0 ? "#ddd" : "#333"} stroke="black" />
       <text x="50" y="90" fontSize="12" textAnchor="middle" fill="#666">{sides} lados</text>
    </svg>
  );

  return {
    renderMain: () => (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-gray-500 uppercase">Secuencia: Conteo de Lados</p>
        <div className="flex gap-2">
          {seq.map((s, i) => (
             <div key={i} className="w-20 h-20 md:w-24 md:h-24">{renderShape(s)}</div>
          ))}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 flex items-center justify-center text-3xl font-bold">?</div>
        </div>
      </div>
    ),
    renderOption: (i) => renderShape(options[i]),
    correctIndex,
    explanation: "La figura aumenta su número de lados en 1 en cada paso (Secuencia +1).",
  };
};

// TIPO 4: SUSTRACCIÓN DE ELEMENTOS (Clásico)
const generateSubtractionLogic = () => {
  const stepRemove = getRandomInt(1, 2); 
  const allAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  
  const getLinesForStep = (stepIndex) => {
    const linesToKeep = Math.max(0, 8 - (stepIndex * stepRemove));
    return allAngles.slice(0, linesToKeep);
  };

  const correctLines = getLinesForStep(3);
  
  let options = [
    correctLines,
    allAngles.slice(0, Math.max(0, correctLines.length - 1)),
    allAngles.slice(0, Math.min(8, correctLines.length + 1)),
    [0, 90]
  ];
  
  // Limpieza de opciones
  const uniqueOptions = [];
  const map = new Map();
  for (const item of options) {
      if(!map.has(item.length)){
          map.set(item.length, true);
          uniqueOptions.push(item);
      }
  }
  while(uniqueOptions.length < 4) {
      const r = getRandomInt(1, 8);
      if(!map.has(r)) { map.set(r, true); uniqueOptions.push(allAngles.slice(0, r)); }
  }

  const shuffledOptions = uniqueOptions.sort(() => Math.random() - 0.5);
  const correctIndex = shuffledOptions.findIndex(o => o.length === correctLines.length);

  const renderLines = (angles) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" className="bg-white border-2 border-gray-300">
      <circle cx="50" cy="50" r="45" fill="#f0f0f0" />
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x2 = 50 + 40 * Math.cos(rad);
        const y2 = 50 + 40 * Math.sin(rad);
        return <line key={i} x1="50" y1="50" x2={x2} y2={y2} stroke="black" strokeWidth="4" strokeLinecap="round" />;
      })}
    </svg>
  );

  return {
    renderMain: () => (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-gray-500 uppercase">Secuencia: Sustracción</p>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
             <div key={i} className="w-20 h-20 md:w-24 md:h-24">{renderLines(getLinesForStep(i))}</div>
          ))}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 flex items-center justify-center text-3xl font-bold">?</div>
        </div>
      </div>
    ),
    renderOption: (i) => renderLines(shuffledOptions[i]),
    correctIndex,
    explanation: `En cada paso se eliminan ${stepRemove} línea(s) siguiendo el patrón de reducción.`,
  };
};

const generators = [generateMatrixLogic, generateDualRotationLogic, generateSidesLogic, generateSubtractionLogic];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function Razonamiento() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [userTotalQuestions, setUserTotalQuestions] = useState(15); // Estado para config
  
  const [exercise, setExercise] = useState(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10); // Reducido a 10s
  const [gameOver, setGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const timerRef = useRef(null);

  // Cargar nuevo ejercicio
  const nextExercise = () => {
    if (questionCount >= userTotalQuestions) {
      setGameOver(true);
      return;
    }
    const gen = pickRandom(generators);
    setExercise(gen());
    setQuestionCount(prev => prev + 1);
    setSelectedOption(null);
    setShowExplanation(false);
    setTimeLeft(10); // Reinicia a 10s
    
    // Reiniciar timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setShowExplanation(true);
    setSelectedOption(-1); // Estado de timeout
  };

  const handleSelect = (idx) => {
    if (showExplanation) return; // Ya respondió
    clearInterval(timerRef.current);
    setSelectedOption(idx);
    setShowExplanation(true);
    
    if (idx === exercise.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const exitGame = () => {
      clearInterval(timerRef.current);
      setStarted(false);
      setGameOver(false);
      setScore(0);
      setQuestionCount(0);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Pantalla de Inicio / Configuración
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Simulador Abstracto</h1>
          <p className="text-slate-600 mb-6">
            Configura tu prueba y entrena tu lógica con patrones, rotaciones y series.
          </p>

          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <label className="block text-slate-700 font-bold mb-2">
                  Número de Ejercicios: {userTotalQuestions}
              </label>
              <input 
                  type="range" 
                  min="5" 
                  max="30" 
                  step="5"
                  value={userTotalQuestions}
                  onChange={(e) => setUserTotalQuestions(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>15</span>
                  <span>30</span>
              </div>
          </div>

          <div className="space-y-3">
            <button 
                onClick={() => { setStarted(true); setQuestionCount(0); setScore(0); setGameOver(false); setTimeout(nextExercise, 100); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
                COMENZAR PRUEBA
            </button>
            <button 
                onClick={() => navigate(-1)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
            >
                Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de Resultados
  if (gameOver) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-4">¡Prueba Finalizada!</h2>
          <div className="text-6xl font-black text-blue-600 mb-4">{score} / {userTotalQuestions}</div>
          <p className="text-slate-600 mb-8">Puntaje final</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={exitGame} 
              className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg"
            >
              Menú Principal
            </button>
            <button 
              onClick={() => { 
                setGameOver(false); 
                setScore(0); 
                setQuestionCount(0); 
                nextExercise(); 
              }}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exercise) return <div>Cargando...</div>;

  // Pantalla del Ejercicio
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 px-4">
      {/* Header Info */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <button onClick={exitGame} className="text-sm text-gray-500 hover:text-gray-800 font-bold">
            ← Volver al Menú
        </button>
        <div className="text-slate-700 font-bold">Pregunta {questionCount} / {userTotalQuestions}</div>
        <div className={`font-mono text-xl font-bold ${timeLeft < 4 ? 'text-red-500' : 'text-blue-600'}`}>
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Area de Pregunta */}
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-md mb-6 flex justify-center min-h-[160px]">
        {exercise.renderMain()}
      </div>

      {/* Area de Opciones */}
      <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[0, 1, 2, 3].map((idx) => {
          let borderColor = "border-gray-200";
          let bgColor = "bg-white";
          
          if (showExplanation) {
            if (idx === exercise.correctIndex) {
              borderColor = "border-green-500";
              bgColor = "bg-green-50";
            } else if (idx === selectedOption) {
              borderColor = "border-red-500";
              bgColor = "bg-red-50";
            }
          } else if (selectedOption === idx) {
             borderColor = "border-blue-500";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showExplanation}
              className={`aspect-square p-2 border-4 rounded-xl transition-all ${borderColor} ${bgColor} hover:shadow-lg relative`}
            >
              <div className="absolute top-1 left-2 font-bold text-gray-400">{String.fromCharCode(65 + idx)}</div>
              {exercise.renderOption(idx)}
            </button>
          );
        })}
      </div>

      {/* Explicación y Siguiente */}
      {showExplanation && (
        <div className="w-full max-w-3xl animate-fade-in-up">
          <div className={`p-4 rounded-lg border-l-4 mb-4 ${selectedOption === exercise.correctIndex ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
            <h3 className="font-bold text-lg mb-1">
              {selectedOption === exercise.correctIndex ? "¡Correcto!" : "Incorrecto"}
            </h3>
            <p className="text-slate-700">{exercise.explanation}</p>
          </div>
          <button 
            onClick={nextExercise}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            SIGUIENTE EJERCICIO →
          </button>
        </div>
      )}
    </div>
  );
}