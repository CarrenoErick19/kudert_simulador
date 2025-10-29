import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ALPHABETS = {
  EN: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  ES: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')
};

const TIME_LIMIT = 7;

export default function SeriesLetras() {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [screen, setScreen] = useState('modeSelection'); 
  const [gameMode, setGameMode] = useState('realistic'); 
  const [alphabetType, setAlphabetType] = useState('EN');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState({});
  const [showNextButton, setShowNextButton] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const timerRef = useRef(null);
  const [questionsNumberInput, setQuestionsNumberInput] = useState(10);

  // --- MODAL INSTRUCTIVO ---
  const [showInstructivo, setShowInstructivo] = useState(false);
  const instructivoUrl = "https://drive.google.com/file/d/10fDxIdMrBatwk4vXrOmLkHft6gvAnKXp/preview";
  const instructivoBackupUrl = "https://drive.google.com/file/d/10fDxIdMrBatwk4vXrOmLkHft6gvAnKXp/view?usp=sharing";

  // --- AUXILIARES ---
  const getIndex = (letter, alphabet) => alphabet.indexOf(letter) + 1;
  const getLetter = (index, alphabet) => {
    const len = alphabet.length;
    const adjustedIndex = ((index - 1) % len + len) % len;
    return alphabet[adjustedIndex];
  };

  const problemGenerators = {
    arithmetic: (alphabet) => {
      const step = Math.floor(Math.random() * 3) + 2;
      const startIdx = Math.floor(Math.random() * (alphabet.length - step * 5)) + 1;
      const series = Array.from({ length: 5 }, (_, i) => getLetter(startIdx + i * step, alphabet));
      const answer = series.pop();
      return { series, answer, explanation: `Serie aritmética con salto constante de +${step}.` };
    },
    decreasing: (alphabet) => {
      const step = Math.floor(Math.random() * 3) + 2;
      const startIdx = Math.floor(Math.random() * (alphabet.length - step * 5)) + step * 5;
      const series = Array.from({ length: 5 }, (_, i) => getLetter(startIdx - i * step, alphabet));
      const answer = series.pop();
      return { series, answer, explanation: `Serie decreciente con salto constante de -${step}.` };
    },
    alternating: (alphabet) => {
      let step1 = Math.floor(Math.random() * 2) + 2;
      let step2 = Math.floor(Math.random() * 2) + 2;
      if (step1 === step2) step2++;
      let currentIdx = Math.floor(Math.random() * (alphabet.length / 3)) + 1;
      const series = [];
      for (let i = 0; i < 5; i++) {
        series.push(getLetter(currentIdx, alphabet));
        currentIdx += (i % 2 === 0) ? step1 : step2;
        if (currentIdx > alphabet.length * 2) return problemGenerators.arithmetic(alphabet);
      }
      const answer = series.pop();
      return { series, answer, explanation: `Serie con patrón alternado de +${step1} y +${step2}.` };
    },
    variableIncrement: (alphabet) => {
      let currentIdx = Math.floor(Math.random() * 10) + 1;
      const series = [];
      for (let i = 0; i < 5; i++) {
        series.push(getLetter(currentIdx, alphabet));
        currentIdx += i + 1;
      }
      const answer = series.pop();
      return { series, answer, explanation: `Serie con incremento variable (+1, +2, +3, +4...).` };
    },
    pairedSeries: (alphabet) => {
      const step1 = Math.floor(Math.random() * 3) + 2;
      const step2 = Math.floor(Math.random() * 3) + 2;
      let start1 = Math.floor(Math.random() * 10) + 1;
      let start2 = Math.floor(Math.random() * 10) + 1;
      const series = [];
      for (let i = 0; i < 3; i++) {
        const l1 = getLetter(start1, alphabet);
        const l2 = getLetter(start2, alphabet);
        series.push(`${l1}${l2}`);
        start1 += step1;
        start2 += step2;
      }
      const answer = `${getLetter(start1, alphabet)}${getLetter(start2, alphabet)}`;
      return { series, answer, explanation: `Dos series independientes. 1ª letra: +${step1}. 2ª letra: +${step2}.` };
    }
  };

  const generateOptions = (correctAnswer, alphabet) => {
    const options = new Set([correctAnswer]);
    const isPaired = correctAnswer.length > 1;
    while (options.size < 4) {
      let option = '';
      if (isPaired) {
        option = getLetter(Math.floor(Math.random() * alphabet.length) + 1, alphabet) +
                 getLetter(Math.floor(Math.random() * alphabet.length) + 1, alphabet);
      } else {
        option = getLetter(Math.floor(Math.random() * alphabet.length) + 1, alphabet);
      }
      options.add(option);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const generateNewProblem = () => {
    const alphabet = ALPHABETS[alphabetType];
    const generatorKeys = Object.keys(problemGenerators);
    const randomKey = generatorKeys[Math.floor(Math.random() * generatorKeys.length)];
    const problem = problemGenerators[randomKey](alphabet);
    const options = generateOptions(problem.answer, alphabet);
    setCurrentProblem({
      ...problem,
      options,
      series: problem.series.join(', ')
    });
    setTimeLeft(TIME_LIMIT);
    setShowNextButton(false);
    setFeedback('');
    setFeedbackColor('');
    setExplanation('');
  };

  // --- TIMER ---
  useEffect(() => {
    if (screen === 'game' && currentProblem.series) {
      clearInterval(timerRef.current);
      setTimeLeft(TIME_LIMIT);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
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

  // --- HANDLERS ---
  const handleAnswer = (selectedOption) => {
    clearInterval(timerRef.current);
    if (!currentProblem.answer) return;

    const correct = selectedOption === currentProblem.answer;

    if (correct) {
      setScore(prev => prev + 1);
      setFeedback('¡Correcto!');
      setFeedbackColor('text-green-500');
    } else {
      setFeedback(
        selectedOption === null 
          ? `¡Se acabó el tiempo! La respuesta correcta era ${currentProblem.answer}`
          : `Incorrecto, era ${currentProblem.answer}`
      );
      setFeedbackColor('text-red-500');
    }

    setExplanation(currentProblem.explanation);
    setShowExplanation(gameMode === 'practice');
    setShowNextButton(true);
  };

  const nextQuestion = () => {
    setShowNextButton(false);
    if (currentQuestionNumber + 1 >= totalQuestions) {
      setScreen('end');
    } else {
      setCurrentQuestionNumber(prev => prev + 1);
      generateNewProblem();
    }
  };

  const startGame = () => {
    setTotalQuestions(Number(questionsNumberInput) || 10);
    setScore(0);
    setCurrentQuestionNumber(0);
    setScreen('game');
    setShowNextButton(false);
    generateNewProblem();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100">
      <h1 className="text-2xl font-bold mb-6">Series de Letras</h1>
      <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-4 py-2 rounded-lg mb-4">
        Volver
      </button>

      {/* BOTÓN INSTRUCTIVO */}
      {screen === 'modeSelection' && (
        <button
          onClick={() => setShowInstructivo(true)}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg mb-4"
        >
          Instructivo
        </button>
      )}

      {/* MODAL INSTRUCTIVO */}
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
            <iframe
              src={instructivoUrl}
              className="w-full h-full"
              title="Instructivo Series Letras"
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

      {/* MODO SELECCIÓN */}
      {screen === 'modeSelection' && (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
          <button onClick={() => { setGameMode('practice'); setScreen('settings'); }} className="mode-btn bg-sky-500 text-white p-6 rounded-lg">
            Modo Práctica
          </button>
          <button onClick={() => { setGameMode('realistic'); setScreen('settings'); }} className="mode-btn bg-indigo-600 text-white p-6 rounded-lg">
            Modo Realista
          </button>
        </div>
      )}

      {/* PANTALLA DE AJUSTES */}
      {screen === 'settings' && (
        <div>
          <input
            type="number"
            value={questionsNumberInput}
            onChange={(e) => setQuestionsNumberInput(e.target.value)}
            className="w-32 text-center text-lg p-2 border border-slate-300 rounded-lg shadow-sm mb-4"
          />
          <button onClick={startGame} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Comenzar</button>
        </div>
      )}

      {/* PANTALLA DE JUEGO */}
      {screen === 'game' && currentProblem.series && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl text-center">
          <div className="text-xl mb-4">{currentProblem.series}</div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {currentProblem.options.map((opt, idx) => (
              <button 
                key={idx}
                onClick={() => handleAnswer(opt)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="text-lg mb-2">Tiempo restante: {timeLeft}s</div>
          {showExplanation && <div className="text-slate-700 mb-2">{explanation}</div>}
          {showNextButton && (
            <button onClick={nextQuestion} className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2">
              Siguiente
            </button>
          )}
          <div className={`text-lg font-bold mt-2 ${feedbackColor}`}>{feedback}</div>
          <div className="text-slate-700 mt-2">Pregunta {currentQuestionNumber + 1} / {totalQuestions}</div>
        </div>
      )}

      {/* FIN */}
      {screen === 'end' && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">¡Juego Terminado!</h2>
          <p className="text-lg mb-4">Tu puntaje: {score} / {totalQuestions}</p>
          <button onClick={() => setScreen('modeSelection')} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Menú</button>
        </div>
      )}
    </div>
  );
}
