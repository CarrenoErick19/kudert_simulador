// src/utils/seriesGenerators.js

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRepetitionSeries() {
  const num = randInt(1, 9);
  const series = Array.from({ length: 5 }, () => num);
  const answer = num;
  return { question: series.join(' '), answer, type: 'Repetición' };
}

export function generateArithmeticSeries() {
  if (Math.random() < 0.6) {
    const start = randInt(1, 20);
    const reason = randInt(2, 12) * (Math.random() < 0.5 ? 1 : -1);
    const series = Array.from({ length: 5 }, (_, i) => start + i * reason);
    const answer = start + 5 * reason;
    return { question: series.join(' - '), answer, type: 'Aritmética (Constante)' };
  } else {
    const start = randInt(50, 80);
    let reasonChange = randInt(1, 3);
    let currentReason = -randInt(1, 3);
    let series = [start];
    let currentVal = start;
    for (let i = 0; i < 4; i++) {
      currentVal += currentReason;
      series.push(currentVal);
      currentReason -= reasonChange;
    }
    const answer = currentVal + currentReason;
    return { question: series.join(' - '), answer, type: 'Aritmética (Variable)' };
  }
}

export function generateGeometricSeries() {
  const isMultiplication = Math.random() < 0.5;
  if (isMultiplication) {
    const start = randInt(2, 5);
    const reason = randInt(2, 4);
    let currentVal = start;
    const series = [];
    for (let i = 0; i < 3; i++) {
      series.push(currentVal);
      currentVal *= reason;
    }
    return { question: series.join(' - '), answer: currentVal, type: 'Geométrica (Multiplicación)' };
  } else {
    const reason = randInt(2, 3);
    const answer = randInt(5, 15);
    const start = answer * Math.pow(reason, 3);
    let currentVal = start;
    const series = [];
    for (let i = 0; i < 3; i++) {
      series.push(currentVal);
      currentVal /= reason;
    }
    return { question: series.join(' - '), answer, type: 'Geométrica (División)' };
  }
}

export function generateAlternatingSeries() {
  const isAscending = Math.random() < 0.5;
  const groups = [];
  let startNum = isAscending ? randInt(1, 5) : randInt(7, 9);
  for (let i = 0; i < 2; i++) {
    const group = isAscending
      ? [startNum, startNum + 2, startNum + 1]
      : [startNum, startNum - 2, startNum - 1];
    groups.push(...group);
    startNum = isAscending ? startNum + 3 : startNum - 3;
  }
  const answer = startNum;
  return { question: groups.join(' '), answer, type: 'Alternante' };
}

export function generateSpecialSeries() {
  const a = randInt(1, 5);
  const b = randInt(1, 5);
  const series = [a, b];
  for (let i = 0; i < 5; i++) {
    series.push(series[i] + series[i + 1]);
  }
  const answer = series.pop();
  return { question: series.join(' '), answer, type: 'Especial (Fibonacci)' };
}

export const seriesGenerators = [
  generateRepetitionSeries,
  generateArithmeticSeries,
  generateGeometricSeries,
  generateAlternatingSeries,
  generateSpecialSeries,
];
