// Вероника Якушина — моушн концепта.
// Фирменная идея «нить»: петли замкнутого круга (как в КПТ — круг мыслей, эмоций, поведения)
// распрямляются в ровную линию. В hero — при прокрутке, в запросах каждый «узел» развязывается сам.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- Построение нити: укороченная трохоида, k = 1 петли, k = 0 прямая ---------- */
  function loopPath(W, H, { loops, R, k = 1, phase = 0, pad = 0, vary = 0 }) {
    const span = loops * Math.PI * 2 + Math.PI; // концы приходятся на середину высоты
    const t0 = -1.5 * Math.PI;
    const a = (W - 2 * pad) / span;
    const steps = Math.ceil(loops * 72 + 36);
    const y0 = H / 2;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = t0 + (span * i) / steps;
      const r = R * k * (1 - vary + vary * Math.sin(0.55 * t + 1.3));
      const x = pad + a * (t - t0) - r * Math.sin(t + phase);
      const y = y0 + r * Math.cos(t + phase);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }
  const fit = svg => {
    const r = svg.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${r.width.toFixed(1)} ${r.height.toFixed(1)}`);
    return { W: r.width, H: r.height };
  };

  // Нить в hero
  const hero = { svg: $('.thread'), path: $('.thread path'), k: 1, phase: 0, W: 0, H: 0 };
  function drawHero() {
    const mobile = hero.W < 700;
    const loops = Math.max(4, Math.round(hero.W / (mobile ? 84 : 120)));
    hero.path.setAttribute('d', loopPath(hero.W, hero.H, {
      loops, R: mobile ? 28 : 38, k: hero.k, phase: hero.phase, pad: -40, vary: 0.2,
    }));
  }

  // Маленькие узлы у запросов и подчёркивание «расставание»
  const knots = $$('.knot').map(svg => ({ svg, path: $('path', svg), k: 1, opts: { loops: 1, R: 10, pad: 3 } }));
  const tieSvg = $('.tie__thread');
  const tie = { svg: tieSvg, path: $('path', tieSvg), k: 1, opts: { auto: true } };
  function drawSmall(o) {
    let opts = o.opts;
    if (opts.auto) { // подчёркивание: размер петель от высоты шрифта, их число — от ширины слова
      const R = o.H * 0.62, a = R / 1.8;
      opts = { R, pad: 0, loops: Math.max(2, Math.round((o.W / a - Math.PI) / (Math.PI * 2))) };
    }
    o.path.setAttribute('d', loopPath(o.W, o.H, { ...opts, k: o.k }));
  }

  function layout() {
    Object.assign(hero, fit(hero.svg));
    drawHero();
    [...knots, tie].forEach(o => { Object.assign(o, fit(o.svg)); drawSmall(o); });
  }
  layout();
  let lastW = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth === lastW) return; // мобильная адресная строка меняет только высоту
    lastW = innerWidth;
    layout();
  });

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    layout(); // шрифты загрузились — ширина «расставание» могла измениться

    /* ---------- 1. Hero: вход ---------- */
    const chars = { type: 'words,chars', wordsClass: 'sw', charsClass: 'ch', mask: 'chars' };
    const kicker = SplitText.create('.kicker', chars);
    const name = SplitText.create('.hero__first, .hero__last', chars);
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { kicker.revert(); name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__photo img',
        { autoAlpha: 0, scale: 1.12, filter: 'blur(16px)' },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 2.4, ease: 'expo.out', clearProps: 'filter' }, 0.1)
      .from('.halo', { scale: 0.7, autoAlpha: 0, duration: 2, ease: 'expo.out' }, 0.35)
      .from(kicker.chars, { autoAlpha: 0, duration: 0.01, stagger: 0.035, ease: 'none' }, 1.0)
      .from(name.chars, { yPercent: 112, duration: 1.15, stagger: 0.04, ease: 'expo.out' }, 0.55)
      .fromTo(hero.path,
        { attr: { 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 } },
        {
          attr: { 'stroke-dashoffset': 0 }, duration: 2.4, ease: 'power2.inOut',
          onComplete: () => { hero.path.removeAttribute('stroke-dasharray'); hero.path.removeAttribute('stroke-dashoffset'); },
        }, 0.7)
      .from(lead.lines, { yPercent: 100, duration: 0.95, stagger: 0.09 }, 1.05)
      .from('.chips li', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.25)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35);

    /* Нить живёт: петли медленно катятся; при прокрутке распрямляются */
    let dirty = true;
    const mark = () => { dirty = true; };
    gsap.ticker.add(() => { if (dirty) { dirty = false; drawHero(); } });
    const drift = gsap.to(hero, { phase: -Math.PI * 2, duration: 24, ease: 'none', repeat: -1, onUpdate: mark });
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onToggle: self => (self.isActive ? drift.play() : drift.pause()) });
    gsap.fromTo(hero, { k: 1 }, {
      k: 0, ease: 'power1.inOut', onUpdate: mark,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: () => '+=' + Math.min(innerHeight * 0.5, 440), scrub: 0.8 },
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Запросы: каждый узел развязывается ---------- */
    revealLines('.topics .sec-head h2', '.topics .sec-head');
    gsap.from('.topics .sec-head .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.topics .sec-head', start: 'top 85%' } });
    $$('.topic').forEach(topic => {
      gsap.from(topic, { y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: topic, start: 'top 90%' } });
      const knot = knots.find(o => topic.contains(o.svg));
      if (!knot) return;
      ScrollTrigger.create({
        trigger: topic, start: 'top 72%', once: true,
        onEnter: () => {
          topic.classList.add('is-solved');
          gsap.to(knot, { k: 0, duration: 1.4, delay: 0.25, ease: 'power2.inOut', onUpdate: () => drawSmall(knot) });
        },
      });
    });

    /* ---------- 3. Практикум: карточка раскрывается, подчёркивание развязывается ---------- */
    const card = $('.practicum');
    const round = getComputedStyle(card).borderTopLeftRadius;
    gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 82%' } })
      .fromTo(card,
        { clipPath: `inset(10% 6% 10% 6% round ${round})` },
        { clipPath: `inset(0% 0% 0% 0% round ${round})`, duration: 1.3, ease: 'expo.inOut' })
      .from('.practicum .eyebrow', { y: 12, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.35)
      .from('.practicum__title', { yPercent: 22, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.45)
      .from('.practicum .btn', { y: 16, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.8)
      .to(tie, { k: 0, duration: 1.8, ease: 'power2.inOut', onUpdate: () => drawSmall(tie) }, 1.1);

    /* ---------- 4. Результаты: из тьмы — в ясность ---------- */
    revealLines('.results .sec-head h2', '.results .sec-head');
    gsap.from(['.results .eyebrow', '.results .sec-sub'], {
      y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.results .sec-head', start: 'top 85%' },
    });
    const results = $$('.result');
    gsap.set(results, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(results, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.09, ease: 'power3.out' });
        gsap.fromTo(els.map(el => $('.result__line', el)), { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.09, ease: 'expo.out' });
      },
    });
    gsap.from('.results__cta .btn', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.results__cta', start: 'top 92%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    addEventListener('load', refresh, { once: true });
  });
})();
