// Дарья Шпилевская — моушн концепта.
// Фирменная идея — «отражение»: имя стоит над морем с её баннера и отражается в воде.
// При входе вода взволнована и постепенно успокаивается до ясного отражения (как терапия: от смятения к ясности),
// дальше живёт лёгкой рябью и отзывается на прокрутку и движение руки/курсора.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная версия: отражение с неподвижной рябью, всё видно

  const refresh = () => ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger, delay = 0) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, delay, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- рябь: одна «сила волны» управляет displacement-фильтром ---------- */
    const turb = $('#ripple feTurbulence');
    const disp = $('#ripple feDisplacementMap');
    const CALM = 9;
    const wave = { s: 70 };
    const applyWave = () => disp.setAttribute('scale', wave.s.toFixed(2));
    applyWave();
    let calming = null;
    const stir = amount => { // всплеск ряби и плавное успокоение
      const target = Math.min(CALM + amount, CALM + 20);
      if (target <= wave.s) return;
      if (calming) calming.kill();
      calming = gsap.timeline({ onUpdate: applyWave })
        .to(wave, { s: target, duration: 0.25, ease: 'power2.out' })
        .to(wave, { s: CALM, duration: 2.2, ease: 'power2.out' });
    };

    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.name > span', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const tag = SplitText.create('.hero__tag', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); tag.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from(name.chars, { yPercent: 108, duration: 1.15, stagger: 0.035, ease: 'expo.out' }, 0.2)
      .from('.hero__role span', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.55)
      // вода раскрывается от линии горизонта
      .fromTo('.sea', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.45)
      .from('.sea__strip', { scale: 1.22, duration: 2.2, ease: 'expo.out' }, 0.55)
      .from('.reflect', { autoAlpha: 0, duration: 1.6, ease: 'power2.out' }, 1.0)
      // вода успокаивается — отражение проясняется
      .to(wave, { s: CALM, duration: 2.8, ease: 'power3.out', onUpdate: applyWave }, 0.8)
      .fromTo('.portrait', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'expo.inOut' }, 0.75)
      .from('.portrait img', { scale: 1.28, duration: 2.1, ease: 'expo.out' }, 0.85)
      .from('.hero__lines li', { x: -14, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.25)
      .from(tag.lines, { yPercent: 100, stagger: 0.1, duration: 1.05, ease: 'expo.out' }, 1.2)
      .from('.hero__cta > *', { y: 16, autoAlpha: 0, stagger: 0.12, duration: 0.8 }, 1.5);

    /* Живая вода: рябь медленно «течёт», полоса моря дрейфует */
    gsap.to(turb, { attr: { baseFrequency: '0.013 0.15' }, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.sea__strip', { x: () => (innerWidth < 900 ? -38 : -80), duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    /* Вода отзывается на прокрутку и на движение курсора / пальца над ней */
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onUpdate: self => stir(Math.abs(self.getVelocity()) / 90),
    });
    let lastX = null;
    $('.sea').addEventListener('pointermove', e => {
      if (lastX !== null) stir(Math.abs(e.clientX - lastX) * 0.9);
      lastX = e.clientX;
    });
    $('.sea').addEventListener('pointerleave', () => { lastX = null; });

    /* Лёгкий параллакс портрета */
    gsap.to('.portrait img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Запросы: пункты всплывают из глубины ---------- */
    revealLines('.topics h2', '.topics .sec-head');
    gsap.from(['.topics .eyebrow', '.topics .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.15,
      scrollTrigger: { trigger: '.topics .sec-head', start: 'top 84%' },
    });
    const items = $$('.req li');
    gsap.set(items, { y: 28, autoAlpha: 0, filter: 'blur(6px)' });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1, stagger: 0.08, ease: 'power3.out', clearProps: 'filter' });
        gsap.from(els.map(el => $('.st', el)), { rotation: -135, scale: 0.4, duration: 1.2, stagger: 0.08, ease: 'expo.out' });
      },
    });
    // большой ✽ медленно поворачивается вместе с прокруткой
    gsap.fromTo('.star-big', { rotation: -30 }, {
      rotation: 60, ease: 'none',
      scrollTrigger: { trigger: '.topics', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    /* ---------- 3. Терапия ---------- */
    revealLines('.therapy h2', '.therapy .sec-head');
    gsap.from('.therapy .eyebrow', { y: 16, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.therapy .sec-head', start: 'top 84%' } });
    revealLines('.therapy__lead', '.therapy__lead', 0.1);
    gsap.from('.therapy__text', { y: 20, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.therapy__text', start: 'top 88%' } });
    // «это про глубину…» подчёркивается тонкой линией
    const mark = $('.therapy__text mark');
    gsap.fromTo(mark, { '--u': '0%' }, {
      '--u': '100%', duration: 1.6, ease: 'power2.inOut',
      scrollTrigger: { trigger: mark, start: 'top 78%' },
    });
    gsap.from('.qa > *', { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.12, scrollTrigger: { trigger: '.qa', start: 'top 86%' } });

    gsap.from('.fact', {
      y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.facts', start: 'top 86%' },
    });
    gsap.from('.facts__note', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.facts__note', start: 'top 92%' } });

    // кадры раскрываются по очереди, как плёнка
    gsap.timeline({ scrollTrigger: { trigger: '.strip', start: 'top 88%' } })
      .fromTo('.strip li', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, stagger: 0.12, ease: 'expo.inOut' })
      .from('.strip img', { scale: 1.3, duration: 1.6, stagger: 0.12, ease: 'expo.out' }, 0.1);

    gsap.from('.wait', {
      y: 46, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.wait', start: 'top 88%' },
    });
    gsap.from('.wait > *', {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.08, delay: 0.2,
      scrollTrigger: { trigger: '.wait', start: 'top 88%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
