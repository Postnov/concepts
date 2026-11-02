// Светлана Петровна — моушн концепта. Фирменная идея: мяч летит по параболе y = a(x − h)² + k над центральным кругом поля,
// где её фото, а дальше катится под вкладками классов как индикатор. Всё остальное — спокойные появления.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- вкладки классов: работают и без GSAP ---------- */
  const tabs = $$('.tab');
  const tabsBox = $('.tabs');
  const ball = $('.tabs__ball');
  const BALL_R = 11; // радиус мяча в px — для вращения при качении
  let ballX = null;
  let ballRot = 0;
  const tabCenter = tab => tab.offsetLeft + tab.offsetWidth / 2;
  // Мяч катится к вкладке: поворот = путь / радиус
  function rollTo(tab, instant) {
    const x = tabCenter(tab);
    if (ballX === null || instant || !animate) {
      ballX = x;
      ball.style.transform = `translateX(${x}px) rotate(${ballRot}deg)`;
      return;
    }
    ballRot += ((x - ballX) / BALL_R) * (180 / Math.PI);
    ballX = x;
    gsap.to(ball, { x, rotation: ballRot, duration: 0.75, ease: 'power3.out', overwrite: true });
  }
  function select(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    rollTo(tab);
    if (animate) {
      const rows = $$('.row', $('#' + tab.getAttribute('aria-controls')));
      gsap.fromTo(rows, { x: -16, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.55, stagger: 0.05, ease: 'power3.out', overwrite: true });
    }
    refresh();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  const current = () => tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  const placeBall = () => {
    const x = tabCenter(current());
    if (animate) { ballX = x; gsap.set(ball, { x, rotation: ballRot }); } else rollTo(current(), true);
  };
  window.addEventListener('resize', placeBall);

  if (!animate) {
    placeBall();
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Мячик в подписи секции вкатывается слева
  function rollEyebrow(scope) {
    const eb = $(scope + ' .eyebrow');
    gsap.timeline({ scrollTrigger: { trigger: eb, start: 'top 88%' } })
      .from(eb, { autoAlpha: 0, duration: 0.5 }, 0)
      .from($('svg', eb), { x: -70, rotation: -360, duration: 1, ease: 'power3.out' }, 0);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const lines = $$('.hero__line').map(el => SplitText.create(el, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' }));
    const photo = $('.field__photo');
    const circle = $('.field__circle');

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => lines.forEach(s => s.revert()) })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.15)
      .from('.kicker__ball', { x: -40, rotation: -300, duration: 0.9 }, 0.15)
      .from(lines[0].chars, { yPercent: 110, stagger: 0.04, duration: 1, ease: 'expo.out' }, 0.25)
      .from(lines[1].chars, { yPercent: 110, stagger: 0.04, duration: 1, ease: 'expo.out' }, 0.4)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.75)
      .from('.field__half', { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, 0.3)
      .fromTo(circle, { strokeDasharray: 100, strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0.4)
      .from(photo, { scale: 0.5, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.55)
      .from('.field__photo img', { scale: 1.4, duration: 1.6, ease: 'expo.out' }, 0.55)
      .from('.stat', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.95)
      .from('.tags li', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.1)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.2);

    /* Удар: мяч по параболе. Горизонтальная скорость постоянна (как у настоящего полёта), высота — по формуле */
    const P = { x0: 14, x1: 318, h: 166, k: 12, ground: 300 };
    P.a = (P.ground - P.k) / ((P.x1 - P.h) ** 2);
    const yAt = x => P.k + P.a * (x - P.h) ** 2;
    const ballG = $('.field__ball');
    const clip = $('.field__clip');
    const shadow = $('.field__shadow');
    const trail = $('.field__trail');
    const st = { x: P.x0, y: yAt(P.x0), rot: 0 };
    const draw = () => {
      ballG.setAttribute('transform', `translate(${st.x.toFixed(2)} ${st.y.toFixed(2)}) rotate(${st.rot.toFixed(1)})`);
      shadow.setAttribute('cx', st.x.toFixed(2));
      // Тень у земли плотнее и шире
      const near = 1 - Math.min(1, (P.ground - st.y) / (P.ground - P.k));
      shadow.setAttribute('rx', (5 + 7 * near).toFixed(2));
      shadow.style.opacity = (0.15 + 0.85 * near).toFixed(2);
    };
    const flight = { p: 0 };
    // Каждый удар — с исходной точки: мяч у левого края, след ещё не нарисован
    const reset = () => { st.x = P.x0; st.y = yAt(P.x0); st.rot = 0; draw(); clip.setAttribute('width', P.x0); gsap.set(trail, { autoAlpha: 0.8 }); };
    reset();
    gsap.set(ballG, { autoAlpha: 0 });
    const kick = gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 1.05, onRepeat: reset })
      .fromTo(ballG, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
      .fromTo(flight, { p: 0 }, {
        p: 1, duration: 1.35, ease: 'none',
        onUpdate: () => {
          st.x = P.x0 + (P.x1 - P.x0) * flight.p;
          st.y = yAt(st.x);
          st.rot = 620 * flight.p;
          clip.setAttribute('width', st.x + 2);
          draw();
        },
      })
      // Два затухающих отскока и докат
      .to(st, { keyframes: [
        { x: 328, y: P.ground - 16, duration: 0.2, ease: 'power2.out' },
        { x: 336, y: P.ground, duration: 0.2, ease: 'power2.in' },
        { x: 341, y: P.ground - 5, duration: 0.12, ease: 'power2.out' },
        { x: 345, y: P.ground, duration: 0.12, ease: 'power2.in' },
      ], rot: 760, onUpdate: draw })
      .to(st, { x: 348, rot: 790, duration: 0.6, ease: 'power2.out', onUpdate: draw })
      .to({}, { duration: 2.2 })
      .to([ballG, trail], { autoAlpha: 0, duration: 0.5 })
      .to(shadow, { opacity: 0, duration: 0.5 }, '<');
    // Формула появляется, когда мяч проходит вершину
    gsap.from('.field__formula', { autoAlpha: 0, y: 8, duration: 0.8, delay: 1.7 });
    // Ушёл с экрана — пауза, чтобы не крутить анимацию зря
    ScrollTrigger.create({ trigger: '.field', start: 'top bottom', end: 'bottom top', onToggle: s => (s.isActive ? kick.resume() : kick.pause()) });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--line):not(.btn--ghost):not(.btn--green)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i * 0.8 });
    });

    /* ---------- 2. Занятия ---------- */
    rollEyebrow('.lessons');
    revealLines('.lessons h2', '.lessons .sec-head');
    $$('.card').forEach((card, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' } });
      tl.from(card, { y: 48, autoAlpha: 0, duration: 1, ease: 'expo.out', delay: i * 0.08 })
        // Схема розыгрыша: игроки появляются, пробег рисуется к воротам
        .from($$('.tactic__dot', card), { scale: 0, transformOrigin: '50% 50%', stagger: 0.07, duration: 0.5, ease: 'back.out(2.4)' }, 0.3)
        .fromTo($('.tactic__run', card), { strokeDasharray: 100, strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0.55)
        .from($('.tactic__tip', card), { autoAlpha: 0, duration: 0.3 }, 1.35)
        // Цена появляется целиком, без счётчика
        .from($('.card__price', card), { y: 14, autoAlpha: 0, duration: 0.8 }, 0.45);
    });

    /* ---------- 3. Курсы ---------- */
    rollEyebrow('.courses');
    revealLines('.courses h2', '.courses .sec-head');
    gsap.from('.courses .sec-sub', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses .sec-head', start: 'top 80%' } });
    gsap.from('.tab', { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.tabs', start: 'top 88%' } });
    gsap.from('.tabs__track', { scaleX: 0, transformOrigin: '0 50%', duration: 1, ease: 'expo.inOut', scrollTrigger: { trigger: '.tabs', start: 'top 88%' } });
    // Мяч вкатывается слева к активной вкладке
    placeBall();
    const startRot = ballRot;
    ballRot = startRot;
    gsap.from(ball, {
      x: -30, rotation: startRot - ((ballX + 30) / BALL_R) * (180 / Math.PI), duration: 1.3, ease: 'power3.out',
      scrollTrigger: { trigger: '.tabs', start: 'top 85%' },
    });
    gsap.from('.panel:not([hidden]) .row', {
      x: -16, autoAlpha: 0, stagger: 0.06, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: '.panels', start: 'top 88%' },
    });
    gsap.from('.courses__more > *', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.courses__more', start: 'top 90%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
