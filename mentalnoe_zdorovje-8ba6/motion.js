// Снежана — моушн концепта. Идея «личная граница»: кольцо вокруг фото рисуется само, линии-границы прорисовываются при прокрутке.
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
    const ring = $('.space__ring');
    const len = ring.getTotalLength();

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); gsap.set(ring, { clearProps: 'strokeDasharray,strokeDashoffset' }); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.frame', { scale: 0.7, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.1)
      .from('.frame img', { scale: 1.35, duration: 1.9, ease: 'expo.out' }, 0.2)
      .fromTo(ring, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0.35)
      .from('.space__dash', { scale: 0.8, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.6)
      .from('.space__label', { y: 10, autoAlpha: 0, duration: 0.6 }, 1.6)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.75)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.pills li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' }, 1.1)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.25);

    /* Граница «дышит»: пунктир медленно вращается, кольцо чуть расширяется и возвращается */
    gsap.to('.space__dash', { rotation: 360, duration: 80, ease: 'none', repeat: -1 });
    gsap.timeline({ repeat: -1, yoyo: true, delay: 2.2 })
      .to(ring, { scale: 1.035, duration: 3.6, ease: 'sine.inOut' });

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    gsap.to('.frame', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Запросы: строки с линией-границей ---------- */
    revealLines('.topics h2', '.topics .sec-head');
    gsap.from(['.topics .eyebrow', '.topics .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.topics .sec-head', start: 'top 82%' },
    });
    $$('.rows li').forEach(li => {
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 92%' } })
        .fromTo(li, { '--draw': 0 }, { '--draw': 1, duration: 1, ease: 'power3.inOut' })
        .from($('.rows__n', li), { x: -10, autoAlpha: 0, duration: 0.6 }, 0.1);
    });
    $$('.rows li').forEach(li => gsap.from(li, { autoAlpha: 0, y: 14, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 92%' } }));

    /* ---------- 3. Консультации ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.formats .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 82%' } });
    gsap.from('.card', {
      y: 50, rotateX: -12, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0,
      duration: 1.05, stagger: 0.15, ease: 'expo.out',
      scrollTrigger: { trigger: '.cards', start: 'top 86%' },
    });
    $$('.card__price').forEach(el => gsap.from(el, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
    gsap.from('.free', { x: -14, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.free', start: 'top 90%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
