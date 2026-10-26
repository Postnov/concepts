// Алиса Басеева — моушн концепта. Лабораторный язык: пробирки наполняются, на шкале «референс — оптимум» ставится «печать» и загорается оптимум.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP: статичная страница с готовыми пробирками и шкалой

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger, vars = {}) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(), ...vars,
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { title.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from('.hero__pre', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.4)
      .from(title.chars, { yPercent: 112, stagger: 0.03, duration: 1.0, ease: 'expo.out' }, 0.45)
      // штатив: панель поднимается, пробирки «садятся» в неё, жидкость поднимается волной
      .from('.rack__glow', { scale: 0.6, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.3)
      .from('.rack__panel', { y: 70, autoAlpha: 0, duration: 1.0, ease: 'expo.out' }, 0.35)
      .from('.tube', { y: -90, autoAlpha: 0, stagger: 0.09, duration: 1.05, ease: 'power3.out' }, 0.55)
      .from('.liq', { y: 230, stagger: 0.11, duration: 1.9, ease: 'power2.inOut' }, 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.95)
      .from('.hero__text .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.2)
      .from('.pills li', { scale: 0.7, autoAlpha: 0, stagger: 0.07, duration: 0.55, ease: 'back.out(2)' }, 1.3);

    /* Жизнь в пробирках: волна на поверхности и редкие пузырьки */
    $$('.wave--a').forEach((w, i) => gsap.to(w, { x: -44, duration: 2.6 + i * 0.35, ease: 'none', repeat: -1 }));
    $$('.wave--b').forEach((w, i) => gsap.to(w, { x: 44, duration: 3.4 + i * 0.3, ease: 'none', repeat: -1 }));
    $$('.bub').forEach((b, i) => {
      gsap.fromTo(b, { y: 0, autoAlpha: 0 }, {
        y: -64, autoAlpha: 0.7, duration: 3.4 + (i % 4) * 0.7, ease: 'sine.in',
        repeat: -1, delay: 2.2 + (i % 6) * 0.55, repeatRefresh: false,
        onRepeat() { gsap.set(b, { x: gsap.utils.random(-5, 5) }); },
      });
    });

    /* Блик на главных кнопках раз в несколько секунд */
    $$('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    /* Лёгкий параллакс штатива */
    gsap.to('.rack__svg', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Референс и оптимум ---------- */
    gsap.from('.gap .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.gap .sec-head', start: 'top 84%' } });
    revealLines('.gap h2', '.gap .sec-head');

    // Шкала: референс выезжает, на нём — показатель; «печать» ВСЕ ХОРОШО!, и только потом загорается оптимум
    const gauge = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: '.gauge', start: 'top 78%' },
    });
    gauge
      .from('.gauge__ref', { scaleX: 0, transformOrigin: '0% 50%', duration: 1.1, ease: 'expo.out' })
      .from('.gauge__lab--ref', { y: 8, autoAlpha: 0, duration: 0.6 }, 0.5)
      .from('.gauge__marker', { y: -70, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.6)
      .from('.gauge__leader', { scaleY: 0, transformOrigin: '50% 100%', duration: 0.4 }, 1.3)
      .from('.gauge__stamp', { scale: 1.7, rotate: -16, autoAlpha: 0, duration: 0.28, ease: 'power4.in' }, 1.6)
      .to('.gauge__track', { y: 4, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.88)
      .from('.gauge__opt', { scaleX: 0, autoAlpha: 0, transformOrigin: '0% 50%', duration: 1.2, ease: 'expo.out' }, 2.4)
      .from('.gauge__lab--opt', { y: -8, autoAlpha: 0, duration: 0.6 }, 3.0);
    // Показатель дышит: кольцо вокруг точки расходится
    gsap.fromTo('.gauge__halo', { scale: 0.7, autoAlpha: 0.7 }, { scale: 1.6, autoAlpha: 0, duration: 1.8, ease: 'power2.out', repeat: -1, delay: 3.2 });

    gsap.from('.gap__claim', { y: 24, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.gap__copy', start: 'top 84%' } });
    gsap.from('.gap__promise', { x: -14, autoAlpha: 0, duration: 0.9, delay: 0.15, scrollTrigger: { trigger: '.gap__copy', start: 'top 80%' } });

    /* ---------- 3. Предложение ---------- */
    gsap.from('.offer .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.offer .sec-head', start: 'top 84%' } });
    revealLines('.offer h2', '.offer .sec-head');
    gsap.from('.offer .sec-sub', { y: 18, autoAlpha: 0, duration: 0.9, delay: 0.2, scrollTrigger: { trigger: '.offer .sec-head', start: 'top 80%' } });
    gsap.from('.inside__title', { y: 12, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.inside', start: 'top 86%' } });
    gsap.set('.inside__list li', { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch('.inside__list li', {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }),
    });
    gsap.timeline({ scrollTrigger: { trigger: '.price', start: 'top 82%' } })
      .fromTo('.price', { clipPath: 'inset(0% 0% 100% 0% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 32px)', duration: 1.3, ease: 'expo.inOut' })
      .from('.price__tag', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.5)
      // цена появляется целиком, без счётчика
      .from('.price__now', { y: 22, autoAlpha: 0, duration: 0.9 }, 0.65)
      .from(['.price__was', '.price__once'], { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, 0.85)
      .from('.meter', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.05)
      .from('.meter__fill', { scaleX: 0, duration: 1.6, ease: 'expo.out' }, 1.2)
      .from(['.price .btn', '.price__note'], { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, 1.3);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
