import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Asegúrate de que tus estilos estén aquí

function Sumas() {
  const [mode, setMode] = useState(null); // null, 'ci' (correcto/incorrecto), 'om' (opción múltiple)
  const [numExercisesInput, setNumExercisesInput] = useState(''); // String temporal para input
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [percentage, setPercentage] = useState(0);

  // Función para generar ejercicio (basado en PDF: sumas de 3 números de 3 cifras)
  const generateExercise = (isMultipleChoice = false) => {
    const num1 = Math.floor(Math.random() * 900) + 100; // 100-999
    const num2 = Math.floor(Math.random() * 900) + 100;
    const num3 = Math.floor(Math.random() * 900) + 100;
    const correctSum = num1 + num2 + num3;

    if (isMultipleChoice) {
      // 1 correcta + 3 trampas (1 cercana, 2 obvias)
      const closeTrap = correctSum + (Math.random() < 0.5 ? -10 : 10); // Cercana
      const obvious1 = correctSum + (Math.random() < 0.5 ? -500 : 500);
      const obvious2 = correctSum + (Math.random() < 0.5 ? -1000 : 1000);
      const options = [correctSum, closeTrap, obvious1, obvious2];
      options.sort(() => Math.random() - 0.5); // Barajar
      const labels = ['A', 'B', 'C', 'D'];
      const labeled = labels.map((label, idx) => ({ label, value: options[idx] }));
      const correctLabel = labeled.find(opt => opt.value === correctSum).label;

      return {
        text: `${num1} + ${num2} + ${num3} = ?`,
        options: labeled,
        correct: correctLabel,
      };
    } else {
      // Correcto/Incorrecto: 50% chance de correcta
      const isCorrect = Math.random() < 0.5;
      const displayed = isCorrect ? correctSum : correctSum + (Math.random() < 0.5 ? -Math.floor(Math.random() * 500) : Math.floor(Math.random() * 500));

      return {
        text: `${num1} + ${num2} + ${num3} = ${displayed}`,
        correct: isCorrect ? 'correcto' : 'incorrecto',
      };
    }
  };

  // Iniciar práctica
  const startPractice = () => {
    const num = parseInt(numExercisesInput, 10);
    if (isNaN(num) || num < 1 || num > 50) {
      alert('Ingresa un número válido entre 1 y 50');
      return;
    }

    const newExercises = Array.from({ length: num }, () => generateExercise(mode === 'om'));
    setExercises(newExercises);
    setAnswers([]);
    setCurrentExercise(0);
    setShowResult(false);
    setNumExercisesInput(''); // Limpiar input
  };

  // Manejar respuesta
  const handleAnswer = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentExercise + 1 < exercises.length) {
      setCurrentExercise(currentExercise + 1);
    } else {
      // Calcular porcentaje
      let correctCount = 0;
      exercises.forEach((ex, idx) => {
        if (newAnswers[idx] === ex.correct) correctCount++;
      });
      setPercentage((correctCount / exercises.length) * 100);
      setShowResult(true);
    }
  };

  return (
    <div className="App">
      <h2>Sección Sumas (KUDERT)</h2>

      {!mode ? (
        <div>
          <p>Elige la modalidad de práctica:</p>
          <button onClick={() => setMode('ci')}>Correcto / Incorrecto</button>
          <button onClick={() => setMode('om')}>Opción Múltiple (4 opciones)</button>
          <br /><br />
          <Link to="/">
            <button className="back">Volver al Menú Principal</button>
          </Link>
        </div>
      ) : !exercises.length ? (
        <div>
          <p>Modalidad seleccionada: {mode === 'ci' ? 'Correcto/Incorrecto' : 'Opción Múltiple'}</p>
          <p>¿Cuántos ejercicios quieres practicar? (Recomendado: 20-50, máx. 50)</p>
          <input
            type="number"
            min="1"
            max="50"
            value={numExercisesInput}
            onChange={(e) => setNumExercisesInput(e.target.value)}
            placeholder="Ej: 20"
          />
          <br /><br />
          <button onClick={startPractice}>Empezar Práctica</button>
          <button onClick={() => setMode(null)}>Cambiar Modalidad</button>
        </div>
      ) : !showResult ? (
        <div>
          <p>Ejercicio {currentExercise + 1} de {exercises.length}</p>
          <div style={{ fontSize: '1.8rem', margin: '20px 0', fontWeight: 'bold' }}>
            {exercises[currentExercise].text}
          </div>

          {mode === 'om' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
              {exercises[currentExercise].options.map((opt) => (
                <button key={opt.label} onClick={() => handleAnswer(opt.label)}>
                  {opt.label}. {opt.value}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button onClick={() => handleAnswer('correcto')}>Correcto</button>
              <button onClick={() => handleAnswer('incorrecto')}>Incorrecto</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>¡Ronda terminada!</h3>
          <p>Porcentaje de aciertos: <strong>{percentage.toFixed(2)}%</strong></p>
          <button onClick={() => {
            setExercises([]);
            setShowResult(false);
          }}>Otra ronda (misma modalidad)</button>
          <button onClick={() => setMode(null)}>Cambiar modalidad</button>
          <br /><br />
          <Link to="/">
            <button className="back">Volver al Menú Principal</button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Sumas;