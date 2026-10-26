// OP-POP-ART — моушн концепта.
// Фирменная идея: «живая» оп-арт картина в hero — шахматное поле с кругами, которое выпучивается сферой,
// как на холстах оп-арта; сфера медленно дрейфует, на десктопе тянется за курсором, при прокрутке разрастается.
// В секции академии — два набора колец, которые при прокрутке расходятся и дают муар.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- оп-арт картина (canvas) ---------- */
  const INK = [20, 18, 22], PAPER = [243, 239, 231], VIOLET = [90, 65, 196], LEMON = [243, 223, 74];
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const smooth = v => v * v * (3 - 2 * v);

  function opArt(canvas) {
    const ctx = canvas.getContext('2d');
    const st = { intro: 1, grow: 0, t: 2.2, hover: 0, px: 0.5, py: 0.5 };
    let W = 0, H = 0, N = 12;

    function resize() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      N = W > 440 ? 14 : 12;
    }

    function draw() {
      if (!W) return;
      const t = st.t;
      // центр сферы: медленный дрейф по фигуре Лиссажу, на десктопе — к курсору
      const dx = 0.5 + 0.15 * Math.sin(t * 0.33), dy = 0.5 + 0.12 * Math.sin(t * 0.41 + 1.2);
      const cx = dx + (st.px - dx) * st.hover, cy = dy + (st.py - dy) * st.hover;
      const R = 0.4 + 0.03 * Math.sin(t * 0.7) + 0.16 * st.grow;
      const k = 0.95 * st.intro;
      // искажение «линзой»: r' = r + k·r·(1 − r) — центр увеличен, у края сжатие
      const warp = (x, y) => {
        const ox = x - cx, oy = y - cy, d = Math.hypot(ox, oy);
        if (d >= R || d < 1e-6) return [x * W, y * H];
        const r = d / R, f = (r + k * r * (1 - r)) / r;
        return [(cx + ox * f) * W, (cy + oy * f) * H];
      };
      const P = [];
      for (let i = 0; i <= N; i++) { P[i] = []; for (let j = 0; j <= N; j++) P[i][j] = warp(i / N, j / N); }

      ctx.fillStyle = mix(PAPER, PAPER, 0); ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const a = P[i][j], b = P[i + 1][j], c = P[i + 1][j + 1], d = P[i][j + 1];
        const mx = (i + 0.5) / N, my = (j + 0.5) / N;
        const depth = smooth(clamp01(1 - Math.hypot(mx - cx, my - cy) / R));
        // появление: клетки вырастают от центра к краям
        const s = smooth(clamp01((st.intro * 1.7 - Math.hypot(mx - 0.5, my - 0.5)) / 0.55));
        if (s <= 0) continue;
        const qx = (a[0] + b[0] + c[0] + d[0]) / 4, qy = (a[1] + b[1] + c[1] + d[1]) / 4;
        const sc = (p) => [qx + (p[0] - qx) * s, qy + (p[1] - qy) * s];
        const A = sc(a), B = sc(b), C = sc(c), D = sc(d);
        const dark = (i + j) % 2 === 0;
        const base = dark ? mix(INK, VIOLET, depth * 0.95) : mix(PAPER, LEMON, depth * 0.9);
        const dot = dark ? mix(PAPER, LEMON, depth * 0.9) : mix(INK, VIOLET, depth * 0.95);
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.lineTo(D[0], D[1]); ctx.closePath();
        ctx.fillStyle = base; ctx.fill();
        if (dark) { ctx.strokeStyle = base; ctx.lineWidth = 0.6; ctx.stroke(); }
        // круг в клетке: растёт к центру сферы
        const w = (Math.hypot(B[0] - A[0], B[1] - A[1]) + Math.hypot(C[0] - D[0], C[1] - D[1])) / 2;
        const h = (Math.hypot(D[0] - A[0], D[1] - A[1]) + Math.hypot(C[0] - B[0], C[1] - B[1])) / 2;
        const rr = 0.17 + 0.15 * depth;
        ctx.beginPath(); ctx.ellipse(qx, qy, w * rr, h * rr, 0, 0, Math.PI * 2);
        ctx.fillStyle = dot; ctx.fill();
      }
    }

    resize(); draw();
    if (window.ResizeObserver) new ResizeObserver(() => { resize(); draw(); }).observe(canvas);
    return { st, draw };
  }

  const art = $('.opart') ? opArt($('.opart')) : null;

  if (!animate) return; // reduced motion / нет GSAP: статичная картина и полностью видимая страница

  // Заголовок по буквам из-под маски (только words,chars — иначе перенос посреди слова)
  function revealChars(selector, trigger, vars = {}) {
    const split = SplitText.create(selector, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from(split.chars, {
      yPercent: 110, duration: 1, stagger: 0.03, ease: 'expo.out', ...vars,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const frame = $('.painting__frame');
    if (art) art.st.intro = 0, art.draw();

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => lead.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.15)
      .from(frame, { '--sh': '0px', borderColor: 'rgba(20,18,22,0)', duration: 0.9, ease: 'expo.out' }, 0.9)
      .to(art ? art.st : {}, { intro: 1, duration: 2.1, ease: 'power2.inOut' }, 0.2)
      .from('.wm .l', { yPercent: 70, rotation: 12, autoAlpha: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out' }, 0.45)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95, ease: 'expo.out' }, 0.95)
      .from('.sticker', { scale: 1.9, rotation: -40, autoAlpha: 0, duration: 0.55, ease: 'power3.in' }, 1.5)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25);

    /* Картина живёт: дрейф сферы, курсор на десктопе, рост сферы при прокрутке; рисуем, только пока видна */
    if (art) {
      let active = true;
      gsap.ticker.add((time) => { if (!active) return; art.st.t = 2.2 + time; art.draw(); });
      ScrollTrigger.create({ trigger: '.painting', start: 'top bottom', end: 'bottom top', onToggle: self => { active = self.isActive; } });
      gsap.to(art.st, { grow: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const p = $('.painting');
        p.addEventListener('pointermove', e => {
          const r = frame.getBoundingClientRect();
          gsap.to(art.st, { px: (e.clientX - r.left) / r.width, py: (e.clientY - r.top) / r.height, hover: 1, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
        });
        p.addEventListener('pointerleave', () => gsap.to(art.st, { hover: 0, duration: 1.4, ease: 'power2.inOut', overwrite: 'auto' }));
      }
    }

    /* ---------- 2. Академия ---------- */
    gsap.from('.academy .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.academy .sec-head', start: 'top 86%' } });
    revealChars('.academy h2', '.academy .sec-head');
    const poster = $('.poster');
    gsap.timeline({ scrollTrigger: { trigger: poster, start: 'top 82%' } })
      .fromTo(poster, { clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(150% at 50% 100%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.ring', { scale: 0.4, autoAlpha: 0, duration: 1.8, stagger: 0.15, ease: 'expo.out' }, 0.2);
    revealLines('.poster__lead', '.poster');
    gsap.from('.fact--year b', { yPercent: 40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.facts', start: 'top 90%' } });
    gsap.from(['.fact--year span', '.fact--online'], { x: -14, autoAlpha: 0, duration: 0.8, stagger: 0.12, delay: 0.25, scrollTrigger: { trigger: '.facts', start: 'top 90%' } });
    gsap.from('.step', { x: 34, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.steps', start: 'top 88%' } });
    // муар: второй набор колец уезжает относительно первого
    gsap.fromTo('.ring--b', { xPercent: -3, yPercent: 2 }, { xPercent: 3, yPercent: -3, ease: 'none', scrollTrigger: { trigger: poster, start: 'top bottom', end: 'bottom top', scrub: true } });

    /* ---------- 3. Арт-туры ---------- */
    gsap.from('.tours .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.tours .sec-head', start: 'top 86%' } });
    revealChars('.tours h2', '.tours .sec-head');
    gsap.from('.tours .sec-sub', { y: 14, autoAlpha: 0, duration: 0.8, delay: 0.3, scrollTrigger: { trigger: '.tours .sec-head', start: 'top 86%' } });
    $$('.ticket').forEach((t, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 88%' } });
      tl.from(t, { xPercent: i % 2 ? -22 : 22, rotation: i % 2 ? -4 : 4, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .from($('.ticket__code', t), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.7, ease: 'power3.out' }, 0.35)
        .from($('.ticket__more', t), { y: 10, autoAlpha: 0, duration: 0.6 }, 0.45);
      revealChars($('.ticket__city', t), t, { stagger: 0.05 });
    });
    gsap.from('.tours__all', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.tours__all', start: 'top 94%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
