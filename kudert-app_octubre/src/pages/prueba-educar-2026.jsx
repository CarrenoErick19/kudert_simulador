import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const shuffleOptionsKeepIndex = (options, correctIndex) => {
  const mapped = options.map((opt, idx) => ({ opt, idx }));
  const shuffled = shuffleArray(mapped);
  const newCorrectIndex = shuffled.findIndex((o) => o.idx === correctIndex);
  return { options: shuffled.map((s) => s.opt), correctIndex: newCorrectIndex };
};

// ✅ AQUÍ irán las preguntas — se añadirán en los siguientes mensajes
import { ALL_QUESTIONS } from '../utils/preguntasEducar2026';

export default function PruebaEducar2026() {
  const navigate = useNavigate();
  const [view, setView] = useState('menu');
  const [numQuestionsInput, setNumQuestionsInput] = useState(10);
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionPool, setQuestionPool] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [correctIndexForCurrent, setCorrectIndexForCurrent] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answersLog, setAnswersLog] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);
  const timerRef = useRef(null);

  const startPractice = (count) => {
    const n = Math.min(Math.max(1, Number(count) || 10), ALL_QUESTIONS.length || 1);
    const shuffled = shuffleArray(ALL_QUESTIONS);
    const selected = shuffled.slice(0, Math.min(n, ALL_QUESTIONS.length));
    setQuestionPool(selected);
    setNumQuestions(selected.length);
    setCurrentIndex(0);
    setScore(0);
    setAnswersLog([]);
    setSelectedAnswer(null);
    setShowNextButton(false);
    setView('practicing');
  };

  useEffect(() => {
    if (view !== 'practicing' || !questionPool.length) return;
    if (currentIndex >= questionPool.length) {
      setView('results');
      return;
    }

    const q = questionPool[currentIndex];
    const { options, correctIndex } = shuffleOptionsKeepIndex(q.options, q.correctIndex);
    setShuffledOptions(options);
    setCorrectIndexForCurrent(correctIndex);
    setSelectedAnswer(null);
    setShowNextButton(false);
    setTimeLeft(30);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => timerRef.current && clearInterval(timerRef.current);
  }, [currentIndex, questionPool, view]);

  const handleSelect = (idx) => {
    if (selectedAnswer !== null || showNextButton) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const q = questionPool[currentIndex];
    setSelectedAnswer(idx);
    const isCorrect = idx === correctIndexForCurrent;
    if (isCorrect) setScore((s) => s + 1);

    setAnswersLog((p) => [
      ...p,
      {
        questionId: q.id,
        questionText: q.text,
        chosenIndex: idx,
        correctIndex: correctIndexForCurrent,
        timedOut: false,
        options: shuffledOptions,
        explanation: q.explanation,
        correct: isCorrect,
      },
    ]);

    setShowNextButton(true);
  };

  const handleTimeout = () => {
    if (selectedAnswer !== null) return;
    const q = questionPool[currentIndex];

    setAnswersLog((p) => [
      ...p,
      {
        questionId: q.id,
        questionText: q.text,
        chosenIndex: null,
        correctIndex: correctIndexForCurrent,
        timedOut: true,
        options: shuffledOptions,
        explanation: q.explanation,
        correct: false,
      },
    ]);
    setShowNextButton(true);
  };

  const goToNext = () => {
    if (currentIndex + 1 >= questionPool.length) setView('results');
    else setCurrentIndex((i) => i + 1);
  };

  const resetAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setView('menu');
    setQuestionPool([]);
    setCurrentIndex(0);
    setAnswersLog([]);
    setScore(0);
    setSelectedAnswer(null);
    setShowNextButton(false);
    setNumQuestionsInput(10);
  };

  const percent = useMemo(
    () => (questionPool.length ? Math.round((score / questionPool.length) * 100) : 0),
    [score, questionPool]
  );

  useEffect(() => () => timerRef.current && clearInterval(timerRef.current), []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-slate-50">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Prueba Educar 2026</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-3 py-1 rounded-lg text-sm"
          >
            Volver
          </button>
        </div>

        {/* === MENÚ PRINCIPAL === */}
        {view === 'menu' && (
          <div className="space-y-6 bg-white p-6 rounded-lg shadow">
            <p>
              Practica las preguntas de la Prueba Educar 2026. Tienes{' '}
              <strong>30 segundos</strong> por pregunta. Si no respondes a tiempo, se contará como{' '}
              <strong>incorrecta</strong>.
            </p>
            {ALL_QUESTIONS.length === 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm text-yellow-800">
                ⚠️ Aún no hay preguntas cargadas.
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setView('setup')}
                disabled={ALL_QUESTIONS.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
              >
                Practicar
              </button>
            </div>
          </div>
        )}

        {/* === CONFIGURAR === */}
        {view === 'setup' && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-semibold">Configurar práctica</h2>
            <div className="flex items-center gap-2">
              <label>Preguntas (1–{ALL_QUESTIONS.length}):</label>
              <input
                type="number"
                min={1}
                max={ALL_QUESTIONS.length}
                value={numQuestionsInput}
                onChange={(e) => setNumQuestionsInput(e.target.value)}
                className="border rounded px-2 py-1 w-20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startPractice(numQuestionsInput)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Iniciar
              </button>
              <button
                onClick={() => setView('menu')}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* === JUEGO === */}
        {view === 'practicing' && questionPool.length > 0 && currentIndex < questionPool.length && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between mb-2">
              <div className="text-sm text-gray-500">
                Pregunta {currentIndex + 1} / {questionPool.length}
              </div>
              <div className={`text-sm font-mono font-semibold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-500'}`}>
                Tiempo: {timeLeft}s
              </div>
            </div>

            <div className="mb-4 font-semibold">{questionPool[currentIndex].text}</div>

            {shuffledOptions.map((opt, idx) => {
              const isChosen = selectedAnswer === idx;
              const isCorrect = idx === correctIndexForCurrent;
              const showFeedback = showNextButton;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showNextButton}
                  className={`w-full text-left border rounded p-3 mb-2 transition ${
                    showFeedback
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : isChosen
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                      : 'border-gray-200 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              );
            })}

            {showNextButton && (
              <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                <div className="font-semibold text-blue-700">Explicación</div>
                <div className="text-sm mt-1 text-gray-700">
                  {questionPool[currentIndex].explanation}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-between items-center">
              <button onClick={resetAll} className="bg-gray-200 px-3 py-2 rounded">
                Salir
              </button>
              <button
                onClick={goToNext}
                disabled={!showNextButton}
                className={`px-4 py-2 rounded-lg ${
                  showNextButton
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {currentIndex + 1 >= questionPool.length ? 'Ver resultados' : 'Siguiente'}
              </button>
            </div>
          </div>
        )}

        {/* === RESULTADOS === */}
        {view === 'results' && (
          <div className="bg-white p-6 rounded-lg shadow space-y-3">
            <h2 className="text-xl font-semibold">Resultados</h2>
            <p>
              Puntaje: {score} / {questionPool.length} ({percent}% correctas)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => startPractice(questionPool.length)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Reintentar
              </button>
              <button onClick={resetAll} className="bg-gray-200 px-4 py-2 rounded">
                Volver al menú
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}