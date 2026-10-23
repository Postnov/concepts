// Александр Лоренц — моушн концепта.
// Одна идея: «тоннель внимания». Кольца со смещёнными центрами медленно вращаются вокруг портрета и складываются
// в качающуюся воронку; от взгляда расходятся коралловые волны — воздействие без слов. Та же воронка в значках ступеней:
// чем глубже ступень, тем больше колец. Курсив «невербального» проявляется из расфокуса в резкость.
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP — статичная рабочая страница

  // Строки из-под маски. Маске — запас снизу (padding + отрицательный margin), чтобы хвосты «у», «р», «д» не резались
  function revealLines(target, trigger, vars = {}) {
    const split = SplitText.create(target, { type: 'lines', mask: 'lines' });
    if (split.masks) gsap.set(split.masks, { paddingBottom: '0.14em', marginBottom: '-0.14em' });
    return gsap.from(split.lines, {
      yPercent: 118, duration: 1.1, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: trigger === false ? undefined : { trigger: trigger || target, start: 'top 84%' },
      onComplete: () => split.revert(),
      ...vars,
    });
  }

  // Бесконечное вращение колец (у каждого значка своя скорость и направление — воронки не синхронны)
  function spin(el, duration, dir = 1) {
    gsap.to(el, { rotation: 360 * dir, svgOrigin: '0 0', duration, repeat: -1, ease: 'none' });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const caps = SplitText.create('.t-caps', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const serif = SplitText.create('.t-serif', { type: 'words,chars', wordsClass: 'sw' });
    const portrait = document.querySelector('.hero__portrait');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { caps.revert(); serif.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.tunnel', { autoAlpha: 0, duration: 1.2, ease: 'power2.out' }, 0.05)
      .from('.tunnel__rings', { scale: 0.42, rotation: -70, svgOrigin: '0 0', duration: 2.4, ease: 'expo.out' }, 0.05)
      .fromTo(portrait,
        { clipPath: 'circle(0% at 50% 50%)' },
        { clipPath: 'circle(50% at 50% 50%)', duration: 1.4, ease: 'expo.inOut' }, 0.15)
      .from('.hero__portrait img', { scale: 1.4, duration: 2.1, ease: 'expo.out' }, 0.35)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.3)
      .from(caps.chars, { yPercent: 112, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.4)
      // «невербального» — из расфокуса в резкость, от центра слова к краям
      .from(serif.chars, {
        autoAlpha: 0, filter: 'blur(12px)', yPercent: 8,
        stagger: { each: 0.035, from: 'center' }, duration: 1.2, ease: 'power2.out',
        clearProps: 'filter',
      }, 0.65)
      .from('.hero__lead', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.hero__motto > *', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 1.1)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.75 }, 1.2);

    // Тоннель вращается; волны расходятся от портрета по очереди
    spin('.tunnel__rings', 38);
    $$('.tunnel__wave').forEach((wave, i) => {
      gsap.timeline({ repeat: -1, delay: 1.6 + i * 2.2 })
        .fromTo(wave, { attr: { r: 208 }, opacity: 0.85 }, { attr: { r: 560 }, opacity: 0, duration: 4.4, ease: 'sine.out' });
    });

    // При уходе hero воронка «затягивает»: кольца растут, портрет чуть уплывает
    gsap.to('.tunnel', {
      scale: 1.3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__portrait img', {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Курсы ---------- */
    gsap.from('.program .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.program .sec-head', start: 'top 85%' } });
    revealLines('.program h2', '.program .sec-head');

    $$('.step').forEach((step, i) => {
      const badge = step.querySelector('.step__badge svg');
      spin(step.querySelector('.badge__rings'), 16 + i * 4, i % 2 ? -1 : 1);
      const tl = gsap.timeline({ scrollTrigger: { trigger: step, start: 'top 86%' } });
      if (step.classList.contains('step--deep')) {
        tl.fromTo(step,
          { clipPath: 'inset(0% 0% 100% 0% round 24px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.2, ease: 'expo.inOut' });
      }
      tl.from(badge, { scale: 0.2, rotation: -120, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.05)
        .from(step.querySelector('.step__badge b'), { autoAlpha: 0, duration: 0.6 }, 0.35)
        .from(step.querySelector('h3'), { x: -22, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.15)
        .from(step.querySelector('p'), { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.3);
    });

    gsap.from('.feats li', {
      y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.feats', start: 'top 90%' },
    });
    revealLines('.program__motto', '.program__motto');

    /* ---------- 3. О себе ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.about__photo', start: 'top 82%' } })
      .fromTo('.about__photo .frame',
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
      .from('.about__photo img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.2)
      .from('.about__orbit', { scale: 0.5, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.4);
    spin('.about__orbit .badge__rings', 30, -1);

    gsap.from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 85%' } });
    revealLines('.about h2', '.about .sec-head');
    revealLines('.about__lead', '.about__lead');
    $$('.about__p').forEach(p => gsap.from(p, { y: 16, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: p, start: 'top 90%' } }));
    gsap.from('.format__title', { x: -20, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.format__title', start: 'top 88%' } });
    const rows = $$('.format li');
    gsap.set(rows, { x: -20, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' }),
    });
    gsap.from('.about__actions .btn', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.about__actions', start: 'top 94%' } });

    /* ---------- концепт ---------- */
    spin('.concept-end__disc .badge__rings', 22);
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
