// Юлия Галоян — моушн концепта. Фирменная идея «из мрака — в ясность» (её «Борюсь с мракобесием»):
// портрет проявляется лучом света из темноты студии, ключевые фразы наводятся на резкость слово за словом.
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (!window.MotionBase || !MotionBase.init()) return;
  const refresh = () => ScrollTrigger.refresh();

  // «Наведение на резкость»: слова из размытой полутени становятся чёткими; после — revert
  function clarify(selector, opts = {}) {
    const split = SplitText.create(selector, { type: 'words', wordsClass: 'sw' });
    const tween = {
      autoAlpha: 1, filter: 'blur(0px)', yPercent: 0,
      duration: opts.duration || 1.1, stagger: opts.stagger || 0.09, ease: 'power2.out',
      onComplete: () => split.revert(),
    };
    if (opts.trigger) tween.scrollTrigger = { trigger: opts.trigger, start: opts.start || 'top 78%' };
    if (opts.delay) tween.delay = opts.delay;
    const t = gsap.fromTo(split.words, { autoAlpha: 0.1, filter: 'blur(10px)', yPercent: 12 }, tween);
    return { split, tween: t };
  }

  // Заголовок строками из-под маски
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__glow', { autoAlpha: 0, scale: 0.6, duration: 2.4, ease: 'power2.out' }, 0)
      // луч света раскрывает портрет из темноты
      .fromTo('.spot', { '--spot': '0%' }, { '--spot': '100%', duration: 2.4, ease: 'power2.inOut' }, 0.15)
      .from('.spot', { scale: 1.1, duration: 2.8, ease: 'expo.out' }, 0.15)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 112, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.4)
      .from('.hero__patr', { y: 18, autoAlpha: 0, duration: 0.9 }, 0.95)
      .from('.roles li', { x: -14, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.2)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.9);
    clarify('.hero__motto', { delay: 1.35, stagger: 0.14, duration: 1.2 });

    // свет в студии медленно «дышит»
    gsap.to('.hero__glow', { scale: 1.12, opacity: 0.75, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4 });
    // блик на главной кнопке
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.8 + i });
    });
    // при прокрутке портрет чуть уходит вверх, луч сужается
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero__photo', { yPercent: -7, ease: 'none' }, 0)
      .to('.spot', { '--spot': '80%', ease: 'none' }, 0);

    /* ---------- 2. Обо мне ---------- */
    gsap.from('.about .eyebrow', { x: -16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about', start: 'top 80%' } });
    clarify('.statement', { trigger: '.statement', start: 'top 80%', stagger: 0.11, duration: 1.2 });
    $$('.principle').forEach(item => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 86%' } });
      tl.from(item.querySelector('.principle__num'), { y: 14, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0)
        .from(item.querySelector('p'), { y: 22, autoAlpha: 0, filter: 'blur(6px)', duration: 0.95, ease: 'power3.out' }, 0.08);
    });

    /* ---------- 3. Форматы ---------- */
    gsap.from('.services .eyebrow', { x: -16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 82%' } });
    revealLines('.services h2', '.services .sec-head');
    $$('.card').forEach((card, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' } });
      tl.fromTo(card,
        { clipPath: 'inset(18% 4% 0% 4% round 26px)', y: 60, autoAlpha: 0 },
        { clipPath: 'inset(0% 0% 0% 0% round 26px)', y: 0, autoAlpha: 1, duration: 1.1, ease: 'expo.out', delay: window.innerWidth >= 960 ? i * 0.12 : 0,
          onComplete: () => gsap.set(card, { clearProps: 'clipPath' }) })
        .from(card.querySelectorAll('.card__meta span, .card__title, .card__text'), { y: 16, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: 'power3.out' }, '-=0.75')
        // точки-лидеры прайса прочерчиваются к цене
        .from(card.querySelectorAll('.prices i'), { scaleX: 0, stagger: 0.12, duration: 0.8, ease: 'power2.inOut' }, '-=0.4')
        .from(card.querySelectorAll('.prices b'), { x: 12, autoAlpha: 0, stagger: 0.12, duration: 0.6, ease: 'power3.out' }, '-=0.6');
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
