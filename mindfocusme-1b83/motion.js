// Катерина Суратова — моушн концепта. Фирменная идея — «наводка фокуса» (mindfocus):
// портрет в объективе наводится на резкость поворотом кольца, затем фокус по очереди переходит по её словам
// (устойчивость → жизнелюбие → доброту → аутентичность → чувство собственного достоинства), кольцо доворачивается с каждым шагом.
// Секции проявляются из расфокуса, карточки — как рамка автофокуса, которая захватывает цель. Фон — пятна боке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- шкала на кольце объектива: рисуем и без GSAP ---------- */
  const ticks = $('.lens__ticks');
  if (ticks) {
    const NS = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 120; i++) {
      const a = (i * 3 * Math.PI) / 180;
      const r1 = i % 10 === 0 ? 101 : i % 5 === 0 ? 104.5 : 107;
      const r2 = 112;
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', (150 + r1 * Math.sin(a)).toFixed(2));
      line.setAttribute('y1', (150 - r1 * Math.cos(a)).toFixed(2));
      line.setAttribute('x2', (150 + r2 * Math.sin(a)).toFixed(2));
      line.setAttribute('y2', (150 - r2 * Math.cos(a)).toFixed(2));
      if (i === 0) line.setAttribute('class', 'tick-zero');
      else if (i % 10 === 0) line.setAttribute('class', 'tick-long');
      ticks.append(line);
    }
  }

  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => ScrollTrigger.refresh();
  const css = getComputedStyle(document.documentElement);
  const C = { ink: css.getPropertyValue('--ink').trim(), coral: css.getPropertyValue('--coral-ink').trim() };
  const desktop = matchMedia('(min-width: 900px)').matches;

  // Проявление из расфокуса: размытие уходит, масштаб чуть «дышит», как у объектива при наводке
  function focusIn(targets, trigger, vars = {}) {
    return gsap.fromTo(targets,
      { autoAlpha: 0, filter: 'blur(12px)', scale: 1.035 },
      {
        autoAlpha: 1, filter: 'blur(0px)', scale: 1, duration: 1.25, ease: 'power2.out', stagger: 0.14,
        clearProps: 'filter,transform', ...vars,
        scrollTrigger: { trigger, start: 'top 84%' },
      });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: наводка на резкость ---------- */
    const ring = $('.lens__ring');
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.bokeh i', { autoAlpha: 0, scale: 0.6, duration: 2.2, stagger: 0.08, ease: 'power2.out' }, 0)
      .from('.lens__aura', { autoAlpha: 0, scale: 0.7, duration: 1.8, ease: 'expo.out' }, 0.1)
      .fromTo(ring, { rotation: -110, autoAlpha: 0 }, { rotation: 0, autoAlpha: 1, duration: 2.1, ease: 'expo.out' }, 0.15)
      .from('.lens__photo', { scale: 0.86, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.1)
      .fromTo('.lens__photo img', { filter: 'blur(18px)', scale: 1.16 }, { filter: 'blur(0px)', scale: 1, duration: 1.9, ease: 'power2.inOut', clearProps: 'filter' }, 0.2)
      .from('.lens__index', { y: -10, autoAlpha: 0, duration: 0.6 }, 1.2)
      .fromTo(['.hero__first', '.hero__last'],
        { autoAlpha: 0, filter: 'blur(14px)', scale: 1.06 },
        { autoAlpha: 1, filter: 'blur(0px)', scale: 1, duration: 1.4, stagger: 0.18, ease: 'power2.out', clearProps: 'filter,transform' }, 0.5)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.8 }, 0.95)
      .fromTo('.creed', { autoAlpha: 0, filter: 'blur(8px)' }, { autoAlpha: 1, filter: 'blur(0px)', duration: 1.1, clearProps: 'filter' }, 1.05)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 1.3);

    /* Фокус переходит по её словам; в конце круга вся фраза снова резкая */
    const groups = [0, 1, 2, 3, 4].map(i => $$(`.val[data-v="${i}"]`));
    const focusOn = i => {
      groups.forEach((g, k) => {
        const sharp = i < 0 || k === i;
        gsap.to(g, {
          filter: `blur(${sharp ? 0 : 1}px)`, opacity: sharp ? 1 : 0.5, color: k === i ? C.coral : C.ink,
          duration: 0.9, ease: 'power2.inOut', overwrite: 'auto',
        });
      });
      gsap.to(ring, { rotation: '+=24', duration: 1.2, ease: 'power3.inOut' });
    };
    const rack = gsap.timeline({ repeat: -1, paused: true });
    [0, 1, 2, 3, 4, -1].forEach(i => rack.call(focusOn, [i]).to({}, { duration: i < 0 ? 3.4 : 2.3 }));
    intro.call(() => rack.play(), null, 2.3);
    // За пределами первого экрана цикл не крутим
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onLeave: () => rack.pause(), onEnterBack: () => intro.progress() === 1 && rack.play(),
    });

    /* Объектив чуть отстаёт при прокрутке */
    gsap.to('.lens', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* Боке медленно плывёт и уходит в глубину при прокрутке */
    $$('.bokeh i').forEach(b => gsap.to(b, {
      x: gsap.utils.random(-46, 46), y: gsap.utils.random(-56, 56),
      duration: gsap.utils.random(9, 15), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1,
    }));
    gsap.to('.bokeh', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: true } });

    /* ---------- 2. Программы: рамка автофокуса ---------- */
    focusIn('.programs h2', '.programs .sec-head');
    gsap.from('.programs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.programs .sec-head', start: 'top 84%' } });
    $$('.prog').forEach((card, i) => {
      const af = $$('.af', card);
      const body = [...card.children].filter(n => !n.classList.contains('af'));
      const tl = gsap.timeline({ delay: desktop ? i * 0.14 : 0, scrollTrigger: { trigger: card, start: 'top 86%' } });
      tl.from(card, { y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
        .fromTo(body, { filter: 'blur(10px)', autoAlpha: 0 }, { filter: 'blur(0px)', autoAlpha: 1, duration: 1.0, stagger: 0.06, ease: 'power2.out', clearProps: 'filter' }, 0.2)
        .from(af, { x: k => [-18, 18, -18, 18][k], y: k => [-18, -18, 18, 18][k], autoAlpha: 0, duration: 0.75, ease: 'expo.out' }, 0.15)
        // захват: уголки дважды вспыхивают коралловым и возвращаются
        .to(af, { borderColor: C.coral, opacity: 1, duration: 0.12, repeat: 3, yoyo: true, ease: 'none' }, 0.85);
    });

    /* ---------- 3. Подписка: шкала от 1 до 6 ---------- */
    gsap.from('.sub .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.sub__head', start: 'top 84%' } });
    focusIn('.sub__title > *', '.sub__head', { stagger: 0.2 });
    gsap.timeline({ scrollTrigger: { trigger: '.scale', start: 'top 90%' } })
      .fromTo('.scale__fill', { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: 'power2.inOut' })
      .fromTo('.scale__marks span', { opacity: 0.2, y: 6 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.28, ease: 'power2.out' }, 0.05);
    gsap.from('.sub__text', { y: 22, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.sub__body', start: 'top 88%' } });
    gsap.from('.sub__body .btn', { y: 16, autoAlpha: 0, duration: 0.7, delay: 0.15, scrollTrigger: { trigger: '.sub__body', start: 'top 88%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
