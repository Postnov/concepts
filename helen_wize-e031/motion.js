// Елена Вайс · Институт неопсихологии — моушн концепта.
// Фирменная идея: эмблема института (кольцо вокруг треугольника) собирается на глазах, кольцо медленно крутится, как золотая фольга на свету,
// а вокруг идёт циферблат «нового времени»: точка-секундная стрелка обходит эмблему.
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
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    const rings = $$('.emb-ring');
    const T = '150 163'; // центр кольца эмблемы

    /* ---------- 1. Hero: эмблема собирается ---------- */
    const t1 = SplitText.create('.hero__t1', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const t2 = SplitText.create('.hero__t2', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { t1.revert(); t2.revert(); lead.revert(); startLoops(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.dial', { scale: 0.86, autoAlpha: 0, duration: 1.6, ease: 'expo.out', stagger: 0.12 }, 0.2)
      .from('.orbit', { rotation: -90, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.3)
      // Эмблема проявляется кругом из центра; слои не мигают прозрачностью по отдельности, иначе кольцо просвечивает сквозь треугольник
      .fromTo('.emb', { clipPath: 'circle(0% at 50% 54%)' }, { clipPath: 'circle(78% at 50% 54%)', duration: 1.9, ease: 'expo.out', clearProps: 'clipPath' }, 0.3)
      .from(rings, { rotation: -170, svgOrigin: T, duration: 2.3, ease: 'expo.out' }, 0.3)
      .from('.emb-tri', { y: 40, duration: 1.6, ease: 'expo.out' }, 0.45)
      .from('.emb-psi', { scale: 0.5, svgOrigin: '150 166', autoAlpha: 0, duration: 1.1, ease: 'power3.out' }, 1.2)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.4)
      .from(t1.chars, { yPercent: 118, stagger: 0.03, duration: 1.05, ease: 'expo.out' }, 0.6)
      .from(t2.chars, { yPercent: 118, stagger: 0.018, duration: 0.9, ease: 'expo.out' }, 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.2)
      .from('.tag', { y: 14, scale: 0.92, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)' }, 1.45)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.6);

    function startLoops() {
      // Кольцо крутится, золотой градиент ловит «свет» — оба экземпляра (за треугольником и перед ним) синхронно
      gsap.to(rings, { rotation: 360, svgOrigin: T, duration: 110, ease: 'none', repeat: -1 });
      // Точка обходит эмблему: оборот за 36 секунд
      gsap.to('.orbit', { rotation: 360, duration: 36, ease: 'none', repeat: -1 });
      // Блик на главной кнопке раз в несколько секунд
      gsap.fromTo('.hero__cta .btn:not(.btn--ghost)', { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8 });
    }

    // Уходя с экрана, циферблат слегка поворачивается, а эмблема уходит вглубь
    gsap.to('.dial--major', { rotation: 60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.dial--minor', { rotation: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.stage', { yPercent: -7, scale: 0.94, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Программы ---------- */
    revealLines('.programs h2', '.programs .sec-head');
    gsap.from('.programs .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.programs .sec-head', start: 'top 86%' } });

    const feat = gsap.timeline({ scrollTrigger: { trigger: '.feature', start: 'top 82%' }, defaults: { ease: 'power3.out' } });
    feat
      .fromTo('.feature', { clipPath: 'inset(0% 0% 100% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.feature__ring', { rotation: -60, scale: 0.8, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.3)
      .from('.feature .label, .feature__title, .feature__text', { y: 22, autoAlpha: 0, stagger: 0.12, duration: 0.85 }, 0.7)
      .from('.evo__end', { autoAlpha: 0, y: 10, stagger: 0.15, duration: 0.7 }, 1.15)
      .fromTo('.evo', { '--p': 0 }, { '--p': 1, duration: 2.2, ease: 'power2.inOut' }, 1.2)
      .from('.feature .btn', { y: 16, autoAlpha: 0, duration: 0.7 }, 1.5);
    gsap.to('.feature__ring', { rotation: 360, duration: 140, ease: 'none', repeat: -1 });

    $$('.pcard').forEach((card, i) => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' }, defaults: { ease: 'power3.out' } })
        .fromTo(card, { clipPath: 'inset(100% 0% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.15, ease: 'expo.inOut', clearProps: 'clipPath', delay: i * 0.08 })
        .from(card.querySelectorAll(':scope > :not(.mark)'), { y: 18, autoAlpha: 0, stagger: 0.09, duration: 0.7 }, 0.45 + i * 0.08)
        .fromTo(card.querySelector('.mark__ring'), { strokeDasharray: 1, strokeDashoffset: 1, rotation: -90, svgOrigin: '30 35' }, { strokeDashoffset: 0, rotation: 0, duration: 1.6, ease: 'power2.inOut' }, 0.6 + i * 0.08);
    });

    /* ---------- 3. Подарки ---------- */
    revealLines('.gifts h2', '.gifts .sec-head');
    gsap.from('.gifts .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.gifts .sec-head', start: 'top 86%' } });

    // Золотая рамка теста вычерчивается по периметру
    const frame = $('.test__frame rect');
    gsap.set(frame, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.timeline({ scrollTrigger: { trigger: '.test', start: 'top 82%' }, defaults: { ease: 'power3.out' } })
      .to(frame, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' })
      .from('.test > :not(.test__frame):not(.test__sparks)', { y: 22, autoAlpha: 0, stagger: 0.12, duration: 0.85 }, 0.5);

    // Золотая пыль, как на баннере теста: сердечки и искры плавно дрейфуют
    const box = $('.test__sparks');
    const heart = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12 21s-7-4.6-9.5-9C.8 8.6 2.6 5 6 5c2.1 0 3.4 1.2 4 2.3C10.6 6.2 11.9 5 14 5c3.4 0 5.2 3.6 3.5 7C19 16.4 12 21 12 21z"/></svg>';
    const dust = [[8, 12, 9], [86, 9, 12], [18, 62, 8], [92, 56, 10], [6, 88, 11], [80, 84, 8], [50, 4, 7], [66, 34, 6], [30, 24, 6], [95, 30, 7]];
    dust.forEach(([x, y, s], i) => {
      const el = document.createElement('span');
      el.className = 'spark';
      el.style.cssText = `left:${x}%;top:${y}%;--s:${s}px`;
      el.innerHTML = i % 3 === 2 ? '<svg viewBox="0 0 10 10" width="100%" height="100%"><path fill="currentColor" d="M5 0l1 4 4 1-4 1-1 4-1-4-4-1 4-1z"/></svg>' : heart;
      box.append(el);
      gsap.fromTo(el, { y: 0, autoAlpha: 0.15 }, { y: -14 - (i % 4) * 5, autoAlpha: 0.85, duration: 3 + (i % 5) * 0.7, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.35 });
    });

    gsap.from('.guide > :not(.mark)', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.guide', start: 'top 88%' } });
    gsap.fromTo('.guide .mark__ring', { strokeDasharray: 1, strokeDashoffset: 1, rotation: -90, svgOrigin: '30 35' }, { strokeDashoffset: 0, rotation: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: '.guide', start: 'top 88%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
