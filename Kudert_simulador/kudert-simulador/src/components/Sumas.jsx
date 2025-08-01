import React, { useState, useEffect, useCallback } from 'react';

// Utilidades
const generateRandomNumber = (digits) => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

// Íconos
const TimerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon" style={{ color: '#4ade80' }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon" style={{ color: '#f87171' }}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const AwardIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon" style={{ color: '#fbbf24', marginBottom: '1rem' }}>
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"></polyline>
  </svg>
);

// Generadores de preguntas
const generateCorrectIncorrectSet = (total) => {
  const questions = [];
  const types = ['incorrect-unit', 'correct-unit-correct-sum', 'correct-unit-incorrect-sum'];
  while (questions.length < total) {
    const nums = [generateRandomNumber(3), generateRandomNumber(3), generateRandomNumber(3)];
    const actualSum = nums.reduce((a, b) => a + b, 0);
    const correctUnit = actualSum % 10;
    const type = types[questions.length % 3];
    let displayedAnswer, isCorrect;
    switch (type) {
      case 'incorrect-unit':
        do {
          displayedAnswer = actualSum + (Math.floor(Math.random() * 200 + 100) * (Math.random() > 0.5 ? 1 : -1));
          if (Math.abs(displayedAnswer - actualSum) < 100) {
            displayedAnswer = actualSum + (displayedAnswer > actualSum ? 100 : -100);
          }
        } while (displayedAnswer % 10 === correctUnit || displayedAnswer === actualSum);
        isCorrect = false;
        break;
      case 'correct-unit-correct-sum':
        displayedAnswer = actualSum;
        isCorrect = true;
        break;
      case 'correct-unit-incorrect-sum':
        do {
          displayedAnswer = actualSum + (Math.floor(Math.random() * 200 + 100) * (Math.random() > 0.5 ? 1 : -1));
        } while (displayedAnswer % 10 !== correctUnit ||
                displayedAnswer === actualSum ||
                Math.abs(displayedAnswer - actualSum) < 100);
        isCorrect = false;
        break;
    }
    questions.push({ nums, displayedAnswer, isCorrect, actualSum });
  }
  return shuffleArray(questions);
};

const generateMultipleChoiceSet = (total) => {
  const questions = [];
  const modes = [];
  for (let i = 0; i < total; i++) {
    if (i % 3 === 0) modes.push('mezclado');
    else if (i % 3 === 1) modes.push('semi-mezclado');
    else modes.push('uniforme');
  }
  shuffleArray(modes);
  for (let i = 0; i < total; i++) {
    const numCount = Math.random() > 0.5 ? 2 : 3;
    const nums = Array.from({ length: numCount }, () => generateRandomNumber(3));
    const answer = nums.reduce((a, b) => a + b, 0);
    const correctUnit = answer % 10;
    const options = new Set();
    options.add(answer);
    const mode = modes[i];
    if (mode === 'mezclado') {
      while (options.size < 4) {
        const candidate = answer + (Math.floor(Math.random() * 1000) - 500);
        if (
          candidate > 0 &&
          (candidate % 10 !== correctUnit || candidate === answer) &&
          !options.has(candidate)
        ) {
          options.add(candidate);
        }
      }
    } else if (mode === 'semi-mezclado') {
      const distractor = answer + (Math.random() > 0.5 ? 200 : -200);
      options.add(distractor);
      while (options.size < 4) {
        const candidate = answer + (Math.floor(Math.random() * 1000) - 500);
        if (
          candidate > 0 &&
          candidate % 10 !== correctUnit &&
          !options.has(candidate)
        ) {
          options.add(candidate);
        }
      }
    } else {
      const offsets = [-400, -200, 200, 400];
      shuffleArray(offsets);
      for (const offset of offsets) {
        if (options.size >= 4) break;
        const candidate = answer + offset;
        if (
          candidate > 0 &&
          candidate % 10 === correctUnit &&
          !options.has(candidate)
        ) {
          options.add(candidate);
        }
      }
      if (options.size < 4) {
        const candidate = answer + 201;
        options.add(candidate);
      }
    }
    questions.push({ nums, options: shuffleArray([...options]), answer });
  }
  return questions;
};

