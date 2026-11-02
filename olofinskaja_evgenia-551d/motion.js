// Евгения Олофинская — моушн концепта.
// Фирменная идея «красная правка»: фото «наводится на резкость», как под микроскопом (её путь начался с патанатомии — «ставить
// правильный диагноз, находить истину»), а красная ручка от руки подчёркивает «честно, больно» и зачёркивает «экс-» роли по мере прокрутки.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно, линии ручки нарисованы

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.11, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 86%' }, ...vars,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: имя из-под маски, фото «в фокус», треугольники, ручка ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const heroImg = $('.hero__photo img');
    const underlines = $$('.hero .pen path');

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__glow', { autoAlpha: 0, scale: 0.7, duration: 2.2, ease: 'power2.out' }, 0)
      // Наводка на резкость: размытие и «приближение» уходят, как у окуляра
      .fromTo(heroImg,
        { filter: 'blur(18px) brightness(.55)', scale: 1.16, autoAlpha: 0 },
        { filter: 'blur(0px) brightness(1)', scale: 1, autoAlpha: 1, duration: 2.1, ease: 'expo.out', clearProps: 'filter' }, 0.15)
      .from('.hero__kicker > *', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 118, stagger: 0.032, duration: 1.1, ease: 'expo.out' }, 0.35)
      .from('.goals .tri', { scale: 0, rotate: -120, duration: 0.8, stagger: 0.12, ease: 'back.out(2.2)' }, 1.0)
      .from('.goals li', { x: -18, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 1.02)
      .from('.hero__motto', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.35)
      .fromTo(underlines, { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.38, ease: 'power2.inOut' }, 1.7)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 1.55);

    // Медленный «свет» за фото
    gsap.to('.hero__glow', { xPercent: 6, yPercent: -4, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
    // Лёгкий параллакс портрета
    gsap.to(heroImg, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Кто я ---------- */
    gsap.from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 86%' } });
    revealLines('.about__title', '.about .sec-head');
    gsap.timeline({ scrollTrigger: { trigger: '.about__photo', start: 'top 82%' } })
      .fromTo('.about__photo .frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .from('.about__photo img', { scale: 1.28, duration: 2, ease: 'expo.out' }, 0.1);
    fadeUp('.about__text > *', '.about__text', { stagger: 0.12 });

    // «Экс-» роли: строка поднимается, затем красная ручка зачёркивает слово вслед за прокруткой
    $$('.ex__row').forEach(row => {
      const word = $('.ex__word', row);
      gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%' } })
        .from($('.ex__pre', row), { x: -12, autoAlpha: 0, duration: 0.6, ease: 'power3.out' })
        .from(word, { y: 26, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.05);
      // Ручка идёт за прокруткой; дочертив, линия остаётся (при прокрутке назад не стирается)
      gsap.timeline({
        scrollTrigger: {
          trigger: row, start: 'top 74%', end: 'top 48%', scrub: true,
          onLeave: self => { self.animation.progress(1); self.kill(false, true); },
        },
      })
        .fromTo($('.pen path', row), { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, ease: 'none' })
        .fromTo(word, { color: '#13253a' }, { color: '#7d8a98', ease: 'none' }, 0);
    });
    fadeUp('.facts li', '.facts', { x: -14, y: 0, stagger: 0.1 });

    /* ---------- 3. Услуги ---------- */
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 86%' } });
    revealLines('.services h2', '.services .sec-head');
    $$('.svc').forEach((card, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 84%' } });
      tl.from(card, { y: 70, rotate: i % 2 ? 2.5 : -2.5, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .from($$('.svc__num, .svc__title, .svc__fmt', card), { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.25)
        .fromTo($$('.svc__row', card), { '--rule': 0 }, { '--rule': 1, duration: 0.9, stagger: 0.12, ease: 'power2.inOut' }, 0.45)
        .from($$('.svc__row dt', card), { x: -10, autoAlpha: 0, duration: 0.6, stagger: 0.12 }, 0.55)
        // Цена появляется целиком, без счётчика
        .from($$('.svc__row dd', card), { y: 12, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, 0.65)
        .from($('.btn', card), { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.95);
    });
    gsap.from('.svc-note', { x: -16, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.svc-note', start: 'top 90%' } });

    /* ---------- финал ---------- */
    fadeUp('.concept-end > *', '.concept-end');

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
