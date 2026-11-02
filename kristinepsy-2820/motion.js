// Кристине — моушн концепта. Фирменная идея: золотая нить. В hero она обводит арку портрета,
// в блоке «как проходит работа» — спутанный клубок, который при прокрутке распутывается в ровную линию к «понятным шагам».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- нить-клубок: путь из N кубических кривых; t = 1 — узел, t = 0 — ровная нить ----------
     Петля у кубической кривой получается, когда обе контрольные точки по одну сторону от нити
     и заходят за концы отрезка по ходу движения (первая — ниже конца, вторая — выше начала) */
  const knot = $('.knot__path');
  const N = 14, H = 600, X = 30, DY = H / N;
  const loops = Array.from({ length: N }, (_, i) => ({
    s: i % 2 ? -1 : 1,                    // петли по очереди вправо и влево
    r: 24 + 5 * Math.sin(i * 1.9),        // ширина петли
    k: 1.05 + 0.25 * Math.cos(i * 1.3),   // перехлёст за концы отрезка — высота петли
    j: 4 * Math.sin(i * 2.7),             // смещение узла от оси
  }));
  const f = n => n.toFixed(1);
  function knotPath(t) {
    const mix = (tangled, calm) => calm + (tangled - calm) * t;
    let d = `M${X} 0`;
    loops.forEach((g, i) => {
      const y0 = i * DY, y1 = y0 + DY, cx = f(mix(X + g.s * g.r, X));
      let c1y = mix(y1 + g.k * DY, y0 + DY / 3);
      let c2y = mix(y0 - g.k * DY, y0 + DY * 2 / 3);
      if (i === 0) c2y = Math.max(c2y, 4);             // первая петля не вылезает над списком
      if (i === N - 1) c1y = Math.min(c1y, H - 4);     // последняя — под ним
      d += ` C${cx} ${f(c1y)} ${cx} ${f(c2y)} ${f(mix(X + g.j, X))} ${f(y1)}`;
    });
    return d;
  }
  if (knot) knot.setAttribute('d', knotPath(animate ? 1 : 0));

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 84%' }, ...vars,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: арка раскрывается, нить обводит портрет ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const thread = $('.thread__path');
    const len = thread.getTotalLength();
    gsap.set(thread, { strokeDasharray: len, strokeDashoffset: len });

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); gsap.set('.arch', { clearProps: 'clipPath' }); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.1)
      .from('.arch img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.3)
      .to(thread, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' }, 0.55)
      .from('.thread__bead', { scale: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(3)' }, 2.75)
      .from('.hero__handle', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.5)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.45)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.85)
      .from('.pills li', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.3);

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.arch img', {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Как проходит работа: клубок распутывается ---------- */
    revealLines('.approach h2', '.approach .sec-head');
    fadeUp('.approach .eyebrow', '.approach .sec-head');
    fadeUp('.approach__intro', '.approach__body');
    gsap.from('.knot__list li', {
      x: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.knot', start: 'top 80%' },
    });
    const state = { t: 1 };
    gsap.timeline({ scrollTrigger: { trigger: '.knot', start: 'top 72%', end: 'bottom 62%', scrub: 0.8 } })
      .to(state, { t: 0, ease: 'power1.inOut', onUpdate: () => knot.setAttribute('d', knotPath(state.t)) }, 0)
      .fromTo(knot, { opacity: 0.55 }, { opacity: 1, ease: 'none' }, 0);
    gsap.from('.knot__dot', {
      scale: 0, duration: 0.9, ease: 'back.out(2.2)',
      scrollTrigger: { trigger: '.knot__end', start: 'top 80%' },
    });
    fadeUp('.knot__end > span:last-child', '.knot__end', { y: 12 });
    gsap.timeline({ scrollTrigger: { trigger: '.approach__note', start: 'top 85%' } })
      .from('.approach__note', { y: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out' })
      .from('.strike__line', { scaleX: 0, duration: 0.9, ease: 'power2.inOut' }, 0.5);

    /* ---------- 3. Знакомство ---------- */
    const digits = $('.meet__digits');
    const n = { v: 0 };
    gsap.timeline({ scrollTrigger: { trigger: '.meet', start: 'top 78%' } })
      .from('.meet__num', { yPercent: 18, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .fromTo(n, { v: 0 }, {
        v: Number(digits.dataset.count), duration: 1.5, ease: 'power2.out',
        onUpdate: () => { digits.textContent = Math.round(n.v); },
      }, 0.1)
      .from('.meet__unit', { x: -10, autoAlpha: 0, duration: 0.7 }, 0.6);
    revealLines('.meet h2', '.meet .sec-head');
    fadeUp(['.meet .eyebrow', '.meet .sec-sub'], '.meet .sec-head');
    fadeUp('.meet .btn', '.meet .btn', { y: 18 });
    gsap.from('.links li', {
      y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.links', start: 'top 88%' },
    });
    fadeUp('.concept-end > *', '.concept-end', { y: 20, stagger: 0.1 });

    window.addEventListener('load', refresh, { once: true });
  });
})();
