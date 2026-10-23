// Лилия Воронкова — моушн концепта.
// Фирменная идея: двойная спираль ДНК (🧬 из её био). В hero она собирается из точек и медленно вращается,
// а точки пересечения нитей по очереди «подсвечивают» четыре опоры её подхода: тело · гормоны · сознание · мышление.
// Прокрутка подкручивает спираль; в тёмном блоке сопровождения та же спираль идёт фоном.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- спираль: чистый SVG, рисуется и без GSAP ---------- */
  function Helix(svg, o) {
    const st = { amp: 1, reveal: 1, phase: o.phase || 0 };
    let L = 0, C = 0, k = 0, rungs = [], pa, pb;
    const el = (tag, cls) => {
      const e = document.createElementNS(NS, tag);
      if (cls) e.setAttribute('class', cls);
      svg.appendChild(e);
      return e;
    };
    const pt = (u, v) => (o.vertical ? [v, u] : [u, v]);
    function build() {
      const r = svg.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      L = o.vertical ? r.height : r.width;
      C = o.vertical ? r.width : r.height;
      svg.setAttribute('viewBox', `0 0 ${r.width.toFixed(1)} ${r.height.toFixed(1)}`);
      svg.textContent = '';
      k = o.wave ? (2 * Math.PI) / o.wave : (o.halfTurns * Math.PI) / L;
      pb = el('path', 's-b');
      pa = el('path', 's-a');
      const n = Math.max(2, Math.round(L / o.step));
      rungs = [];
      for (let i = 0; i <= n; i++) {
        rungs.push({ u: (i * L) / n, line: el('line'), b: el('circle', 'd-b'), a: el('circle', 'd-a') });
      }
      return true;
    }
    function draw() {
      if (!L) return;
      const mid = C / 2, A = (C / 2) * o.amp * st.amp, lim = st.reveal * L;
      let da = '', db = '';
      for (let u = 0; u <= lim; u += 3) {
        const s = Math.sin(u * k + st.phase);
        const [x1, y1] = pt(u, mid + A * s), [x2, y2] = pt(u, mid - A * s);
        da += `${u ? 'L' : 'M'}${x1.toFixed(1)} ${y1.toFixed(1)}`;
        db += `${u ? 'L' : 'M'}${x2.toFixed(1)} ${y2.toFixed(1)}`;
      }
      pa.setAttribute('d', da || 'M0 0');
      pb.setAttribute('d', db || 'M0 0');
      for (const r of rungs) {
        const on = r.u <= lim;
        const th = r.u * k + st.phase, s = Math.sin(th), z = Math.cos(th);
        const [ax, ay] = pt(r.u, mid + A * s), [bx, by] = pt(r.u, mid - A * s);
        r.line.setAttribute('x1', ax.toFixed(1)); r.line.setAttribute('y1', ay.toFixed(1));
        r.line.setAttribute('x2', bx.toFixed(1)); r.line.setAttribute('y2', by.toFixed(1));
        r.line.style.opacity = on ? 0.32 : 0;
        // глубина: точка «спереди» крупнее и ярче
        r.a.setAttribute('cx', ax.toFixed(1)); r.a.setAttribute('cy', ay.toFixed(1));
        r.a.setAttribute('r', (o.dot * (0.72 + 0.38 * z)).toFixed(2));
        r.a.style.opacity = on ? (0.35 + 0.65 * (z + 1) / 2).toFixed(2) : 0;
        r.b.setAttribute('cx', bx.toFixed(1)); r.b.setAttribute('cy', by.toFixed(1));
        r.b.setAttribute('r', (o.dot * (0.72 - 0.38 * z)).toFixed(2));
        r.b.style.opacity = on ? (0.3 + 0.6 * (1 - z) / 2).toFixed(2) : 0;
      }
      if (o.onDraw) o.onDraw(k, st.phase, L);
    }
    return { st, build, draw, get len() { return L; } };
  }

  // Подсветка опор: чем ближе точка пересечения нитей к подписи, тем ярче подпись
  const labels = $$('.pillars__list li');
  const band = Helix($('.helix--band'), {
    halfTurns: 3, step: 12, amp: 0.78, dot: 3.1, phase: 0.9,
    onDraw(k, phase, L) {
      labels.forEach((li, j) => {
        const th = (((j + 0.5) * L) / labels.length) * k + phase;
        let d = ((th % Math.PI) + Math.PI) % Math.PI;
        d = Math.min(d, Math.PI - d);
        li.style.setProperty('--hi', Math.max(0, 1 - d / (Math.PI * 0.28)).toFixed(3));
      });
    },
  });
  const ghostSvg = $('.helix--ghost');
  const ghost = ghostSvg ? Helix(ghostSvg, { vertical: true, wave: 420, step: 22, amp: 0.62, dot: 3.6, phase: 0.3 }) : null;
  const helixes = [band, ghost].filter(Boolean);
  const rebuild = () => helixes.forEach(h => h.build() && h.draw());
  rebuild();
  let rw = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === rw) return; // мобильная адресная строка меняет только высоту
    rw = window.innerWidth;
    rebuild();
  });

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- спирали: вращение во времени + подкрутка прокруткой ---------- */
    // рисуем только видимые спирали
    const visible = new Map(helixes.map(h => [h, true]));
    const bySvg = new Map([[$('.helix--band'), band], [ghostSvg, ghost]].filter(([s, h]) => s && h));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => visible.set(bySvg.get(e.target), e.isIntersecting)));
      bySvg.forEach((h, s) => io.observe(s));
    }
    let lastY = window.scrollY, spin = 0;
    gsap.ticker.add((time, dt) => {
      const y = window.scrollY;
      spin += (y - lastY) * 0.008;
      lastY = y;
      const step = Math.min(dt, 50) / 1000;
      const boost = spin * 0.12;
      spin -= boost;
      band.st.phase -= 0.62 * step + boost;
      if (ghost) ghost.st.phase -= 0.35 * step + boost * 1.4;
      helixes.forEach(h => visible.get(h) && h.draw());
    });

    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const frame = $('.hero__frame');
    band.st.amp = 0; band.st.reveal = 0; band.draw();

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(frame, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.05)
      .fromTo('.scan', { y: 0, autoAlpha: 1 }, { y: () => frame.offsetHeight * 0.92, duration: 1.5, ease: 'expo.inOut' }, 0.05)
      .to('.scan', { autoAlpha: 0, duration: 0.4 }, 1.4)
      .from('.hero__frame img', { scale: 1.18, duration: 2.2, ease: 'expo.out' }, 0.2)
      .from('.chip', { y: 10, autoAlpha: 0, duration: 0.7 }, 0.9)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.55)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.95)
      // спираль «собирается»: нити прорастают слева направо и раскрываются по амплитуде
      .to(band.st, { reveal: 1, duration: 1.6, ease: 'power2.inOut' }, 1.0)
      .to(band.st, { amp: 1, duration: 1.8, ease: 'expo.out' }, 1.3)
      .from('.pillars__list li', { y: 10, autoAlpha: 0, stagger: 0.09, duration: 0.6 }, 1.5)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.45)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.6);

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.2, delay: 2.6 + i * 0.7 });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__frame img', {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Консультация ---------- */
    revealLines('.consult h2', '.consult .sec-head');
    gsap.from(['.consult .eyebrow', '.consult .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.consult .sec-head', start: 'top 82%' },
    });
    gsap.from('.consult .protocol__title', {
      autoAlpha: 0, x: -10, duration: 0.7,
      scrollTrigger: { trigger: '.consult__grid', start: 'top 85%' },
    });
    gsap.to('.protocol__rail span', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.protocol__list', start: 'top 72%', end: 'bottom 55%', scrub: true },
    });
    $$('.protocol__list li').forEach(li => {
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 84%' } })
        .from($('.protocol__n', li), { scale: 0, duration: 0.7, ease: 'back.out(2.2)' })
        .from($('p', li), { x: -14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.1);
    });
    gsap.from('.after__item:not(.after__item--wide)', {
      y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.after__list', start: 'top 86%' },
    });
    gsap.fromTo('.after__item--wide',
      { clipPath: 'inset(0% 100% 0% 0% round 18px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: '.after__item--wide', start: 'top 88%' } });

    // «Это не быстрый совет…» — слова проявляются по мере чтения (прокрутки)
    const stmt = SplitText.create('.statement', { type: 'words', wordsClass: 'sw' });
    gsap.fromTo(stmt.words, { opacity: 0.14 }, {
      opacity: 1, duration: 0.7, ease: 'power1.out', stagger: 0.09,
      scrollTrigger: { trigger: '.statement', start: 'top 74%' },
      onComplete: () => stmt.revert(),
    });

    gsap.timeline({ scrollTrigger: { trigger: '.price', start: 'top 86%' } })
      .from('.price', { y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out' })
      .from('.price__value', { yPercent: 40, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out' }, 0.25)
      .from('.price .btn', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.45);

    /* ---------- 3. Закрытое сопровождение ---------- */
    revealLines('.club h2', '.club .sec-head');
    gsap.from('.club .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.club .sec-head', start: 'top 82%' } });
    const big = SplitText.create('.club__big', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ scrollTrigger: { trigger: '.club__term', start: 'top 84%' }, onComplete: () => big.revert() })
      .from(big.chars, { yPercent: 110, stagger: 0.05, duration: 1.1, ease: 'expo.out' })
      .from('.club__small', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.4);
    gsap.from('.club__rare', { x: -18, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.club__rare', start: 'top 88%' } });
    gsap.from('.club__h', { autoAlpha: 0, y: 10, duration: 0.7, stagger: 0.2, scrollTrigger: { trigger: '.club__includes', start: 'top 85%' } });
    const items = $$('.club__list li');
    gsap.set(items, { x: 24, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' }),
    });
    gsap.from('.tags li', {
      scale: 0.86, autoAlpha: 0, duration: 0.6, stagger: 0.07, ease: 'back.out(1.8)',
      scrollTrigger: { trigger: '.tags', start: 'top 88%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.club__price', start: 'top 86%' } })
      .from('.club__price', { y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out' })
      .from('.club__value', { yPercent: 35, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.25)
      .from(['.club__note', '.club__price .btn'], { y: 12, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, 0.45);
    if (ghost) {
      ghost.st.reveal = 0;
      ghost.draw();
      gsap.to(ghost.st, { reveal: 1, duration: 2.6, ease: 'power2.inOut', onUpdate: ghost.draw, scrollTrigger: { trigger: '.club', start: 'top 70%' } });
    }

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
