// Мария Лемешко — моушн концепта. Фирменная идея — «росток» (🌱 из её имени в Instagram):
// из-за фото вырастает стебель и раскрываются листья, под словом «корень» прорастают корешки,
// черты «——» её баннера с подходом вытягиваются в стебельки с листиком, карточки услуг раскрываются, как листья.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно сразу

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  // Линия SVG «рисуется»: прячем через dash, вернём в 0
  const prepDraw = paths => paths.forEach(p => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len + 1, strokeDashoffset: len + 1 });
  });

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger, opts = {}) {
    const el = $(selector);
    if (!el) return;
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out', ...opts,
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Росток: стебель рисуется, листья раскрываются от основания (возвращает таймлайн)
  function grow(svg) {
    const stem = $('.sprout__stem', svg);
    prepDraw([stem]);
    const leafL = $('.sprout__leaf--l', svg), leafR = $('.sprout__leaf--r', svg), leafS = $('.sprout__leaf--s', svg);
    // У SVG точку вращения задаёт сам GSAP (CSS transform-origin он не читает): основание листа у стебля
    gsap.set(leafL, { transformOrigin: '100% 100%', scale: 0 });
    gsap.set(leafR, { transformOrigin: '0% 100%', scale: 0 });
    if (leafS) gsap.set(leafS, { transformOrigin: '0% 100%', scale: 0 });
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      .to(stem, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0);
    if (leafS) tl.fromTo(leafS, { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 1.1 }, 0.45);
    tl.fromTo(leafL, { scale: 0, rotation: 55 }, { scale: 1, rotation: 0, duration: 1.4 }, 0.8)
      .fromTo(leafR, { scale: 0, rotation: -55 }, { scale: 1, rotation: 0, duration: 1.4 }, 0.9);
    return tl;
  }

  // Листья живут: лёгкое покачивание от основания (после того как росток вырос)
  function sway(svg) {
    const leaf = (sel, rot, dur) => { const el = $(sel, svg); if (el) gsap.to(el, { rotation: rot, duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1 }); };
    leaf('.sprout__leaf--l', -5, 2.6);
    leaf('.sprout__leaf--r', 4, 3.1);
    leaf('.sprout__leaf--s', -6, 2.3);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const frame = $('.hero__photo .frame');
    const sprout = $('.hero .sprout');

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.25)
      .fromTo(frame,
        { clipPath: 'inset(100% 0% 0% 0% round 150px 18px 150px 18px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 150px 18px 150px 18px)', duration: 1.35, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.15)
      .from('.hero__photo img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.35)
      .from('.hero__handle', { y: 10, autoAlpha: 0, duration: 0.7 }, 1.25)
      .add(grow(sprout).eventCallback('onComplete', () => sway(sprout)), 0.6)
      .from('.hero__role', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.8)
      .from('.hero__lead', { x: -14, autoAlpha: 0, duration: 0.8 }, 0.95)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.1);

    // Стебель ростка чуть клонится
    gsap.fromTo(sprout, { rotation: -1.2 }, { rotation: 1.2, transformOrigin: '50% 100%', duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4 });

    // Блик на главной кнопке
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.6 + i });
    });

    // Лёгкий параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Сверхспособность ---------- */
    gsap.from('.power', {
      borderTopLeftRadius: 0, borderBottomRightRadius: 0, duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: '.power', start: 'top 92%' },
    });
    gsap.from('.power .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.power', start: 'top 80%' } });
    revealLines('.power__title', '.power');
    // Цитата: слова поднимаются, потом под «корнем» прорастают корешки
    const roots = $$('.roots path');
    prepDraw(roots);
    gsap.timeline({ scrollTrigger: { trigger: '.power__quote', start: 'top 82%' } })
      .from('.power__quote .q', { y: 34, autoAlpha: 0, stagger: 0.14, duration: 1.1, ease: 'expo.out' })
      .to(roots[0], { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.55)
      .to(roots.slice(1), { strokeDashoffset: 0, duration: 1.2, stagger: 0.09, ease: 'power2.out' }, 0.95);
    gsap.from('.power__stamp span', {
      scale: 1.25, rotation: -9, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.8)',
      scrollTrigger: { trigger: '.power__stamp', start: 'top 90%' },
    });

    revealLines('.approach__title', '.approach');
    $$('.step').forEach(step => {
      gsap.timeline({ scrollTrigger: { trigger: step, start: 'top 88%' } })
        .from($('.step__line', step), { scaleX: 0, duration: 0.8, ease: 'power2.inOut' })
        .from($('.step__leaf', step), { scale: 0, rotation: -70, duration: 0.9, ease: 'back.out(2)' }, 0.55)
        .from($('p', step), { x: -12, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.2);
    });

    /* ---------- 3. Услуги ---------- */
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 84%' } });
    revealLines('.services h2', '.services .sec-head');
    gsap.timeline({ scrollTrigger: { trigger: '.services__photo', start: 'top 82%' } })
      .fromTo('.services__photo .frame',
        { clipPath: 'circle(0% at 100% 100%)' },
        { clipPath: 'circle(150% at 100% 100%)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.services__photo img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.2);
    // Карточки раскрываются, как листья: поворот от нижнего левого угла
    gsap.from('.offer', {
      rotation: -7, y: 40, autoAlpha: 0, transformOrigin: '0% 100%',
      duration: 1.1, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.offers', start: 'top 86%' },
    });
    gsap.from('.contact__title', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.contact', start: 'top 90%' } });
    gsap.from('.chip', {
      scale: 0.7, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.messengers', start: 'top 92%' },
    });

    /* ---------- финал ---------- */
    const endSprout = $('.concept-end__sprout');
    const endTl = grow(endSprout);
    endTl.pause();
    ScrollTrigger.create({ trigger: '.concept-end', start: 'top 85%', once: true, onEnter: () => endTl.play() });
    gsap.from('.concept-end > :not(svg)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
