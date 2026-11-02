// Лариса Гафурова — моушн концепта. Фирменная идея: линия «напряжение → покой» — рваная линия расслабляется в ровную волну.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const EMBER = '#b9552a';
  const CALM = 'rgba(42,31,25,.3)';

  /* ---------- линия напряжения: t=1 — рваная, t=0 — спокойная волна ---------- */
  const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  function tensionLine(svg, o = {}) {
    const path = $('path', svg);
    const vb = svg.viewBox.baseVal;
    const n = o.n || 56, cycles = o.cycles || 2.2, amp = o.amp || vb.height * 0.42, calm = o.calm ?? 0.42;
    const st = { t: 0, phase: o.phase || 0, path };
    st.draw = () => {
      const mid = vb.height / 2;
      let d = '';
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const env = Math.pow(Math.sin(Math.PI * (0.03 + 0.94 * u)), 0.5);
        const zig = (i % 2 ? 1 : -1) * (0.42 + 0.58 * hash(i + (o.seed || 0)));
        const wave = Math.sin(u * Math.PI * 2 * cycles + st.phase);
        const y = mid + amp * env * (st.t * zig + (1 - st.t) * calm * wave);
        d += (i ? 'L' : 'M') + (u * vb.width).toFixed(1) + ' ' + y.toFixed(2);
      }
      path.setAttribute('d', d);
    };
    st.draw();
    return st;
  }
  // спокойное состояние сразу — страница полностью читается и без анимации
  const heroLine = tensionLine($('.pulse--hero'), { n: 72, cycles: 2.4, amp: 17 });
  const rows = $$('.issue').map((row, i) => ({ row, st: tensionLine($('.tl', row), { n: 64, cycles: 3, amp: 6.5, calm: 0.38, seed: i * 17 }) }));

  /* ---------- без анимации: всё уже на месте ---------- */
  if (!animate) return;

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name .nm', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    heroLine.t = 1; heroLine.draw();
    gsap.set(heroLine.path, { stroke: EMBER });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__photo', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.35, ease: 'expo.inOut' }, 0.05)
      .from('.hero__photo img', { scale: 1.34, duration: 2, ease: 'expo.out' }, 0.2)
      .from('.hero__glow', { scale: 0.55, autoAlpha: 0, duration: 2.2, ease: 'expo.out' }, 0.5)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.55)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.6)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.55)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.95)
      .from('.hero__dm', { y: 12, autoAlpha: 0, duration: 0.7 }, 2.1)
      // напряжение уходит: рваная линия расслабляется в волну
      .to(heroLine, { t: 0, duration: 2.6, ease: 'power2.inOut', onUpdate: heroLine.draw }, 1.0);
    // после — линия «дышит» медленной волной
    gsap.to(heroLine, { phase: Math.PI * 2, duration: 11, ease: 'none', repeat: -1, delay: 3.6, onUpdate: heroLine.draw });
    // свет лампы чуть дышит
    gsap.to('.hero__glow', { scale: 1.07, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4 });

    /* Блик на главных кнопках раз в несколько секунд */
    $$('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.2, delay: 3 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo img', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Проблемы ---------- */
    revealLines('.issues h2', '.issues .sec-head');
    gsap.from('.issues .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.issues .sec-head', start: 'top 86%' } });
    rows.forEach(({ row, st }) => {
      st.t = 1; st.draw();
      gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%' } })
        .from($$('.issue__n, .issue__t, .issue__d', row), { y: 20, autoAlpha: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out' }, 0.1)
        .fromTo(st.path, { stroke: EMBER }, { stroke: CALM, duration: 1.9, ease: 'power1.inOut' }, 0)
        .to(st, { t: 0, duration: 1.9, ease: 'power2.inOut', onUpdate: st.draw }, 0);
    });

    /* ---------- 3. Услуги ---------- */
    revealLines('.plans h2', '.plans .sec-head');
    gsap.from('.plans .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.plans .sec-head', start: 'top 86%' } });
    gsap.to('.plans__lamp', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.plans', start: 'top bottom', end: 'bottom top', scrub: true } });
    $$('.plan').forEach(plan => {
      gsap.timeline({ scrollTrigger: { trigger: plan, start: 'top 84%' } })
        .from(plan, { clipPath: 'inset(0% 0% 100% 0% round 26px)', duration: 1.25, ease: 'expo.inOut' })
        .from($('.plan__img img', plan), { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.1)
        .from($$('.plan__meta, .plan__title, .plan__price, .btn', plan), { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.7);
    });
    gsap.from('.plans__place', { x: -14, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.plans__place', start: 'top 94%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
