// Тест «Как вы прерываете контакт»: экраны сменяются без анимаций (Мария просила спокойную статику),
// результат считается в браузере (quiz-core.js), ответы никуда не отправляются.
import { TYPES, QUESTIONS, PAUSE_AFTER } from './quiz-data.js';
import { score } from './quiz-core.js';

const BOOKING = 'https://t.me/MariRss3';
const screen = document.getElementById('screen');
const byId = Object.fromEntries(TYPES.map(t => [t.id, t]));

let answers = [];
let step = 'intro'; // 'intro' | индекс вопроса | 'pause' | 'result'

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Короткие слова и тире не отрываются от соседних слов в конце строки
const nb = s => esc(s).replace(/(?<=^|[\s«(])([а-яё]{1,2}) /gi, '$1 ').replace(/ —/g, ' —');

// Круг с её сайта, без отрисовки: открытый в начале, замкнутый в результате
const ring = closed => `<svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
  <circle cx="60" cy="60" r="50" pathLength="100" stroke-dasharray="${closed ? 'none' : '86 14'}" transform="rotate(-90 60 60)"/>
  <circle class="ring__sun" cx="${closed ? 60 : 21.5}" cy="${closed ? 10 : 28.1}" r="5"/>
</svg>`;

const views = {
  intro: () => `<section class="screen">
    ${ring(false)}
    <p class="kicker">Гештальт-тест</p>
    <h1 class="title" tabindex="-1">${nb('Как вы прерываете контакт с собой и другими')}</h1>
    <p class="lead">${nb('В гештальт-терапии выделяют шесть способов, которыми мы незаметно прерываем контакт — с людьми и с собственными чувствами. 12 вопросов покажут, какие из них ваши.')}</p>
    <div class="card">
      <p class="card__kicker">Вы узнаете</p>
      <ul class="ticks">
        <li>${nb('Какие два способа вы используете чаще всего')}</li>
        <li>${nb('Как они проявляются в отношениях и в теле')}</li>
        <li>${nb('Зачем они когда-то были нужны и что можно попробовать уже сейчас')}</li>
      </ul>
    </div>
    <div class="actions">
      <button class="btn" data-start>Начать тест <span class="btn__arrow">→</span></button>
      <p class="fine">бесплатно · около 3 минут · ответы никуда не отправляются</p>
    </div>
  </section>`,

  question: i => {
    const q = QUESTIONS[i];
    return `<section class="screen">
      <div class="progress">
        <span>Вопрос ${i + 1} из ${QUESTIONS.length}</span>
        <button class="progress__back" data-back>← Назад</button>
      </div>
      <div class="bar"><i style="width:${((i + 1) / QUESTIONS.length) * 100}%"></i></div>
      <h2 class="q__title" tabindex="-1">${nb(q.text)}</h2>
      <ol class="opts">
        ${q.options.map((o, k) => `<li><button class="opt${answers[i] === k ? ' is-picked' : ''}" data-pick="${k}" aria-pressed="${answers[i] === k}">
          <span class="opt__n">${k + 1}</span><span>${nb(o.text)}</span>
        </button></li>`).join('')}
      </ol>
    </section>`;
  },

  pause: () => `<section class="screen">
    ${ring(false)}
    <p class="kicker">Половина пути</p>
    <h2 class="title title--sm" tabindex="-1">${nb('Здесь нет правильных ответов')}</h2>
    <p class="lead">${nb('Выбирайте то, что откликается первым, — даже если подходит не полностью. Так результат будет точнее.')}</p>
    <div class="actions">
      <button class="btn" data-continue>Продолжить <span class="btn__arrow">→</span></button>
      <button class="progress__back" data-back>← Назад</button>
    </div>
  </section>`,

  result: () => {
    const { ranking, top } = score(answers);
    const [first, second] = top.map(id => byId[id]);
    return `<section class="screen">
      ${ring(true)}
      <p class="kicker">Ваш результат</p>
      <h1 class="title" tabindex="-1">${[first, second].filter(Boolean).map(t => esc(t.name)).join(' + ')}</h1>
      <p class="result__labels">${[first, second].filter(Boolean).map(t => esc(t.label)).join(' · ')}</p>
      <ul class="bars">
        ${ranking.map(r => `<li>
          <span class="bars__name">${esc(byId[r.id].name)}<small>${esc(byId[r.id].label)}</small></span>
          <span class="bars__pct">${r.percent}%</span>
          <span class="bars__track"><i style="width:${ranking[0].percent ? (r.percent / ranking[0].percent) * 100 : 0}%"></i></span>
        </li>`).join('')}
      </ul>
      <article class="card type">
        <p class="card__kicker">Ведущий способ</p>
        <h2 class="type__name">${esc(first.name)}</h2>
        <p class="type__summary">${nb(first.summary)}</p>
        <h3>Как это проявляется</h3><p>${nb(first.how)}</p>
        <h3>Зачем это было нужно</h3><p>${nb(first.why)}</p>
        <h3>Что можно попробовать</h3><p>${nb(first.try)}</p>
      </article>
      ${second ? `<article class="card type">
        <p class="card__kicker">Второй по силе</p>
        <h2 class="type__name">${esc(second.name)}</h2>
        <p class="type__summary">${nb(second.summary)}</p>
        <h3>Как это проявляется</h3><p>${nb(second.how)}</p>
      </article>` : ''}
      <p class="note">${nb('Все шесть способов есть у каждого человека: это не недостаток и не диагноз, а привычные способы справляться. Тест показывает, на какие из них вы опираетесь чаще. Чтобы разобраться глубже, лучше прийти к специалисту.')}</p>
      <div class="cta">
        <p class="cta__title">${nb('Хотите разобраться глубже?')}</p>
        <p class="cta__text">${nb('На консультации посмотрим, как эти способы проявляются в вашей жизни и что с ними можно делать.')}</p>
        <a class="btn btn--sun" href="${BOOKING}">Записаться на консультацию <span class="btn__arrow">→</span></a>
        <button class="btn btn--ghost" data-restart>Пройти ещё раз</button>
      </div>
    </section>`;
  },
};

let started = false;

function render() {
  screen.innerHTML = typeof step === 'number' ? views.question(step) : views[step]();
  window.scrollTo(0, 0);
  // Фокус на заголовок нового экрана (для экранного диктора), кроме первой загрузки
  if (started) screen.querySelector('[tabindex="-1"]')?.focus({ preventScroll: true });
  started = true;
}

function go(next) {
  step = next;
  render();
}

function forward() {
  if (step === 'pause') return go(PAUSE_AFTER);
  const n = step + 1;
  go(n === QUESTIONS.length ? 'result' : n === PAUSE_AFTER ? 'pause' : n);
}

function back() {
  if (step === 'pause') return go(PAUSE_AFTER - 1);
  if (step === 0) return go('intro');
  go(step === PAUSE_AFTER ? 'pause' : step - 1);
}

function pick(k) {
  answers[step] = k;
  forward();
}

screen.addEventListener('click', e => {
  const el = e.target.closest('button');
  if (!el) return;
  if (el.hasAttribute('data-start')) go(0);
  else if (el.hasAttribute('data-pick')) pick(Number(el.dataset.pick));
  else if (el.hasAttribute('data-back')) back();
  else if (el.hasAttribute('data-continue')) forward();
  else if (el.hasAttribute('data-restart')) { answers = []; go(0); }
});

// Цифры 1–5 выбирают вариант
document.addEventListener('keydown', e => {
  if (typeof step !== 'number' || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = Number(e.key) - 1;
  if (k >= 0 && k < QUESTIONS[step].options.length) pick(k);
});

render();

// Как на остальных демо: страница видна после загрузки шрифтов, чтобы текст не прыгал
const fonts = ['400 1em Prata', '300 1em Commissioner', '400 1em Commissioner', '500 1em Commissioner'];
Promise.race([
  Promise.all(fonts.map(f => document.fonts.load(f, 'Аа1%'))),
  new Promise(r => setTimeout(r, 4000)),
]).finally(() => document.documentElement.classList.remove('is-loading'));
