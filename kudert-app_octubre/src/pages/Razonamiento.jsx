import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Razonamiento.jsx
 *
 * - Modo: práctica configurable (elige cantidad de ejercicios).
 * - Temporizador: 6s por ejercicio; si llega a 0 se registra como INCORRECTA automáticamente.
 * - Incluye plantillas "PDF-like" (rotaciones, matrices/combos, movimiento circular) + variaciones generadas.
 *
 * Copiar/pegar completo en tu archivo Razonamiento.jsx
 */

// ================== UTILIDADES SVG ==================
const Heart = ({ x = 50, y = 50, size = 28, fill = "black", rotate = 0 }) => {
  // Heart path scaled and translated
  const s = size / 50;
  const transform = `translate(${x - 50}, ${y - 50}) scale(${s}) rotate(${rotate},50,50)`;
  return (
    <g transform={transform}>
      <path
        d="M50 77 L20 45 A15 15 0 0 1 50 25 A15 15 0 0 1 80 45 Z"
        fill={fill}
        stroke="black"
        strokeWidth="2"
      />
    </g>
  );
};

const PolygonShape = ({ sides = 3, x = 50, y = 50, size = 30, fill = "white", rotate = 0 }) => {
  const angle = (2 * Math.PI) / sides;
  const points = Array.from({ length: sides })
    .map((_, i) => {
      const px = x + size * Math.cos(i * angle - Math.PI / 2 + (rotate * Math.PI) / 180);
      const py = y + size * Math.sin(i * angle - Math.PI / 2 + (rotate * Math.PI) / 180);
      return `${px},${py}`;
    })
    .join(" ");
  return <polygon points={points} fill={fill} stroke="black" strokeWidth="2" />;
};

const Face = ({ x = 50, y = 50, size = 38, rotate = 0 }) => {
  const transform = `translate(${x - 50}, ${y - 50}) rotate(${rotate},50,50)`;
  return (
    <g transform={transform}>
      <circle cx="50" cy="50" r={size} fill="#ffe7b8" stroke="black" strokeWidth="2" />
      <circle cx="40" cy="45" r="4" fill="black" />
      <circle cx="60" cy="45" r="4" fill="black" />
      <path d="M40 62 Q50 70 60 62" stroke="black" strokeWidth="2" fill="none" />
    </g>
  );
};

// ================== GENERADORES / PLANTILLAS (PDF-like) ==================
/**
 * Cada plantilla devuelve:
 * {
 *   renderMain: () => JSX (SVG main sequence shown to user),
 *   correctIndex: number (index 0..3),
 *   renderOption(i): JSX (SVG option i),
 *   explanation: string
 * }
 *
 * We'll implement 3 plantillas: Rotaciones+corazones, Matriz combinación, Movimiento circular.
 */

// Helper random
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Shuffle
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// 1) Rotación + corazones (Ejemplo 2 parecido)
const templateRotationHearts = (seed = {}) => {
  // seed: rotation direction and heart color pattern
  const startRot = seed.startRot ?? rand(0, 90); // starting face rotation degrees
  const step = seed.step ?? (Math.random() > 0.5 ? 90 : 45); // rotation step
  const dir = seed.dir ?? (Math.random() > 0.5 ? 1 : -1);
  const heartPositions = seed.heartPositions ?? [
    { x: 30, y: 30, color: "black" },
    { x: 70, y: 30, color: "white" },
    { x: 30, y: 70, color: "black" },
  ];
  // Sequence: show 3 panels (rotating face) + hearts moving positions (pattern)
  // correct is the next rotation + expected heart positions combination
  const correctRot = startRot + dir * step * 3;
  const correctHearts = heartPositions.map((p) => {
    // shift each heart one place clockwise (simulated pattern)
    return { x: p.x === 30 ? 70 : 30, y: p.y, color: p.color };
  });

  // options: create 4 candidates combining rotations and heart positions
  const options = [];
  // option A: correct
  options.push({ rot: correctRot, hearts: correctHearts });
  // option B: rotation correct but hearts different
  options.push({
    rot: correctRot,
    hearts: correctHearts.map((h, i) => ({ ...h, color: h.color === "black" ? "white" : "black" })),
  });
  // option C: rotation wrong (repeat previous)
  options.push({ rot: startRot + dir * step * 1, hearts: correctHearts });
  // option D: rotation off by step and hearts swapped
  options.push({
    rot: correctRot + dir * step,
    hearts: correctHearts.slice().reverse(),
  });

  const ordered = shuffle(options);
  const correctIndex = ordered.findIndex((o) => o.rot === correctRot && o.hearts[0].x === correctHearts[0].x && o.hearts[0].color === correctHearts[0].color);

  return {
    renderMain: () => (
      <div className="flex gap-2 items-center">
        {/* Show 3 panels horizontally as sequence */}
        {[0, 1, 2].map((i) => (
          <svg key={i} width="110" height="110" viewBox="0 0 100 100" className="border rounded">
            <rect x="0" y="0" width="100" height="100" fill="white" />
            <Face x={50} y={35} size={28} rotate={startRot + dir * step * i} />
            {/* hearts positions rotate/move slightly */}
            <Heart x={30 + (i * 10)} y={70} size={18} fill={heartPositions[0].color} rotate={i * 15} />
            <Heart x={70 - (i * 10)} y={70} size={18} fill={heartPositions[1].color} rotate={-i * 10} />
          </svg>
        ))}
        <div style={{ fontSize: 28, fontWeight: "700" }}>?</div>
      </div>
    ),
    options: ordered.map((opt) => (props) => (
      <svg width="120" height="120" viewBox="0 0 100 100" className="border rounded">
        <rect x="0" y="0" width="100" height="100" fill="white" />
        <Face x={50} y={45} size={32} rotate={opt.rot} />
        {opt.hearts.map((h, i) => (
          <Heart key={i} x={h.x} y={h.y} size={12} fill={h.color} />
        ))}
      </svg>
    )),
    correctIndex,
    explanation:
      "Patrón: la cara rota avanza en el mismo sentido y grado de rotación; los corazones se mueven consistentemente (se desplazan). La opción correcta combina la rotación siguiente con la posición esperada de los corazones.",
  };
};

