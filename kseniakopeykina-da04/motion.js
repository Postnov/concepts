// Ксения Копейкина — моушн концепта. Идея: «выход из режима выживания» — рваная линия тревоги за фото успокаивается в ровный пульс.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- сигнал: слева рваная линия, справа ровный пульс; граница «спокойствия» (front) едет вправо ---------- */
  const N = 120;
  const seeded = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function signal(svg, h) {
    const glow = $('.signal__glow', svg), line = $('.signal__line', svg);
    const mid = h / 2;
    return function draw(front, t) {
      let d = '';
      for (let i = 0; i <= N; i++) {
        const x = i / N;
        const rough = (seeded(i) - 0.5) * 2 * h * 0.42 * (0.35 + 0.65 * seeded(i + 99));
        const wave = Math.sin(x * Math.PI * 6 - t * 1.6) * h * 0.13 * (0.6 + 0.4 * Math.sin(x * 3));
        const calmness = smooth(front - 0.3, front, x); // 0 — слева (тревога), 1 — у фронта и дальше
        const y = mid + rough * (1 - calmness) + wave * (0.25 + 0.75 * calmness);
        d += (i ? 'L' : 'M') + (x * 1000).toFixed(1) + ' ' + y.toFixed(1);
      }
      glow.setAttribute('d', d);
      line.setAttribute('d', d);
    };
  }
  const heroSvg = $('.signal--hero'), scrubSvg = $('.signal--scrub');
  const drawHero = heroSvg ? signal(heroSvg, 120) : null;
  const drawScrub = scrubSvg ? signal(scrubSvg, 80) : null;
  // статичный вариант для reduced motion и до старта анимации
  drawHero && drawHero(0.5, 0);
  drawScrub && drawScrub(0.5, 0);

  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');
    const state = { front: 1.35 };

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 145px 145px 28px 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 145px 145px 28px 28px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.tag', { scale: 0.6, autoAlpha: 0, duration: 0.7, ease: 'back.out(2)' }, 1.3)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.05, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from('.hero__surname', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.9)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.75)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.hero__note', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.1)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25);

    // линия: фронт спокойствия едет слева направо, потом ровный пульс плывёт
    gsap.fromTo(state, { front: 1.35 }, { front: 0.04, duration: 3.4, ease: 'power2.inOut', delay: 0.5 });
    gsap.ticker.add((time) => { drawHero(state.front, time); });
    gsap.from('.signal--hero', { autoAlpha: 0, duration: 1, delay: 0.3 });

    /* Блик на главных кнопках */
    $$('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo img', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Признаки: линия успокаивается по мере прокрутки ---------- */
    const sc = { p: 0 };
    ScrollTrigger.create({
      trigger: '.signs', start: 'top 85%', end: 'top 15%', scrub: 0.6,
      onUpdate: self => { sc.p = self.progress; },
    });
    gsap.ticker.add((time) => { drawScrub(1.35 - sc.p * 0.99, time); });
    revealLines('.signs h2', '.signs .sec-head');
    gsap.from(['.signs .eyebrow', '.signs .sec-sub'], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: '.signs .sec-head', start: 'top 82%' } });
    $$('.sign').forEach(el => {
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%' } })
        .from($('.sign__num', el), { yPercent: 40, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
        .from($('h3', el), { x: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.1)
        .from($('.sign__q', el), { x: 12, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.22);
    });

    /* ---------- 3. Стоимость и форматы ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.formats .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 82%' } });
    $$('.card').forEach(card => {
      gsap.fromTo(card, { clipPath: 'inset(0% 100% 0% 0% round 26px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.1, ease: 'expo.inOut',
        scrollTrigger: { trigger: card, start: 'top 88%' },
      });
      gsap.from($$('.card__meta, .card__title, .card__note, .btn', card), { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.08, delay: 0.25, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
      // цены появляются целиком, без счётчика
      gsap.from($$('.card__price', card), { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.12, delay: 0.45, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
