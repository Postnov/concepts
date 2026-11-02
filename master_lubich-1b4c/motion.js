// Мастер Любичъ — моушн концепта. Фирменное: «отпечаток банки» (красная круглая метка «ставится» на место)
// и «мазок гуаши» (полоса под ключевым словом проводится слева направо). Ритм спокойный, без резких эффектов.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница полностью рабочая

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе.
  // Класс is-in запускает мазок гуаши под .swipe (CSS-переход, он переживает revert)
  function revealHeading(selector, trigger) {
    const el = $(selector);
    const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onStart: () => el.classList.add('is-in'),
      onComplete: () => split.revert(),
    });
  }

  // «Отпечаток»: метка прижимается с чуть большего размера и проявляется
  const stamp = (targets, vars = {}, st) => gsap.from(targets, {
    scale: 1.55, autoAlpha: 0, duration: 1.1, ease: 'expo.out', ...vars, ...(st ? { scrollTrigger: st } : {}),
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.25)
      .fromTo('.arch__clip', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.15)
      .from('.arch img', { scale: 1.32, duration: 2, ease: 'expo.out' }, 0.3)
      .from('.imprint:not(.imprint--b)', { scale: 1.5, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.7)
      .from('.imprint--b', { scale: 1.6, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 1.0)
      .from('.dial', { scale: 0.84, autoAlpha: 0, duration: 2.2, ease: 'expo.out', stagger: 0.12 }, 0.5)
      .from('.hero__pre', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.85)
      .from(name.chars, { yPercent: 118, stagger: 0.055, duration: 1.1, ease: 'expo.out' }, 0.9)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.3)
      .from('.facts li', { scale: 0.75, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 1.55)
      .from('.hero .cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.7);

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.2, delay: 2.6 + i * 1.3 });
    });

    /* Циферблат медленно поворачивается при прокрутке, отпечаток и портрет — лёгкий параллакс */
    const heroTrigger = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.dial--minor', { rotate: 28, ease: 'none', scrollTrigger: heroTrigger });
    gsap.to('.dial--major', { rotate: -18, ease: 'none', scrollTrigger: heroTrigger });
    gsap.to('.imprint:not(.imprint--b)', { yPercent: -10, ease: 'none', scrollTrigger: heroTrigger });
    gsap.to('.arch img', { yPercent: -5, ease: 'none', scrollTrigger: heroTrigger });

    /* ---------- 2. Разделы ---------- */
    revealHeading('.doors h2', '.doors .sec-head');
    gsap.from('.doors .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.doors .sec-head', start: 'top 84%' } });
    const doors = $$('.door');
    gsap.set(doors, { y: 44, autoAlpha: 0 });
    ScrollTrigger.batch(doors, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.13, ease: 'power3.out' });
        stamp(els.map(d => $('.imp', d)), { stagger: 0.13, delay: 0.25 });
      },
    });

    /* ---------- 3. Вопрос и соцсети ---------- */
    revealHeading('.ask h2');
    gsap.from('.ask__text, .ask > .btn', {
      y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.14, ease: 'power3.out',
      scrollTrigger: { trigger: '.ask__text', start: 'top 90%' },
    });
    gsap.from('.social .eyebrow, .social__title', {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.social', start: 'top 85%' },
    });
    // Плитки соцсетей «проводятся» слева направо, как мазок гуаши
    gsap.fromTo('.soc',
      { clipPath: 'inset(0% 100% 0% 0% round 26px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.1, stagger: 0.15, ease: 'expo.inOut', scrollTrigger: { trigger: '.social__list', start: 'top 88%' } });
    gsap.from('.soc__ico', { scale: 0.4, autoAlpha: 0, duration: 0.8, stagger: 0.15, delay: 0.5, ease: 'expo.out', scrollTrigger: { trigger: '.social__list', start: 'top 88%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