// 2) Matriz / combinación de colores (Ejemplo 1 parecido)
const templateMatrixCombine = (seed = {}) => {
  // We'll represent a 2x2 grid where combining color positions produce result
  const baseColors = seed.baseColors ?? ["black", "white", "red", "blue"];
  // The rule: combine adjacent cells, but the output cell must have colors that are different from neighbors (as PDF example)
  // We'll create sequence: first two panels => combined third panel
  const panelA = ["red", "blue", "white", "black"].map((c) => c);
  const panelB = ["blue", "red", "black", "white"].map((c) => c);
  // Correct combined panel: for each position, pick the color that's different from same position in other panel
  const combined = panelA.map((c, i) => (c === panelB[i] ? c : (c === "white" ? panelB[i] : c)));

  // Build options: one correct, others with swaps
  const optionsRaw = [
    combined,
    combined.slice().reverse(),
    panelA.slice(),
    panelB.slice(),
  ];
  const options = shuffle(optionsRaw);
  const correctIndex = options.findIndex((o) => o.join(",") === combined.join(","));

  const renderGrid = (arr) => (
    <>
      {/* 2x2 grid */}
      <rect x="5" y="5" width="90" height="90" fill="white" />
      <rect x="10" y="10" width="40" height="40" fill={arr[0]} stroke="black" />
      <rect x="50" y="10" width="40" height="40" fill={arr[1]} stroke="black" />
      <rect x="10" y="50" width="40" height="40" fill={arr[2]} stroke="black" />
      <rect x="50" y="50" width="40" height="40" fill={arr[3]} stroke="black" />
    </>
  );

  return {
    renderMain: () => (
      <div className="flex gap-2 items-center">
        <svg width="110" height="110" viewBox="0 0 100 100" className="border rounded">
          {renderGrid(panelA)}
        </svg>
        <div style={{ fontSize: 22, fontWeight: 700 }}>+</div>
        <svg width="110" height="110" viewBox="0 0 100 100" className="border rounded">
          {renderGrid(panelB)}
        </svg>
        <div style={{ fontSize: 28, fontWeight: 700 }}>=</div>
        <div style={{ fontSize: 28, fontWeight: 700 }}>?</div>
      </div>
    ),
    options: options.map((opt) => (props) => (
      <svg width="120" height="120" viewBox="0 0 100 100" className="border rounded">
        {renderGrid(opt)}
      </svg>
    )),
    correctIndex,
    explanation:
      "Patrón: cada celda se combina observando las dos matrices; aquí la combinación produce la celda que no repite color de la misma posición o sigue la regla mostrada en los paneles de ejemplo.",
  };
};

