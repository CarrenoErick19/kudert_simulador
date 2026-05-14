import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ─────────────────────────────────────────────
// SHAPES SVG — primitivas reutilizables
// ─────────────────────────────────────────────
const SHAPES = ["circle", "square", "triangle", "diamond", "cross", "star"];
const FILLS  = ["#1e293b", "#64748b", "white", "#94a3b8"];
const SIZES  = [14, 18, 22];

const drawShape = (type, cx, cy, size, fill, stroke = "#1e293b") => {
  const s = size / 2;
  switch (type) {
    case "circle":
      return <circle key={`${type}-${cx}-${cy}`} cx={cx} cy={cy} r={s} fill={fill} stroke={stroke} strokeWidth="1.5" />;
    case "square":
      return <rect key={`${type}-${cx}-${cy}`} x={cx - s} y={cy - s} width={size} height={size} fill={fill} stroke={stroke} strokeWidth="1.5" />;
    case "triangle": {
      const pts = [
        `${cx},${cy - s}`,
        `${cx - s},${cy + s}`,
        `${cx + s},${cy + s}`,
      ].join(" ");
      return <polygon key={`${type}-${cx}-${cy}`} points={pts} fill={fill} stroke={stroke} strokeWidth="1.5" />;
    }
    case "diamond": {
      const pts = [`${cx},${cy - s}`, `${cx + s},${cy}`, `${cx},${cy + s}`, `${cx - s},${cy}`].join(" ");
      return <polygon key={`${type}-${cx}-${cy}`} points={pts} fill={fill} stroke={stroke} strokeWidth="1.5" />;
    }
    case "cross":
      return (
        <g key={`${type}-${cx}-${cy}`}>
          <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case "star": {
      const pts5 = Array.from({ length: 10 }).map((_, i) => {
        const r2 = i % 2 === 0 ? s : s * 0.45;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        return `${cx + r2 * Math.cos(a)},${cy + r2 * Math.sin(a)}`;
      }).join(" ");
      return <polygon key={`${type}-${cx}-${cy}`} points={pts5} fill={fill} stroke={stroke} strokeWidth="1.5" />;
    }
    default:
      return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={s} fill={fill} stroke={stroke} strokeWidth="1.5" />;
  }
};

// ─────────────────────────────────────────────
// CELDA GRID 3×3 — cada celda es 100×100
// ─────────────────────────────────────────────
const Cell = ({ children, size = 88, bg = "#f8fafc" }) => (
  <svg viewBox="0 0 88 88" width={size} height={size}
    style={{ background: bg, border: "2px solid #cbd5e1", borderRadius: 6 }}>
    {children}
  </svg>
);

// ─────────────────────────────────────────────
// GENERADOR 1: PATRÓN DE ROTACIÓN EN MATRIZ 3×3
// Cada fila rota una figura. La celda faltante es la esquina inf-der.
// ─────────────────────────────────────────────
const genRotation = () => {
  const shape = pick(SHAPES);
  const fill  = pick(["#1e293b", "#475569"]);
  const size  = 28;
  // Ángulos de rotación por columna: 0, 45, 90 → la siguiente sería 135
  const baseAngles = [0, 45, 90];
  const nextAngle  = 135;

  const renderCell = (rowIdx, colIdx) => {
    const angle = baseAngles[colIdx] + rowIdx * 30; // variación por fila
    return (
      <Cell key={`${rowIdx}-${colIdx}`}>
        <g transform={`translate(44,44) rotate(${angle})`}>
          {drawShape(shape, 0, 0, size, fill)}
        </g>
      </Cell>
    );
  };

  // La respuesta correcta: fila 2, col 2 → angle = baseAngles[2] + 2*30 = 90+60=150
  const correctAngle = baseAngles[2] + 2 * 30;

  const renderAnswer = (angle) => (
    <Cell>
      <g transform={`translate(44,44) rotate(${angle})`}>
        {drawShape(shape, 0, 0, size, fill)}
      </g>
    </Cell>
  );

  const wrongAngles = shuffle([correctAngle + 45, correctAngle - 45, correctAngle + 90, correctAngle + 180])
    .filter((a, i, arr) => arr.indexOf(a) === i)
    .slice(0, 3);

  const allOptions = shuffle([correctAngle, ...wrongAngles]);
  const correctIndex = allOptions.indexOf(correctAngle);

  return {
    title: "Patrón de Rotación",
    matrix: [
      [renderCell(0,0), renderCell(0,1), renderCell(0,2)],
      [renderCell(1,0), renderCell(1,1), renderCell(1,2)],
      [renderCell(2,0), renderCell(2,1), null],
    ],
    options: allOptions.map(a => renderAnswer(a)),
    correctIndex,
    explanation: "Cada figura rota progresivamente. Identifica el ángulo que continúa la secuencia de la tercera fila.",
  };
};

// ─────────────────────────────────────────────
// GENERADOR 2: CONTEO DE FIGURAS (+1 por fila/col)
// ─────────────────────────────────────────────
const genCount = () => {
  const shape = pick(SHAPES);
  const fill  = pick(["#1e293b", "#475569", "#0f172a"]);

  // Posiciones fijas para 1..9 figuras dentro de 88×88
  const positions = [
    [[44,44]],
    [[30,44],[58,44]],
    [[22,44],[44,44],[66,44]],
    [[30,30],[58,30],[30,58],[58,58]],
    [[22,30],[44,30],[66,30],[22,58],[66,58]],
    [[22,30],[44,30],[66,30],[22,58],[44,58],[66,58]],
    [[22,22],[44,22],[66,22],[22,44],[66,44],[22,66],[66,66]],
    [[22,22],[44,22],[66,22],[22,44],[44,44],[66,44],[22,66],[66,66]],
    [[22,22],[44,22],[66,22],[22,44],[44,44],[66,44],[22,66],[44,66],[66,66]],
  ];

  // Matriz: fila i, col j → i+j+1 figuras
  const countAt = (r, c) => Math.min(r + c + 1, 9);

  const renderCell = (r, c) => {
    const n = countAt(r, c);
    const pts = positions[n - 1] || positions[0];
    return (
      <Cell key={`${r}-${c}`}>
        {pts.map(([x, y], i) => drawShape(shape, x, y, 14, fill))}
      </Cell>
    );
  };

  const correctCount = countAt(2, 2); // = 5
  const renderAnswer = (n) => {
    const clamped = Math.max(1, Math.min(9, n));
    const pts = positions[clamped - 1];
    return (
      <Cell>
        {pts.map(([x, y]) => drawShape(shape, x, y, 14, fill))}
      </Cell>
    );
  };

  const wrong = shuffle([correctCount - 1, correctCount + 1, correctCount - 2, correctCount + 2])
    .filter(n => n >= 1 && n <= 9 && n !== correctCount)
    .slice(0, 3);

  const allOptions = shuffle([correctCount, ...wrong]);
  const correctIndex = allOptions.indexOf(correctCount);

  return {
    title: "Conteo Progresivo",
    matrix: [
      [renderCell(0,0), renderCell(0,1), renderCell(0,2)],
      [renderCell(1,0), renderCell(1,1), renderCell(1,2)],
      [renderCell(2,0), renderCell(2,1), null],
    ],
    options: allOptions.map(n => renderAnswer(n)),
    correctIndex,
    explanation: "El número de figuras aumenta en 1 al avanzar por fila y columna. La celda faltante sigue esa lógica.",
  };
};

// ─────────────────────────────────────────────
// GENERADOR 3: SUPERPOSICIÓN / XOR DE FIGURAS
// Fila: A, B, C donde C = A XOR B (figuras que NO se repiten)
// ─────────────────────────────────────────────
const genXOR = () => {
  const shape = pick(SHAPES);
  const fill  = "#1e293b";
  // Cada celda es una máscara de 4 posiciones (cuadrantes)
  const positions4 = [[22,22],[66,22],[22,66],[66,66]];

  const randMask = () => Array(4).fill(0).map(() => Math.random() > 0.5);
  const xorMask  = (a, b) => a.map((v, i) => v !== b[i]);

  // 3 filas, cada una independiente
  const rows = Array(3).fill(0).map(() => {
    const maskA = randMask();
    const maskB = randMask();
    const maskC = xorMask(maskA, maskB);
    return { maskA, maskB, maskC };
  });

  const renderMask = (mask, key) => (
    <Cell key={key}>
      {mask.map((on, i) => on ? drawShape(shape, positions4[i][0], positions4[i][1], 20, fill) : null)}
    </Cell>
  );

  const correctMask = rows[2].maskC;
  const generateWrong = () => {
    let w;
    do { w = randMask(); } while (JSON.stringify(w) === JSON.stringify(correctMask));
    return w;
  };

  const wrongMasks = [generateWrong(), generateWrong(), generateWrong()];
  const allMasks   = shuffle([correctMask, ...wrongMasks]);
  const correctIndex = allMasks.findIndex(m => JSON.stringify(m) === JSON.stringify(correctMask));

  return {
    title: "Superposición (XOR)",
    matrix: rows.map((row, r) => [
      renderMask(row.maskA, `a${r}`),
      renderMask(row.maskB, `b${r}`),
      r < 2 ? renderMask(row.maskC, `c${r}`) : null,
    ]),
    options: allMasks.map((m, i) => renderMask(m, `opt${i}`)),
    correctIndex,
    explanation: "Las figuras que aparecen en la misma posición en las dos primeras columnas se cancelan. Solo permanecen las figuras únicas de cada columna.",
  };
};

// ─────────────────────────────────────────────
// GENERADOR 4: TAMAÑO PROGRESIVO
// Cada fila: pequeño → mediano → grande
// ─────────────────────────────────────────────
const genSize = () => {
  const shapes = shuffle(SHAPES).slice(0, 3); // Una figura por fila
  const fill   = pick(["#1e293b", "#475569"]);
  const sizes  = [[12, 22, 32], [14, 24, 34], [10, 20, 30]];

  const renderCell = (r, c) => (
    <Cell key={`${r}-${c}`}>
      {drawShape(shapes[r], 44, 44, sizes[r][c], fill)}
    </Cell>
  );

  const correctSize = sizes[2][2];
  const correctShape = shapes[2];

  const renderAnswer = (sz, sh) => (
    <Cell>{drawShape(sh, 44, 44, sz, fill)}</Cell>
  );

  const wrongOptions = [
    [correctSize - 8, correctShape],
    [correctSize + 8, correctShape],
    [correctSize, shapes[0]],
  ];

  const allOptions = shuffle([[correctSize, correctShape], ...wrongOptions]);
  const correctIndex = allOptions.findIndex(([sz, sh]) => sz === correctSize && sh === correctShape);

  return {
    title: "Tamaño Progresivo",
    matrix: [
      [renderCell(0,0), renderCell(0,1), renderCell(0,2)],
      [renderCell(1,0), renderCell(1,1), renderCell(1,2)],
      [renderCell(2,0), renderCell(2,1), null],
    ],
    options: allOptions.map(([sz, sh]) => renderAnswer(sz, sh)),
    correctIndex,
    explanation: "En cada fila la figura aumenta de tamaño progresivamente: pequeña → mediana → grande.",
  };
};

// ─────────────────────────────────────────────
// GENERADOR 5: ESPEJO HORIZONTAL
// Col 0 y Col 2 son espejo. Col 1 es diferente.
// ─────────────────────────────────────────────
const genMirror = () => {
  const shape = pick(SHAPES);
  const fill  = "#1e293b";
  // Offset del centro: col0 a la izquierda, col2 espejo a la derecha
  const offsets = [[-18, 0], [0, 0], [18, 0]];

  const renderCell = (r, c) => {
    const [ox, oy] = offsets[c];
    const scaleX = c === 2 ? -1 : 1; // Espejo en col2
    return (
      <Cell key={`${r}-${c}`}>
        <g transform={`translate(44,44) scale(${scaleX},1) translate(${ox},${oy})`}>
          {drawShape(shape, 0, 0, 26, fill)}
        </g>
      </Cell>
    );
  };

  // Opción correcta: reflejo de col0 en fila2
  const renderAnswer = (mirrored) => (
    <Cell>
      <g transform={`translate(44,44) scale(${mirrored ? -1 : 1},1) translate(${offsets[2][0]},0)`}>
        {drawShape(shape, 0, 0, 26, fill)}
      </g>
    </Cell>
  );

  const allOptions = shuffle([true, false, true, false]).slice(0, 4);
  // Forzar que haya exactamente una correcta (mirrored = true) y opciones incorrectas
  const opts = [true, false, false, false];
  const shuffledOpts = shuffle(opts);
  const correctIndex = shuffledOpts.indexOf(true);

  return {
    title: "Espejo Horizontal",
    matrix: [
      [renderCell(0,0), renderCell(0,1), renderCell(0,2)],
      [renderCell(1,0), renderCell(1,1), renderCell(1,2)],
      [renderCell(2,0), renderCell(2,1), null],
    ],
    options: shuffledOpts.map(m => renderAnswer(m)),
    correctIndex,
    explanation: "La tercera columna es el reflejo espejo de la primera columna. Identifica la opción que mantiene esa simetría.",
  };
};

// ─────────────────────────────────────────────
// GENERADOR 6: INTERSECCIÓN — lo que COMPARTEN dos figuras
// ─────────────────────────────────────────────
const genIntersection = () => {
  // Usamos clipPath SVG para mostrar intersección visual
  const pairs = [
    { shapeA: "square", shapeB: "circle",   correct: "circle"   },
    { shapeA: "circle", shapeB: "diamond",  correct: "diamond"  },
    { shapeA: "square", shapeB: "triangle", correct: "triangle" },
  ];
  const { shapeA, shapeB, correct } = pick(pairs);
  const fill = "#1e293b";

  const renderOverlap = (sA, sB) => (
    <Cell>
      <g opacity="0.35">{drawShape(sA, 36, 44, 36, fill)}</g>
      <g opacity="0.35">{drawShape(sB, 52, 44, 36, fill)}</g>
      {/* Intersección aproximada al centro */}
      {drawShape(sB, 44, 44, 20, fill)}
    </Cell>
  );

  const rows = [
    { a: pairs[0].shapeA, b: pairs[0].shapeB, c: pairs[0].correct },
    { a: pairs[1].shapeA, b: pairs[1].shapeB, c: pairs[1].correct },
    { a: pairs[2].shapeA, b: pairs[2].shapeB, c: null },
  ];

  const renderCell = (r, col) => {
    const row = rows[r];
    if (col === 0) return <Cell key={`${r}0`}>{drawShape(row.a, 44, 44, 32, fill)}</Cell>;
    if (col === 1) return <Cell key={`${r}1`}>{drawShape(row.b, 44, 44, 32, fill)}</Cell>;
    if (col === 2 && row.c) return <Cell key={`${r}2`}>{drawShape(row.c, 44, 44, 22, fill)}</Cell>;
    return null;
  };

  const correctShape = rows[2].c || pairs[2].correct;
  const wrongShapes = SHAPES.filter(s => s !== correctShape).slice(0, 3);
  const allOptions = shuffle([correctShape, ...wrongShapes]);
  const correctIndex = allOptions.indexOf(correctShape);

  return {
    title: "Figura de Intersección",
    matrix: [
      [renderCell(0,0), renderCell(0,1), renderCell(0,2)],
      [renderCell(1,0), renderCell(1,1), renderCell(1,2)],
      [renderCell(2,0), renderCell(2,1), null],
    ],
    options: allOptions.map(sh => <Cell>{drawShape(sh, 44, 44, 22, fill)}</Cell>),
    correctIndex,
    explanation: "La tercera columna muestra la figura que es común (intersección) entre las dos primeras. Identifica qué figura comparten las dos de la última fila.",
  };
};

// ─────────────────────────────────────────────
// GENERADOR 7: DIAGONAL — figura se mueve en diagonal
// ─────────────────────────────────────────────
const genDiagonal = () => {
  const shape = pick(SHAPES);
  const fill  = "#1e293b";
  // Posición de la figura en cada celda: avanza en diagonal
  // (r,c) → figura en posición (r*30+14, c*30+14)
  const posFn = (r, c) => [14 + c * 30, 14 + r * 30];

  const renderCell = (r, c, showFig = true) => (
    <Cell key={`${r}-${c}`}>
      {showFig && drawShape(shape, posFn(r, c)[0], posFn(r, c)[1], 20, fill)}
    </Cell>
  );

  // Posición correcta para (2,2)
  const [cx, cy] = posFn(2, 2);
  const wrongPositions = [[cx - 30, cy], [cx, cy - 30], [cx + 15, cy + 15]];

  const renderAnswer = ([px, py]) => (
    <Cell>{drawShape(shape, px, py, 20, fill)}</Cell>
  );

  const allOptions = shuffle([[cx, cy], ...wrongPositions]);
  const correctIndex = allOptions.findIndex(([x, y]) => x === cx && y === cy);

  return {
    title: "Movimiento Diagonal",
    matrix: [
      [renderCell(0,0), renderCell(0,1,false), renderCell(0,2,false)],
      [renderCell(1,0,false), renderCell(1,1), renderCell(1,2,false)],
      [renderCell(2,0,false), renderCell(2,1,false), null],
    ],
    options: allOptions.map(pos => renderAnswer(pos)),
    correctIndex,
    explanation: "La figura se desplaza en diagonal (↘): avanza una posición hacia abajo y a la derecha en cada paso.",
  };
};

// ─────────────────────────────────────────────
// GENERADOR 8: PATRÓN DE RELLENO (lleno/vacío alterna)
// ─────────────────────────────────────────────
const genFill = () => {
  const shape = pick(SHAPES);
  // Patrón: (r+c) par → lleno, impar → vacío
  const getFill = (r, c) => (r + c) % 2 === 0 ? "#1e293b" : "white";
  const getStroke = () => "#1e293b";

  const renderCell = (r, c) => (
    <Cell key={`${r}-${c}`}>
      {drawShape(shape, 44, 44, 30, getFill(r, c), getStroke())}
    </Cell>
  );

  const correctFill = getFill(2, 2); // (2+2)%2=0 → lleno
  const renderAnswer = (f) => (
    <Cell>{drawShape(shape, 44, 44, 30, f, getStroke())}</Cell>
  );

  const opts = shuffle([correctFill, correctFill === "#1e293b" ? "white" : "#1e293b",
    "#64748b", "#94a3b8"]);
  const correctIndex = opts.indexOf(correctFill);

  return {
    title: "Patrón de Relleno",
    matrix: [
      [renderCell(0,0), renderCell(0,1), renderCell(0,2)],
      [renderCell(1,0), renderCell(1,1), renderCell(1,2)],
      [renderCell(2,0), renderCell(2,1), null],
    ],
    options: opts.map(f => renderAnswer(f)),
    correctIndex,
    explanation: "El relleno alterna entre lleno y vacío siguiendo un patrón de tablero de ajedrez. Identifica si la celda faltante debe ser llena o vacía.",
  };
};

// Pool de generadores
const GENERATORS = [
  genRotation, genCount, genXOR, genSize,
  genMirror, genIntersection, genDiagonal, genFill,
];

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
const TIMER_SECONDS = 28; // Igual que la prueba real

export default function Abstracto() {
  const navigate = useNavigate();
  const [view, setView] = useState("menu"); // menu | game | results
  const [totalQ, setTotalQ] = useState(10);
  const [exercise, setExercise] = useState(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selected, setSelected] = useState(null); // null | number | "timeout"
  const timerRef = useRef(null);

  const stopTimer = () => { clearInterval(timerRef.current); timerRef.current = null; };

  const loadNextExercise = useCallback(() => {
    const gen = pick(GENERATORS);
    setExercise(gen());
    setSelected(null);
    setTimeLeft(TIMER_SECONDS);
  }, []);

  // Arrancar timer cuando carga ejercicio en modo game
  useEffect(() => {
    if (view !== "game" || exercise === null || selected !== null) return;
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          stopTimer();
          setSelected("timeout");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return stopTimer;
  }, [exercise, view, selected]);

  // Limpiar al desmontar
  useEffect(() => () => stopTimer(), []);

  const startGame = () => {
    setScore(0);
    setQuestionIdx(0);
    setView("game");
    loadNextExercise();
  };

  const handleSelect = (idx) => {
    if (selected !== null) return;
    stopTimer();
    setSelected(idx);
    if (idx === exercise.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    const next = questionIdx + 1;
    if (next >= totalQ) {
      setView("results");
    } else {
      setQuestionIdx(next);
      loadNextExercise();
    }
  };

  const resetAll = () => {
    stopTimer();
    setView("menu");
    setExercise(null);
    setSelected(null);
    setScore(0);
    setQuestionIdx(0);
  };

  const percent = totalQ ? Math.round((score / totalQ) * 100) : 0;
  const isAnswered = selected !== null;
  const isCorrect  = selected === exercise?.correctIndex;
  const isTimeout  = selected === "timeout";

  // ── MENÚ ──────────────────────────────────
  if (view === "menu") return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Razonamiento Abstracto</h1>
          <button onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-800 font-semibold">
            ← Volver
          </button>
        </div>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          Simula el módulo abstracto de la prueba Corp Favorita. Tienes{" "}
          <strong>28 segundos</strong> por pregunta para identificar el patrón
          y seleccionar la figura que completa la matriz.
        </p>

        {/* Config cantidad */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <label className="block text-slate-700 font-semibold mb-3 text-sm">
            Número de ejercicios: <span className="text-blue-600 text-lg">{totalQ}</span>
          </label>
          <input type="range" min={5} max={30} step={5} value={totalQ}
            onChange={e => setTotalQ(+e.target.value)}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>5</span><span>15</span><span>30</span>
          </div>
        </div>

        <button onClick={startGame}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors mb-3">
          COMENZAR
        </button>
        <button onClick={() => navigate(-1)}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );

  // ── RESULTADOS ─────────────────────────────
  if (view === "results") return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-2 text-slate-800">¡Prueba Finalizada!</h2>
        <div className="text-6xl font-black text-blue-600 my-6">{score}<span className="text-2xl text-slate-400">/{totalQ}</span></div>
        <p className="text-slate-500 mb-2">{percent}% de respuestas correctas</p>
        <p className="text-sm text-slate-400 mb-8">
          {percent >= 80 ? "¡Excelente desempeño!" : percent >= 60 ? "Buen intento, sigue practicando." : "Practica más para mejorar tu velocidad."}
        </p>
        <div className="flex gap-3">
          <button onClick={startGame}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
            Reintentar
          </button>
          <button onClick={resetAll}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors">
            Menú
          </button>
        </div>
      </div>
    </div>
  );

  // ── JUEGO ──────────────────────────────────
  if (!exercise) return <div className="flex items-center justify-center min-h-screen text-slate-500">Cargando...</div>;

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 14 ? "#2563eb" : timeLeft > 7 ? "#d97706" : "#dc2626";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-5 px-3">

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 bg-white rounded-xl shadow-sm px-4 py-3">
        <button onClick={resetAll} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
          ← Salir
        </button>
        <span className="text-sm font-bold text-slate-600">
          Ejercicio {questionIdx + 1} / {totalQ}
        </span>
        <span className="font-mono text-xl font-black" style={{ color: timerColor }}>
          {String(timeLeft).padStart(2, "0")}s
        </span>
      </div>

      {/* Barra de tiempo */}
      <div className="w-full max-w-2xl mb-4 bg-slate-200 rounded-full h-2 overflow-hidden">
        <div className="h-2 rounded-full transition-all duration-1000"
          style={{ width: `${timerPct}%`, background: timerColor }} />
      </div>

      {/* Tipo de ejercicio */}
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        {exercise.title}
      </p>

      {/* Matriz 3×3 */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-5 w-full max-w-2xl">
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, 1fr)", maxWidth: 320, margin: "0 auto" }}>
          {exercise.matrix.flat().map((cell, i) =>
            cell === null
              ? (
                <div key={i} className="flex items-center justify-center rounded-md text-3xl font-black text-slate-300"
                  style={{ width: 88, height: 88, background: "#f1f5f9", border: "2px dashed #94a3b8" }}>
                  ?
                </div>
              )
              : <div key={i}>{cell}</div>
          )}
        </div>
      </div>

      {/* Opciones E F G H */}
      <div className="w-full max-w-2xl grid grid-cols-4 gap-3 mb-5">
        {["E", "F", "G", "H"].map((label, idx) => {
          let borderStyle = "2px solid #e2e8f0";
          let bg = "white";
          if (isAnswered) {
            if (idx === exercise.correctIndex) { borderStyle = "3px solid #22c55e"; bg = "#f0fdf4"; }
            else if (idx === selected)          { borderStyle = "3px solid #ef4444"; bg = "#fef2f2"; }
          } else if (selected === idx) {
            borderStyle = "3px solid #3b82f6";
          }

          return (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={isAnswered}
              className="relative flex flex-col items-center rounded-xl p-2 transition-all hover:shadow-md active:scale-95"
              style={{ border: borderStyle, background: bg }}>
              <span className="text-xs font-black text-slate-400 mb-1">{label}</span>
              <div style={{ width: 72, height: 72 }}>{exercise.options[idx]}</div>
            </button>
          );
        })}
      </div>

      {/* Feedback + Siguiente */}
      {isAnswered && (
        <div className="w-full max-w-2xl animate-pulse-once">
          <div className={`rounded-xl p-4 mb-3 border-l-4 text-sm ${
            isCorrect
              ? "bg-green-50 border-green-500 text-green-800"
              : isTimeout
              ? "bg-amber-50 border-amber-500 text-amber-800"
              : "bg-red-50 border-red-500 text-red-800"
          }`}>
            <p className="font-bold mb-1">
              {isCorrect ? "✅ ¡Correcto!" : isTimeout ? "⏱ Tiempo agotado" : "❌ Incorrecto"}
            </p>
            <p>{exercise.explanation}</p>
          </div>
          <button onClick={handleNext}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-colors">
            {questionIdx + 1 >= totalQ ? "Ver resultados →" : "Siguiente ejercicio →"}
          </button>
        </div>
      )}
    </div>
  );
}