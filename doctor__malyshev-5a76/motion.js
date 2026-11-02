(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  // Без моушна — статичная полностью рабочая страница (позвонки ровные, рентген-слой скрыт)
  if (!animate) return;

  // Кривизна «до»: позвонок смещён и повёрнут по синусоиде — к концу анимации ряд выпрямляется
  const wob = i => Math.sin(i * 0.9 + 0.5);

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    // ---------- Hero: рентген-скан фото + выпрямление позвонков ----------
    const names = SplitText.create('.hero__first, .hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const verts = $$('.chain .vert');
    const portrait = $('.portrait');
    const scanLine = $('.portrait__scan');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { names.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.25)
      .from(names.chars, { yPercent: 118, stagger: 0.038, duration: 1.05, ease: 'expo.out' }, 0.3)
      .fromTo(portrait, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.25, ease: 'expo.inOut' }, 0.45)
      .from('.portrait__photo img', { scale: 1.35, duration: 2.2, ease: 'expo.out' }, 0.45)
      .fromTo(scanLine, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 1.15)
      .fromTo(portrait, { '--scan': 0 }, { '--scan': 100, duration: 1.7, ease: 'power2.inOut' }, 1.15)
      .to(scanLine, { autoAlpha: 0, duration: 0.3 }, 2.75)
      .from('.ring', { scale: 0.86, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 1.0)
      .from('.chain__cord', { scaleY: 0, transformOrigin: 'top', duration: 1.4, ease: 'expo.out' }, 0.5)
      .from(verts, {
        x: i => wob(i) * 15, rotation: i => wob(i + 1.3) * 20, autoAlpha: 0,
        duration: 1.3, ease: 'power3.inOut', stagger: 0.055,
      }, 0.8)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.2)
      .from('.hero__sub', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.5)
      .from('.tags li', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.6)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.75);

    // Покой после интро: по позвоночнику время от времени пробегает коралловая волна — «осмотр»
    gsap.timeline({ repeat: -1, repeatDelay: 3.4, delay: 3.6 })
      .to(verts, { color: '#e4572e', duration: 0.28, stagger: 0.07, yoyo: true, repeat: 1, ease: 'sine.inOut' });

    gsap.to('.ring', { rotation: 360, duration: 40, ease: 'none', repeat: -1 });
    gsap.to('.portrait__photo img', {
      yPercent: -2.5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // ---------- 2. С чем помогаю: ряд позвонков выпрямляется по мере чтения ----------
    revealLines('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 84%' } });
    const rows = $$('.spine__item');
    gsap.set(rows, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => els.forEach((row, k) => {
        const i = rows.indexOf(row);
        gsap.to(row, { y: 0, autoAlpha: 1, duration: 0.8, delay: k * 0.08, ease: 'power3.out' });
        gsap.fromTo($('.vert', row), { x: wob(i) * 11, rotation: wob(i + 1.3) * 24 }, { x: 0, rotation: 0, duration: 1.5, delay: 0.1 + k * 0.08, ease: 'expo.out' });
      }),
    });
    rows.forEach(row => ScrollTrigger.create({
      trigger: row, start: 'top 62%', end: 'bottom 38%',
      toggleClass: { targets: row, className: 'is-on' },
    }));

    // ---------- 3. Запись ----------
    revealLines('.book h2', '.book .sec-head');
    gsap.from(['.book .eyebrow', '.book .sec-sub'], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: '.book .sec-head', start: 'top 84%' } });
    gsap.from('.city', {
      y: 46, autoAlpha: 0, duration: 1.05, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.cities', start: 'top 86%' },
    });
    gsap.from('.admin > *', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.admin', start: 'top 90%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