// 3) Movimiento circular alrededor (Ejemplo 7 parecido)
const templateCircularMovement = (seed = {}) => {
  // small circle orbiting a square; sequence shows orbit positions moving clockwise
  const startPos = seed.startPos ?? 0; // 0..3 positions (top, right, bottom, left)
  const dir = seed.dir ?? 1; // clockwise
  // After three moves, next will be position = startPos + 3*dir
  const nextPos = (startPos + 3 * dir + 4) % 4;
  // Options: four positions with one correct
  const options = [0, 1, 2, 3].map((p) => ({ pos: p }));
  const ordered = shuffle(options);
  const correctIndex = ordered.findIndex((o) => o.pos === nextPos);

  const renderPanel = (posOffset = 0) => {
    // show the orbiting small circle position after posOffset moves
    const pos = (startPos + posOffset + 4) % 4;
    const coords = [
      { x: 50, y: 20 },
      { x: 80, y: 50 },
      { x: 50, y: 80 },
      { x: 20, y: 50 },
    ][pos];
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className="border rounded">
        <rect x="0" y="0" width="100" height="100" fill="white" />
        <rect x="30" y="30" width="40" height="40" fill="#ddd" stroke="black" />
        <circle cx={coords.x} cy={coords.y} r="8" fill="black" />
      </svg>
    );
  };

  return {
    renderMain: () => (
      <div className="flex gap-2 items-center">
        {[0, 1, 2].map((i) => (
          <div key={i}>{renderPanel(i)}</div>
        ))}
        <div style={{ fontSize: 28, fontWeight: 700 }}>?</div>
      </div>
    ),
    options: ordered.map((opt) => (props) => (
      <svg width="120" height="120" viewBox="0 0 100 100" className="border rounded">
        <rect x="0" y="0" width="100" height="100" fill="white" />
        <rect x="20" y="20" width="60" height="60" fill="#eee" stroke="black" />
        {/* draw candidate pos */}
        <circle
          cx={[50, 80, 50, 20][opt.pos]}
          cy={[20, 50, 80, 50][opt.pos]}
          r="8"
          fill="black"
        />
      </svg>
    )),
    correctIndex,
    explanation:
      "Patrón: el punto gira alrededor del cuadrado en la misma dirección y saltos; la opción correcta coloca el punto en la posición esperada según la secuencia.",
  };
};

// Factory: return a function that produces a randomized instance of a template (mix of base + variation)
const allTemplates = [
  () => templateRotationHearts({ startRot: rand(0, 45), step: Math.random() > 0.5 ? 90 : 45, dir: Math.random() > 0.5 ? 1 : -1 }),
  () => templateMatrixCombine(),
  () => templateCircularMovement({ startPos: rand(0, 3), dir: Math.random() > 0.5 ? 1 : -1 }),
];

