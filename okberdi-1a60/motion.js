// Оксана Бердичевская — моушн концепта. Страница — лабораторный бланк: красная ручка врача обводит главное,
// красные точки показателей сами уходят в зелёную зону «норма». Спокойный ритм, без резких эффектов.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // без GSAP / при reduced motion — статичная полностью рабочая страница

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 85%' },
      onComplete: () => split.revert(),
    });
  }
  // Ручка: штрих рисуется по контуру (pathLength=1)
  const draw = (paths, vars) => gsap.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', ...vars });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const gauges = $$('.gauge');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        name.revert(); lead.revert();
        // Ручка обводит «открытую книгу» уже на живом тексте (маски строк сняты)
        draw('.hero .pen path', { delay: 0.1, duration: 1.2 });
      },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.stage__arch', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.25, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.stage__img', { yPercent: 14, scale: 1.1, transformOrigin: '50% 100%', duration: 1.7, ease: 'expo.out' }, 0.45)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from('.slip', { y: 46, autoAlpha: 0, duration: 1.0, ease: 'expo.out' }, 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.85)
      .from('.hero__about', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.15)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3)
      .from('.hero__note', { y: 10, autoAlpha: 0, duration: 0.8 }, 1.5);
    // Показатели: красные точки приходят из-за границ шкалы в зелёную зону
    gauges.forEach((g, i) => {
      const dot = $('.gauge__dot', g);
      intro.fromTo(dot, { '--p': +g.dataset.from }, { '--p': +g.dataset.to, duration: 1.7, ease: 'power3.inOut' }, 1.25 + i * 0.16);
      // потом показатель чуть «дышит» внутри нормы
      gsap.to(dot, { '--p': `+=${i % 2 ? 3 : -3}`, duration: 2.6 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3.4 + i * 0.3 });
    });
    // Бланк слегка покачивается, как лежащий на столе лист
    gsap.to('.slip', { y: -5, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.6 });
    // Лёгкий параллакс портрета
    gsap.to('.stage', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Курсы ---------- */
    revealLines('.courses h2', '.courses .sec-head');
    gsap.from('.courses .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses .sec-head', start: 'top 85%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.feature', start: 'top 82%' } })
      .from('.feature', { clipPath: 'inset(0% 0% 100% 0% round 26px)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.feature > *', { y: 22, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, 0.5)
      .add(() => draw('.feature .pen path', { duration: 1.1 }), 1.0);
    const rows = $$('.row');
    gsap.set(rows, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }),
    });

    /* ---------- 3. Маршрут ---------- */
    revealLines('.route h2', '.route .sec-head');
    gsap.from('.route .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.route .sec-head', start: 'top 85%' } });
    // Показатель едет вниз по шкале вместе с прокруткой и приходит в зелёную зону на последнем шаге
    gsap.fromTo('.scale__dot', { '--p': 0 }, {
      '--p': 86, ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 65%', end: 'bottom 70%', scrub: 0.4 },
    });
    $$('.step').forEach(step => {
      gsap.from(step.children, {
        x: -18, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 85%' },
      });
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
