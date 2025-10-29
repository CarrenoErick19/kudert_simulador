// Personalidad.jsx
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

// ---------- PREGUNTAS: todas embebidas ----------
// Basadas en el PDF que subiste. Cada pregunta tiene:
// { id, text, options: [...], correctIndex (index in options), explanation (string shown when user chooses incorrect or time out) }
const ALL_QUESTIONS = [
  {
    id: 1,
    text: '¿Es la siguiente declaración verdadera? “No tengo ninguna característica negativa en mi vida que me moleste”',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1, // "No"
    explanation:
      'RESPUESTA = NO. Si pones "Sí", implica que no tienes introspección; todos los humanos tenemos errores. Reconocer fallas demuestra autoconocimiento.',
  },
  {
    id: 2,
    text: 'Si alguien te ofreciera soborno, ¿lo denunciarías aun si demorara la solución que buscas?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. Siempre es correcto denunciar; anteponer la ética y la transparencia demuestra integridad.',
  },
  {
    id: 3,
    text: '¿Está usted de acuerdo en que cuando alguien viola la ley se debe culpar en primer lugar al entorno en el que la persona creció?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Cada persona debe ser responsable de sus actos; justificar sistemáticamente la mala conducta por el entorno no es la postura que busca la empresa.',
  },
  {
    id: 4,
    text: '¿Le ocurrió alguna vez que hurtó dinero, pero lo devolvió porque se arrepintió?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Tener antecedentes de hurto puede ser motivo de descarte; la empresa prioriza honestidad.',
  },
  {
    id: 5,
    text: '¿Sobornó usted alguna vez a alguien para obtener mejor servicio?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Participar en actos de corrupción es inaceptable; evita sugerir comportamiento corrupto.',
  },
  {
    id: 6,
    text: '¿Piensa usted que es correcto robar a los ricos para darle a los pobres?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Esa postura promueve el delito y no es aceptable para un candidato.',
  },
  {
    id: 7,
    text: '¿Debería estar prohibido contratar a alguien que salió de prisión por delitos contra su empleador anterior?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 2,
    explanation:
      'RESPUESTA: NO/DEPENDE. En la práctica hay que valorar la rehabilitación y el contexto; no responder con prejuicio absoluto.',
  },
  {
    id: 8,
    text: '¿Presentaría una queja si alguien le ofreció un soborno u otros beneficios personales en el trabajo?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. Reportar sobornos demuestra compromiso con la ética y políticas de la empresa.',
  },
  {
    id: 9,
    text: '¿Si un cliente le diera un presente extra le correspondería con un trato más favorable?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Aceptar tratos diferenciados por regalos puede ser corrupción; lo correcto es mantener imparcialidad.',
  },
  {
    id: 10,
    text: '¿Siempre reporta los delitos que ve a su alrededor?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. Mostrar disposición a reportar problemas refleja responsabilidad y compromiso con la empresa.',
  },
  {
    id: 11,
    text: '¿Ha pensado alguna vez pedirle a un colega que lo cubra para faltar al trabajo?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Buscar encubrir faltas es falta de profesionalismo; la respuesta ideal es no.',
  },
  {
    id: 12,
    text: '¿Recibió alguna vez de un cliente un pago mayor al estipulado y se guardó la diferencia?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Guardar diferencias es conducta deshonesta y motivo de descarte.',
  },
  {
    id: 13,
    text: '¿Un empleado debería informar a sus superiores si un compañero llega atrasado frecuentemente?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. Informar comportamientos que afectan el trabajo ayuda a mantener estándares.',
  },
  {
    id: 14,
    text: '¿Logró alguna vez comprar productos sin cargarlos a su tarjeta o cuenta (sin autorización)?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Acciones así son robo/uso indebido y la empresa no lo acepta.',
  },
  {
    id: 15,
    text: '¿Debe una empresa contratar a alguien sabiendo que fue despedido por hurto?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 2,
    explanation:
      'RESPUESTA = NO ESTOY SEGURO / DEPENDE. La recomendación general: evaluar caso por caso; la respuesta neutra evita prejuicios.',
  },
  {
    id: 16,
    text: 'Si obtuvieras un código de acceso a un sitio para contenido sin pagar, ¿lo compartirías con amigos?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Compartir accesos no autorizados es piratería y demuestra falta de ética.',
  },
  {
    id: 17,
    text: '¿Cree usted que prohibir llamadas en horario de trabajo reducirá llamadas personales?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. Reglas claras tienden a reducir comportamientos indebidos durante trabajo.',
  },
  {
    id: 18,
    text: '¿Alguna vez ha quebrantado leyes con las que no está de acuerdo?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Admitir quebrantar la ley puede ser motivo de descarte; mejor indicar apego a la ley.',
  },
  {
    id: 19,
    text: '¿Cree que hay que despedir a una persona aunque haya devuelto lo que robó?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. Aunque devuelva lo robado, el acto demuestra falta de confianza; la empresa suele sancionar.',
  },
  {
    id: 20,
    text: '¿Alguna vez ha sido convicto de un delito judicial?',
    options: ['Sí', 'No', 'Me opongo a responder'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Indicar antecedentes penales puede llevar a descarte; la respuesta correcta es NO.',
  },
  {
    id: 21,
    text: '¿Alguna vez ha sido cambiado de cargo o despedido por conducta incorrecta?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Ser despedido por conducta incorrecta es negativo en postulaciones.',
  },
  {
    id: 22,
    text: '¿Alguna vez ha sido sospechoso de cometer un delito (sin incluir infracciones de tránsito)?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Si indicas sí, puede generar dudas sobre tu perfil.',
  },
  {
    id: 23,
    text: '¿Debe admitir una persona sus errores incluso aun cuando se enojen con ella?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. Aceptar errores muestra madurez y profesionalismo.',
  },
  {
    id: 24,
    text: '¿Cuántas veces en los últimos 3 años ha recibido regalos o recompensas no autorizadas de clientes?',
    options: ['Ninguna', '1–2', '3 o más'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = NINGUNA. Aceptar regalos no autorizados es falta de ética; la respuesta segura es ninguna.',
  },
  {
    id: 25,
    text: 'En su desempeño pasado, ¿sintió que si un cliente le hubiera entregado un presente usted le habría dado mejor trato?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. No corresponder trato especial por regalos; eso es parcialidad.',
  },
  {
    id: 26,
    text: '¿Piensa que un empleado que toma dinero sin permiso, pero siempre lo devuelve, es una persona recta?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Tomar dinero sin permiso es falta grave, aunque sea devuelto.',
  },
  {
    id: 27,
    text: '¿Debería un empleado reportar a su jefe sobre un robo si el ladrón es su familiar?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. La lealtad a la empresa y la ética exige reportar irregularidades.',
  },
  {
    id: 28,
    text: '¿Alguna vez le han pedido que divulgue información confidencial y lo ha hecho?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Divulgar información confidencial es grave; lo correcto es no hacerlo.',
  },
  {
    id: 29,
    text: '¿Cuántas veces en los últimos 3 años ha hecho algo en su trabajo que, de ser descubierto, probablemente lo habrían despedido?',
    options: ['Nunca', '1–5 veces', 'Más de 5'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = NUNCA. Indicar nunca demuestra rectitud profesional.',
  },
  {
    id: 30,
    text: '¿Participa frecuentemente en loterías legales?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Mucha participación puede indicar problemas financieros; la opción segura es no.',
  },
  {
    id: 31,
    text: '¿Cuántas veces ha transferido información confidencial a personas no autorizadas?',
    options: ['Nunca', '1–2', '3 o más'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = NUNCA. Mantener confidencialidad es clave en ambientes corporativos.',
  },
  {
    id: 32,
    text: '¿Cuántas veces en los últimos 3 años ha sacado copias personales de programas de la empresa sin permiso?',
    options: ['Nunca', '1–2', 'Más de 2'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = NUNCA. Hacer copias no autorizadas es uso indebido de recursos.',
  },
  {
    id: 33,
    text: '¿Ha sido alguna vez despedido o se le pidió renunciar por conducta no ética?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Este tipo de antecedentes son desfavorables.',
  },
  {
    id: 34,
    text: '¿Cuántas veces en los últimos 3 años ha sacado copias de documentos confidenciales para uso personal?',
    options: ['Nunca', '1–5', 'Más de 5'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = NUNCA. Eso representa violación de políticas internas.',
  },
  {
    id: 35,
    text: '¿Piensa que un empleado que toma dinero sin permiso pero lo devuelve es aceptable?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. El acto en sí es inaceptable, devolverlo no lo disculpa.',
  },
  {
    id: 36,
    text: '¿Cree usted que la empresa debe despedir a quien recibió regalos de un proveedor a cambio de favoritismo?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. Ese tipo de corrupción no se tolera.',
  },
  {
    id: 37,
    text: '¿Debería un empleado informar irregularidades aunque el autor sea un familiar?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. Prioriza la ética y la seguridad del lugar de trabajo.',
  },
  {
    id: 38,
    text: '¿Cree que un empleado que devuelve equipos que robó debería ser contratado de nuevo?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 2,
    explanation:
      'RESPUESTA = NO ESTOY SEGURO / DEPENDE. Lo habitual: evaluar caso por caso; ser cauteloso evita prejuicios.',
  },
  {
    id: 39,
    text: '¿Ha pedido alguna vez a su jefe un reembolso en efectivo por un gasto que no tuvo?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Pedir reembolsos falsos es fraude.',
  },
  {
    id: 40,
    text: '¿Está de acuerdo con: “Nunca dije algo malo sobre alguien a sus espaldas”?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Decir que nunca hiciste algo así sugiere falta de honestidad sobre uno mismo; todos han errado.',
  },
  {
    id: 41,
    text: '¿En su opinión, casi todos los trabajadores públicos defraudan la confianza depositada en ellos?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Generalizar negativamente muestra desconfianza; mejor postura es confiar en la sociedad.',
  },
  {
    id: 42,
    text: '¿Cree usted que tiene derecho a no cumplir una ley si no está de acuerdo con ella?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = NO. Indicar que no se acatan las leyes es problemático; la postura correcta es respeto a la ley.',
  },
  {
    id: 43,
    text: '¿Cuánto tiempo pasa en promedio navegando en internet por cosas no relacionadas al trabajo?',
    options: ['Menos de 15 min', 'Alrededor de 30 min', 'Alrededor de 1 hora', 'Más de 2 horas'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = MENOS DE 15 MIN. En ambiente laboral, mantener foco y evitar distracciones es lo esperado.',
  },
  {
    id: 44,
    text: '¿Cuántas veces en los últimos 3 años ha hecho algo que ocultó a su supervisor?',
    options: ['Nunca', '1–5 veces', '6–10', '11–20'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = NUNCA. Indicar nunca muestra consistencia y honestidad.',
  },
  {
    id: 45,
    text: '¿Piensa que los empleados deben admitir sus errores aunque eso cause enojo en otros?',
    options: ['Sí', 'No', 'No estoy seguro'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = SÍ. Admitir errores demuestra responsabilidad y facilita la mejora.',
  },
  {
    id: 46,
    text: '¿Se considera usted una persona honesta en una escala general?',
    options: ['Muy honesto', 'Lo suficientemente honesto', 'Poco honesto'],
    correctIndex: 1,
    explanation:
      'RESPUESTA = LO SUFICIENTE HONESTO. No exageres; mantén un balance realista entre confianza y humildad.',
  },
  {
    id: 47,
    text: '¿Cómo describiría en 25 palabras cómo se describe a sí mismo? (seleccione la opción que más se aproxime)',
    options: ['Detallista, responsable, sociable...', 'Indiferente, inconsistente...', 'No sé / Prefiero no contestar'],
    correctIndex: 0,
    explanation:
      'RESPUESTA = la primera opción. En postulaciones busca resaltar rasgos positivos relevantes al cargo (ej.: sociable si es cajero).',
  },
];

export default function Personalidad() {
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
  const [timeLeft, setTimeLeft] = useState(6);
  const [score, setScore] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);
  const timerRef = useRef(null);

  const instructivoPreviewUrl =
    'https://drive.google.com/file/d/18KIJUjsQ8f8dk2qe9ydUfEfoMZtcG0Gv/preview';
  const instructivoBackupUrl =
    'https://drive.google.com/file/d/18KIJUjsQ8f8dk2qe9ydUfEfoMZtcG0Gv/view?usp=sharing';

  const startPractice = (count) => {
    const n = Math.min(Math.max(1, Number(count) || 10), 50);
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
    setTimeLeft(6);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleTimeout(); // <- ahora cuenta como incorrecta
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

  // 🔴 CORREGIDO: ahora el timeout se registra como incorrecto (igual que responder mal)
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
        correct: false, // se marca incorrecta
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
          <h1 className="text-2xl font-bold">Personalidad</h1>
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
              Practica las preguntas de personalidad y conducta. Tienes{' '}
              <strong>6 segundos</strong> por pregunta. Si no respondes a tiempo, se contará como{' '}
              <strong>incorrecta</strong> y verás la explicación.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setView('instructivo')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
              >
                Instructivo
              </button>
              <button
                onClick={() => setView('setup')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Practicar
              </button>
            </div>
          </div>
        )}

        {/* === INSTRUCTIVO === */}
        {view === 'instructivo' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between mb-3">
              <h2 className="font-semibold text-lg">Instructivo - Personalidad</h2>
              <button
                onClick={() => setView('menu')}
                className="bg-gray-300 px-3 py-1 rounded-lg text-sm"
              >
                Cerrar
              </button>
            </div>
            <iframe
              src={instructivoPreviewUrl}
              className="w-full h-[500px]"
              title="Instructivo Personalidad"
            />
            <div className="text-right mt-2">
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
        )}

        {/* === CONFIGURAR === */}
        {view === 'setup' && (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-semibold">Configurar práctica</h2>
            <div className="flex items-center gap-2">
              <label>Preguntas (1–50):</label>
              <input
                type="number"
                min={1}
                max={50}
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
              <div className="text-sm text-gray-500 font-mono">
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

            {/* feedback */}
            {showNextButton && (
              <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-3 rounded">
                <div className="font-semibold text-red-700">Explicación</div>
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
                {currentIndex + 1 >= questionPool.length
                  ? 'Ver resultados'
                  : 'Siguiente'}
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
            <button onClick={resetAll} className="bg-gray-200 px-4 py-2 rounded">
              Volver al menú
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

