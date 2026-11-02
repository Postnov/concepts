// Анастасия — моушн концепта. Фирменная идея — кривая роста на миллиметровке:
// график рисуется сам, точка едет по нему от «я ничего не понимаю» к «почему так легко, в чём подвох?»,
// а в карточках результатов баллы растут ровно на высоте точки (5 → 88). Цены появляются целиком, без счётчиков.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная версия: всё видно, точки стоят в конце графиков (см. styles.css)

  // Точка на кривой: доля t → позиция HTML-точки в процентах от рамки (viewBox совпадает с пропорциями рамки)
  // Штрих линий (pathLength="1") ведём из той же доли t — линия и точка всегда вместе
  function rider(path, dot, vb, lines = [path]) {
    const len = path.getTotalLength();
    lines.forEach(l => { l.style.strokeDasharray = '1 1'; });
    return t => {
      lines.forEach(l => { l.style.strokeDashoffset = String(1 - t); });
      const p = path.getPointAtLength(len * t);
      dot.style.left = (p.x / vb.w * 100) + '%';
      dot.style.top = (p.y / vb.h * 100) + '%';
      return p;
    };
  }
  // Рисование линии через pathLength="1": смещение штриха 1 → 0
  const drawFrom = { strokeDasharray: 1, strokeDashoffset: 1 };

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    // Курсивное имя режем на буквы без маски: маска подрезала бы наклонные хвосты
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw' });
    const curve = $('.plot__curve');
    const glow = $('.plot__curve-glow');
    const dot = $('.plot__dot');
    const ride = rider(curve, dot, { w: 1080, h: 950 }, [curve, glow]);
    const prog = { t: 0 };
    ride(0);

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 55, autoAlpha: 0, rotate: 7, stagger: 0.045, duration: 1, ease: 'expo.out' }, 0.3)
      .fromTo('.plot-photo', { clipPath: 'inset(0% 0% 100% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.1, ease: 'expo.inOut' }, 0.1)
      .from('.plot-photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.plot-photo__grid', { autoAlpha: 0, duration: 0.8, ease: 'none' }, 0.6)
      .fromTo('.plot__axis', drawFrom, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.1 }, 0.65)
      .from('.plot__arrow, .plot__ticks', { autoAlpha: 0, duration: 0.4 }, 1.15)
      .from('.plot__tick', { x: -6, autoAlpha: 0, stagger: 0.07, duration: 0.5 }, 1.05)
      .from('.plot__start', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(3)' }, 0.95)
      .from('.plot__dot', { scale: 0, duration: 0.45, ease: 'back.out(3)' }, 1.0)
      .from('.plot__label--from', { y: 10, scale: 0.9, autoAlpha: 0, transformOrigin: '0% 100%', duration: 0.55, ease: 'back.out(2)' }, 1.05)
      // Кривая рисуется, точка едет по ней
      .to(prog, { t: 1, duration: 1.6, ease: 'power2.inOut', onUpdate: () => ride(prog.t) }, 1.1)
      .from('.plot__label--to', { y: -10, scale: 0.9, autoAlpha: 0, transformOrigin: '100% 0%', duration: 0.6, ease: 'back.out(2)' }, 2.45)
      .from('.hero__caption', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.2)
      .from('.hero__body > *', { y: 18, autoAlpha: 0, stagger: 0.09, duration: 0.75 }, 0.85);

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 4.2 + i });
    });

    /* Лёгкий параллакс фото внутри рамки */
    gsap.to('.plot-photo img', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Форматы ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.formats .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 84%' } });
    $$('.fcard').forEach(card => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' }, defaults: { ease: 'power3.out' } });
      tl.from(card, { y: 46, autoAlpha: 0, duration: 0.95, ease: 'expo.out' });
      const facts = $$('.fcard__facts li', card);
      if (facts.length) tl.from(facts, { x: -10, autoAlpha: 0, stagger: 0.07, duration: 0.5 }, 0.3);
      const foot = $('.fcard__foot', card);
      // Пунктир над ценой «прочерчивается» слева направо, цена появляется целиком
      if (foot) tl.fromTo(foot, { '--axis': 0 }, { '--axis': 1, duration: 0.8, ease: 'power2.inOut' }, 0.35)
        .from($$('.price, .btn', foot), { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.55);
      $$('.prog', card).forEach((p, i) => {
        tl.from(p, { y: 24, autoAlpha: 0, duration: 0.7 }, 0.35 + i * 0.12)
          .from($('.prog__name b', p), { yPercent: 40, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 0.45 + i * 0.12);
      });
    });
    gsap.from('.formats__note', { x: -12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats__note', start: 'top 92%' } });

    /* ---------- 3. Результаты: график баллов с точкой и растущим числом ---------- */
    revealLines('.results h2', '.results .sec-head');
    gsap.from(['.results .eyebrow', '.results .sec-sub'], {
      y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: '.results .sec-head', start: 'top 84%' },
    });
    $$('.rcard').forEach(card => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 80%' }, defaults: { ease: 'power3.out' } });
      tl.from(card, { y: 56, rotate: -1.5, autoAlpha: 0, duration: 1, ease: 'expo.out' })
        .from($$('.rcard__name, .rcard__goal', card), { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.55 }, 0.2);
      const path = $('.score__curve', card);
      if (path) {
        const sdot = $('.score__dot', card);
        const num = $('.score__num', card);
        const from = +card.dataset.from;
        const to = +card.dataset.to;
        const go = rider(path, sdot, { w: 320, h: 170 });
        const p = { t: 0 };
        go(0);
        num.textContent = String(from);
        // Балл = высота точки на оси 0–100 (y = 160 − балл × 1,44)
        const show = () => {
          const pt = go(p.t);
          const v = p.t >= 1 ? to : Math.max(from, Math.min(to, Math.round((160 - pt.y) / 1.44)));
          num.textContent = String(v);
        };
        tl.from($('.score__grid', card), { autoAlpha: 0, duration: 0.5 }, 0.3)
          .fromTo($('.score__axis', card), drawFrom, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0.3)
          .from($$('.score__goal, .score__goal-label', card), { autoAlpha: 0, x: -10, duration: 0.6 }, 0.7)
          .from($$('.score__from, .score__dot, .score__to', card), { autoAlpha: 0, scale: 0.7, transformOrigin: '50% 50%', stagger: 0.06, duration: 0.45, ease: 'back.out(2.4)' }, 0.75)
          .to(p, { t: 1, duration: 1.7, ease: 'power2.inOut', onUpdate: show }, 1.0)
          .from($$('.rcard__row', card), { y: 10, autoAlpha: 0, stagger: 0.12, duration: 0.55 }, 1.5);
      } else {
        tl.from($$('.rcard__label, .rcard__list li', card), { x: -10, autoAlpha: 0, stagger: 0.08, duration: 0.55 }, 0.35)
          .from($('.rcard__quote', card), { y: 12, autoAlpha: 0, duration: 0.7 }, 0.8);
      }
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
