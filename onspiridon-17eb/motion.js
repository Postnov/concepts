// Спиридон Оганесян — моушн концепта. Фирменная идея: «тревога → спокойствие → близость».
// Линия пульса в hero сначала дрожит, потом выравнивается в ровную волну; два круга в блоке записи сближаются при прокрутке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- линия пульса ----------
     calm: 0 — тревога (рваный шум), 1 — спокойствие (ровная волна). Рисуется и без GSAP: статичная спокойная волна */
  function signal(svg) {
    const line = $('.signal__line', svg);
    if (!line) return null;
    const W = 600, H = 64, N = 96;
    const state = { calm: 1, phase: 0 };
    const noise = new Float32Array(N + 1);
    const roll = () => {
      for (let i = 0; i <= N; i++) {
        const spike = Math.random() < 0.07 ? 1.9 : 1; // редкие резкие всплески, как у тревожного пульса
        noise[i] = (Math.random() * 2 - 1) * spike;
      }
    };
    const render = () => {
      const { calm, phase } = state;
      const edge = i => Math.min(1, Math.min(i, N - i) / 6); // концы линии не дрожат
      let d = '';
      for (let i = 0; i <= N; i++) {
        const x = (i / N) * W;
        const jitter = noise[i] * 24 * (1 - calm) * edge(i);
        const wave = Math.sin((x / W) * Math.PI * 4 + phase) * (9 + 4 * (1 - calm)) * (0.25 + 0.75 * calm);
        d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${(H / 2 + jitter + wave).toFixed(1)}`;
      }
      line.setAttribute('d', d);
    };
    roll();
    render();
    return { state, render, roll };
  }

  const sig = signal(document);

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const arch = $('.arch');

    // Линия стартует тревожной
    if (sig) { sig.state.calm = 0; sig.render(); }

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(arch, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.1)
      .from('.arch img', { scale: 1.34, duration: 2, ease: 'expo.out' }, 0.25)
      .from('.halo', { scale: 0.86, autoAlpha: 0, duration: 1.6, stagger: 0.14, ease: 'expo.out' }, 0.7)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.55)
      .from('.signal', { autoAlpha: 0, duration: 0.5 }, 0.9);
    if (sig) intro.to(sig.state, { calm: 1, duration: 3.4, ease: 'power2.inOut', onUpdate: sig.render }, 1.1);
    intro
      .from(lead.lines, { yPercent: 105, stagger: 0.1, duration: 1, ease: 'expo.out' }, 2.5)
      .from('.hero__about', { y: 14, autoAlpha: 0, duration: 0.8 }, 2.8)
      .from('.pills li', { y: 12, autoAlpha: 0, stagger: 0.09, duration: 0.7 }, 3.0)
      .from('.hero .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 3.2);

    // Пульс продолжает мягко «дышать» (пока hero в кадре); пока линия ещё тревожная — шум перебрасывается ~16 раз в секунду
    if (sig) {
      let on = true, acc = 0;
      ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: self => { on = self.isActive; } });
      gsap.ticker.add((time, dt) => {
        if (!on) return;
        acc += dt;
        if (acc < 33) return;
        if (sig.state.calm < 0.995) sig.roll();
        sig.state.phase += acc * 0.0009;
        acc = 0;
        sig.render();
      });
    }

    /* Лёгкий параллакс портрета */
    gsap.to('.arch img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Консультация ---------- */
    revealLines('.book h2', '.book .sec-head');
    gsap.from('.book .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.book .sec-head', start: 'top 84%' } });
    gsap.from('.ticket', {
      y: 60, autoAlpha: 0, scale: 0.97, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: '.ticket', start: 'top 88%' },
    });
    // Цена появляется целиком, без счётчика
    gsap.from('.ticket__price > *', { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.ticket__price', start: 'top 92%' } });
    gsap.from('.ticket .btn', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.ticket .actions', start: 'top 96%' } });
    // Близость: два круга сближаются и перекрываются, пока блок идёт по экрану
    gsap.timeline({ scrollTrigger: { trigger: '.ticket', start: 'top 85%', end: 'bottom 45%', scrub: 0.8 } })
      .from('.ring--a', { x: -78, strokeDashoffset: 1, ease: 'none' }, 0)
      .from('.ring--b', { x: 78, strokeDashoffset: 1, ease: 'none' }, 0)
      .from('.ring-lens', { autoAlpha: 0, ease: 'none', duration: 0.4 }, 0.6);

    /* ---------- 3. Каналы: карточки приходят с двух сторон и встают рядом ---------- */
    revealLines('.chan h2', '.chan .sec-head');
    gsap.from('.chan .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.chan .sec-head', start: 'top 84%' } });
    const side = window.matchMedia('(min-width: 900px)').matches;
    gsap.from('.link--l', { x: side ? -90 : -48, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.links', start: 'top 86%' } });
    gsap.from('.link--r', { x: side ? 90 : 48, autoAlpha: 0, duration: 1.2, ease: 'expo.out', delay: 0.12, scrollTrigger: { trigger: '.links', start: 'top 86%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
