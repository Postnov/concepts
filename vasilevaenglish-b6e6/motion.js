// Алина Васильева — моушн концепта.
// Фирменная идея: «табло вылетов». Слова из её «Разговорника путешественника» (раздел «В аэропорту»)
// перекидываются флажками с русского на английский, под ними — транскрипция из того же разговорника.
// Остальное спокойно и в ту же тему: шторка иллюминатора поднимается, самолёт летит по маршруту из болей, талоны «печатаются».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: табло показывает DEPARTURE, маршрут закрашен

  /* ---------- табло ---------- */
  const WORDS = [
    { ru: 'отправление', en: 'departure', tr: '[дипа:че]' },
    { ru: 'прибытие', en: 'arrival', tr: '[эрайвл]' },
    { ru: 'номер рейса', en: 'flight number', tr: '[флайт намбэ]' },
    { ru: 'номер места', en: 'seat number', tr: '[си:т намбэ]' },
    { ru: 'ручная кладь', en: 'hand luggage', tr: '[хэнд лагидж]' },
    { ru: 'багаж', en: 'luggage', tr: '[лагидж]' },
  ];
  const RU = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ';
  const EN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const board = $('[data-board]');
  const ruEl = $('.board__ru', board);
  const trEl = $('.board__tr', board);
  const cellEls = $$('.cell', board);
  const N = cellEls.length;
  const pad = s => s.toUpperCase().padEnd(N, ' ').slice(0, N);
  let cells = [];
  let shown = pad('');

  // Ячейка: статичные верх (новый символ) и низ (старый); флажок-верх (старый, падает) и флажок-низ (новый, ложится)
  function makeCell(el) {
    const ch = el.textContent;
    el.textContent = '';
    const layer = cls => {
      const s = document.createElement('span');
      s.className = `cell__l ${cls}`;
      s.textContent = ch;
      el.append(s);
      return s;
    };
    const c = { t: layer('cell__t'), b: layer('cell__b'), ft: layer('cell__ft'), fb: layer('cell__fb') };
    gsap.set([c.ft, c.fb], { transformPerspective: 260, transformOrigin: '50% 50%' });
    gsap.set(c.fb, { rotationX: 90 });
    return c;
  }
  const setAll = (c, ch) => { c.t.textContent = c.b.textContent = c.ft.textContent = c.fb.textContent = ch; };

  // Один перекид ячейки на символ next, начиная с момента at
  function flip(tl, c, next, at, step) {
    tl.call(() => { c.t.textContent = next; c.fb.textContent = next; }, null, at)
      .fromTo(c.ft, { rotationX: 0 }, { rotationX: -90, duration: step * 0.52, ease: 'power1.in', immediateRender: false }, at)
      .fromTo(c.fb, { rotationX: 90 }, { rotationX: 0, duration: step * 0.48, ease: 'power1.out', immediateRender: false }, at + step * 0.52)
      .call(() => {
        c.b.textContent = next; c.ft.textContent = next;
        gsap.set(c.ft, { rotationX: 0 }); gsap.set(c.fb, { rotationX: 90 });
      }, null, at + step);
  }

  // Переход всего табло на текст: каждая ячейка пробегает 2–4 случайных символа и встаёт на нужный
  function show(text) {
    const target = pad(text);
    const pool = /[a-z]/i.test(text) ? EN : RU;
    const tl = gsap.timeline();
    const step = 0.068;
    cells.forEach((c, i) => {
      if (shown[i] === target[i]) return;
      const chain = [];
      const k = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < k; j++) chain.push(pool[Math.floor(Math.random() * pool.length)]);
      chain.push(target[i]);
      chain.forEach((ch, j) => flip(tl, c, ch, i * 0.035 + j * step, step));
    });
    shown = target;
    return tl;
  }

  function cycle(idx) {
    const w = WORDS[idx % WORDS.length];
    gsap.timeline({ onComplete: () => cycle(idx + 1) })
      .to([ruEl, trEl], { autoAlpha: 0, duration: 0.3 })
      .call(() => { ruEl.textContent = w.ru; trEl.textContent = w.tr; board.setAttribute('aria-label', `Из разговорника путешественника: ${w.en} — ${w.ru}`); })
      .to(ruEl, { autoAlpha: 1, duration: 0.4 })
      .add(show(w.ru), '<')
      .add(show(w.en), '+=1.2')
      .to(trEl, { autoAlpha: 1, duration: 0.5 }, '-=0.15')
      .to({}, { duration: 2.8 });
  }

  /* ---------- общие появления ---------- */
  function revealLines(selector, trigger, start = 'top 84%') {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start },
      onComplete: () => split.revert(),
    });
  }
  const up = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 86%' }, ...vars,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    cells = cellEls.map(makeCell);
    cells.forEach(c => setAll(c, ' '));
    gsap.set(trEl, { autoAlpha: 0 });

    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.window', { y: 40, autoAlpha: 0, duration: 1.1 }, 0.05)
      .fromTo('.window__shade', { yPercent: 0 }, { yPercent: -101, duration: 1.5, ease: 'power3.inOut' }, 0.45)
      .from('.window__glass img', { scale: 1.18, duration: 2.2, ease: 'expo.out' }, 0.5)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.15)
      .from(name.chars, { yPercent: 112, stagger: 0.035, duration: 1, ease: 'expo.out' }, 0.25)
      .from('.say__word', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.75)
      .from('.say__list li', { x: -14, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.85)
      .from('.board', { y: 26, autoAlpha: 0, duration: 0.9 }, 0.55)
      .from('.facts li', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.0)
      .from('.hero__cta', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.1)
      // табло: пустое → «отправление» → «departure» и дальше по кругу
      .call(() => {
        gsap.timeline({ onComplete: () => cycle(1) })
          .add(show(WORDS[0].ru))
          .add(show(WORDS[0].en), '+=0.45')
          .to(trEl, { autoAlpha: 1, duration: 0.5 }, '-=0.15')
          .to({}, { duration: 2.8 });
      }, null, 0.45);

    revealLines('.hero__lead', '.hero__lead', 'top 92%');

    /* лёгкий параллакс фото в иллюминаторе */
    gsap.to('.window__glass img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Про вас ли это? — самолёт летит по маршруту, остановки загораются ---------- */
    revealLines('.pains h2', '.pains .sec-head');
    up('.pains .eyebrow', '.pains .sec-head');
    const route = $('.route');
    const line = $('.route__line');
    const plane = $('.route__plane');
    gsap.set(plane, { rotation: 180 });
    const routeST = {
      trigger: line, start: 'top 72%', end: 'bottom 72%', scrub: 0.6,
      onToggle: self => gsap.to(plane, { autoAlpha: self.isActive || self.progress === 1 ? 1 : 0, duration: 0.3 }),
    };
    gsap.timeline({ scrollTrigger: routeST })
      .fromTo('.route__fill', { scaleY: 0 }, { scaleY: 1, ease: 'none' }, 0)
      .fromTo(plane, { y: 0 }, { y: () => line.offsetHeight, ease: 'none' }, 0);
    $$('.pain').forEach(item => {
      ScrollTrigger.create({ trigger: $('.pain__num', item), start: 'center 72%', end: 'max', toggleClass: { targets: item, className: 'is-on' } });
    });
    gsap.set('.pain p', { x: 18, autoAlpha: 0 });
    ScrollTrigger.batch('.pain p', {
      start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }),
    });
    gsap.timeline({ scrollTrigger: { trigger: '.invite', start: 'top 82%' }, defaults: { ease: 'power3.out' } })
      .from('.invite', { y: 30, autoAlpha: 0, duration: 0.9 })
      .from('.invite__photo', { y: 40, rotation: 10, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.15)
      .from('.invite__text', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.3)
      .from('.invite .btn', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.45);

    /* ---------- 3. Варианты занятий — талоны «печатаются» сверху вниз ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    up('.formats .eyebrow', '.formats .sec-head');
    $$('.pass').forEach(pass => {
      gsap.timeline({ scrollTrigger: { trigger: pass, start: 'top 84%' }, defaults: { ease: 'power3.out' } })
        .fromTo(pass,
          { clipPath: 'inset(0% 0% 100% 0% round 24px)', y: -20 },
          { clipPath: 'inset(0% 0% 0% 0% round 24px)', y: 0, duration: 1.3, ease: 'power2.inOut', clearProps: 'clipPath' })
        .from($$('.pass__title, .pass__for', pass), { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.45)
        .from($$('.pass__list li', pass), { x: -12, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.6)
        .from($$('.pass__fields > div, .pass__label', pass), { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.8)
        .from($('.pass__code', pass), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'expo.out' }, 0.9)
        .from($('.btn', pass), { y: 14, autoAlpha: 0, duration: 0.6 }, 1.0);
    });

    up('.concept-end > *', '.concept-end');

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
