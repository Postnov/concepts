// Валерия — моушн концепта. Фирменная идея: «дробление» — вокруг её фото, как под микроскопом,
// клетка делится 1 → 2 → 4 → 8 и снова собирается; значки-клетки на карточках делятся при появлении.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: клетки уже стоят раскладкой «8» в разметке

  // Раскладки восьми кругов эмбриона (координаты viewBox −200…200): 1, 2, 4 и 8 клеток
  const ring = (n, rad, r) => Array.from({ length: 8 }, (_, i) => {
    const k = Math.floor(i / (8 / n));
    const a = (k / n) * Math.PI * 2 + (n === 4 ? Math.PI / 4 : 0);
    return { cx: +(Math.cos(a) * rad).toFixed(1), cy: +(Math.sin(a) * rad).toFixed(1), r };
  });
  const STAGES = [
    Array.from({ length: 8 }, () => ({ cx: 0, cy: 0, r: 150 })),
    ring(2, 70, 106),
    ring(4, 88, 82),
    ring(8, 128, 54),
  ];

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    const cells = $$('.embryo__cells circle');
    const cyto = $$('.embryo__cyto circle');
    const nuclei = $$('.embryo__nuclei circle');
    // Внутренний слой на MEMBRANE единиц меньше — светится только «мембрана» клетки
    const MEMBRANE = 12;
    const place = (s, i) => [
      [cells[i], STAGES[s][i]],
      [cyto[i], { ...STAGES[s][i], r: STAGES[s][i].r - MEMBRANE }],
      [nuclei[i], { cx: STAGES[s][i].cx, cy: STAGES[s][i].cy }],
    ];
    const setStage = (s, vars, tl, at) => cells.forEach((_, i) => place(s, i).forEach(([el, attr]) => tl.to(el, { attr, ...vars }, at)));
    // Старт — одна клетка
    cells.forEach((_, i) => place(0, i).forEach(([el, attr]) => gsap.set(el, { attr })));

    /* Дробление: 1 → 2 → 4 → 8, пауза, клетки собираются обратно; всё медленно вращается */
    const division = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });
    const step = { duration: 1.5, ease: 'power2.inOut' };
    division.addLabel('s2', 0.8);
    setStage(1, step, division, 's2');
    division.addLabel('s4', '+=1.1');
    setStage(2, step, division, 's4');
    division.addLabel('s8', '+=1.1');
    setStage(3, step, division, 's8');
    division.addLabel('back', '+=2.2');
    setStage(0, { duration: 2.2, ease: 'power3.inOut' }, division, 'back');
    division.to(nuclei, { autoAlpha: 0, duration: 0.01 }, 0).to(nuclei, { autoAlpha: 0.9, duration: 0.8 }, 's2+=0.6');

    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); division.play(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.embryo__spin', { scale: 0.25, autoAlpha: 0, svgOrigin: '0 0', duration: 1.6, ease: 'expo.out' }, 0.1)
      .from('.embryo__ring, .embryo__ticks', { autoAlpha: 0, scale: 0.86, svgOrigin: '0 0', stagger: 0.08, duration: 1.4, ease: 'expo.out' }, 0.2)
      .fromTo('.hero__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.3, ease: 'expo.inOut' }, 0.35)
      .from('.hero__photo img', { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.5)
      .from('.hello', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.5)
      .from(first.chars, { yPercent: 110, stagger: 0.035, duration: 1, ease: 'expo.out' }, 0.55)
      .from(last.chars, { yPercent: 110, stagger: 0.035, duration: 1, ease: 'expo.out' }, 0.7)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.95)
      .from('.hero__about', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.1)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.2)
      .from('.sticker', { scale: 0.4, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.7)' }, 1.25);

    gsap.to('.embryo__spin', { rotation: 360, svgOrigin: '0 0', duration: 90, repeat: -1, ease: 'none' });
    gsap.to('.embryo__ring--dash', { rotation: -360, svgOrigin: '0 0', duration: 120, repeat: -1, ease: 'none' });

    // Лёгкий параллакс поля микроскопа при уходе hero
    gsap.to('.hero__visual', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Приём ---------- */
    revealLines('.care h2', '.care .sec-head');
    gsap.from('.care .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.care .sec-head', start: 'top 84%' } });
    gsap.from('.care', { borderRadius: '90px 90px 0 0', ease: 'none', scrollTrigger: { trigger: '.care', start: 'top bottom', end: 'top 40%', scrub: true } });
    $$('.svc__item').forEach(item => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 90%' } });
      tl.from($('.svc__line', item), { scaleX: 0, duration: 1.1, ease: 'expo.inOut' })
        .from($('.svc__num', item), { autoAlpha: 0, x: -10, duration: 0.6 }, 0.35)
        .from($('.svc__title', item), { autoAlpha: 0, x: -18, duration: 0.8, ease: 'power3.out' }, 0.4)
        .from($('.svc__go', item), { autoAlpha: 0, rotation: -90, duration: 0.8, ease: 'power3.out' }, 0.5);
    });
    gsap.to('.care__orb', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.care', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* ---------- 3. Курсы: карточки «наводятся на резкость», значки-клетки делятся ---------- */
    revealLines('.learn h2', '.learn .sec-head');
    gsap.from(['.learn .eyebrow', '.learn .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.learn .sec-head', start: 'top 84%' },
    });
    const cards = $$('.card');
    gsap.set(cards, { autoAlpha: 0, scale: 0.94, filter: 'blur(14px)' });
    ScrollTrigger.batch(cards, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, stagger: 0.12, ease: 'power3.out', clearProps: 'filter' });
        els.forEach((card, k) => {
          const dots = $$('.cells circle', card);
          gsap.from(dots, { attr: { cx: 0, cy: 0 }, duration: 1.2, delay: 0.35 + k * 0.12, ease: 'power2.inOut' });
        });
      },
    });
    gsap.from('.help', { x: -14, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.help', start: 'top 92%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
