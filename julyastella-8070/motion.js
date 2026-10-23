// Юлия Овчинникова — моушн концепта. Фирменная идея: сантиметровая лента и шкала веса «с 92 в 47».
// Лента бежит под тиком, число падает; на прокрутке лента «дорисовывается» вдоль уровней, иконки рисуют себя пульсом.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- шкала: лента рисуется на canvas (нет DOM-текста, который режется краем), и без анимации стоит на итоговом весе ---------- */
  const scales = $$('[data-scale]').map(el => {
    const from = +el.dataset.from, to = +el.dataset.to, step = +(el.dataset.step || 12);
    const num = $('[data-num]', el);
    const cv = $('canvas', el);
    const ctx = cv.getContext('2d');
    const s = { el, from, to, step, v: to };
    s.draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const color = getComputedStyle(el).color;
      ctx.fillStyle = color; ctx.strokeStyle = color;
      ctx.font = '400 11px Jost, system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const half = w / 2 / step + 2;
      for (let t = Math.floor(s.v - half); t <= Math.ceil(s.v + half); t++) {
        const x = Math.round(w / 2 - (t - s.v) * step) + 0.5;
        const major = t % 5 === 0;
        ctx.globalAlpha = major ? 0.9 : 0.5;
        ctx.fillRect(x, 0, 1, major ? 22 : 12);
        if (major && Math.abs(t - s.v) > 0.9) { ctx.globalAlpha = 0.85; ctx.fillText(String(t), x, 28); }
      }
      ctx.globalAlpha = 1;
    };
    s.set = v => { s.v = v; num.textContent = Math.round(v); s.draw(); };
    s.set(to);
    return s;
  });
  const redraw = () => scales.forEach(s => s.draw());
  if (document.fonts) document.fonts.ready.then(redraw);
  window.addEventListener('resize', redraw);

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const hero = scales[0];
    hero.set(hero.from);
    const proxy = { v: hero.from };

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__photo .frame', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.05)
      .from('.hero__photo img', { scale: 1.28, duration: 2.2, ease: 'expo.out' }, 0.2)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.6)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.65)
      .from(lead.lines, { yPercent: 105, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.scale__read > *', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 1.15)
      .from('.scale__tape', { autoAlpha: 0, scaleX: 0.6, transformOrigin: '50% 50%', duration: 1.0, ease: 'expo.out' }, 1.2)
      .to(proxy, { v: hero.to, duration: 3.6, ease: 'power2.inOut', onUpdate: () => hero.set(proxy.v) }, 1.5)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.5)
      .from('.pills li', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.65)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.8);

    // Лёгкий параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Личная работа ---------- */
    revealLines('.offers h2', '.offers .sec-head');
    gsap.from(['.offers .eyebrow', '.offers .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.offers .sec-head', start: 'top 84%' },
    });
    // Фото «вытягивается» лентой слева направо
    gsap.timeline({ scrollTrigger: { trigger: '.offers__photo', start: 'top 85%' } })
      .fromTo('.offers__photo .frame', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
      .from('.offers__photo img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.1);
    $$('.offer').forEach(card => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 82%' }, defaults: { ease: 'power3.out' } });
      tl.from(card, { y: 44, autoAlpha: 0, duration: 1.0 })
        .from($$('.offer__meta, .offer__title, .offer__tag, .offer__lead', card), { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.2)
        .fromTo($$('.offer__rows > div', card), { '--draw': 0 }, { '--draw': 1, duration: 1.1, stagger: 0.18, ease: 'power2.inOut' }, 0.45)
        .from($$('.offer__rows > div > *', card), { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 0.6);
      // Цена появляется целиком, без счётчика
      gsap.from($$('.offer__price, .offer__buy .btn', card), {
        y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: $('.offer__buy', card), start: 'top 94%' },
      });
    });

    /* ---------- 3. Экосистема ---------- */
    revealLines('.levels h2', '.levels__head');
    gsap.from('.levels .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.levels__head', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.levels__photo', start: 'top 86%' } })
      .fromTo('.levels__photo .frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
      .from('.levels__photo img', { scale: 1.25, duration: 2.1, ease: 'expo.out' }, 0.15);
    gsap.fromTo('.levels__photo img', { yPercent: 0 }, {
      yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: '.levels__photo', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    // Лента вдоль уровней дорисовывается по мере прокрутки
    gsap.fromTo('.levels__rail span', { '--fill': 0 }, {
      '--fill': 1, ease: 'none',
      scrollTrigger: { trigger: '.levels__list', start: 'top 72%', end: 'bottom 62%', scrub: true },
    });
    $$('.level').forEach(item => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 82%' }, defaults: { ease: 'power3.out' } });
      tl.from($('.level__icon', item), { scale: 0.5, autoAlpha: 0, duration: 0.6 })
        .fromTo($('.level__icon path', item), { '--dash': 1 }, { '--dash': 0, duration: 1.3, ease: 'power2.inOut' }, 0.15)
        .from($$('.level__label, .level__title, .level__text', item), { x: -16, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 0.15);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
