// Екатерина Нонон — моушн концепта. Фирменная идея «ясность»: фото и текст проявляются из размытия в резкость,
// как объектив, поймавший фокус; метки фокуса по углам портрета сходятся в момент резкости.
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP — статичная рабочая страница
  const refresh = () => ScrollTrigger.refresh();

  // Проявление из размытия (один раз при входе в экран)
  const blurIn = (targets, trigger, o = {}) => gsap.fromTo(targets,
    { filter: `blur(${o.blur ?? 12}px)`, autoAlpha: 0, y: o.y ?? 16 },
    {
      filter: 'blur(0px)', autoAlpha: 1, y: 0, duration: o.duration ?? 1.1, stagger: o.stagger ?? 0.1, ease: o.ease ?? 'power3.out',
      delay: o.delay ?? 0, clearProps: 'filter',
      scrollTrigger: { trigger: trigger || targets, start: o.start ?? 'top 84%', once: true },
    });

  // Заголовок строками из размытия; после анимации нарезку снимаем, чтобы переносы жили при ресайзе
  const blurLines = (selector, trigger) => {
    const split = SplitText.create(selector, { type: 'lines' });
    gsap.fromTo(split.lines,
      { filter: 'blur(12px)', autoAlpha: 0, y: 18 },
      {
        filter: 'blur(0px)', autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: trigger || selector, start: 'top 84%', once: true },
        onComplete: () => split.revert(),
      });
  };

  MotionBase.ready(() => {
    /* ---------- 1. Hero: фото «наводится на резкость», метки фокуса сходятся ---------- */
    const corners = { tl: [-1, -1], tr: [1, -1], bl: [-1, 1], br: [1, 1] };
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero .frame', { autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, 0.05)
      .fromTo('.hero__photo img',
        { filter: 'blur(24px) brightness(1.16)', scale: 1.14 },
        { filter: 'blur(0px) brightness(1)', scale: 1, duration: 2.2, ease: 'expo.out', clearProps: 'filter' }, 0.1)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3);
    Object.entries(corners).forEach(([k, [sx, sy]]) => {
      intro.fromTo(`.focus__c--${k}`, { x: sx * 34, y: sy * 34, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 1.35, ease: 'expo.out' }, 0.4);
    });
    intro
      // «Щелчок» фокуса: метки на миг поджимаются к кадру
      .to('.focus', { scale: 0.975, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 1.45)
      .fromTo(['.hero__first', '.hero__last'],
        { filter: 'blur(18px)', autoAlpha: 0, y: 28 },
        { filter: 'blur(0px)', autoAlpha: 1, y: 0, duration: 1.5, stagger: 0.22, ease: 'expo.out', clearProps: 'filter' }, 0.55)
      .fromTo('.hero__lead',
        { filter: 'blur(12px)', autoAlpha: 0, y: 16 },
        { filter: 'blur(0px)', autoAlpha: 1, y: 0, duration: 1.1, clearProps: 'filter' }, 1.0)
      .from(['.hero__sub', '.hero__role'], { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.2)
      .from('.hero__cta > *', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35)
      .from('.hero .guide', { y: 16, autoAlpha: 0, duration: 0.7 }, 1.5);

    /* ---------- 2. Запросы: «это не ваша вина» проявляется по словам ---------- */
    blurIn(['.topics .eyebrow', '.topics__text'], '.topics__intro', { stagger: 0.15 });
    const key = SplitText.create('.topics__key', { type: 'words', wordsClass: 'sw' });
    gsap.fromTo(key.words,
      { filter: 'blur(14px)', autoAlpha: 0 },
      {
        filter: 'blur(0px)', autoAlpha: 1, duration: 1.2, stagger: 0.13, ease: 'power2.out',
        scrollTrigger: { trigger: '.topics__key', start: 'top 80%', once: true },
        onComplete: () => key.revert(),
      });
    blurLines('.topics__title');
    // Пункты по очереди наводятся на резкость, номера — чуть раньше текста
    const items = $$('.issues li');
    gsap.set(items, { autoAlpha: 0, y: 14, filter: 'blur(10px)' });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.07, ease: 'power3.out', clearProps: 'filter' }),
    });

    /* ---------- 3. Первая консультация ---------- */
    blurIn('.first .eyebrow', '.first .sec-head');
    blurLines('.first h2', '.first .sec-head');
    blurIn('.first__text > *', '.first__text', { stagger: 0.12 });
    blurIn('.first__label', '.first__side');
    // Цены появляются целиком (без счётчика), карточки — с лёгким подъёмом
    gsap.from('.price', {
      y: 34, autoAlpha: 0, duration: 1.0, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.prices', start: 'top 88%', once: true },
    });
    blurIn('.price__sum', '.prices', { blur: 10, y: 8, delay: 0.25, stagger: 0.14 });
    gsap.from('.terms li', { x: -12, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.terms', start: 'top 90%', once: true } });
    gsap.from('.book > *', { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.book', start: 'top 94%', once: true } });

    blurIn('.concept-end > *', '.concept-end', { start: 'top 86%' });

    window.addEventListener('load', refresh, { once: true });
  });
})();
