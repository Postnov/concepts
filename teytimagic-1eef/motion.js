// Teyti Magic — моушн концепта. Фирменная идея: «расклад» — карты рубашкой вверх переворачиваются при прокрутке,
// за портретом медленно вращается астролябия со звёздами. Без резких эффектов.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* деления на астролябии: рисуем кодом, чтобы разметка была короткой */
  const ticks = $('.wheel__ticks');
  if (ticks) {
    const NS = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 48; i++) {
      const a = (i * 7.5 * Math.PI) / 180, long = i % 4 === 0;
      const l = document.createElementNS(NS, 'line');
      const r1 = long ? 86.5 : 89, r2 = 91.5;
      l.setAttribute('x1', 100 + r1 * Math.sin(a)); l.setAttribute('y1', 100 - r1 * Math.cos(a));
      l.setAttribute('x2', 100 + r2 * Math.sin(a)); l.setAttribute('y2', 100 - r2 * Math.cos(a));
      ticks.append(l);
    }
  }

  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 85%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.1)
      .from('.arch img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.2)
      .from('.wheel', { scale: 0.7, rotation: -40, autoAlpha: 0, duration: 2.2, ease: 'expo.out' }, 0.3)
      .from('.spark', { scale: 0, rotation: -90, autoAlpha: 0, stagger: 0.18, duration: 0.9, ease: 'back.out(2.4)' }, 1.0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.15);

    /* Астролябия: внешнее кольцо и внутреннее крутятся в разные стороны */
    gsap.to('.wheel__outer', { rotation: 360, svgOrigin: '100 100', duration: 160, ease: 'none', repeat: -1 });
    gsap.to('.wheel__inner', { rotation: -360, svgOrigin: '100 100', duration: 110, ease: 'none', repeat: -1 });
    /* Звёзды мерцают */
    $$('.spark').forEach((el, i) => {
      gsap.to(el, { scale: 0.55, autoAlpha: 0.45, rotation: 45, duration: 1.8 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 + i * 0.4 });
    });
    /* Блик на главных кнопках */
    $$('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });
    /* Лёгкий параллакс портрета */
    gsap.to('.arch img', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Три карты: переворот рубашкой вверх → лицом ---------- */
    revealLines('.spread h2', '.spread .sec-head');
    gsap.from('.spread .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.spread .sec-head', start: 'top 85%' } });
    $$('.tcard').forEach((card, i) => {
      const inner = $('.tcard__inner', card);
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
        .fromTo(card, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' })
        .fromTo(inner, { rotateY: 180 }, { rotateY: 0, duration: 1.5, ease: 'expo.inOut', transformOrigin: '50% 50%' }, 0.35)
        .fromTo($('.tcard__icon', card), { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(2)' }, 1.3 + 0 * i);
    });

    /* ---------- 3. Услуги ---------- */
    revealLines('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 85%' } });
    $$('.svc').forEach(row => {
      const paths = $$('.svc__icon > *', row);
      paths.forEach(p => p.setAttribute('pathLength', '1'));
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%' } });
      tl.fromTo(paths, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.08, onComplete: () => gsap.set(paths, { clearProps: 'strokeDasharray,strokeDashoffset' }) })
        .from($('div', row), { x: 26, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.2);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
