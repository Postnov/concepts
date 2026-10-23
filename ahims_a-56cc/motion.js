// Аня — моушн концепта. Фирменная идея «колба»: жидкость с живой волной поднимается в круге с фото и в пробирках гидов.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Уровень жидкости: исходная позиция из атрибута transform="translate(0 Y)"
  const levelY = g => Number((g.getAttribute('transform').match(/translate\(\s*0[ ,]+([\d.]+)/) || [])[1] || 0);

  // Бесконечная волна: сдвиг на один период — шов не виден
  const waveLoop = (el, period, duration) => gsap.to(el, { x: period, duration, ease: 'none', repeat: -1 });

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: колба наполняется, фото проявляется ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const level = $('.flask__level');
    const y0 = levelY(level);
    const rim = $('.flask__rim');
    const rimLen = 2 * Math.PI * 146;

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(rim, { strokeDasharray: rimLen, strokeDashoffset: rimLen }, { strokeDashoffset: 0, duration: 1.6, ease: 'expo.inOut' }, 0.1)
      .from('.flask__glass', { scale: 0.86, transformOrigin: '50% 50%', autoAlpha: 0, duration: 1.2 }, 0.2)
      .fromTo(level, { y: 310 }, { y: y0, duration: 2.2, ease: 'expo.out' }, 0.45)
      .fromTo('.flask__photo', { clipPath: 'circle(0% at 50% 60%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.3, ease: 'expo.inOut' }, 0.35)
      .from('.flask__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.5)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.55)
      .from(name.chars, { yPercent: 115, stagger: 0.07, duration: 1.1, ease: 'expo.out' }, 0.6)
      .from(lead.lines, { yPercent: 100, stagger: 0.1, duration: 0.95 }, 0.9)
      .from('.tags li', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.15)
      .from('.hero__actions > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3)
      .from('.hero__place', { autoAlpha: 0, duration: 0.8 }, 1.5);

    // Живая поверхность: две волны в разные стороны + лёгкое покачивание уровня
    waveLoop('.flask__wave--front', 150, 5.5);
    gsap.fromTo('.flask__wave--back', { x: 0 }, { x: -150, duration: 8.5, ease: 'none', repeat: -1 });
    gsap.to(level, { y: y0 - 6, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.8 });
    // Пузырьки поднимаются со дна и тают у поверхности
    $$('.flask__bubble').forEach((b, i) => {
      gsap.fromTo(b, { y: 10, autoAlpha: 0 }, {
        keyframes: [{ autoAlpha: 1, duration: 0.6 }, { y: -58, autoAlpha: 0, duration: 2.6, ease: 'sine.in' }],
        repeat: -1, repeatDelay: 1.2 + i * 0.7, delay: 2.2 + i * 0.9,
      });
    });

    // Лёгкий параллакс фото при прокрутке
    gsap.to('.flask__photo img', {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Интенсив и группа ---------- */
    revealLines('.programs .sec-title', '.programs .sec-head');
    gsap.from('.programs .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.programs .sec-head', start: 'top 84%' } });
    $$('.prog').forEach((card, i) => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' }, delay: i * 0.12 })
        .fromTo(card, { clipPath: 'inset(100% 0% 0% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.25, ease: 'expo.inOut' })
        .from($$(':scope > *', card), { y: 26, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.55);
    });

    /* ---------- 3. Гиды: пробирки наполняются ---------- */
    const guideSplit = SplitText.create('.guides .sec-title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from(guideSplit.chars, {
      yPercent: 110, stagger: 0.06, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.guides .sec-head', start: 'top 84%' },
      onComplete: () => guideSplit.revert(),
    });
    gsap.from('.guides .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.guides .sec-head', start: 'top 84%' } });

    $$('.guide').forEach((card, i) => {
      const lvl = $('.tube__level', card);
      const ly = levelY(lvl);
      waveLoop($('.tube__wave', card), 26, 2.6 + i * 0.4);
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
        .from(card, { y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
        .fromTo(lvl, { y: 176 }, { y: ly, duration: 1.8, ease: 'expo.out' }, 0.25)
        .from($$('.guide__body > *', card), { x: 18, autoAlpha: 0, stagger: 0.07, duration: 0.7, ease: 'power2.out' }, 0.3);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
