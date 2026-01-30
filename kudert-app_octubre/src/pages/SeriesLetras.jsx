import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ALPHABETS = {
  EN: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  ES: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split(""),
};

const VOWELS = "AEIOU".split("");

export default function SeriesLetras() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("modeSelection");
  const [gameMode, setGameMode] = useState("practice");
  const [difficulty, setDifficulty] = useState("medium");
  const [alphabetType, setAlphabetType] = useState("ES");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7);
  const timerRef = useRef(null);
  const [questionsInput, setQuestionsInput] = useState(10);
  const [showInstructivo, setShowInstructivo] = useState(false);
  const [problems, setProblems] = useState([]);

  const instructivoUrl =
    "https://drive.google.com/file/d/10fDxIdMrBatwk4vXrOmLkHft6gvAnKXp/preview";

  const getLetter = (index, alphabet) => {
    const len = alphabet.length;
    const safeIndex = ((index - 1) % len + len) % len;
    return alphabet[safeIndex];
  };

  const getPos = (letter, alphabet) => {
    return alphabet.indexOf(letter.toUpperCase()) + 1;
  };

  const problemGenerators = {
    simpleAsc: (alphabet) => {
      const step = Math.floor(Math.random() * 3) + 2;
      const start = Math.floor(Math.random() * (alphabet.length - step * 6)) + 1;
      const series = [];
      for (let i = 0; i < 5; i++) series.push(getLetter(start + i * step, alphabet));
      const answer = getLetter(start + 5 * step, alphabet);
      return { series, answer, explanation: `Ascendente +${step}` };
    },

    simpleDesc: (alphabet) => {
      const step = Math.floor(Math.random() * 3) + 2;
      const start = Math.floor(Math.random() * (alphabet.length - step * 6)) + step * 5;
      const series = [];
      for (let i = 0; i < 5; i++) series.push(getLetter(start - i * step, alphabet));
      const answer = getLetter(start - 5 * step, alphabet);
      return { series, answer, explanation: `Descendente -${step}` };
    },

    alternating: (alphabet) => {
      const step1 = Math.floor(Math.random() * 3) + 2;
      const step2 = Math.floor(Math.random() * 3) + 2;
      let pos = Math.floor(Math.random() * (alphabet.length - (step1 + step2) * 5)) + 1;
      const series = [];
      for (let i = 0; i < 5; i++) {
        series.push(getLetter(pos, alphabet));
        pos += i % 2 === 0 ? step1 : step2;
      }
      const answer = getLetter(pos, alphabet);
      return { series, answer, explanation: `Alternante +${step1}/${step2}` };
    },

    interleaved: (alphabet) => {
      const stepA = Math.floor(Math.random() * 3) + 2;
      const stepB = Math.floor(Math.random() * 3) + 2;
      let posA = Math.floor(Math.random() * (alphabet.length - stepA * 5)) + 1;
      let posB = Math.floor(Math.random() * (alphabet.length - stepB * 5)) + 1;
      const series = [];
      for (let i = 0; i < 6; i++) {
        if (i % 2 === 0) {
          series.push(getLetter(posA, alphabet));
          posA += stepA;
        } else {
          series.push(getLetter(posB, alphabet));
          posB += stepB;
        }
      }
      const answer = getLetter(series.length % 2 === 0 ? posA : posB, alphabet);
      return { series, answer, explanation: `Intercalada ${stepA}/${stepB}` };
    },

    doublePairs: (alphabet) => {
      let jumpBetweenStarts, gapInPair;

      // Actualizado para incluir experto
      if (difficulty === "medium" || difficulty === "hard" || difficulty === "expert") {
        gapInPair = Math.floor(Math.random() * 2) + 3; 
        jumpBetweenStarts = Math.floor(Math.random() * 4) + 5; 
      } else {
        jumpBetweenStarts = Math.floor(Math.random() * 2) + 2;
        gapInPair = 1;
      }

      const maxNeeded = (jumpBetweenStarts * 5) + gapInPair + 2;
      let start = Math.floor(Math.random() * (alphabet.length - maxNeeded)) + 1;

      const series = [];
      let currentPos = start;

      for (let i = 0; i < 4; i++) {
        const first = getLetter(currentPos, alphabet);
        const second = getLetter(currentPos + gapInPair, alphabet);
        series.push(first + second);
        currentPos += jumpBetweenStarts; 
      }

      const nextFirst = getLetter(currentPos, alphabet);
      const nextSecond = getLetter(currentPos + gapInPair, alphabet);
      const answer = nextFirst + nextSecond;

      return {
        series,
        answer,
        explanation: `Pares con salto interno +${gapInPair} y avance entre pares +${jumpBetweenStarts}`
      };
    },

    growingSteps: (alphabet) => {
      const start = Math.floor(Math.random() * (alphabet.length - 20)) + 1;
      const series = [];
      let pos = start;
      for (let i = 1; i <= 5; i++) {
        series.push(getLetter(pos, alphabet));
        pos += i;
      }
      const answer = getLetter(pos, alphabet);
      return { series, answer, explanation: `Pasos crecientes +1+2+3+4+5` };
    },
  };

  // Se filtra la lista para coincidir exactamente con el archivo de texto proporcionado
  const realisticProblems = [
    { alphabet: "EN", series: "ACEGIKM", answer: "O", options: ["O", "S", "A", "P"], explanation: "Salto +2 (inglés). A(1), C(3), E(5)... M(13), siguiente O(15)." },
    { alphabet: "ES", series: "DFHJLN", answer: "P", options: ["P", "Ñ", "O", "Q"], explanation: "Salto de una letra. Al estar la Ñ en opciones, usamos alfabeto español." },
    { alphabet: "EN", series: "KMOQS", answer: "U", options: ["U", "V", "T", "Ñ"], explanation: "+2 letras. K(11), M(13), O(15), Q(17), S(19) -> U(21). Lógica inglés." },
    { alphabet: "ES", series: "D K Q ?", answer: "X", options: ["X", "Y", "W", "Z"], explanation: "D(4) +7 = K(11). K(11) +7 = Q(18, español). Q(18)+7 = 25 (X en español)." },
    { alphabet: "EN", series: "G N T ?", answer: "Y", options: ["Z", "A", "Y", "B"], explanation: "G=7, N=14 (+7), T=20 (+6). Sigue +5: 20+5=25=Y (Alfabeto Inglés)." },
    { alphabet: "EN", series: "F M T ?", answer: "A", options: ["C", "D", "A", "B"], explanation: "F=6, M=13 (+7), T=20 (+7). Siguiente +7: 20+7=27 -> A (Inglés)." },
    { alphabet: "ES", series: "SROÑKJEDX", answer: "W", options: ["W", "V", "C", "A"], explanation: "Pares descendentes consecutivos (español por la Ñ): SR, OÑ, KJ, ED. X sigue W." },
    { alphabet: "EN", series: "HGFEDCBA", answer: "Z", options: ["Z", "Y", "A", "B"], explanation: "Descendente simple. Tras A sigue Z (circular)." },
    { alphabet: "ES", series: "UOIAUOIEUOI ?", answer: "I", options: ["A", "E", "I", "O"], explanation: "Patrón de vocales intercaladas." },
    { alphabet: "EN", series: "XYZAXYZEXYZ ?", answer: "I", options: ["I", "A", "E", "O"], explanation: "Bloque XYZ constante, vocales suben." },
    { alphabet: "EN", series: "EFGPQRHIJ ?", answer: "STU", options: ["K", "STU", "L", "T"], explanation: "Tríos alfabéticos intercalados." },
    { alphabet: "EN", series: "Q N J F ?", answer: "B", options: ["C", "B", "D", "A"], explanation: "Q(17), N(14), J(10), F(6). Restas: -3, -4, -4. Siguiente -4: 6-4=2(B)." },
    { alphabet: "EN", series: "Z W R M ?", answer: "H", options: ["H", "G", "I", "J"], explanation: "Z(26), W(23), R(18), M(13). -3, -5, -5. Siguiente -5: 8(H)." },
    { alphabet: "EN", series: "AO ER IU ?", answer: "MX", options: ["MV", "AD", "NJ", "MX"], explanation: "Primeras +4 (A->E->I->M). Segundas +3 (O->R->U->X)." },
    { alphabet: "EN", series: "BR EU HX ?", answer: "KA", options: ["KA", "JA", "KZ", "JZ"], explanation: "Primeras +3 (B->E->H->K). Segundas +3 (R->U->X->A)." },
    { alphabet: "EN", series: "BEGJLOQ ?", answer: "T", options: ["T", "S", "U", "R"], explanation: "B(2) +3 E(5) +2 G(7) +3 J(10)... Q(17)+3 = T(20)." },
    { alphabet: "EN", series: "CFILORU ?", answer: "X", options: ["X", "Y", "Z", "W"], explanation: "+3 constante. U(21)+3=24(X) (Inglés)." },
    { alphabet: "EN", series: "D G I L N Q ?", answer: "S", options: ["S", "T", "R", "U"], explanation: "+3, +2. Q(17)+2=19(S)." },
    { alphabet: "EN", series: "E H J M O ?", answer: "R", options: ["L", "S", "F", "R"], explanation: "+3, +2. O(15)+3=18(R)." },
    { alphabet: "EN", series: "K N P S U ?", answer: "X", options: ["X", "Y", "Z", "W"], explanation: "+3, +2. U(21)+3=24(X)." },
    { alphabet: "EN", series: "B E G J L ?", answer: "O", options: ["N", "O", "P", "M"], explanation: "+3, +2. L(12)+3=15(O)." },
    { alphabet: "EN", series: "A X C X E X G X ?", answer: "I", options: ["I", "H", "J", "X"], explanation: "Saltando X: A, C, E, G... (+2). Siguiente I." },
    { alphabet: "EN", series: "P Q R Q S T U T ?", answer: "V", options: ["V", "W", "X", "Q"], explanation: "Serie compleja. U + 1 = V." },
    { alphabet: "EN", series: "W Z C F I ?", answer: "L", options: ["K", "L", "M", "J"], explanation: "+3 constante. I(9)+3=12(L)." },
    { alphabet: "EN", series: "U X A D G ?", answer: "J", options: ["J", "I", "H", "K"], explanation: "+3 constante (circular). G(7)+3=10(J)." },
    { alphabet: "EN", series: "T W Z C ?", answer: "F", options: ["F", "E", "D", "G"], explanation: "+3 constante. C(3)+3=6(F)." },
    { alphabet: "EN", series: "A D E E F G I H ?", answer: "I", options: ["I", "J", "E", "K"], explanation: "Parejas consecutivas tras vocal." },
    { alphabet: "EN", series: "A C F H K ?", answer: "M", options: ["N", "J", "M", "K"], explanation: "+2, +3. K(11)+2=13(M)." },
    { alphabet: "EN", series: "D F I K N ?", answer: "P", options: ["P", "Q", "O", "R"], explanation: "+2, +3. N(14)+2=16(P)." },
    { alphabet: "EN", series: "G I L N Q ?", answer: "S", options: ["S", "T", "R", "U"], explanation: "+2, +3. Q(17)+2=19(S)." },
    { alphabet: "EN", series: "B D H J N P ?", answer: "T", options: ["N", "J", "M", "T"], explanation: "+2, +4. P(16)+4=20(T)." },
    { alphabet: "EN", series: "C E I K O Q ?", answer: "U", options: ["U", "T", "S", "V"], explanation: "+2, +4. Q(17)+4=21(U)." },
    { alphabet: "EN", series: "F H L N R T ?", answer: "X", options: ["X", "Y", "Z", "W"], explanation: "+2, +4. T(20)+4=24(X)." },
    { alphabet: "EN", series: "M N P S W ?", answer: "B", options: ["Z", "H", "B", "O"], explanation: "M(13)+1, +2, +3, +4. W(23)+5=28 -> B." },
    { alphabet: "EN", series: "A B D G K ?", answer: "P", options: ["P", "O", "N", "Q"], explanation: "Incrementos +1, +2, +3, +4. K(11)+5=16(P)." },
    { alphabet: "EN", series: "C D F I M ?", answer: "R", options: ["R", "S", "T", "Q"], explanation: "Incrementos +1, +2, +3, +4. M(13)+5=18(R)." },
    { alphabet: "EN", series: "X T P L ?", answer: "H", options: ["F", "I", "G", "H"], explanation: "-4 constante. L(12)-4=8(H)." },
    { alphabet: "EN", series: "W S O K ?", answer: "G", options: ["G", "H", "F", "E"], explanation: "-4 constante. K(11)-4=7(G)." },
    { alphabet: "EN", series: "Z V R N ?", answer: "J", options: ["J", "I", "H", "K"], explanation: "-4 constante. N(14)-4=10(J)." },
    { alphabet: "EN", series: "G H A J K E M N I ?", answer: "O", options: ["Q", "P", "N", "O"], explanation: "Pares consecutivos y vocales." },
    { alphabet: "ES", series: "B C U D E O F G ?", answer: "I", options: ["I", "H", "J", "K"], explanation: "Pares y vocales inversas." },
    { alphabet: "ES", series: "O M A U M A A M A ?", answer: "E", options: ["D", "E", "A", "C"], explanation: "Secuencia de vocales." },
    { alphabet: "ES", series: "E X I X O X U X ?", answer: "A", options: ["A", "E", "I", "O"], explanation: "Vocales saltando X." },
    { alphabet: "ES", series: "A Y E Y I Y O Y ?", answer: "U", options: ["U", "A", "E", "I"], explanation: "Vocales saltando Y." },
  ];

  const generateOptions = (correct, alphabet) => {
    const options = new Set([correct.toUpperCase()]);
    const isPair = correct.length === 2;
    const isTriple = correct.includes(" ");

    // Actualizado para incluir experto
    if (isPair && (difficulty === "medium" || difficulty === "hard" || difficulty === "expert")) {
      const first = correct[0];
      const second = correct[1];
      const pos1 = getPos(first, alphabet);
      const pos2 = getPos(second, alphabet);

      let offset = Math.random() < 0.5 ? 2 : -2;
      if (Math.abs(offset) < 2) offset = offset > 0 ? 2 : -2; 
      const trapSecond = getLetter(pos2 + offset, alphabet);
      const trap1 = first + trapSecond;
      if (trap1 !== correct) options.add(trap1);

      offset = Math.random() < 0.5 ? 2 : -2;
      const trapFirst = getLetter(pos1 + offset, alphabet);
      const trap2 = trapFirst + second;
      if (trap2 !== correct && !options.has(trap2)) options.add(trap2);
    }

    while (options.size < 4) {
      let distractor;
      if (isTriple) {
        const parts = correct.split(" ");
        distractor = parts.map((p) => getLetter(getPos(p, alphabet) + (Math.random() < 0.5 ? 2 : -2), alphabet)).join(" ");
      } else if (isPair) {
        const p1 = getLetter(getPos(correct[0], alphabet) + (Math.random() < 0.5 ? 2 : -2), alphabet);
        const p2 = getLetter(getPos(correct[1], alphabet) + (Math.random() < 0.5 ? 2 : -2), alphabet);
        distractor = p1 + p2;
      } else {
        const pos = getPos(correct, alphabet);
        const offset = Math.floor(Math.random() * 5) - 2;
        distractor = getLetter(pos + offset, alphabet);
      }
      if (distractor !== correct) options.add(distractor);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    const numQuestions = Number(questionsInput) || 10;
    setTotalQuestions(numQuestions);
    setScore(0);
    setCurrentQuestion(0);

    // Default alphabet (usado solo en modo practica libre)
    const alphabet = ALPHABETS[alphabetType];
    let time = 6;
    let showVisuals = false;
    let generatedProblems = [];

    if (gameMode === "practice") {
      if (difficulty === "easy") time = 10;
      else if (difficulty === "medium") time = 10;
      else if (difficulty === "hard") time = 6;
      else if (difficulty === "expert") time = 8; // Tiempo Experto
      
      // Visuals true para easy/medium/hard, false para expert
      showVisuals = difficulty !== "expert";

      for (let i = 0; i < numQuestions; i++) {
        const easyPool = ["simpleAsc", "simpleDesc"];
        const mediumPool = ["alternating", "interleaved", "doublePairs"];
        const hardPool = ["alternating", "interleaved", "doublePairs"];

        let pool = [];
        if (difficulty === "easy") pool = Math.random() < 0.5 ? easyPool : mediumPool;
        else if (difficulty === "medium") pool = mediumPool;
        else if (difficulty === "hard" || difficulty === "expert") pool = hardPool; // Pool Experto = Pool Hard

        const key = pool[Math.floor(Math.random() * pool.length)];
        const generator = problemGenerators[key];
        const problem = generator(alphabet);
        const options = generateOptions(problem.answer, alphabet);

        generatedProblems.push({
          series: problem.series.join(" "),
          answer: problem.answer,
          options,
          explanation: problem.explanation,
          showVisuals,
          alphabet: alphabetType // Guardamos qué alfabeto generó esto
        });
      }
    } else {
      // Modos realistas
      time = gameMode === "realistic-practice" ? 10 : 6;
      showVisuals = gameMode === "realistic-practice";

      const shuffled = shuffleArray([...realisticProblems]);
      if (numQuestions > shuffled.length) {
        const repeats = Math.ceil(numQuestions / shuffled.length);
        const extended = [];
        for (let i = 0; i < repeats; i++) {
          extended.push(...shuffleArray([...realisticProblems]));
        }
        generatedProblems = extended.slice(0, numQuestions);
      } else {
        generatedProblems = shuffled.slice(0, numQuestions);
      }

      // Procesar opciones para asegurar aleatoriedad en cada juego
      generatedProblems = generatedProblems.map(p => {
        // Usamos el alfabeto ESPECÍFICO del problema para generar distractores si hacen falta
        const probAlphabet = ALPHABETS[p.alphabet || "EN"];
        return {
          ...p,
          options: shuffleArray([...p.options]),
          showVisuals
        };
      });
    }

    setProblems(generatedProblems);
    setScreen("game");
  };

  useEffect(() => {
    if (screen === "game" && problems.length > 0 && currentQuestion < problems.length) {
      setTimeLeft(
        gameMode === "practice"
          ? difficulty === "easy"
            ? 10
            : difficulty === "medium"
            ? 10
            : difficulty === "hard"
            ? 6
            : 8 // Expert
          : gameMode === "realistic-practice"
          ? 10
          : 6
      );
      setFeedback("");
      setFeedbackColor("");
      setShowNext(false);
      setShowExplanation(false);

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
  }, [screen, currentQuestion, problems, gameMode, difficulty]);

  const handleAnswer = (option) => {
    clearInterval(timerRef.current);
    const problem = problems[currentQuestion];
    if (!problem) return;

    const isCorrect = option?.toUpperCase() === problem.answer.toUpperCase();

    if (isCorrect) {
      setScore((s) => s + 1);
      setFeedback("✅ ¡Correcto!");
      setFeedbackColor("text-green-600");
    } else {
      setFeedback(
        option === null
          ? `⏱ Tiempo agotado. Respuesta: ${problem.answer}`
          : `❌ Incorrecto. Respuesta: ${problem.answer}`
      );
      setFeedbackColor("text-red-600");
    }

    setShowExplanation(gameMode === "practice" || (gameMode === "realistic-practice" && !isCorrect));
    setShowNext(true);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= totalQuestions) {
      setScreen("end");
    } else {
      setCurrentQuestion((q) => q + 1);
    }
  };

  // Helper para determinar qué alfabeto usar en el renderizado actual
  const getCurrentAlphabet = () => {
    if (!problems[currentQuestion]) return ALPHABETS.EN;
    // Si el problema tiene un alfabeto específico (realistic), úsalo. Si no (practice), usa el del estado.
    const type = problems[currentQuestion].alphabet || alphabetType;
    return ALPHABETS[type] || ALPHABETS.EN;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
      <h1 className="text-2xl font-bold mb-6">🧩 Series de Letras</h1>

      <button
        onClick={() => navigate(-1)}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-4"
      >
        Volver
      </button>

      {screen === "modeSelection" && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => { setGameMode("practice"); setScreen("settings"); }}
            className="bg-sky-500 text-white px-6 py-4 rounded-lg w-64"
          >
            🧠 Modo Práctica
          </button>
          <button
            onClick={() => { setGameMode("realistic-practice"); setScreen("settings"); }}
            className="bg-indigo-600 text-white px-6 py-4 rounded-lg w-64"
          >
            ⏱️ Práctica Examen
          </button>
          <button
            onClick={() => { setGameMode("realistic-exam"); setScreen("settings"); }}
            className="bg-indigo-600 text-white px-6 py-4 rounded-lg w-64"
          >
            ⏱️ Examen
          </button>
          <button
            onClick={() => setShowInstructivo(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg mt-2"
          >
            📘 Instructivo
          </button>
          <button
            onClick={() => navigate("/entrenamiento")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg w-64"
          >
            🔤 Entrenamiento ABC
          </button>
        </div>
      )}

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
                  <option value="ES">Español (Incluye Ñ)</option>
                  <option value="EN">Inglés (Sin Ñ)</option>
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

      {screen === "game" && problems.length > currentQuestion && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl text-center">
          <div className="text-xl mb-4 font-mono">
            {problems[currentQuestion].series}
          </div>

          {problems[currentQuestion].showVisuals && (
            <div className="text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded">
              <p className="text-xs mb-1 font-bold text-gray-400">
                Ayuda visual ({problems[currentQuestion].alphabet === 'ES' ? 'Español con Ñ' : 'Inglés sin Ñ'}):
              </p>
              {problems[currentQuestion].series.split(" ").map((item, i) => {
                const activeAlphabet = getCurrentAlphabet();
                if (item.length === 2) {
                  const first = item[0];
                  const second = item[1];
                  return (
                    <span key={i} className="mx-1 inline-block">
                      {item} <span className="text-xs text-sky-600">({getPos(first, activeAlphabet)},{getPos(second, activeAlphabet)})</span>
                    </span>
                  );
                } else if (item.length === 1) {
                  return (
                    <span key={i} className="mx-1 inline-block">
                      {item} <span className="text-xs text-sky-600">({getPos(item, activeAlphabet)})</span>
                    </span>
                  );
                } else {
                  return <span key={i}>{item} </span>;
                }
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            {problems[currentQuestion].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="text-lg mb-2 font-bold">
            ⏳ Tiempo restante: {timeLeft}s
          </div>

          {showExplanation && (
            <div className="text-slate-700 mb-4 italic bg-yellow-50 p-3 rounded border border-yellow-200">
              {problems[currentQuestion].explanation}
            </div>
          )}

          {showNext && (
            <button
              onClick={nextQuestion}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg mt-4"
            >
              Siguiente →
            </button>
          )}

          <div className={`text-xl font-bold mt-4 ${feedbackColor}`}>
            {feedback}
          </div>

          <div className="text-slate-600 mt-4 text-sm">
            Pregunta {currentQuestion + 1} de {totalQuestions}
          </div>
        </div>
      )}

      {screen === "end" && (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-lg">
          <h2 className="text-3xl font-bold mb-4">¡Fin del entrenamiento! 🎯</h2>
          <p className="text-2xl mb-2">
            Puntaje: <strong>{score} / {totalQuestions}</strong>
          </p>
          <p className="text-xl mb-6 text-indigo-600">
            Aciertos: {((score / totalQuestions) * 100).toFixed(1)}%
          </p>
          <button
            onClick={() => setScreen("modeSelection")}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg"
          >
            Volver al menú
          </button>
        </div>
      )}
    </div>
  );
}