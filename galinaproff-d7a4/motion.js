// Orlova Studio — моушн концепта. Идея: луч стирает «волоски» с фото и оставляет гладкость; та же линия-луч рисует строки процедур.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const frame = $('.hero .frame');

    // Луч проходит слева направо, стирая волоски; можно повторить
    const sweep = () => {
      const tl = gsap.timeline();
      tl.set('.strands', { clipPath: 'inset(0% 0% 0% 0%)' })
        .set('.beam', { x: 0, autoAlpha: 1 })
        .to('.strands', { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.9, ease: 'power2.inOut' }, 0)
        .to('.beam', { x: () => document.querySelector('.beam').parentElement.offsetWidth, duration: 1.9, ease: 'power2.inOut' }, 0)   // сдвиг декора — только transform (cls)
        .to('.beam', { autoAlpha: 0, duration: 0.3 }, 1.7);
      return tl;
    };

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.1)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 26px 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 26px 26px)', duration: 1.3, ease: 'expo.inOut' }, 0.15)
      .from('.hero__photo img', { scale: 1.35, duration: 1.9, ease: 'expo.out' }, 0.3)
      .add(sweep(), 0.9)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.5)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.95)
      .from('.hero__about', { y: 18, autoAlpha: 0, duration: 0.85 }, 1.15)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3);

    // Вернулись к началу страницы — луч проходит ещё раз
    let played = false;
    ScrollTrigger.create({
      trigger: '.hero', start: 'top 20%', end: 'bottom top',
      onLeave: () => { played = true; },
      onEnterBack: () => { if (played) { played = false; sweep(); } },
    });

    /* Блик на главных кнопках */
    $$('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Процедуры ---------- */
    revealLines('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 84%' } });
    $$('.row').forEach(row => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%' } });
      tl.fromTo(row, { '--draw': 0 }, { '--draw': 1, duration: 1.1, ease: 'power3.inOut' })
        .from($$('.row__num, .row__title, .row__go', row), { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.15);
    });
    gsap.from('.services__btn', { y: 20, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services__btn', start: 'top 94%' } });

    /* ---------- 3. Отзывы ---------- */
    revealLines('.reviews h2', '.reviews .sec-head');
    gsap.from('.reviews .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.reviews .sec-head', start: 'top 84%' } });
    gsap.from('.rev', {
      x: 60, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.reviews__track', start: 'top 88%' },
    });
    gsap.from('.stars', {
      clipPath: 'inset(0 100% 0 0)', duration: 0.9, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.reviews__track', start: 'top 88%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
