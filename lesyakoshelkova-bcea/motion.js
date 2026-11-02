// Леся Кошелькова — моушн концепта. Идея: пульс из рваного в ровный (КПТ и тревога) + точка-бегунья на кольце и «километры» запросов.
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
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.3)
      .from('.hero__photo .frame', { scale: 0.6, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.4)
      .from('.orbit__ring', { scale: 0.7, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.55)
      .from('.orbit__runner', { autoAlpha: 0, duration: 0.5 }, 1.1)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.pills li', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.1)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.2);

    // Бегунья: точка делает круг по кольцу вокруг фото
    gsap.to('.orbit', { rotation: 360, duration: 18, ease: 'none', repeat: -1 });

    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    /* ---------- пульс: линия прорисовывается — от рваной к ровной, точка бежит по кончику ---------- */
    const line = $('.pulse__line');
    const dot = $('.pulse__dot');
    const svg = $('.pulse svg');
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    const place = () => {
      const k = 1 - parseFloat(line.style.strokeDashoffset || len) / len;
      const p = line.getPointAtLength(len * k);
      const box = svg.getBoundingClientRect();
      gsap.set(dot, { x: (p.x / 1200) * box.width, y: (p.y / 120) * box.height });
    };
    const run = () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.pulse', start: 'top 92%', once: true } });
      tl.set(dot, { autoAlpha: 1 })
        .to(line, { strokeDashoffset: 0, duration: 4.2, ease: 'power1.inOut', onUpdate: place })
        .to(dot, { autoAlpha: 0, duration: 0.6 });
    };
    run();

    /* ---------- 2. Запросы ---------- */
    revealLines('.topics h2', '.topics .sec-head');
    gsap.from('.topics .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.topics .sec-head', start: 'top 82%' } });
    const rows = $$('.km li');
    gsap.set(rows, { x: 26, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' }),
    });
    gsap.to('.topics__rail span', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.topics__list', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    gsap.from('.topics__note', { y: 16, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.topics__note', start: 'top 92%' } });

    /* ---------- 3. Услуги ---------- */
    revealLines('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 82%' } });
    gsap.from('.card', { y: 50, autoAlpha: 0, duration: 1, stagger: 0.14, ease: 'expo.out', scrollTrigger: { trigger: '.cards', start: 'top 86%' } });
    $$('.card__price').forEach(el => gsap.from(el, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%' } }));
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
