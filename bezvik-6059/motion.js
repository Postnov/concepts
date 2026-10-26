// Фирменная идея — «проявленность»: снимок проявляется, как моментальное фото,
// а слова и карточки проступают из размытия, будто изображение в проявителе.
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP — статичная рабочая страница

  // Проступание из размытия; filter снимаем после анимации
  const develop = (targets, vars, from) => gsap.fromTo(targets,
    Object.assign({ autoAlpha: 0, filter: 'blur(14px)' }, from),
    Object.assign({ autoAlpha: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power2.out', clearProps: 'filter' }, vars));

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    // ── Интро: снимок «выезжает» и проявляется из тёмной эмульсии ──
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.print', { y: -46, rotate: -10, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.1)
      .from('.glow', { scale: 0.4, autoAlpha: 0, duration: 2.2, ease: 'expo.out' }, 0.3)
      .fromTo('.print__dev', { opacity: 1 }, { opacity: 0, duration: 2.1, ease: 'power1.inOut' }, 0.45)
      .fromTo('.print__img img',
        { filter: 'saturate(0) contrast(0.55) brightness(1.25) blur(5px)', scale: 1.14 },
        { filter: 'saturate(1) contrast(1) brightness(1) blur(0px)', scale: 1, duration: 2.3, ease: 'power2.inOut', clearProps: 'filter' }, 0.45)
      .from('.print__cap', { autoAlpha: 0, filter: 'blur(6px)', duration: 1.1, clearProps: 'filter' }, 1.6)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(first.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.5)
      .from(last.chars, { yPercent: 115, stagger: 0.035, duration: 1.1, ease: 'expo.out' }, 0.65)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.75 }, 1.15);

    // Красный «фотофонарь» за снимком мягко дышит
    gsap.to('.glow', { scale: 1.1, opacity: 0.7, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4 });

    // Лёгкий параллакс снимка при уходе hero
    gsap.to('.hero__photo', {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // ── Направления: слова проявляются по очереди, «проявленность» загорается красным ──
    gsap.from('.dark .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.dark', start: 'top 75%' } });
    $$('.word').forEach(word => {
      const red = word.classList.contains('word--red');
      develop(word,
        Object.assign({ y: 0, duration: 1.8, scrollTrigger: { trigger: word, start: 'top 82%' } }, red ? { color: getComputedStyle(word).color } : {}),
        Object.assign({ autoAlpha: 0.05, filter: 'blur(18px)', y: 18 }, red ? { color: '#f6f0e9' } : {}));
    });
    develop('.dark__text', { duration: 1.4, y: 0, scrollTrigger: { trigger: '.dark__text', start: 'top 88%' } }, { y: 16 });
    // Плёнка «протягивается» при прокрутке
    gsap.fromTo('.film', { backgroundPositionX: 0 }, {
      backgroundPositionX: -300, ease: 'none',
      scrollTrigger: { trigger: '.dark', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.fromTo('.dark__light', { yPercent: -10 }, {
      yPercent: 25, ease: 'none',
      scrollTrigger: { trigger: '.dark', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    // ── Форматы ──
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.formats .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 82%' } });
    develop('.card', { y: 0, duration: 1.3, stagger: 0.16, scrollTrigger: { trigger: '.cards', start: 'top 85%' } }, { y: 40, filter: 'blur(12px)' });
    gsap.fromTo('.card__ava', { filter: 'saturate(0) brightness(1.3)' }, {
      filter: 'saturate(1) brightness(1)', duration: 2, ease: 'power2.inOut', clearProps: 'filter',
      scrollTrigger: { trigger: '.cards', start: 'top 85%' },
    });
    gsap.from('.card__x2', {
      xPercent: 18, autoAlpha: 0, duration: 1.6, ease: 'expo.out',
      scrollTrigger: { trigger: '.card--course', start: 'top 85%' },
    });
    gsap.from('.social__label', { y: 12, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.social', start: 'top 88%' } });
    const rows = $$('.links li');
    gsap.set(rows, { y: 22, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' }),
    });

    develop('.concept-end > *', { duration: 1, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } }, { filter: 'blur(8px)' });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
