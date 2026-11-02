// Подсчёт результата теста без сервера: баллы механизмов → доля от максимума → проценты (в сумме ровно 100).
import { TYPES, QUESTIONS } from './quiz-data.js';

export const MAIN = 2;
export const ALSO = 1;

const pointsOf = o => ({ [o.type]: MAIN, ...(o.also ? { [o.also]: ALSO } : {}) });

// answers — индексы выбранных вариантов по порядку вопросов
export function score(answers, questions = QUESTIONS, types = TYPES.map(t => t.id)) {
  const raw = Object.fromEntries(types.map(t => [t, 0]));
  const max = Object.fromEntries(types.map(t => [t, 0]));
  questions.forEach((q, i) => {
    const pts = q.options.map(pointsOf);
    for (const t of types) max[t] += Math.max(0, ...pts.map(p => p[t] || 0));
    const picked = pts[answers[i]];
    if (picked) for (const [t, p] of Object.entries(picked)) raw[t] += p;
  });
  // Доля от максимума: механизм, у которого больше вариантов с баллами, не получает преимущества
  const share = types.map(t => (max[t] ? raw[t] / max[t] : 0));
  const total = share.reduce((a, b) => a + b, 0);
  const percents = largestRemainder(share.map(s => (total ? (s / total) * 100 : 0)));
  // При равенстве — порядок механизмов в TYPES
  const ranking = types
    .map((id, i) => ({ id, raw: raw[id], share: share[i], percent: percents[i], order: i }))
    .sort((a, b) => b.share - a.share || a.order - b.order);
  return { ranking, top: ranking.filter(r => r.raw > 0).slice(0, 2).map(r => r.id) };
}

// Округление до целых с сохранением суммы: недостающие единицы получают те, у кого дробная часть больше
export function largestRemainder(values) {
  const floors = values.map(Math.floor);
  let rest = Math.round(values.reduce((a, b) => a + b, 0)) - floors.reduce((a, b) => a + b, 0);
  const order = values.map((v, i) => [v - floors[i], i]).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (rest <= 0) break;
    floors[i]++;
    rest--;
  }
  return floors;
}
