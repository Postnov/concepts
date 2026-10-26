// Вита Альтерего — моушн концепта. Фирменная идея — «ключ»: её логотип с ключом вместо буквы,
// поэтому портрет открывается через замочную скважину, а карты с ценами переворачиваются, как карты таро.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Счётчик чисел (17 000+, 600+)
  function countUp(el, opts = {}) {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    return gsap.to(o, {
      v: to, duration: opts.duration || 1.6, ease: 'power2.out', snap: { v: to % 100 === 0 && to >= 1000 ? 100 : 1 }, delay: opts.delay || 0,
      scrollTrigger: opts.noScroll ? undefined : { trigger: el, start: 'top 92%', once: true },
      onStart: () => { el.textContent = MotionBase.money(0); },
      onUpdate: () => { el.textContent = MotionBase.money(o.v); },
    });
  }

  // цены не «набегают»: число стоит в разметке, строка цены проявляется целиком
  function priceIn(el) {
    return gsap.from(el, {
      y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: скважина раскрывается в портрет ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      // контур скважины загорается…
      .from('.keyhole__line', { autoAlpha: 0, scale: 0.6, svgOrigin: '50 46', duration: 0.7, ease: 'expo.out' }, 0.1)
      .from('.keyhole__cut', { scale: 0.6, svgOrigin: '50 46', duration: 0.7, ease: 'expo.out' }, 0.1)
      // …и раскрывается на весь кадр, как будто ключ повернули
      .to(['.keyhole__cut', '.keyhole__line'], { scale: 34, svgOrigin: '50 46', duration: 1.6, ease: 'expo.inOut' }, 0.95)
      .to('.keyhole__line', { autoAlpha: 0, duration: 0.5 }, 1.25)
      .set('.keyhole', { display: 'none' }, 2.6)
      .from('.hero__frame img', { scale: 1.35, duration: 2.4, ease: 'expo.out' }, 0.95)
      .from('.tags > *', { y: 10, autoAlpha: 0, stagger: 0.05, duration: 0.5 }, 1.45)
      .from(name.chars, { yPercent: 118, stagger: 0.035, duration: 1.0, ease: 'expo.out' }, 1.5)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.9 }, 1.9)
      .from('.stats li', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 2.0)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 2.15)
      .from('.hero__note', { autoAlpha: 0, duration: 0.7 }, 2.35);
    $$('.stats [data-count]').forEach((el, i) => intro.add(countUp(el, { noScroll: true, duration: 1.8 }), 2.0 + i * 0.1));

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 3 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__frame img', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Направления: строки «отпираются» по очереди ---------- */
    gsap.from('.paths__art img', {
      clipPath: 'inset(0% 100% 0% 0%)', duration: 1.8, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.paths__art', start: 'top 85%' },
    });
    gsap.from('.paths .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.paths .sec-head', start: 'top 85%' } });
    revealLines('.paths h2', '.paths .sec-head');
    $$('.path').forEach(row => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%' } });
      tl.from($('.path__body', row), { clipPath: 'inset(0% 100% 0% 0%)', x: -14, duration: 1.1, ease: 'expo.out' }, 0)
        .from($('.path__num', row), { autoAlpha: 0, y: 10, duration: 0.6 }, 0.1)
        .from($('.path__arrow', row), { autoAlpha: 0, rotate: -90, duration: 0.8, ease: 'back.out(2)' }, 0.3);
    });

    /* ---------- 3. Консультация: арка и карты таро ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.consult__grid', start: 'top 80%' } })
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 26px 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 26px 26px)', duration: 1.5, ease: 'expo.inOut' })
      .from('.arch img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.2);
    gsap.from('.consult .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.consult .sec-head', start: 'top 85%' } });
    revealLines('.consult h2', '.consult .sec-head');
    gsap.from('.consult .sec-sub', { y: 16, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.consult .sec-sub', start: 'top 90%' } });

    // Карты переворачиваются рубашкой к нам → лицом
    gsap.from('.tcard', {
      rotateY: -100, autoAlpha: 0, transformOrigin: '50% 50%', duration: 1.2, stagger: 0.16, ease: 'expo.out',
      scrollTrigger: { trigger: '.tarot', start: 'top 85%' },
    });
    $$('.tcard__price').forEach(priceIn);
    gsap.from('.consult__foot > *', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.consult__foot', start: 'top 92%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
