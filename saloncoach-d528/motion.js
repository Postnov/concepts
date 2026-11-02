// Ирина Мухамедьярова — моушн концепта. Идея «гроссбух»: полосы вала, расходов и денег; полоса денег тонкая — и растёт.
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
    const frame = $('.hero__photo .frame');
    const gain = $('.ledger__row--gain i');

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 26px 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 26px 26px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.glow', { scale: 0.6, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.5)
      .from('.stamp', { y: 20, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.03, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.ledger', { y: 20, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.ledger__label', { x: -10, autoAlpha: 0, stagger: 0.15, duration: 0.6 }, 1.1)
      .from('.ledger__row--rev i', { scaleX: 0, duration: 1.1, ease: 'expo.out' }, 1.15)
      .from('.ledger__row--cost i', { scaleX: 0, duration: 1.1, ease: 'expo.out' }, 1.3)
      .from(gain, { scaleX: 0, duration: 0.8, ease: 'expo.out' }, 1.45)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.5)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.65);

    /* Полоса «денег» медленно ищет себя: тянется вперёд и возвращается */
    gsap.to(gain, { scaleX: 0.3, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3.2 });

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    gsap.to('.hero__photo img', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Помогаю ---------- */
    revealLines('.helps h2', '.helps .sec-head');
    gsap.from('.helps .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.helps .sec-head', start: 'top 82%' } });
    $$('.checks li').forEach(li => {
      const path = $('path', li);
      gsap.set(path, { drawSVG: 0 });
    });
    $$('.checks li').forEach(li => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%', once: true } });
      tl.from(li, { x: -24, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
        .from($('svg', li), { scale: 0, rotate: -40, duration: 0.5, ease: 'back.out(2.2)' }, 0.1)
        .from($('path', li), { strokeDashoffset: 1, duration: 0.5, ease: 'power2.out' }, 0.25);
    });
    gsap.from('.helps__note', { y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.helps__note', start: 'top 88%' } });

    /* ---------- 3. Пакеты ---------- */
    revealLines('.packs h2', '.packs .sec-head');
    gsap.from('.packs .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.packs .sec-head', start: 'top 82%' } });
    gsap.from('.card', {
      y: 50, rotateX: -12, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0,
      duration: 1.05, stagger: 0.15, ease: 'expo.out', scrollTrigger: { trigger: '.cards', start: 'top 86%' },
    });
    $$('.card__price').forEach(el => gsap.from(el, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