// Pantalla de menú
const MenuScreen = ({ onSelectMode, totalQuestions, setTotalQuestions }) => (
  <div>
    <h1 className="title">Entrenador de Sumas</h1>
    <p className="subtitle">Elige un modo de práctica y cuántas sumas quieres resolver.</p>
    <input
      type="number"
      min="1"
      max="100"
      value={totalQuestions}
      onChange={(e) => setTotalQuestions(Number(e.target.value))}
      className="input-field" // ← Cambiado: ahora usa input-field
      placeholder="Cantidad de preguntas"
    />
    <div style={{ display: 'grid', gap: '1rem' }}>
      <button onClick={() => onSelectMode('correct-incorrect')} className="option-button">
        Correcto / Incorrecto
      </button>
      <button onClick={() => onSelectMode('multiple-choice')} className="option-button" style={{ backgroundColor: '#7c3aed' }}>
        Opción Múltiple
      </button>
    </div>
  </div>
);

// Pantalla de resultados
const ResultsScreen = ({ stats, onRestart, onGoToMenu }) => {
  const percentage = (stats.correct / stats.total) * 100;
  const message =
    percentage === 100 ? "¡Perfecto!" :
    percentage >= 80 ? "¡Excelente trabajo!" :
    percentage >= 60 ? "¡Buen intento!" : "¡Sigue practicando!";

  return (
    <div style={{ textAlign: 'center' }}>
      <AwardIcon />
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#22d3ee', marginBottom: '0.5rem' }}>
        Sesión Completada
      </h2>
      <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: '1rem 0' }}>
        {stats.correct} <span style={{ fontSize: '1.875rem', color: '#94a3b8' }}>/ {stats.total}</span>
      </p>
      <p style={{ fontSize: '1.125rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>{message}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={onRestart} className="next-button">Volver a Jugar</button>
        <button onClick={onGoToMenu} className="option-button" style={{ backgroundColor: '#475569' }}>
          Ir al Menú
        </button>
      </div>
    </div>
  );
};

// Temporizador
const Timer = ({ timeLeft, current, total }) => (
  <div className="timer-container">
    <div style={{ fontSize: '1.125rem', color: '#cbd5e1' }}>
      Pregunta: <span style={{ color: 'white' }}>{current} / {total}</span>
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      color: timeLeft <= 3 ? '#ef4444' : '#f59e0b'
    }}>
      <TimerIcon /><span>{timeLeft}s</span>
    </div>
  </div>
);

// Pantalla Correcto/Incorrecto
const CorrectIncorrectScreen = ({ onBack, total }) => {
  const TIME = 6;
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(TIME);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState(null);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total });

  const start = useCallback(() => {
    setQuestions(generateCorrectIncorrectSet(total));
    setIndex(0);
    setTime(TIME);
    setActive(true);
    setStats({ correct: 0, incorrect: 0, total });
    setResult(null);
    setFinished(false);
  }, [total]);

  useEffect(() => { start(); }, [start]);

  useEffect(() => {
    if (!active || time <= 0) return;
    const timer = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [time, active]);

  useEffect(() => {
    if (time === 0 && active) {
      handleTimeOut();
    }
  }, [time, active]);

  const handleTimeOut = () => {
    setActive(false);
    const q = questions[index];
    setStats(s => ({ ...s, incorrect: s.incorrect + 1 }));
    setResult({ correct: false, actual: q.actualSum });
  };

  const answer = (choice) => {
    if (!active || time <= 0) return;
    setActive(false);
    const q = questions[index];
    const correct = choice === q.isCorrect;
    setStats(s => ({
      ...s,
      correct: correct ? s.correct + 1 : s.correct,
      incorrect: !correct ? s.incorrect + 1 : s.incorrect
    }));
    setResult({ correct, actual: q.actualSum });
  };

  const next = () => {
    if (index + 1 >= total) return setFinished(true);
    setIndex(i => i + 1);
    setTime(TIME);
    setActive(true);
    setResult(null);
  };

  if (finished) return <ResultsScreen stats={stats} onRestart={start} onGoToMenu={onBack} />;
  if (!questions.length) return <div>Cargando...</div>;

  const q = questions[index];

  return (
    <div className="multiple-choice-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22d3ee' }}>Correcto / Incorrecto</h2>
        <button onClick={onBack} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Volver
        </button>
      </div>
      <Timer timeLeft={time} current={index + 1} total={total} />
      <div className="question-display">
        {q.nums.join(" + ")} = {q.displayedAnswer}
      </div>

      {!result ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginTop: '1rem'
        }}>
          <button onClick={() => answer(true)} className="option-button correct-button">
            Correcto
          </button>
          <button onClick={() => answer(false)} className="option-button incorrect-button">
            Incorrecto
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <div className={`feedback-message ${result.correct ? 'feedback-correct' : 'feedback-incorrect'}`}>
            {result.correct ? <CheckIcon /> : <XIcon />}
            <span>
              {result.correct ? '¡Correcto!' : `Incorrecto. Suma real: ${result.actual}`}
            </span>
          </div>
          <button onClick={next} className="next-button">Siguiente</button>
        </div>
      )}
    </div>
  );
};

