// Клара Сычугова — моушн концепта.
// Фирменная идея «фокус»: всё проявляется из размытия в резкость — как картина состояния, в которой врач помог разобраться;
// вокруг главного тонкое кольцо дорисовывается само (круг — её мотив: иконки и портрет в круге).
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion или нет GSAP — статичная рабочая страница

  // Кольцо дорисовывается от верхней точки (pathLength=1 у circle)
  const drawRing = (ring, vars = {}) => gsap.fromTo(ring.querySelector('circle'),
    { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', ...vars });

  // Проявление из размытия: фильтр снимаем после анимации, чтобы текст оставался идеально резким
  const focusIn = (targets, vars = {}, from = {}) => gsap.fromTo(targets,
    { filter: 'blur(10px)', autoAlpha: 0, y: 12, ...from },
    { filter: 'blur(0px)', autoAlpha: 1, x: 0, y: 0, duration: 1.1, ease: 'power3.out', clearProps: 'filter', ...vars });

  // Заголовок секции: слова «наводятся на резкость» по очереди
  function focusTitle(el, trigger) {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'sw' });
    focusIn(split.words, {
      stagger: 0.09, duration: 1.2,
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
    }, { filter: 'blur(12px)', y: 6 });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      // Фото: из глубокого размытия в резкость — главный «фокус»
      .fromTo('.hero__img', { filter: 'blur(26px)', autoAlpha: 0 }, { filter: 'blur(0px)', autoAlpha: 1, duration: 2.1, ease: 'expo.out', clearProps: 'filter' }, 0.1)
      .from('.hero__img img', { scale: 1.08, duration: 2.4, ease: 'expo.out' }, 0.1)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.3)
      // Имя: буквы поднимаются из-под маски, а всё слово наводится на резкость
      .from(name.chars, { yPercent: 108, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.35)
      .fromTo('.hero__name', { filter: 'blur(14px)' }, { filter: 'blur(0px)', duration: 1.5, ease: 'power2.out', clearProps: 'filter' }, 0.35)
      // Бейдж: кольцо дорисовывается, круг проявляется, надпись — в фокус
      .add(drawRing($('.badge .ring'), { duration: 1.3 }), 0.7)
      .from('.badge', { scale: 0.72, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.8)
      .add(focusIn('.badge__text', { duration: 1 }, { y: 0 }), 1.05)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 1 }, 0.95)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.2)
      .from('.hero__role li', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.35)
      .add(focusIn('.hero__note', { duration: 1.2 }), 1.45);

    // Бейдж едва заметно «плавает», после интро
    gsap.to('.badge', { y: -7, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4 });

    // Лёгкий параллакс портрета
    gsap.to('.hero__img img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Проблемы ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.cases .sec-head', start: 'top 82%' } })
      .add(drawRing($('.organ .ring'), { duration: 1.4 }), 0)
      .add(focusIn('.organ img', { duration: 1.2 }, { scale: 0.7, y: 0 }), 0.1)
      .from('.cases .eyebrow', { y: 12, autoAlpha: 0, duration: 0.8 }, 0.2);
    focusTitle('.cases h2', '.cases .sec-head');

    const cases = $$('.case');
    cases.forEach(c => {
      gsap.set(c.querySelector('circle'), { strokeDashoffset: 1 });
      gsap.set([c.querySelector('.case__num'), c.querySelector('.case__title'), c.querySelector('.case__text')], { autoAlpha: 0, filter: 'blur(8px)', y: 12 });
    });
    ScrollTrigger.batch(cases, {
      start: 'top 88%', once: true,
      onEnter: els => els.forEach((c, i) => {
        const d = i * 0.14;
        gsap.to(c.querySelector('circle'), { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', delay: d });
        gsap.to([c.querySelector('.case__num'), c.querySelector('.case__title'), c.querySelector('.case__text')], {
          autoAlpha: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: 0.12, ease: 'power3.out', delay: d + 0.15, clearProps: 'filter',
        });
      }),
    });
    // Линия-разделитель «прорисовывается» слева направо
    cases.forEach(c => gsap.fromTo(c, { '--rule': 0 }, { '--rule': 1, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: c, start: 'top 90%' } }));

    /* ---------- 3. Онлайн-консультация ---------- */
    gsap.from('.consult .eyebrow', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.consult', start: 'top 80%' } });
    focusIn('.consult h2 .ln', { stagger: 0.14, duration: 1.3, scrollTrigger: { trigger: '.consult', start: 'top 80%' } }, { filter: 'blur(12px)', y: 8 });
    // Портрет: «диафрагма» раскрывается кругом, снимок наводится на резкость
    gsap.timeline({ scrollTrigger: { trigger: '.aperture', start: 'top 85%' } })
      .add(drawRing($('.aperture .ring'), { duration: 1.7 }), 0)
      .fromTo('.aperture__img', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.5, ease: 'expo.inOut' }, 0.15)
      .fromTo('.aperture__img img', { filter: 'blur(16px)' }, { filter: 'blur(0px)', duration: 1.6, ease: 'power2.out', clearProps: 'filter' }, 0.5);

    // Цены появляются целиком, без счётчика
    focusIn('.price', { stagger: 0.14, duration: 1.1, scrollTrigger: { trigger: '.prices', start: 'top 88%' } }, { y: 26 });
    focusIn('.fact', { stagger: 0.12, scrollTrigger: { trigger: '.facts', start: 'top 88%' } }, { y: 0, x: -14, filter: 'blur(6px)' });
    gsap.from('.consult .btn', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.consult .btn', start: 'top 95%' } });

    /* ---------- финал ---------- */
    focusIn('.concept-end > *', { stagger: 0.12, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
