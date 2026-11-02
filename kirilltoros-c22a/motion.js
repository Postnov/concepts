// Кирилл Торос — моушн концепта. Фирменная идея: «скан тела» — лайм-линия проходит по фото, метки мышц фиксируются по мере прохода;
// дальше в странице эхо: подходы-столбики заполняются по очереди. Кнопки — только плавное увеличение.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.0, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const tags = $$('.tag');
    const SCAN = 3.0; // секунд на проход сканера

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__photo img', { scale: 1.2, filter: 'brightness(0.12)', duration: 2.1, ease: 'power2.out', clearProps: 'filter' }, 0.1)
      .from('.ruler', { scaleY: 0, transformOrigin: '50% 0%', duration: 1.4, ease: 'expo.out' }, 0.5)
      .from('.kicker > *', { x: -14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.5)
      .from(first.chars, { yPercent: 120, stagger: 0.05, duration: 0.9, ease: 'expo.out' }, 0.55)
      .from(last.chars, { yPercent: 110, stagger: 0.07, duration: 1.25, ease: 'expo.out' }, 0.65)
      .from(lead.lines, { yPercent: 105, stagger: 0.09, duration: 0.9 }, 1.1)
      .from('.chips li', { y: 14, autoAlpha: 0, stagger: 0.09, duration: 0.6 }, 1.25)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.4);

    /* Скан: линия идёт сверху вниз с постоянной скоростью, метки «захватывают» мышцы в момент прохода */
    const T0 = 1.5;
    const line = $('.scan__line');
    const scanTl = gsap.timeline({ delay: T0 });
    scanTl.fromTo(line, { yPercent: -101 }, { yPercent: 0, duration: SCAN, ease: 'none' }, 0);
    tags.forEach(tag => {
      const y = parseFloat(tag.dataset.y) / 100;
      const at = y * SCAN;
      const dot = $('.tag__dot', tag), ln = $('.tag__line', tag), label = $('.tag__label', tag);
      const horizontal = tag.classList.contains('tag--l') || tag.classList.contains('tag--r');
      gsap.set([dot, ln, label], { autoAlpha: 0 });
      scanTl
        .fromTo(dot, { scale: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(3)' }, at)
        .fromTo(ln, horizontal ? { scaleX: 0 } : { scaleY: 0 }, { scaleX: 1, scaleY: 1, autoAlpha: 0.85, duration: 0.55, ease: 'power3.out' }, at + 0.1)
        .fromTo(label, { x: horizontal ? (tag.classList.contains('tag--l') ? 8 : -8) : 0, y: horizontal ? 0 : 8 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, at + 0.3);
    });
    // Линия уходит за край и больше не висит поверх фото; дальше раз в несколько секунд — повторный проход
    scanTl.set(line, { autoAlpha: 0 }, SCAN + 0.1);
    const loop = gsap.timeline({ repeat: -1, repeatDelay: 4.2, delay: T0 + SCAN + 3.4 });
    loop
      .set(line, { autoAlpha: 1, yPercent: -101 })
      .to(line, { yPercent: 0, duration: SCAN * 0.9, ease: 'none' })
      .set(line, { autoAlpha: 0 });
    tags.forEach(tag => {
      const y = parseFloat(tag.dataset.y) / 100;
      loop.fromTo($('.tag__dot', tag), { boxShadow: '0 0 0 5px rgba(223,255,58,.25)' }, { boxShadow: '0 0 0 12px rgba(223,255,58,0)', duration: 0.9, ease: 'power2.out' }, y * SCAN * 0.9);
    });

    /* Лёгкий параллакс фото */
    gsap.to('.hero__photo img', {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Индивидуальные программы ---------- */
    revealLines('.indiv h2', '.indiv .sec-head');
    gsap.from(['.indiv .eyebrow', '.indiv .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.indiv .sec-head', start: 'top 84%' },
    });
    const feature = $('.plan--feature');
    gsap.timeline({ scrollTrigger: { trigger: feature, start: 'top 82%' } })
      .fromTo(feature, { clipPath: 'inset(0% 0% 100% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.plan--feature .plan__photo img', { scale: 1.3, duration: 1.7, ease: 'expo.out' }, 0.1)
      .from('.plan--feature .plan__body > *', { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.5);
    $$('.plan:not(.plan--feature)').forEach(card => {
      gsap.from(card, { y: 44, autoAlpha: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%' } });
      gsap.from($('.plan__photo img', card), { scale: 1.25, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%' } });
    });

    /* ---------- 3. Готовые программы: подходы-столбики ---------- */
    revealLines('.gym h2', '.gym .sec-head');
    gsap.from(['.gym .eyebrow', '.gym .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.gym .sec-head', start: 'top 84%' },
    });
    $$('.prog').forEach(row => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%' } });
      tl.from($$('.prog__thumb, .prog__meta, .prog__title, .prog__desc, .prog__buy', row), { y: 22, autoAlpha: 0, duration: 0.75, stagger: 0.06, ease: 'power3.out' }, 0)
        .from($$('.pips i', row), { scaleY: 0, duration: 0.5, stagger: 0.07, ease: 'back.out(2.4)' }, 0.25);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
