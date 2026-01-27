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
      // Lógica modificada: Diferencia interna entre 3 y 4 para dificultad media/dificil
      let jumpBetweenStarts, gapInPair;

      if (difficulty === "medium" || difficulty === "hard") {
        // Genera gapInPair de 3 o 4 (Mayor a 2, menor a 5)
        gapInPair = Math.floor(Math.random() * 2) + 3; 
        
        // El salto entre pares debe ser mayor que el gap interno para evitar superposición visual
        // Generamos un salto entre 5 y 8
        jumpBetweenStarts = Math.floor(Math.random() * 4) + 5; 
      } else {
        // Lógica para fácil (consecutivos)
        jumpBetweenStarts = Math.floor(Math.random() * 2) + 2;
        gapInPair = 1;
      }

      // Punto de inicio seguro para que quepa toda la serie
      const maxNeeded = (jumpBetweenStarts * 5) + gapInPair + 2;
      let start = Math.floor(Math.random() * (alphabet.length - maxNeeded)) + 1;

      const series = [];
      let currentPos = start;

      for (let i = 0; i < 4; i++) {
        const first = getLetter(currentPos, alphabet);
        const second = getLetter(currentPos + gapInPair, alphabet);
        series.push(first + second);
        // Avanzamos la posición inicial del siguiente par según el salto calculado
        currentPos += jumpBetweenStarts; 
      }

      // Respuesta: siguiente par
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

  const realisticProblems = [
    { series: "ACEGIKM", answer: "O", options: ["O", "S", "A", "P"], explanation: "En la sucesión se salta una letra cada vez: A (B) C (D) E (F) G (H) I (J) K (L) M. La siguiente letra sería O. En el alfabeto español le seguiría la Ñ, pero como no está en las opciones y sí aparece la O, se entiende que se usa el alfabeto inglés." },
    { series: "DFHJLN", answer: "P", options: ["P", "Ñ", "O", "Q"], explanation: "Patrón: D (E) F (G) H (I) J (K) L (M) N. Salta una letra entre cada una. La siguiente es P. Como hay Ñ en las opciones, usamos alfabeto español." },
    { series: "KMOQS", answer: "U", options: ["U", "V", "T", "Ñ"], explanation: "K (L) M (N) O (P) Q (R) S. Salta una letra. La siguiente es U. Como aparece la Ñ en opciones, verifiquemos: en español sería Ñ después de O, pero aquí la serie claramente sigue el orden inglés tras S→U." },
    { series: "D K Q ?", answer: "X", options: ["X", "Y", "W", "Z"], explanation: "Pasamos a números: D=4, K=11, Q=18. K - D = 7, Q - K = 7. El patrón es sumar 7. Entonces: 18 + 7 = 25, que corresponde a X en el alfabeto español (sin incluir la Ñ como posición fija aquí)." },
    { series: "G N T ?", answer: "Y", options: ["Z", "A", "Y", "B"], explanation: "G=7, N=14, T=20 → diferencias: +7, +6. Siguiente diferencia +5: 20+5=25=Y (alfabeto inglés)." },
    { series: "F M T ?", answer: "A", options: ["C", "D", "A", "B"], explanation: "F=6, M=13, T=20 → +7, +7. Siguiente +7: 20+7=27, excede 26 → 27-26=1=A." },
    { series: "SROÑKJEDX", answer: "W", options: ["W", "V", "C", "A"], explanation: "Al aparecer la Ñ, usamos el alfabeto español. Separamos en pares: SR (S=19, R=18), OÑ (O=16, Ñ=15), KJ (K=11, J=10), ED (E=5, D=4), X? Cada par son letras consecutivas en orden descendente. La última letra dada es X=25, le seguiría W=24." },
    { series: "HGFEDCBA", answer: "Z", options: ["Z", "Y", "A", "B"], explanation: "Descendente consecutivo desde H hasta A. Después de A (1) no puede bajar, en este contexto la serie terminaría, pero si continuara circularmente, A→Z (26). Opción más lógica en ejercicios comunes: Z." },
    { series: "UOIAUOIEUOI ?", answer: "I", options: ["A", "E", "I", "O"], explanation: "La secuencia se repite: UOI, luego A, luego UOI, luego E, luego UOI. Entre cada bloque UOI hay una vocal en orden: A, E, I, O, U. Entonces después del último UOI sigue I." },
    { series: "XYZAXYZEXYZ ?", answer: "I", options: ["I", "A", "E", "O"], explanation: "Bloque constante XYZ, luego vocal intercalada: A, E, siguiente vocal en orden: I." },
    { series: "EFGPQRHIJ ?", answer: "STU", options: ["K", "STU", "L", "T"], explanation: "Separamos las letras en grupos de tres según el orden alfabético: EFG – PQR – HIJ – ? Vemos que hay dos series intercaladas: una avanza normalmente (EFG, HIJ, KLM…) y otra está en medio (PQR, STU…). La serie que toca continuar es PQR, por lo que sigue STU." },
    { series: "Q N J F ?", answer: "B", options: ["C", "B", "D", "A"], explanation: "Letras en números (inglés): Q=17, N=14, J=10, F=6. Diferencias: 17-14=3, 14-10=4, 10-6=4. El patrón parece ser -3, -4, -4. Si repetimos -4: 6-4=2, que es B." },
    { series: "Z W R M ?", answer: "H", options: ["H", "G", "I", "J"], explanation: "Z=26, W=23 (-3), R=18 (-5), M=13 (-5). Diferencias -3, -5, -5. Siguiente -5: 13-5=8=H." },
    { series: "AO ER IU ?", answer: "MX", options: ["MV", "AD", "NJ", "MX"], explanation: "Analizamos primeras letras: A=1, E=5, I=9 → diferencia +4, siguiente 9+4=13=M. Segundas letras: O=15, R=18, U=21 → diferencia +3, siguiente 21+3=24=X. El par siguiente es MX." },
    { series: "BR EU HX ?", answer: "KA", options: ["KA", "JA", "KZ", "JZ"], explanation: "Primeras: B=2, E=5, H=8 → +3, siguiente 8+3=11=K. Segundas: R=18, U=21, X=24 → +3, siguiente 24+3=27 → 27-26=1=A. Par: KA." },
    { series: "BEGJLOQ ?", answer: "T", options: ["T", "S", "U", "R"], explanation: "Posiciones (español con Ñ=15 o inglés con O=15). Analicemos en inglés para que coincida con las letras dadas: B=2, E=5, G=7, J=10, L=12, O=15, Q=17. Diferencias: +3, +2, +3, +2, +3, +2. El patrón alterna +3 y +2. La última diferencia fue +2 (O→Q), ahora toca +3: 17+3=20=T." },
    { series: "CFILORU ?", answer: "X", options: ["X", "Y", "Z", "W"], explanation: "C=3, F=6 (+3), I=9 (+3), L=12 (+3), O=15 (+3), R=18 (+3), U=21 (+3). Constante +3. Siguiente 21+3=24=X." },
    { series: "D G I L N Q ?", answer: "S", options: ["S", "T", "R", "U"], explanation: "D=4, G=7 (+3), I=9 (+2), L=12 (+3), N=14 (+2), Q=17 (+3). Patrón +3,+2. Siguiente +2: 17+2=19=S." },
    { series: "E H J M O ?", answer: "R", options: ["L", "S", "F", "R"], explanation: "Valores: E=5, H=8, J=10, M=13, O=15. Diferencias: +3, +2, +3, +2. Sigue +3: 15+3=18=R." },
    { series: "K N P S U ?", answer: "X", options: ["X", "Y", "Z", "W"], explanation: "K=11, N=14 (+3), P=16 (+2), S=19 (+3), U=21 (+2). Siguiente +3: 21+3=24=X." },
    { series: "B E G J L ?", answer: "O", options: ["N", "O", "P", "M"], explanation: "B=2, E=5 (+3), G=7 (+2), J=10 (+3), L=12 (+2). Siguiente +3: 12+3=15=O." },
    { series: "I J L J J M K J N ?", answer: "L", options: ["I", "L", "J", "M"], explanation: "Separamos la J que se repite cada dos posiciones y analizamos el resto: I(9) – L(12) – J(10) – M(13) – K(11) – N(14) – ? Las letras sin J muestran: 9, 12, 10, 13, 11, 14… patrón: +3, -2, +3, -2, +3. Aplicamos -2 a 14: 14-2=12=L." },
    { series: "A X C X E X G X ?", answer: "I", options: ["I", "H", "J", "X"], explanation: "Eliminamos X constante: A, C, E, G… letras alternas (saltando una). Siguiente I." },
    { series: "P Q R Q S T U T ?", answer: "V", options: ["V", "W", "X", "Q"], explanation: "Eliminando Q y T que son intercalados fijos: P, R, S, U… Patrón: P(16), R(18) +2, S(19) +1, U(21) +2, siguiente probable +1: 21+1=22=V." },
    { series: "W Z C F I ?", answer: "L", options: ["K", "L", "M", "J"], explanation: "Considerando el alfabeto inglés (27 letras con Ñ no presente), o español sin Ñ en esta serie. Posiciones: W=23, Z=26, C=3 (28-25=3 si excede 26), F=6, I=9. El patrón es +3 cada vez. 9+3=12=L." },
    { series: "U X A D G ?", answer: "J", options: ["J", "I", "H", "K"], explanation: "U=21, X=24 (+3), A=1 (+3 circular), D=4 (+3), G=7 (+3). Siguiente 7+3=10=J." },
    { series: "T W Z C ?", answer: "F", options: ["F", "E", "D", "G"], explanation: "T=20, W=23 (+3), Z=26 (+3), C=29-26=3 (+3 circular). Siguiente 3+3=6=F." },
    { series: "A D E E F G I H ?", answer: "I", options: ["I", "J", "E", "K"], explanation: "Ordenamos visualmente: A – (D E) – E – (F G) – I – (H ?) Parece que hay una vocal, luego dos letras consecutivas, luego vocal, etc. La última pareja empezó con H, le sigue I para completar H I." },
    { series: "A C F H K ?", answer: "M", options: ["N", "J", "M", "K"], explanation: "Posiciones: A=1, C=3, F=6, H=8, K=11. Diferencias: +2, +3, +2, +3. Sigue +2: 11+2=13=M." },
    { series: "D F I K N ?", answer: "P", options: ["P", "Q", "O", "R"], explanation: "D=4, F=6 (+2), I=9 (+3), K=11 (+2), N=14 (+3). Siguiente +2: 14+2=16=P." },
    { series: "G I L N Q ?", answer: "S", options: ["S", "T", "R", "U"], explanation: "G=7, I=9 (+2), L=12 (+3), N=14 (+2), Q=17 (+3). Siguiente +2: 17+2=19=S." },
    { series: "B D H J N P ?", answer: "T", options: ["N", "J", "M", "T"], explanation: "Posiciones: B=2, D=4, H=8, J=10, N=14, P=16. Diferencias: +2, +4, +2, +4, +2. Sigue +4: 16+4=20=T." },
    { series: "C E I K O Q ?", answer: "U", options: ["U", "T", "S", "V"], explanation: "C=3, E=5 (+2), I=9 (+4), K=11 (+2), O=15 (+4), Q=17 (+2). Siguiente +4: 17+4=21=U." },
    { series: "F H L N R T ?", answer: "X", options: ["X", "Y", "Z", "W"], explanation: "F=6, H=8 (+2), L=12 (+4), N=14 (+2), R=18 (+4), T=20 (+2). Siguiente +4: 20+4=24=X." },
    { series: "M N P S W ?", answer: "B", options: ["Z", "H", "B", "O"], explanation: "Posiciones: M=13, N=14 (+1), P=16 (+2), S=19 (+3), W=23 (+4). El incremento aumenta en 1 cada vez. Siguiente incremento +5: 23+5=28. Como el alfabeto tiene 26 letras, 28-26=2 → B." },
    { series: "A B D G K ?", answer: "P", options: ["P", "O", "N", "Q"], explanation: "A=1, B=2 (+1), D=4 (+2), G=7 (+3), K=11 (+4). Incremento creciente +1 cada paso. Siguiente +5: 11+5=16=P." },
    { series: "C D F I M ?", answer: "R", options: ["R", "S", "T", "Q"], explanation: "C=3, D=4 (+1), F=6 (+2), I=9 (+3), M=13 (+4). Siguiente +5: 13+5=18=R." },
    { series: "X T P L ?", answer: "H", options: ["F", "I", "G", "H"], explanation: "Posiciones: X=24, T=20, P=16, L=12. Diferencia constante: -4. Siguiente: 12-4=8=H." },
    { series: "W S O K ?", answer: "G", options: ["G", "H", "F", "E"], explanation: "W=23, S=19 (-4), O=15 (-4), K=11 (-4). Siguiente 11-4=7=G." },
    { series: "Z V R N ?", answer: "J", options: ["J", "I", "H", "K"], explanation: "Z=26, V=22 (-4), R=18 (-4), N=14 (-4). Siguiente 14-4=10=J." },
    { series: "G H A J K E M N I ?", answer: "O", options: ["Q", "P", "N", "O"], explanation: "Separamos pares regulares: GH, JK, MN, OP… y vocales intercaladas: A, E, I. La secuencia es: par GH, vocal A, par JK, vocal E, par MN, vocal I, luego sigue el par OP. La siguiente letra es O." },
    { series: "B C U D E O F G ?", answer: "I", options: ["I", "H", "J", "K"], explanation: "Pares: BC, DE, FG… vocales intercaladas: U, O, ?. Vocales en orden inverso U, O, I, E, A. Siguiente I." },
    { series: "L M E N O A P Q ?", answer: "U", options: ["I", "U", "O", "E"], explanation: "Pares: LM, NO, PQ… vocales intercaladas: E, A, ?. Vocales en orden E, A, U (quizás no secuencia estándar). Posiblemente orden alfabético inverso parcial: E(5), A(1), siguiente circular sería U(21)." },
    { series: "O M A U M A A M A ?", answer: "E", options: ["D", "E", "A", "C"], explanation: "Eliminamos las constantes \"MA\" repetidas: queda O, U, A, ?. Las vocales en orden circular: A E I O U A E I O U A… Después de A (en la posición relativa de la serie) sigue E." },
    { series: "E X I X O X U X ?", answer: "A", options: ["A", "E", "I", "O"], explanation: "Eliminar X: E, I, O, U. Vocales en orden saltando una: E, I, O, U, A. Siguiente A." },
    { series: "A Y E Y I Y O Y ?", answer: "U", options: ["U", "A", "E", "I"], explanation: "Eliminar Y: A, E, I, O. Siguiente U." },
  ];

  // Mejora clave: trampas más inteligentes para pares en modo medio
  const generateOptions = (correct, alphabet) => {
    const options = new Set([correct.toUpperCase()]);
    const isPair = correct.length === 2;
    const isTriple = correct.includes(" ");

    if (isPair && (difficulty === "medium" || difficulty === "hard")) {
      const first = correct[0];
      const second = correct[1];
      const pos1 = getPos(first, alphabet);
      const pos2 = getPos(second, alphabet);

      // Trampa fuerte: misma primera letra + segunda con diferencia mínima de 2
      let offset = Math.random() < 0.5 ? 2 : -2;
      if (Math.abs(offset) < 2) offset = offset > 0 ? 2 : -2; // forzamos mínimo ±2
      const trapSecond = getLetter(pos2 + offset, alphabet);
      const trap1 = first + trapSecond;
      if (trap1 !== correct) options.add(trap1);

      // Trampa secundaria: misma segunda letra + primera cercana (pero no tan cercana)
      offset = Math.random() < 0.5 ? 2 : -2;
      const trapFirst = getLetter(pos1 + offset, alphabet);
      const trap2 = trapFirst + second;
      if (trap2 !== correct && !options.has(trap2)) options.add(trap2);
    }

    // Rellenar con distractoras normales (más variadas)
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

  const generateDynamicProblem = (alphabet, showVisuals) => {
    const key = Object.keys(problemGenerators)[Math.floor(Math.random() * Object.keys(problemGenerators).length)];
    const generator = problemGenerators[key];
    const problem = generator(alphabet);
    const options = generateOptions(problem.answer, alphabet);

    return {
      series: problem.series.join(" "),
      answer: problem.answer,
      options,
      explanation: problem.explanation,
      showVisuals,
    };
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    const numQuestions = Number(questionsInput) || 10;
    setTotalQuestions(numQuestions);
    setScore(0);
    setCurrentQuestion(0);

    const alphabet = ALPHABETS[alphabetType];
    let time = 6;
    let showVisuals = false;
    let generatedProblems = [];

    if (gameMode === "practice") {
      if (difficulty === "easy") time = 10;
      else if (difficulty === "medium") time = 10;
      else if (difficulty === "hard") time = 8;
      showVisuals = true;

      for (let i = 0; i < numQuestions; i++) {
        const easyPool = ["simpleAsc", "simpleDesc"];
        const mediumPool = ["alternating", "interleaved", "doublePairs"];
        const hardPool = ["alternating", "interleaved", "doublePairs"];

        let pool = [];
        if (difficulty === "easy") pool = Math.random() < 0.5 ? easyPool : mediumPool;
        else if (difficulty === "medium") pool = mediumPool;
        else if (difficulty === "hard") pool = hardPool;

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
        });
      }
    } else {
      // Realistic modes
      setAlphabetType("ES"); // Fix to ES for realistic problems
      time = gameMode === "realistic-practice" ? 10 : 6;
      showVisuals = gameMode === "realistic-practice";

      // Use static realisticProblems
      const shuffled = shuffleArray([...realisticProblems]);
      // If numQuestions > length, slice and repeat if necessary
      if (numQuestions > shuffled.length) {
        const repeats = Math.ceil(numQuestions / shuffled.length);
        const extended = [];
        for (let i = 0; i < repeats; i++) {
          extended.push(...shuffleArray([...realisticProblems]));
        }
        generatedProblems = extended.slice(0, numQuestions).map((p) => ({
          series: p.series,
          answer: p.answer,
          options: shuffleArray([...p.options]),
          explanation: p.explanation,
          showVisuals,
        }));
      } else {
        generatedProblems = shuffled.slice(0, numQuestions).map((p) => ({
          series: p.series,
          answer: p.answer,
          options: shuffleArray([...p.options]),
          explanation: p.explanation,
          showVisuals,
        }));
      }
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
            : 8
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

      {screen === "game" && problems.length > currentQuestion && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl text-center">
          <div className="text-xl mb-4 font-mono">
            {problems[currentQuestion].series}
          </div>

          {problems[currentQuestion].showVisuals && (
            <div className="text-sm text-gray-500 mb-4">
              {problems[currentQuestion].series.split(" ").map((item, i) => {
                if (item.length === 2) {
                  const first = item[0];
                  const second = item[1];
                  return (
                    <span key={i}>
                      {item} = {getPos(first, ALPHABETS[alphabetType])};{getPos(second, ALPHABETS[alphabetType])}{" "}
                    </span>
                  );
                } else if (item.length === 1) {
                  return (
                    <span key={i}>
                      {item} = {getPos(item, ALPHABETS[alphabetType])}{" "}
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
            <div className="text-slate-700 mb-4 italic">
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

          <div className="text-slate-600 mt-4">
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