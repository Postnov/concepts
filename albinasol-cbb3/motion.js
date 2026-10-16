// Альбина — моушн концепта. Фирменная идея: линия пульса (кардиограмма) и мягкий удар сердца.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Линия пульса: подготовка к рисованию штриха (без GSAP линия просто видна целиком)
  function pulsePath(svg) {
    const path = $('path', svg);
    const len = path.getTotalLength();
    // запас +8 в штрихе и сдвиге: до начала рисования не виден ни кончик, ни хвост линии
    gsap.set(path, { strokeDasharray: len + 8, strokeDashoffset: len + 8 });
    return path;
  }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead em', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const frame = $('.hero__photo .frame');
    const heroPulse = pulsePath($('.pulse--hero'));

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.chars, { yPercent: 110, stagger: 0.03, duration: 0.9, ease: 'expo.out' }, 0.8)
      .from('.heart', { scale: 0, autoAlpha: 0, duration: 0.7, ease: 'back.out(2.4)' }, 1.15)
      .to(heroPulse, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0.95)
      .from('.pills li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' }, 1.2)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.35);

    /* Удар сердца: «тук-тук — пауза», как настоящий ритм */
    gsap.timeline({ repeat: -1, repeatDelay: 1.1, delay: 2.2 })
      .to('.heart', { scale: 1.18, duration: 0.12, ease: 'power2.out' })
      .to('.heart', { scale: 1, duration: 0.16, ease: 'power2.in' })
      .to('.heart', { scale: 1.1, duration: 0.1, ease: 'power2.out' })
      .to('.heart', { scale: 1, duration: 0.42, ease: 'power2.out' });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo img', {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* Линии пульса в секциях рисуются прокруткой */
    $$('.pulse--scrub').forEach(svg => {
      const path = pulsePath(svg);
      gsap.to(path, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: svg, start: 'top 92%', end: 'top 52%', scrub: true },
      });
    });

    /* ---------- 2. Сессия ---------- */
    revealLines('.offer h2', '.offer .sec-head');
    gsap.from('.offer .eyebrow', {
      y: 16, autoAlpha: 0, duration: 0.8,
      scrollTrigger: { trigger: '.offer .sec-head', start: 'top 82%' },
    });
    gsap.from('.card', {
      y: 50, rotateX: -12, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0,
      duration: 1.05, ease: 'expo.out',
      scrollTrigger: { trigger: '.card', start: 'top 86%' },
    });
    gsap.from('.card__tags li', {
      scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.55, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.card', start: 'top 80%' },
    });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.6, ease: 'power2.out', snap: { v: 100 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });
    gsap.from('.offer__note p', {
      x: -14, autoAlpha: 0, duration: 0.8,
      scrollTrigger: { trigger: '.offer__note', start: 'top 90%' },
    });

    /* ---------- 3. Телеграм-канал ---------- */
    revealLines('.channel h2', '.channel .sec-head');
    gsap.from('.channel .eyebrow', {
      y: 16, autoAlpha: 0, duration: 0.8,
      scrollTrigger: { trigger: '.channel .sec-head', start: 'top 85%' },
    });
    gsap.from('.tg-card', {
      y: 34, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.tg-card', start: 'top 88%' },
    });
    gsap.from('.tg-card__ava', {
      scale: 0.5, autoAlpha: 0, duration: 0.7, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.tg-card', start: 'top 85%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
