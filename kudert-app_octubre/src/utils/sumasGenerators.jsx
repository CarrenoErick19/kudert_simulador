// src/utils/sumasGenerators.js

const getRandomThreeDigit = () => Math.floor(Math.random() * 900) + 100;

const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const generateExercise = () => {
  const numCount = Math.random() < 0.5 ? 2 : 3;
  const nums = Array.from({ length: numCount }, getRandomThreeDigit);
  const sum = nums.reduce((a, b) => a + b, 0);
  return { nums, sum };
};

// -------------------- Correcto / Incorrecto --------------------
export const generateCorrectIncorrectSet = (total) => {
  const exercises = [];
  for (let i = 0; i < total; i++) {
    const { nums, sum } = generateExercise();
    const isCorrect = Math.random() < 0.5;

    let proposed;
    if (isCorrect) {
      proposed = sum;
    } else {
      const deviation = randInt(100, 400);
      let trap = sum + (Math.random() > 0.5 ? deviation : -deviation);
      if (trap <= 0) trap = sum + deviation;
      // forzar misma unidad que el correcto
      const unit = sum % 10;
      trap = Math.floor(trap / 10) * 10 + unit;
      proposed = trap;
    }

    exercises.push({ nums, proposed, isCorrect });
  }
  return exercises;
};

// -------------------- Opción Múltiple --------------------

// proporciones
const pickModes = (total) => {
  const easyCount = Math.round(total * 0.4);
  const trapUnitCount = Math.round(total * 0.4);
  const hardCount = total - easyCount - trapUnitCount;
  const modes = [];
  for (let i = 0; i < easyCount; i++) modes.push("easy");
  for (let i = 0; i < trapUnitCount; i++) modes.push("trapUnit");
  for (let i = 0; i < hardCount; i++) modes.push("hard");
  return modes.sort(() => Math.random() - 0.5);
};

export const generateMultipleChoiceSet = (total) => {
  const exercises = [];
  const modes = pickModes(total);

  for (let i = 0; i < total; i++) {
    const { nums, sum } = generateExercise();
    const unitReal = sum % 10;
    const options = new Set([sum]);

    // cantidad de trampas (1 o 2 normalmente)
    const trapCount = Math.random() < 0.5 ? 1 : 2;

    // trampas: ±100..400 con la misma unidad
    for (let t = 0; t < trapCount; t++) {
      let deviation = randInt(100, 400);
      if (Math.random() < 0.5) deviation *= -1;
      let trap = sum + deviation;
      if (trap <= 0) trap = sum + Math.abs(deviation);
      trap = Math.floor(trap / 10) * 10 + unitReal;
      options.add(trap);
    }

    // descartables: ±600..1000, con unidad distinta
    while (options.size < 4) {
      let deviation = randInt(600, 1000);
      if (Math.random() < 0.5) deviation *= -1;
      let discard = sum + deviation;
      if (discard <= 0) discard = sum + Math.abs(deviation);

      let unit = discard % 10;
      if (unit === unitReal) {
        discard += (unitReal === 9 ? -1 : 1);
      }

      options.add(discard);
    }

    let opts = Array.from(options);

    // Ajustes por modo
    const mode = modes[i] || "hard";
    if (mode === "easy") {
      // solo la correcta tiene la misma unidad
      opts = opts.map((o) =>
        o === sum ? o : (o % 10 === unitReal ? o + 1 : o)
      );
    } else if (mode === "trapUnit") {
      // garantizar que al menos una trampa comparta unidad
      if (!opts.some((o) => o !== sum && o % 10 === unitReal)) {
        for (let j = 0; j < opts.length; j++) {
          if (opts[j] !== sum) {
            opts[j] = Math.floor(opts[j] / 10) * 10 + unitReal;
            break;
          }
        }
      }
    } else if (mode === "hard") {
      // preferir unidades distintas
      opts = opts.map((o) =>
        o === sum ? o : (o % 10 === unitReal ? o + 2 : o)
      );
    }

    // mezclar
    const shuffled = opts.sort(() => Math.random() - 0.5);

    exercises.push({ nums, sum, options: shuffled.slice(0, 4) });
  }

  return exercises;
};