// ================== MAIN COMPONENT ==================
export default function Razonamiento() {
  const navigate = useNavigate();

  // UI config
  const [phase, setPhase] = useState("config"); // config | running | finished
  const [total, setTotal] = useState(8); // default
  const [seedList, setSeedList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6.0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const [autoTaken, setAutoTaken] = useState(false); // if timeout auto-taken

  const currentTemplate = templates[currentIndex];

  // Start run: build a list of exercises (mix of original templates + generated variants)
  const startRun = () => {
    // ensure at least one of each PDF-like template appears in the run:
    const guaranteed = allTemplates.map((f) => f());
    const remainingCount = Math.max(0, total - guaranteed.length);

    const others = Array.from({ length: remainingCount }).map(() => {
      const t = allTemplates[Math.floor(Math.random() * allTemplates.length)];
      return t();
    });

    const mixed = shuffle([...guaranteed, ...others]).slice(0, total);
    // For reproducibility we don't need seeds; templates already randomized
    setTemplates(mixed);
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setShowExplanation(false);
    setPhase("running");
    setTimeLeft(6.0);
    setAutoTaken(false);
  };

  // Timer effect per exercise
  useEffect(() => {
    if (phase !== "running") {
      clearInterval(timerRef.current);
      return;
    }
    // reset timer
    setTimeLeft(6.0);
    setSelected(null);
    setShowExplanation(false);
    setAutoTaken(false);

    const start = Date.now();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const left = Math.max(0, 6 - elapsed);
      setTimeLeft(parseFloat(left.toFixed(2)));
      // progress bar handled via left / 6
      if (left <= 0) {
        clearInterval(timerRef.current);
        // mark incorrect automatically
        if (!autoTaken) {
          setAutoTaken(true);
          setSelected("TIMEOUT"); // sentinel
          setShowExplanation(true);
        }
      }
    }, 100);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex]);

  // When user selects an option
  const handleSelect = (i) => {
    if (!currentTemplate) return;
    if (selected !== null) return; // already answered
    setSelected(i);
    clearInterval(timerRef.current);

    if (i === currentTemplate.correctIndex) {
      setScore((s) => s + 1);
      setShowExplanation(false);
    } else {
      setShowExplanation(true);
    }
  };

  // Next exercise (or finish)
  const handleNext = () => {
    if (currentIndex + 1 >= templates.length) {
      setPhase("finished");
      clearInterval(timerRef.current);
      return;
    }
    setCurrentIndex((c) => c + 1);
    setSelected(null);
    setShowExplanation(false);
    setAutoTaken(false);
    setTimeLeft(6.0);
  };

  const restart = () => {
    setPhase("config");
    setTemplates([]);
    setCurrentIndex(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
  };

  // Progress percentage
  const progressPct = useMemo(() => {
    if (phase !== "running") return 0;
    return Math.round((currentIndex / total) * 100);
  }, [currentIndex, total, phase]);

  // Render helpers for options grid A-D
  const renderOptionsGrid = () => {
    if (!currentTemplate) return null;
    return (
      <div className="grid grid-cols-2 gap-3 mt-4">
        {currentTemplate.options.map((OptionComponent, idx) => {
          const isCorrect = idx === currentTemplate.correctIndex;
          const isSelected = selected === idx;
          const bg =
            selected === null
              ? "bg-white"
              : isCorrect
              ? "bg-green-200"
              : isSelected
              ? "bg-red-200"
              : "bg-white";
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`p-2 rounded border ${bg}`}
              style={{ minHeight: 120 }}
              aria-label={`Opción ${String.fromCharCode(65 + idx)}`}
            >
              <div className="flex items-center justify-center h-full">
                <OptionComponent />
              </div>
              <div className="text-center mt-2 font-bold">{String.fromCharCode(65 + idx)}</div>
            </button>
          );
        })}
      </div>
    );
  };

  // Basic layout styles inline-tailwind friendly classes (assuming tailwind is present)
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6">
      <h1 className="text-2xl font-bold mb-4">Razonamiento - Simulador Kudert (Abstracto)</h1>

      {phase === "config" && (
        <div className="w-full max-w-xl border rounded p-4 shadow">
          <p className="mb-3">Configuración de práctica</p>
          <label className="block mb-2">
            Cantidad de ejercicios:
            <input
              type="number"
              min={1}
              max={30}
              value={total}
              onChange={(e) => {
                const v = parseInt(e.target.value || "1", 10);
                setTotal(Math.max(1, Math.min(30, v)));
              }}
              className="ml-3 p-1 border rounded w-20"
            />
          </label>

          <div className="flex gap-2 mt-4">
            <button
              onClick={startRun}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Iniciar práctica
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Volver
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Nota: cada ejercicio tiene <b>6 segundos</b>. Si se agota el tiempo, se tomará como
            incorrecto automáticamente.
          </div>
        </div>
      )}

      {phase === "running" && currentTemplate && (
        <div className="w-full max-w-3xl mt-4">
          <div className="flex justify-between items-center mb-2">
            <div>Ejercicio {currentIndex + 1} / {total}</div>
            <div>Aciertos: {score}</div>
          </div>

          {/* Timer bar */}
          <div className="w-full bg-gray-200 h-3 rounded overflow-hidden mb-3">
            <div
              style={{
                width: `${(timeLeft / 6) * 100}%`,
                height: "100%",
                transition: "width 0.1s linear",
                background: timeLeft > 2 ? "#60a5fa" : "#fb7185",
              }}
            />
          </div>
          <div className="mb-2 text-sm">
            Tiempo restante: <b>{timeLeft.toFixed(2)}s</b>
            {selected === "TIMEOUT" && <span className="ml-3 text-red-600 font-bold">Tiempo agotado — marcado como incorrecto</span>}
          </div>

          {/* Main rendered example */}
          <div className="flex justify-center mb-3">
            {currentTemplate.renderMain()}
          </div>

          {/* Options (A-D) */}
          {renderOptionsGrid()}

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-4 p-3 bg-yellow-50 border rounded">
              <div className="font-bold mb-1">Explicación</div>
              <div>{currentTemplate.explanation}</div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleNext}
              disabled={selected === null && !autoTaken}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {currentIndex + 1 >= templates.length ? "Finalizar" : "Siguiente"}
            </button>
            <button
              onClick={() => {
                clearInterval(timerRef.current);
                setPhase("config");
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancelar sesión
            </button>
          </div>
        </div>
      )}

      {phase === "finished" && (
        <div className="w-full max-w-xl mt-6 border rounded p-4 shadow">
          <h2 className="text-xl font-bold">Práctica finalizada</h2>
          <p className="mt-2">
            Resultado: <b>{score}</b> / {total} aciertos.
          </p>
          <div className="flex gap-2 mt-4">
            <button onClick={restart} className="bg-blue-600 text-white px-4 py-2 rounded">
              Reiniciar
            </button>
            <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-4 py-2 rounded">
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
