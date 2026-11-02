// Полина Шило — моушн концепта. Фирменная идея из её био «Распутываю сложное»:
// нить рисуется клубком и вытягивается в ровный «доверительный интервал» (усы по краям, точка оценки в центре).
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- нить: клубок → прямая. Чистый JS, работает и без GSAP ---------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  function makeThread(svg, opt) {
    // around — элемент, который нить «опутывает» клубком (слово «сложное»); без него клубок в центре своей полосы
    const o = { loops: 5.4, phase: 0.6, knot: 0.5, cap: 11, around: null, ...opt };
    const path = $('.thread__line', svg);
    const capL = $('.thread__cap--l', svg);
    const capR = $('.thread__cap--r', svg);
    const dot = $('.thread__dot', svg);
    const N = 260;
    const state = { p: 1, cap: 1, dot: 1 };
    let W = 0, H = 0, K = null;
    path.setAttribute('pathLength', '1');

    // Нить в клубке: ровно идёт по линии слева, у слова уходит в петли, выходит и ровно идёт вправо.
    // A..B — доля длины нити, ушедшая в клубок
    const A = 0.24, B = 0.76;
    const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
    const lerp = (a, b, t) => a + (b - a) * t;
    function point(s, p) {
      const x0 = 6, x1 = W - 6, ym = H / 2;
      const sx = lerp(x0, x1, s);
      const kl = K.x - K.rx * 0.7, kr = K.x + K.rx * 0.7;
      // Основа клубка: отрезки по линии сжаты, середина нити — в границах слова
      const bx = s < A ? lerp(x0, kl, s / A) : s > B ? lerp(kr, x1, (s - B) / (1 - B)) : lerp(kl, kr, (s - A) / (B - A));
      const w = smooth(A - 0.1, A + 0.05, s) * (1 - smooth(B - 0.05, B + 0.1, s));
      const th = Math.PI * 2 * o.loops * (s - A) / (B - A);
      const r = 0.86 + 0.14 * Math.sin(3.1 * th + o.phase);
      const kx = K.x + K.rx * r * (0.8 * Math.cos(th + o.phase) + 0.26 * Math.cos(2.13 * th));
      const ky = K.y + K.ry * r * (0.76 * Math.sin(th + o.phase) + 0.26 * Math.sin(1.57 * th + 1.2));
      const tx = lerp(bx, kx, w), ty = lerp(ym, ky, w);
      // Вытягивание: концы первыми, середина — последней
      const c = 1 - Math.abs(2 * s - 1);
      let e = Math.min(1, Math.max(0, p * 1.7 - 0.7 * c));
      e = e * e * (3 - 2 * e);
      return [lerp(tx, sx, e), lerp(ty, ym, e)];
    }
    function render() {
      if (!W) return;
      const pts = [];
      for (let i = 0; i <= N; i++) pts.push(point(i / N, state.p));
      // Catmull-Rom → кубические кривые: гладкая нить без изломов
      const f = v => v.toFixed(2);
      let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
      }
      path.setAttribute('d', d);
      const ym = H / 2, h = o.cap * state.cap;
      [[capL, 6], [capR, W - 6]].forEach(([c, x]) => {
        c.setAttribute('x1', x); c.setAttribute('x2', x);
        c.setAttribute('y1', ym - h); c.setAttribute('y2', ym + h);
        c.style.opacity = state.cap > 0.01 ? 1 : 0;
      });
      const cx = W / 2;
      dot.setAttribute('cx', cx); dot.setAttribute('cy', ym);
      dot.style.opacity = state.dot > 0.01 ? 1 : 0;
      dot.setAttribute('transform', `translate(${cx} ${ym}) scale(${Math.max(state.dot, 0.001)}) translate(${-cx} ${-ym})`);
    }
    function layout() {
      const r = svg.getBoundingClientRect();
      W = Math.round(r.width); H = Math.round(r.height);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      if (o.around) {
        // Клубок поверх слова: координаты слова в системе svg (svg с overflow: visible)
        const a = $(o.around).getBoundingClientRect();
        K = { x: a.left + a.width / 2 - r.left, y: a.top + a.height * 0.55 - r.top, rx: a.width * 0.62, ry: a.height * 0.95 };
      } else {
        K = { x: W * o.knot, y: H / 2, rx: Math.min(H * 0.95, W * 0.2), ry: H * 0.8 };
      }
      render();
    }
    layout();
    new ResizeObserver(layout).observe(svg);
    return { state, render, path, layout };
  }

  const heroThread = makeThread($('[data-thread="hero"]'), { loops: 6.2, around: '.hero__tag em' });
  const teachThread = makeThread($('[data-thread="teach"]'), { loops: 3.6, knot: 0.46, cap: 8, phase: 2.1 });

  if (!animate) return; // статичная страница: нить уже ровная

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  // Нить: рисуется клубком, затем вытягивается; усы и точка — в конце
  function threadTimeline(t, d = 1, hold = 0) {
    const s = t.state;
    // Начальное состояние — сразу, до старта: иначе до своей очереди нить висела бы ровной
    Object.assign(s, { p: 0, cap: 0, dot: 0 });
    t.render();
    const tl = gsap.timeline({ onUpdate: t.render });
    tl.fromTo(t.path, { strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.0 * d, ease: 'power2.inOut' })
      .to(s, { p: 1, duration: 1.4 * d, ease: 'power1.inOut' }, hold ? `+=${hold}` : `-=${0.15 * d}`)
      .to(s, { cap: 1, duration: 0.5 * d, ease: 'power3.out' }, `-=${0.22 * d}`)
      .to(s, { dot: 1, duration: 0.55 * d, ease: 'power3.out' }, '<0.12');
    return tl;
  }

  MotionBase.ready(() => {
    // Шрифты загружены — пересчитать, где слово «сложное», до нарезки текста
    heroThread.layout();
    teachThread.layout();

    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const tag = SplitText.create('.hero__tag', { type: 'lines', mask: 'lines' });
    const frame = $('.hero__photo .frame');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); tag.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__grid', { autoAlpha: 0, duration: 1.4, ease: 'power1.out' }, 0)
      .from('.meta > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(first.chars, { yPercent: 112, stagger: 0.04, duration: 1.0, ease: 'expo.out' }, 0.25)
      .from(last.chars, { yPercent: 112, stagger: 0.05, duration: 1.0, ease: 'expo.out' }, 0.45)
      .from(tag.lines, { yPercent: 100, duration: 0.9 }, 0.6)
      .add(threadTimeline(heroThread, 1, 0.25), 0.75)
      .from('.aud li', { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.0)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 6px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', duration: 1.3, ease: 'expo.inOut' }, 0.5)
      .from('.hero__photo img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.75)
      .from('.hero__photo figcaption', { y: 10, autoAlpha: 0, duration: 0.7 }, 1.4)
      .from(['.hero__hello', '.hero__aside'], { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.3)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.5);

    // Лёгкий параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero__photo', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    /* ---------- лента ---------- */
    gsap.from('.ticker', { autoAlpha: 0, duration: 1, scrollTrigger: { trigger: '.ticker', start: 'top 95%' } });

    /* ---------- 2. Консультации: карточки «проявляются» слева направо, как панели рисунка ---------- */
    revealLines('.consult h2', '.consult .sec-head');
    gsap.from('.consult .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.consult .sec-head', start: 'top 85%' } });
    $$('.ccard').forEach((card, i) => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' }, delay: i * 0.08 })
        .fromTo(card, { clipPath: 'inset(0% 100% 0% 0% round 8px)' }, { clipPath: 'inset(0% 0% 0% 0% round 8px)', duration: 1.1, ease: 'expo.inOut' })
        .from($('.ccard__n', card), { scale: 0.4, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.45)
        .from($$('.ccard__meta > :not(.ccard__n), .ccard__title, .ccard__note, .btn', card), { x: -18, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.5);
    });

    /* ---------- 3. Преподаю: заголовок по буквам, нить, строки оглавления ---------- */
    const teachH = SplitText.create('.teach h2', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ scrollTrigger: { trigger: '.teach .sec-head', start: 'top 80%' }, onComplete: () => teachH.revert() })
      .from('.teach .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7 }, 0)
      .from(teachH.chars, { yPercent: 112, stagger: 0.035, duration: 0.95, ease: 'expo.out' }, 0.05)
      .add(threadTimeline(teachThread, 0.75), 0.35);
    $$('.tgroup').forEach(g => {
      gsap.timeline({ scrollTrigger: { trigger: g, start: 'top 85%' } })
        .from($('.tgroup__who', g), { y: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out' })
        .fromTo($$('.toc li', g), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, stagger: 0.14, ease: 'expo.inOut' }, 0.2)
        .from($$('.toc__arrow', g), { rotate: -90, autoAlpha: 0, duration: 0.7, stagger: 0.14, ease: 'power3.out' }, 0.6);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
