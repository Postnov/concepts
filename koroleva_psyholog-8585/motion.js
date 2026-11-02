// Наталия Королева — моушн концепта. Фирменная идея: папоротник. Вайя разворачивается в hero, а стебель в списке семинаров растёт вместе с прокруткой и выпускает по листку на каждый пункт.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная, полностью рабочая страница: вайя нарисована, стебель и листья на месте

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  function revealHead(root) {
    const head = $('.sec-head', root);
    if (!head) return;
    gsap.from($('.eyebrow', head), { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: head, start: 'top 85%' } });
    if ($('h2', head)) revealLines($('h2', head), head);
    if ($('.sec-sub', head)) gsap.from($('.sec-sub', head), { y: 16, autoAlpha: 0, duration: 0.9, delay: 0.25, scrollTrigger: { trigger: head, start: 'top 85%' } });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вайя разворачивается ---------- */
    const name = SplitText.create('.hero__name .nm', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const arch = $('.hero .arch');
    const fronds = $$('.hero__fern');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); startIdle(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(arch, { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 22px 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 22px 22px)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.15)
      .from('.hero .arch img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.arch-ring', { scale: 0.86, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.7)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.5)
      .from(name.chars, { yPercent: 118, stagger: 0.042, duration: 1.05, ease: 'expo.out' }, 0.6)
      .from(lead.lines, { yPercent: 100, stagger: 0.1, duration: 0.95 }, 1.0)
      .from('.years__item', { y: 16, autoAlpha: 0, stagger: 0.12, duration: 0.8 }, 1.25)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.45);

    // Вайи: стержень рисуется, листочки по очереди вырастают от основания к вершине, в конце раскручивается завиток
    fronds.forEach((fr, k) => {
      const rachis = $('.fr-rachis', fr);
      const coil = $('.fr-coil', fr);
      const leaves = $$('.fr-leaf', fr);
      const veins = $$('.fr-vein', fr);
      const maxI = Math.max(...leaves.map(l => +l.dataset.i));
      const t0 = 0.2 + k * 0.35;
      intro
        .fromTo(rachis, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.0, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, t0)
        .from(leaves, {
          scale: 0, svgOrigin: (i, el) => `${el.dataset.ox} ${el.dataset.oy}`, duration: 1.1, ease: 'power3.out',
          delay: (i, el) => (+el.dataset.i / maxI) * 1.5 + (i % 2) * 0.05,
        }, t0 + 0.15)
        .from(veins, { autoAlpha: 0, duration: 1, stagger: { each: 0.02 } }, t0 + 0.9)
        .fromTo(coil, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, t0 + 1.7);
    });

    // Годы набегают (это не цены, а стаж)
    $$('.years__n').forEach(el => {
      const end = +el.dataset.count;
      const o = { v: 0 };
      el.style.minWidth = `${el.getBoundingClientRect().width}px`; // ширина конечного числа: «лет» не ездит, пока число растёт
      el.textContent = '0';
      gsap.to(o, { v: end, duration: 1.6, delay: 1.5, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); }, onComplete: () => { el.textContent = end; } });
    });

    // Лёгкий ветерок: вайи чуть покачиваются, при прокрутке уплывают медленнее текста
    function startIdle() {
      $$('.hero__fern .fr-all').forEach((g, i) => {
        gsap.to(g, { rotation: i ? -1.8 : 1.8, svgOrigin: g.dataset.origin, duration: 6.5 + i * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    }
    gsap.to('.hero__fern', {
      yPercent: -9, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- Семинары и вебинары: стебель растёт, листья на каждом пункте ---------- */
    revealHead($('.sem-sec'));
    gsap.from('.sem-stem span', {
      scaleY: 0, ease: 'none',
      scrollTrigger: { trigger: '.sem-list', start: 'top 72%', end: 'bottom 72%', scrub: true },
    });
    $$('.sem').forEach(row => {
      gsap.from($('.sem__a', row), { y: 26, autoAlpha: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 92%' } });
      gsap.from($('.sem__leaf', row), {
        scale: 0, rotation: -70, transformOrigin: '1px 14px', duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 76%' },
      });
    });

    /* ---------- Медитации: круги расходятся, бубен бьёт ---------- */
    revealHead($('.med'));
    gsap.from('.med__rings i', {
      scale: 0.15, autoAlpha: 0, stagger: 0.16, duration: 2.2, ease: 'expo.out',
      scrollTrigger: { trigger: '.med', start: 'top 80%' },
    });
    $$('.med-card').forEach(card => {
      gsap.from(card, { y: 44, rotateX: -10, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0, duration: 1.0, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%' } });
      gsap.from($$('.r', card), { scale: 0, svgOrigin: '32 32', stagger: 0.12, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
    });
    const drumRings = $$('.med-card--drum .r');
    if (drumRings.length) {
      ScrollTrigger.create({
        trigger: '.med-card--drum', start: 'top 85%', once: true,
        onEnter: () => gsap.delayedCall(1.6, () => {
          gsap.timeline({ repeat: -1, repeatDelay: 1.1 })
            .to(drumRings, { scale: 1.2, svgOrigin: '32 32', duration: 0.16, ease: 'power2.out', stagger: 0.05 })
            .to(drumRings, { scale: 1, svgOrigin: '32 32', duration: 0.55, ease: 'power2.inOut', stagger: 0.05 })
            .to(drumRings, { scale: 1.2, svgOrigin: '32 32', duration: 0.16, ease: 'power2.out', stagger: 0.05 }, '+=0.12')
            .to(drumRings, { scale: 1, svgOrigin: '32 32', duration: 0.7, ease: 'power2.inOut', stagger: 0.05 });
        }),
      });
    }

    

    if ($('.concept-end')) gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });
    window.addEventListener('load', refresh, { once: true });
  });
})();
