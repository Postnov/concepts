// Скороговорун — моушн концепта: «карточки-буквы». Карточки переворачиваются на место, буквы названия выпадают из-под маски.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.0, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 85%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.0, ease: 'expo.out' }, 0.35)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.9)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.05)
      .from('.hero__note', { autoAlpha: 0, duration: 0.6 }, 1.2)
      .from('.tile', { rotationY: 95, y: 60, autoAlpha: 0, transformPerspective: 900, duration: 1.1, stagger: 0.14, ease: 'back.out(1.3)' }, 0.5);

    // Карточки слегка «дышат» — каждая в своём темпе
    $$('.tile').forEach((t, i) => gsap.to(t, { y: -10, duration: 2.4 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 + i * 0.3 }));
    gsap.to('.deck', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    gsap.utils.toArray('.hero .btn, .set .btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    /* ---------- 2. Программы ---------- */
    revealLines('.paths h2', '.paths .sec-head');
    gsap.from('.paths .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.paths .sec-head', start: 'top 85%' } });
    gsap.from('.path', {
      rotationX: -70, y: 30, autoAlpha: 0, transformPerspective: 900, transformOrigin: '50% 0%',
      duration: 1.0, stagger: 0.15, ease: 'expo.out',
      scrollTrigger: { trigger: '.paths__list', start: 'top 85%' },
    });
    gsap.from('.path__mark', { scale: 0.4, rotate: -20, duration: 0.9, stagger: 0.15, ease: 'back.out(2)', scrollTrigger: { trigger: '.paths__list', start: 'top 85%' } });

    /* ---------- 3. Набор ---------- */
    revealLines('.set h2', '.set .sec-head');
    gsap.from('.set .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.set .sec-head', start: 'top 85%' } });
    gsap.from('.set__list li', { x: -20, autoAlpha: 0, duration: 0.8, stagger: 0.14, ease: 'power3.out', scrollTrigger: { trigger: '.set__list', start: 'top 85%' } });
    gsap.from(['.set .btn', '.set__note'], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.set .btn', start: 'top 92%' } });
    gsap.from('.rcard', {
      rotationY: 90, x: 60, autoAlpha: 0, transformPerspective: 800, duration: 1.0, stagger: 0.09, ease: 'back.out(1.2)',
      scrollTrigger: { trigger: '.reel', start: 'top 88%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 90%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
