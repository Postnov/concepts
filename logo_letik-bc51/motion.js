// Елена Тихоненкова — моушн концепта. Идея: «звуки». Эквалайзер-голос, буквы-пузырьки (Р Ш Л С) всплывают у фото и покачиваются.
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
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.blob', { scale: 0.4, rotate: -25, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.1)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0% round 200px 200px 30px 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 200px 200px 30px 30px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.arch img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.035, duration: 1.0, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.75)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.pills li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' }, 1.1)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.25);

    // Буквы-пузырьки: «выговариваются» по очереди, потом плавно покачиваются
    $$('.chip').forEach((chip, i) => {
      gsap.from(chip, { scale: 0, rotate: -30, autoAlpha: 0, duration: 0.9, ease: 'back.out(2.4)', delay: 1.0 + i * 0.22 });
      gsap.to(chip, { y: i % 2 ? 10 : -10, duration: 2.2 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 + i * 0.2 });
    });

    // Эквалайзер-голос
    $$('.wave i').forEach((bar, i) => {
      gsap.to(bar, { scaleY: () => 0.35 + Math.random() * 0.65, duration: 0.35 + (i % 3) * 0.12, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.07 });
    });

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });
    gsap.to('.arch img', { yPercent: -4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Чем могу быть полезна ---------- */
    revealLines('.help h2', '.help .sec-head');
    gsap.from('.help .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.help .sec-head', start: 'top 82%' } });
    $$('.who').forEach((card, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 84%' } });
      tl.from(card, { y: 60, rotate: i ? 1.5 : -1.5, autoAlpha: 0, duration: 1.0, ease: 'expo.out' })
        .from($$('.who__list li', card), { x: -18, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' }, 0.25)
        .from($$('.btn', card), { y: 14, autoAlpha: 0, duration: 0.6 }, 0.7);
    });

    /* ---------- 3. Услуги ---------- */
    revealLines('.prices h2', '.prices .sec-head');
    gsap.from('.prices .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.prices .sec-head', start: 'top 82%' } });
    $$('.bubble').forEach((b, i) => {
      gsap.from(b, {
        y: 50, scale: 0.86, rotate: i % 2 ? 2 : -2, transformOrigin: i % 2 ? '100% 100%' : '0% 100%', autoAlpha: 0,
        duration: 1.0, ease: 'back.out(1.5)', scrollTrigger: { trigger: b, start: 'top 90%' },
      });
      gsap.from($('.bubble__price', b), { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 88%' } });
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
