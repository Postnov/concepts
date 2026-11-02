// marine.might — моушн концепта «Этикетка КБЖУ».
// Фирменная идея: сборники «печатаются» как пищевые этикетки — линейки прочерчиваются слева направо,
// а числа рецептов набегают, как граммы на весах. В hero фото лежит на «тарелке», подпись по ободу медленно вращается.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // без GSAP / reduced motion — статичная рабочая страница

  // Заголовок секции строками из-под маски
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Число набегает от 0 до значения (как граммы на весах)
  function countUp(el, delay = 0) {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    return gsap.to(o, {
      v: to, duration: 1.3, delay, ease: 'power3.out',
      onStart: () => { el.textContent = '0'; },
      onUpdate: () => { el.textContent = String(Math.round(o.v)); },
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const title = SplitText.create('.hero__title .t', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => title.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.plate__disc', { scale: 0.4, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.1)
      .from('.plate__photo', { scale: 0.2, rotate: -40, duration: 1.4, ease: 'expo.out' }, 0.2)
      .from('.plate__ring', { autoAlpha: 0, rotate: -120, duration: 1.8, ease: 'expo.out' }, 0.35)
      .from('.plate__badge', { scale: 0, rotate: -90, duration: 0.9, ease: 'back.out(1.8)' }, 0.95)
      .from('.hero__brand > *', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(title.chars, { yPercent: 110, stagger: 0.028, duration: 0.9, ease: 'expo.out' }, 0.4)
      .from('.hero__sub', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.95)
      // «на тортиках» дописывается от руки слева направо
      .fromTo('.hand', { clipPath: 'inset(-20% 100% -20% 0%)' }, { clipPath: 'inset(-20% 0% -20% 0%)', duration: 0.9, ease: 'power2.inOut' }, 1.25)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.2)
      .from('.ticker', { autoAlpha: 0, duration: 0.8 }, 1.1);

    // Подпись по ободу тарелки — непрерывное медленное вращение
    gsap.to('.plate__ring', { rotate: 360, duration: 40, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    // Тарелка чуть поворачивается при прокрутке
    gsap.to('.plate__photo img', {
      rotate: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // Блик на главных кнопках раз в несколько секунд
    gsap.utils.toArray('.hero__cta .btn:not(.btn--ghost), .order .btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });

    /* ---------- бегущая строка: бесшовный цикл (дорожка продублирована) ---------- */
    gsap.to('.ticker__track', { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });

    /* ---------- 2. Сборники: этикетки «печатаются» ---------- */
    revealLines('.books h2', '.books .sec-head');
    gsap.from('.books .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.books .sec-head', start: 'top 84%' } });

    $$('.label').forEach(label => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: label, start: 'top 82%' }, defaults: { ease: 'power3.out' } });
      tl.from(label, { y: 46, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
        .from($$('.rule', label), { scaleX: 0, duration: 0.8, stagger: 0.12, ease: 'expo.inOut' }, 0.15)
        .from($$('.label__head > *, .label__big span, .label__row span, .label__text, .label__note', label), { x: -10, autoAlpha: 0, duration: 0.6, stagger: 0.06 }, 0.3)
        .from($('.btn', label), { y: 12, autoAlpha: 0, duration: 0.6 }, 0.7);
      $$('[data-count]', label).forEach((el, i) => tl.add(countUp(el), 0.35 + i * 0.15));
    });

    /* ---------- 3. Меню ---------- */
    revealLines('.menu h2', '.menu .sec-head');
    gsap.from('.menu .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.menu .sec-head', start: 'top 84%' } });
    $$('.tile').forEach((tile, i) => {
      gsap.timeline({ scrollTrigger: { trigger: tile, start: 'top 86%' } })
        .fromTo(tile, { clipPath: 'inset(100% 0% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.1, ease: 'expo.inOut', delay: i * 0.12 })
        .from($$('.tile__kicker, .tile__title, .tile__go', tile), { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, '-=0.45')
        .set(tile, { clearProps: 'clipPath' });
    });
    gsap.from('.order', { y: 30, autoAlpha: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.order', start: 'top 90%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
