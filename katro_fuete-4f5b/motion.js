// Екатерина Первакова — моушн концепта. Идея: обруч (воздушная гимнастика) вокруг фото с точкой-орбитой и «позвонки» шагов, заполняющиеся красным при прокрутке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
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
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const ring = $('.hoop__ring circle');

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hoop', { scale: 0.7, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.1)
      .from('.disc img', { scale: 1.4, duration: 1.9, ease: 'expo.out' }, 0.2)
      .fromTo(ring, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0.3)
      .from('.hoop__orbit i', { scale: 0, duration: 0.6, ease: 'back.out(2)' }, 1.5)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from('.hero__surname', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.85)
      .from('.hero__realms > *', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.1)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.4);

    // Точка бесконечно ходит по обручу
    gsap.to('.hoop__orbit', { rotation: 360, duration: 14, ease: 'none', repeat: -1 });

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    gsap.to('.hoop', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Помочь ---------- */
    revealLines('.help h2', '.help .sec-head');
    gsap.from(['.help .eyebrow', '.help .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.help .sec-head', start: 'top 82%' },
    });
    $$('.step').forEach(step => {
      const fill = $('.step__vert i', step);
      gsap.from([...step.children].filter(c => !c.classList.contains('step__vert')), {
        x: 22, autoAlpha: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 86%' },
      });
      gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: step, start: 'top 80%', end: 'top 45%', scrub: true } });
    });

    /* ---------- 3. Форматы ---------- */
    revealLines('.offers h2', '.offers .sec-head');
    gsap.from('.offers .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.offers .sec-head', start: 'top 82%' } });
    gsap.from('.offer', {
      y: 50, scale: 0.94, autoAlpha: 0, duration: 1.0, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.offers__grid', start: 'top 86%' },
    });
    $$('.offer__price').forEach(el => gsap.from(el, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%' } }));
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
