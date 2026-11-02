// Анна Оленич — моушн концепта. Ручка пишет по косой линейке (слово, строка-разгон), красная ручка учителя
// обводит, отмечает галочками и ставит «Отлично!»; на тёмном «экране» видеокурса заряжается Кристалл знаний.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 85%' },
      onComplete: () => split.revert(),
    });
  }
  // Линия «рисуется»: длину берём у самого пути
  function armStroke(sel) {
    return $$(sel).map(p => {
      const len = Math.ceil(p.getTotalLength()) + 2;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      return p;
    });
  }
  const unarm = els => gsap.set(els, { clearProps: 'strokeDasharray,strokeDashoffset' });

  MotionBase.ready(() => {
    /* ---------- 1. Шапка: лист тетради ---------- */
    const lead = SplitText.create('.hero__lead', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const ring = armStroke('.who__ring path');
    const flo = armStroke('.flourish__path');
    gsap.set('.hero__dot', { left: '0%' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        lead.revert();
        unarm([...ring, ...flo]);
        gsap.set('.hero__ink', { clearProps: 'clipPath' });
        gsap.set('.hero__dot', { autoAlpha: 0 });
      },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.who__img', { scale: 0.55, rotate: -16, autoAlpha: 0, duration: 1, ease: 'back.out(1.5)' }, 0.1)
      .to(ring, { strokeDashoffset: 0, duration: 1.15, ease: 'power2.inOut' }, 0.6)
      .from('.who__name', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.3)
      .from('.who__role', { y: 12, autoAlpha: 0, duration: 0.8 }, 0.42)
      .from(lead.chars, { yPercent: 115, stagger: 0.028, duration: 0.95, ease: 'expo.out' }, 0.45)
      // Слово пишется: чернила идут слева направо, впереди — точка-перо
      .fromTo('.hero__ink', { clipPath: 'inset(-25% 100% -25% -6%)' }, { clipPath: 'inset(-25% -6% -25% -6%)', duration: 1.7, ease: 'power1.inOut' }, 1.0)
      .fromTo('.hero__dot', { autoAlpha: 1, left: '0%' }, { left: '100%', duration: 1.7, ease: 'power1.inOut' }, 1.0)
      .fromTo('.hero__dot', { y: -10 }, { y: 12, duration: 0.21, ease: 'sine.inOut', repeat: 7, yoyo: true }, 1.0)
      .to('.hero__dot', { autoAlpha: 0, duration: 0.3 }, 2.65)
      .from('.hero__tail', { y: 16, autoAlpha: 0, duration: 0.8 }, 2.2)
      .from('.hero__cta', { y: 20, autoAlpha: 0, duration: 0.8 }, 2.45)
      // Строка-разгон: петли «ллл» выводятся одной линией
      .to(flo, { strokeDashoffset: 0, duration: 2.4, ease: 'power1.inOut' }, 1.5)
      // Красная ручка ставит оценку
      .from('.stamp', { scale: 2.6, rotate: -34, autoAlpha: 0, duration: 0.32, ease: 'power4.in' }, 3.5)
      .to('.hero__inner', { y: 3, duration: 0.06, yoyo: true, repeat: 1, ease: 'power1.out' }, 3.82);

    /* ---------- 2. Видеокурс ---------- */
    gsap.from('.course__banner img', {
      clipPath: 'inset(0% 0% 100% 0%)', scale: 1.14, duration: 1.4, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.course__banner', start: 'top 92%' },
    });
    gsap.from('.hud__c', {
      scale: 2.4, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.course__banner', start: 'top 90%' },
    });
    revealLines('.course h2', '.course .sec-head');
    gsap.from(['.course .eyebrow', '.course .lead', '.course .note'], {
      y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.14,
      scrollTrigger: { trigger: '.course .sec-head', start: 'top 85%' },
    });
    // Кристалл заряжается: деления загораются одно за другим
    gsap.from('.crystal__bar i', {
      scaleY: 0.12, autoAlpha: 0.18, duration: 0.45, stagger: 0.16, ease: 'power2.out',
      scrollTrigger: { trigger: '.crystal', start: 'top 84%' },
    });
    gsap.from(['.crystal__label', '.crystal__cap'], { y: 12, autoAlpha: 0, duration: 0.7, stagger: 0.1, scrollTrigger: { trigger: '.crystal', start: 'top 86%' } });
    gsap.from('.reel__track li', { x: 70, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.reel', start: 'top 86%' } });
    gsap.from('.reel__hint', { autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.reel', start: 'top 90%' } });
    gsap.from('.tariff', { y: 46, autoAlpha: 0, duration: 1, stagger: 0.14, ease: 'expo.out', scrollTrigger: { trigger: '.tariffs', start: 'top 86%' } });
    // Цены появляются целиком, без счётчика
    $$('.price').forEach(el => gsap.from(el, { y: 12, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%' } }));
    gsap.from('.pay', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.pay', start: 'top 92%' } });
    gsap.from('.course .btn', { y: 20, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.course .btn', start: 'top 94%' } });

    /* ---------- 3. Прописи ---------- */
    const sFlo = armStroke('.sets__flourish path');
    gsap.to(sFlo, { strokeDashoffset: 0, duration: 2.2, ease: 'power1.inOut', scrollTrigger: { trigger: '.sets__flourish', start: 'top 90%' } });
    revealLines('.sets h2', '.sets .sec-head');
    gsap.from('.sets .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.sets .sec-head', start: 'top 86%' } });
    $$('.set').forEach(set => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: set, start: 'top 80%' } });
      // Саму карточку не двигаем и не гасим: transform/opacity на ней ломает multiply у обложки (белый фон фото перестаёт сливаться с карточкой)
      tl.from($('.set__cover', set), { y: 70, rotate: -7, scale: 0.88, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0)
        .from($$('.set__body > *:not(.ticks):not(.buy)', set), { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.3)
        .from($$('.ticks li', set), { x: -14, autoAlpha: 0, stagger: 0.14, duration: 0.6 }, 0.55)
        .from($$('.tick path', set), { strokeDashoffset: 34, stagger: 0.14, duration: 0.55, ease: 'power2.out' }, 0.65)
        .from($$('.buy .btn', set), { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.9);
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
