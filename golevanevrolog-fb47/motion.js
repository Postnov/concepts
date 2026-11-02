// Елена Голева — моушн концепта. Фирменная идея: «монитор дыхания» из реанимации —
// кривая вдоха и выдоха прописывается в реальном темпе, той же волной рисуются акценты ниже по странице.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- кривая дыхания ---------- */
  // Один цикл 6 с: вдох 2,4 с, выдох 2,8 с, пауза 0,8 с. Возвращает 0…1 (высота вдоха)
  const CYCLE = 6, IN = 2.4, OUT = 2.8;
  const breath = t => {
    const p = ((t % CYCLE) + CYCLE) % CYCLE;
    if (p < IN) return (1 - Math.cos(Math.PI * p / IN)) / 2;
    if (p < IN + OUT) return (1 + Math.cos(Math.PI * (p - IN) / OUT)) / 2;
    return 0;
  };
  const phaseOf = t => {
    const p = ((t % CYCLE) + CYCLE) % CYCLE;
    return p < IN ? 'вдох' : p < IN + OUT ? 'выдох' : 'пауза';
  };
  const W = 600, H = 200, BASE = 168, AMP = 136, N = 160, SWEEP = 10; // экран 600×200, полный проход 10 с
  const yAt = t => BASE - AMP * breath(t);
  const xAt = i => (i / (N - 1)) * W;
  const toPath = pts => pts.length ? 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L') : '';

  const lines = $$('.trace__line');
  const dot = $('.trace__dot');
  const screen = $('.monitor__screen');
  const phaseEl = $('[data-phase]');

  // Статичная кривая (без моушна): полтора цикла на ширину экрана
  const staticTrace = () => {
    const pts = [];
    for (let i = 0; i < N; i++) pts.push([xAt(i), yAt(1.2 + (i / (N - 1)) * SWEEP)]);
    lines[0].setAttribute('d', toPath(pts));
    lines[1].setAttribute('d', '');
  };
  staticTrace();

  if (!animate) return;

  // Развёртка как на мониторе: новая кривая идёт слева направо, впереди — зазор, дальше гаснет прошлый проход
  function runMonitor() {
    const ys = new Array(N).fill(BASE);
    const GAP = 7;
    let start = null, lastPhase = '';
    const tick = () => {
      const now = performance.now() / 1000;
      if (start === null) start = now;
      const t = now - start;
      const head = Math.floor(((t % SWEEP) / SWEEP) * (N - 1));
      const sweepStart = t - (t % SWEEP);
      // прописываем точки текущего прохода до «пера»
      for (let i = 0; i <= head; i++) ys[i] = yAt(sweepStart + (i / (N - 1)) * SWEEP);
      const fresh = [], old = [];
      for (let i = 0; i <= head; i++) fresh.push([xAt(i), ys[i]]);
      if (t >= SWEEP) for (let i = head + GAP; i < N; i++) old.push([xAt(i), ys[i]]);
      lines[0].setAttribute('d', toPath(fresh));
      lines[1].setAttribute('d', toPath(old));
      const r = screen.getBoundingClientRect();
      gsap.set(dot, { x: (xAt(head) / W) * r.width, y: (ys[head] / H) * r.height });
      const ph = phaseOf(t);
      if (ph !== lastPhase) {
        lastPhase = ph;
        gsap.to(phaseEl, { autoAlpha: 0, duration: 0.2, onComplete: () => { phaseEl.textContent = ph; gsap.to(phaseEl, { autoAlpha: 1, duration: 0.3 }); } });
      }
      // фото еле заметно «дышит» вместе с кривой
      gsap.set('.monitor__photo', { scale: 1 + 0.025 * breath(t) });
    };
    lines[0].setAttribute('d', '');
    gsap.to(dot, { opacity: 1, duration: 0.6 });
    gsap.ticker.add(tick);
  }

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  // Волна прописывается, как на мониторе
  function drawPath(path, vars) {
    const len = path.getTotalLength();
    gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'power2.inOut', ...vars });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.2)
      .from(first.chars, { yPercent: 110, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.3)
      .from(last.chars, { yPercent: 110, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.5)
      .fromTo('.monitor', { clipPath: 'inset(50% 0% 50% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.2, ease: 'expo.inOut' }, 0.45)
      .from('.monitor__photo', { autoAlpha: 0, yPercent: 14, duration: 1.3, ease: 'expo.out' }, 1.0)
      .from('.monitor__photo img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 1.0)
      .from(['.monitor__head > *', '.monitor__foot'], { autoAlpha: 0, y: 8, stagger: 0.08, duration: 0.6 }, 1.2)
      .call(runMonitor, null, 1.25)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.9)
      .from('.hero__actions > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25);

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i });
    });

    /* ---------- 2. Уроки ---------- */
    revealLines('.lessons h2', '.lessons .sec-head');
    gsap.from('.lessons .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.lessons .sec-head', start: 'top 85%' } });
    $$('.lesson').forEach((row, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%' } });
      tl.from(row, { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out' })
        .from($('.lesson__num', row), { autoAlpha: 0, x: -10, duration: 0.5 }, 0.15);
      drawPath($('.lesson__wave path', row), { duration: 1.4, delay: 0.25 + i * 0.05, scrollTrigger: { trigger: row, start: 'top 90%' } });
    });
    gsap.timeline({ scrollTrigger: { trigger: '.course', start: 'top 82%' } })
      .fromTo('.course', { clipPath: 'inset(0% 0% 100% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.2, ease: 'expo.inOut' })
      .from('.course > :not(svg)', { y: 22, autoAlpha: 0, stagger: 0.09, duration: 0.8, ease: 'power3.out' }, 0.45);
    drawPath($('.course__wave path'), { duration: 2.4, scrollTrigger: { trigger: '.course', start: 'top 70%' } });

    /* ---------- 3. О враче ---------- */
    revealLines('.about h2', '.about .sec-head');
    gsap.from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 85%' } });
    gsap.from('.fact', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.fact', start: 'top 88%' } });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = Math.round(o.v); },
      });
    });
    gsap.from('.about__role', { y: 20, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.about__role', start: 'top 90%' } });
    gsap.fromTo('.about__quote', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: '.about__quote', start: 'top 86%' } });
    gsap.from('.about__text > p, .about__links', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.about__text', start: 'top 80%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