// Pantalla de opción múltiple
const MultipleChoiceScreen = ({ onBack, total }) => {
  const TIME = 6;
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(TIME);
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total });

  const start = useCallback(() => {
    setQuestions(generateMultipleChoiceSet(total));
    setIndex(0);
    setTime(TIME);
    setActive(true);
    setStats({ correct: 0, incorrect: 0, total });
    setSelected(null);
    setFinished(false);
  }, [total]);

  useEffect(() => { start(); }, [start]);

  useEffect(() => {
    if (!active || time <= 0) return;
    const timer = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [time, active]);

  useEffect(() => {
    if (time === 0 && active) {
      handleTimeOut();
    }
  }, [time, active]);

  const handleTimeOut = () => {
    setActive(false);
    setSelected('timeout');
    const q = questions[index];
    setStats(s => ({ ...s, incorrect: s.incorrect + 1 }));
  };

  const answer = (opt) => {
    if (!active || time <= 0) return;
    setSelected(opt);
    setActive(false);
    const q = questions[index];
    const correct = opt === q.answer;
    setStats(s => ({
      ...s,
      correct: correct ? s.correct + 1 : s.correct,
      incorrect: !correct ? s.incorrect + 1 : s.incorrect
    }));
  };

  const next = () => {
    if (index + 1 >= total) return setFinished(true);
    setIndex(i => i + 1);
    setTime(TIME);
    setActive(true);
    setSelected(null);
  };

  if (finished) return <ResultsScreen stats={stats} onRestart={start} onGoToMenu={onBack} />;
  if (!questions.length) return <div>Cargando...</div>;

  const q = questions[index];
  const isCorrect = selected === q?.answer;
  const isTimeout = selected === 'timeout';

  return (
    <div className="multiple-choice-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22d3ee' }}>Opción Múltiple</h2>
        <button onClick={onBack} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Volver
        </button>
      </div>
      <Timer timeLeft={time} current={index + 1} total={total} />
      <div className="question-display">
        {q.nums.join(" + ")} = ?
      </div>
      <div className="grid-options">
        {q.options.map(opt => {
          let buttonClass = "option-button";
          if (selected !== null || isTimeout) {
            if (opt === q.answer) {
              buttonClass += " correct";
            } else if (opt === selected && opt !== q.answer) {
              buttonClass += " incorrect";
            } else {
              buttonClass += " disabled";
            }
          }
          return (
            <button
              key={opt}
              onClick={() => answer(opt)}
              disabled={selected !== null || isTimeout}
              className={buttonClass}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {(selected !== null || isTimeout) && (
        <div className={`feedback-message ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
          {isTimeout ? (
            <>
              <XIcon />
              <span>¡Tiempo agotado! La respuesta correcta era {q.answer}</span>
            </>
          ) : isCorrect ? (
            <>
              <CheckIcon />
              <span>¡Correcto! La respuesta es {q.answer}</span>
            </>
          ) : (
            <>
              <XIcon />
              <span>Incorrecto. La respuesta correcta es {q.answer}</span>
            </>
          )}
        </div>
      )}
      {(selected !== null || isTimeout) && (
        <button onClick={next} className="next-button">
          Siguiente
        </button>
      )}
    </div>
  );
};

// Componente principal
export default function Sumas() {
  const [mode, setMode] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(10);

  const onSelectMode = (selectedMode) => {
    setMode(selectedMode);
  };

  const onGoToMenu = () => {
    setMode(null);
  };

  if (!mode) {
    return <MenuScreen onSelectMode={onSelectMode} totalQuestions={totalQuestions} setTotalQuestions={setTotalQuestions} />;
  } else if (mode === 'correct-incorrect') {
    return <CorrectIncorrectScreen onBack={onGoToMenu} total={totalQuestions} />;
  } else if (mode === 'multiple-choice') {
    return <MultipleChoiceScreen onBack={onGoToMenu} total={totalQuestions} />;
  }

  return null;
}