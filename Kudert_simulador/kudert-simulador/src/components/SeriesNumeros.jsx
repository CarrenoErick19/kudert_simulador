// src/components/SeriesNumeros.jsx
import React, { useState, useRef } from 'react';
import {
  seriesGenerators
} from '../utils/seriesGenerators';

const TIME_LIMIT = 6;

function SeriesNumericas() {
  const [step, setStep] = useState('setup');
  const [totalExercises, setTotalExercises] = useState(5);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [series, setSeries] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [timerWidth, setTimerWidth] = useState('100%');
  const [animateTimer, setAnimateTimer] = useState(false);
  const [answered, setAnswered] = useState(false);

  const timerRef = useRef(null);
  const answerRef = useRef(null);

  const generateExercise = () => {
    const { question, answer, explanation } = seriesGenerators[Math.floor(Math.random() * seriesGenerators.length)]();
    setSeries(question);
    setCorrectAnswer(answer);
    answerRef.current = answer;
    setExplanation(explanation || '');
    setUserAnswer('');
    setFeedback(null);
    setAnswered(false);
    resetTimer();
  };

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    setAnimateTimer(false);
    setTimerWidth('100%');
    setTimeout(() => {
      setAnimateTimer(true);
      setTimerWidth('0%');
    }, 20);

    timerRef.current = setTimeout(() => {
      if (!answered) handleAnswer(null);
    }, TIME_LIMIT * 1000);
  };

  const handleAnswer = (input) => {
    if (answered) return;
    clearTimeout(timerRef.current);
    setAnswered(true);

    let userInput = input;
    if (input === null || isNaN(input)) {
      userInput = null;
    }

    const correct = userInput === answerRef.current;

    if (userInput === null) {
      setFeedback({ correct: false, text: `¡Tiempo agotado! Respuesta: ${answerRef.current}` });
    } else if (correct) {
      setScore(prev => prev + 1);
      setFeedback({ correct: true, text: '¡Correcto!' });
    } else {
      setFeedback({ correct: false, text: `Incorrecto. Era: ${answerRef.current}` });
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex + 1 >= totalExercises) {
      setStep('results');
    } else {
      setCurrentExerciseIndex(prev => prev + 1);
      generateExercise();
    }
  };

  const handleStart = () => {
    setStep('playing');
    setScore(0);
    setCurrentExerciseIndex(0);
    generateExercise();
  };

  const handleRestart = () => {
    setStep('setup');
    setScore(0);
  };

  return (
    <div className="container">
      {step === 'setup' && (
        <div className="card">
          <div className="title">Series Numéricas</div>
          <div className="subtitle">Define cuántas quieres practicar</div>
          <input
            className="input-field"
            type="number"
            min={1}
            value={totalExercises}
            onChange={(e) => setTotalExercises(parseInt(e.target.value))}
          />
          <button className="option-button" onClick={handleStart}>Iniciar</button>
        </div>
      )}

      {step === 'playing' && (
        <div className="card">
          <div className="timer-container">
            <span>Pregunta {currentExerciseIndex + 1}/{totalExercises}</span>
            <div style={{ width: '100px', height: '6px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: timerWidth,
                height: '100%',
                backgroundColor: '#22d3ee',
                transition: animateTimer ? `width ${TIME_LIMIT}s linear` : 'none'
              }} />
            </div>
          </div>

          <div className="question-display">{series} ... ?</div>
          <input
            className="input-field"
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnswer(parseInt(userAnswer))}
            disabled={answered}
          />
          <button className="option-button" onClick={() => handleAnswer(parseInt(userAnswer))} disabled={answered}>Comprobar</button>
          {feedback && (
            <div className={`feedback-message ${feedback.correct ? 'feedback-correct' : 'feedback-incorrect'}`}>
              {feedback.text}
              {explanation && <div style={{ marginTop: '0.5rem', fontWeight: 'normal', fontSize: '0.9rem' }}>{explanation}</div>}
            </div>
          )}
          {answered && (
            <button className="next-button" onClick={nextExercise}>Siguiente</button>
          )}
        </div>
      )}

      {step === 'results' && (
        <div className="card">
          <div className="title">Resultados</div>
          <p className="subtitle">Aciertos: {score} de {totalExercises}</p>
          <p>
            {score === totalExercises
              ? '¡Perfecto!'
              : score >= totalExercises * 0.75
              ? '¡Muy bien hecho!'
              : score >= totalExercises * 0.5
              ? '¡Sigue practicando!'
              : 'Puedes mejorar, ¡no te rindas!'}
          </p>
          <button className="option-button" onClick={handleRestart}>Volver a empezar</button>
        </div>
      )}
    </div>
  );
}

export default SeriesNumericas;
