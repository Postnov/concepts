// Анастасия Генералова — моушн концепта.
// Фирменная идея — «нить»: между «До терапии» и «После» клубок распутывается по скроллу,
// нить тянется вниз и складывается в сердце. Остальное — спокойные раскрытия, как в комнате, где включают тёплый свет.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  // Без GSAP или при reduced motion страница остаётся статичной: нить нарисована целиком, все фото цветные
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, ease: 'power3.out', ...vars,
    scrollTrigger: { trigger, start: 'top 84%' },
  });

  // Нить: клубок стирается с вольного конца (нить «вытягивают»), хвост и сердце дорисовываются
  function threadTimeline(svg) {
    const knot = $('.thread__knot', svg);
    const tail = $('.thread__tail', svg);
    const heart = $('.thread__heart', svg);
    const fill = $('.thread__fill', svg);
    const lk = knot.getTotalLength();
    const lt = tail.getTotalLength();
    const lh = heart.getTotalLength();
    // Промежуток длиннее штриха на 2 и сдвиг ещё на 1: иначе круглый кончик линии виден точкой на старте/финише
    gsap.set(knot, { strokeDasharray: `${lk} ${lk + 2}`, strokeDashoffset: 0 });
    gsap.set(tail, { strokeDasharray: `${lt} ${lt + 2}`, strokeDashoffset: lt + 1 });
    gsap.set(heart, { strokeDasharray: `${lh} ${lh + 2}`, strokeDashoffset: lh + 1 });
    gsap.set(fill, { autoAlpha: 0, scale: 0.5, svgOrigin: heartCenter(heart) });
    return gsap.timeline({ defaults: { ease: 'none' } })
      .to(knot, { strokeDashoffset: -lk - 1, duration: 1 }, 0)
      .to(tail, { strokeDashoffset: 0, duration: 0.5 }, 0.15)
      .to(heart, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut' }, 0.6)
      .to(fill, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, 1.1);
  }
  function heartCenter(path) {
    const b = path.getBBox();
    return `${b.x + b.width / 2} ${b.y + b.height * 0.55}`;
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: «включается свет» ---------- */
    const name = SplitText.create('.hero__name > span', { type: 'words,chars', wordsClass: 'sw' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__photo', { autoAlpha: 0, duration: 1.4, ease: 'power2.out' }, 0)
      .fromTo('.hero__photo img',
        { scale: 1.14, filter: 'brightness(0.35)' },
        { scale: 1, filter: 'brightness(1)', duration: 2.6, ease: 'expo.out', clearProps: 'filter' }, 0)
      .from('.kicker', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.45)
      .from(name.chars, { yPercent: 45, autoAlpha: 0, duration: 1.25, stagger: 0.035, ease: 'expo.out' }, 0.55)
      .from('.hero__topics li', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.95 }, 1.05)
      .from('.hero .cta', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.3)
      .from('.hero__about', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.45);

    // Лёгкий параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. До и после ---------- */
    fadeUp('.shift .eyebrow', '.shift .sec-head');
    revealLines('.shift h2', '.shift .sec-head');

    $$('.state').forEach(card => {
      gsap.from(card, {
        y: 60, autoAlpha: 0, duration: 1.15, ease: 'expo.out',
        scrollTrigger: { trigger: card, start: 'top 88%' },
      });
      gsap.fromTo($('.pebble', card),
        { clipPath: 'inset(0% 50% 0% 50% round 999px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: card, start: 'top 84%' } });
    });
    const items = $$('.state__list li, .state__note');
    gsap.set(items, { y: 14, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' }),
    });

    // Цвет возвращается в фото «После» вместе с сердцем
    gsap.fromTo('.state--after .pebble img', { filter: 'grayscale(1)' }, {
      filter: 'grayscale(0)', ease: 'none',
      scrollTrigger: { trigger: '.state--after', start: 'top 85%', end: 'top 35%', scrub: true },
    });

    const mm = gsap.matchMedia();
    mm.add('(max-width: 899px)', () => {
      ScrollTrigger.create({
        trigger: '.thread', start: 'top 78%', end: 'bottom 38%', scrub: 0.6,
        animation: threadTimeline($('.thread__svg--v')),
      });
    });
    mm.add('(min-width: 900px)', () => {
      ScrollTrigger.create({
        trigger: '.thread__svg--h', start: 'top 80%', end: 'bottom 35%', scrub: 0.6,
        animation: threadTimeline($('.thread__svg--h')),
      });
    });

    /* ---------- 3. Консультация ---------- */
    fadeUp('.consult .eyebrow', '.consult__head');
    revealLines('.consult h2', '.consult__head');
    const leadC = SplitText.create('.consult__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(leadC.lines, {
      yPercent: 100, duration: 1, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '.consult__lead', start: 'top 86%' },
      onComplete: () => leadC.revert(),
    });

    gsap.timeline({ scrollTrigger: { trigger: '.facts', start: 'top 82%' } })
      .fromTo('.facts .pebble',
        { clipPath: 'inset(100% 0% 0% 0% round 999px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.4, ease: 'expo.inOut' })
      .from('.facts .pebble img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.15)
      .from('.facts__row', { y: 18, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, 0.3);

    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.6, ease: 'power2.out', snap: { v: 100 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });

    gsap.from('.apply', {
      y: 50, autoAlpha: 0, duration: 1.15, ease: 'expo.out',
      scrollTrigger: { trigger: '.apply', start: 'top 90%' },
    });
    fadeUp('.apply > *', '.apply', { stagger: 0.1, delay: 0.15 });
    fadeUp('.concept-end > *', '.concept-end', { stagger: 0.1 });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
