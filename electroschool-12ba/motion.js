// ElectroSchool — моушн концепта. Идея: электрический импульс. Кольца расходятся от фото, искра бежит по линии и зажигает карточки.
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
    const count = $('[data-count]');
    const target = +count.dataset.count;
    const num = { v: 0 };
    count.textContent = '0';

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); count.textContent = MotionBase.money(target); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 28px 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 28px 28px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.arch img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.03, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.facts li', { y: 22, autoAlpha: 0, stagger: 0.12, duration: 0.8 }, 1.05)
      .to(num, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: () => { count.textContent = MotionBase.money(num.v); } }, 1.1)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.3)
      .from('.spark', { scale: 0, autoAlpha: 0, duration: 0.6, ease: 'back.out(3)' }, 1.4);

    /* Импульс: кольца расходятся от фото волнами */
    $$('.pulse__ring').forEach((ring, i) => {
      gsap.fromTo(ring, { scale: 0.86, autoAlpha: 0.9 }, { scale: 1.16, autoAlpha: 0, duration: 3.2, ease: 'sine.out', repeat: -1, delay: 1.2 + i * 1.05 });
    });
    /* Искра обегает арку по дуге */
    gsap.to('.spark', { keyframes: [{ x: 14, y: -34 }, { x: 0, y: -70 }, { x: -6, y: -34 }, { x: 0, y: 0 }], duration: 6, ease: 'sine.inOut', repeat: -1, delay: 2 });

    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.4 + i });
    });

    gsap.to('.arch img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Уроки: искра бежит по линии и зажигает карточки ---------- */
    revealLines('.lessons h2', '.lessons .sec-head');
    gsap.from('.lessons .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.lessons .sec-head', start: 'top 82%' } });
    const list = $('.lessons__list');
    const st = { trigger: list, start: 'top 65%', end: 'bottom 70%', scrub: 0.6 };
    gsap.to('.rail__line', { scaleY: 1, ease: 'none', scrollTrigger: st });
    gsap.fromTo('.rail__dot', { top: '0%' }, { top: 'calc(100% - 11px)', ease: 'none', scrollTrigger: st });
    $$('.lesson').forEach(card => {
      gsap.from(card, { y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 90%' } });
      ScrollTrigger.create({ trigger: card, start: 'top 60%', end: 'bottom 30%', toggleClass: { targets: card, className: 'is-lit' } });
    });

    /* ---------- 3. Каналы ---------- */
    revealLines('.channels h2', '.channels .sec-head');
    gsap.from('.channels .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.channels .sec-head', start: 'top 82%' } });
    gsap.from('.chan', {
      y: 50, autoAlpha: 0, duration: 1.0, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.channels__grid', start: 'top 88%' },
    });
    gsap.from('.btn--ask', { y: 20, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.btn--ask', start: 'top 94%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
