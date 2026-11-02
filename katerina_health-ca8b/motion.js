// Екатерина — моушн концепта. Фирменное: «кривая датчика» — линия после еды поднимается и возвращается в спокойный коридор, по ней идёт точка.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- кривая под реальную ширину сцены (чтобы линия не плющилась) ---------- */
  const svg = $('.trace__svg');
  const line = $('.trace__line');
  const dot = $('.trace__dot');
  const pulse = $('.trace__pulse');
  const H = 170;
  const PTS = 'M0 112 C40 108 70 116 110 110 S160 104 190 92 C215 64 235 52 262 58 C300 66 320 108 360 116 S420 110 450 102 C475 72 500 44 530 48 C570 54 590 106 630 116 S690 110 715 96 C735 74 752 64 775 70 C790 74 796 92 800 102';
  function buildCurve() {
    const w = svg.getBoundingClientRect().width || 390;
    // мобильная ширина: показываем ту же форму, растянутую по x; сама ширина viewBox = пикселям — штрих без искажения
    const k = w / 800;
    const d = PTS.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${(x * k).toFixed(1)} ${y}`);
    svg.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    line.setAttribute('d', d);
  }
  buildCurve();
  const movePoint = p => {
    const len = line.getTotalLength();
    const pt = line.getPointAtLength(len * p);
    [dot, pulse].forEach(c => { c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); });
  };

  /* ---------- вертикальные цели нужны и без GSAP: линия просто показана ---------- */
  if (!animate) {
    movePoint(0.46);
    return;
  }

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 85%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set([dot, pulse], { autoAlpha: 0 });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.trace__band', { scaleY: 0, transformOrigin: '50% 50%', duration: 1, ease: 'expo.out' }, 0.1)
      .to(line, { strokeDashoffset: 0, duration: 2.6, ease: 'power1.inOut' }, 0.25)
      .from('.trace__ticks span', { y: 10, autoAlpha: 0, stagger: 0.15, duration: 0.6 }, 1.0)
      .fromTo('.plate__ring', { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.3, ease: 'expo.out' }, 0.35)
      .fromTo('.plate__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(72% at 50% 50%)', duration: 1.3, ease: 'expo.inOut' }, 0.45)
      .from('.plate__photo img', { scale: 1.45, duration: 1.9, ease: 'expo.out' }, 0.5)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.5)
      .from(name.chars, { yPercent: 115, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.6)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.95)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3);

    // Точка датчика гуляет по кривой: после еды чуть вверх и обратно в коридор
    const st = { p: 0 };
    gsap.set([dot, pulse], { autoAlpha: 1 });
    movePoint(0);
    const walker = gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: 1.2 });
    walker.to(st, { p: 1, duration: 9, ease: 'none', onUpdate: () => movePoint(st.p) })
      .to([dot, pulse], { autoAlpha: 0, duration: 0.4 })
      .set(st, { p: 0 })
      .call(() => movePoint(0))
      .to([dot, pulse], { autoAlpha: 1, duration: 0.4 });
    gsap.fromTo(pulse, { attr: { r: 5 }, opacity: 0.6 }, { attr: { r: 15 }, opacity: 0, duration: 1.5, repeat: -1, ease: 'power1.out' });

    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    gsap.to('.plate', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Датчик ---------- */
    revealLines('.sensor h2', '.sensor .sec-head');
    gsap.from('.sensor .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.sensor .sec-head', start: 'top 85%' } });

    const fp = $('.feature__curve path');
    const fl = fp.getTotalLength();
    gsap.set(fp, { strokeDasharray: fl, strokeDashoffset: fl });
    const ft = gsap.timeline({ scrollTrigger: { trigger: '.feature', start: 'top 80%' }, defaults: { ease: 'power3.out' } });
    ft.fromTo('.feature', { clipPath: 'inset(0% 0% 100% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.3, ease: 'expo.inOut' })
      .to(fp, { strokeDashoffset: 0, duration: 2.2, ease: 'power1.inOut' }, 0.3)
      .from('.feature__tag, .feature__title', { y: 22, autoAlpha: 0, stagger: 0.12, duration: 0.9 }, 0.7)
      .from('.feature .price', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0);
    gsap.from(['.feature__fit', '.feature__cols .note', '.feature__sub'], {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.feature__fit', start: 'top 88%' },
    });
    gsap.from('.feature .checks li', {
      x: -16, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.feature .checks', start: 'top 88%' },
    });

    /* ---------- 3. Тарифы ---------- */
    revealLines('.tariffs h2', '.tariffs .sec-head');
    gsap.from('.tariffs .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.tariffs .sec-head', start: 'top 85%' } });
    $$('.plan').forEach(plan => {
      gsap.from(plan, {
        y: 54, rotateX: -10, transformPerspective: 900, transformOrigin: '50% 100%', autoAlpha: 0,
        duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: plan, start: 'top 88%' },
      });
      gsap.from($$('.price, .plan__fit', plan), { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: plan, start: 'top 80%' } });
      gsap.from($$('.checks li', plan), {
        x: -14, autoAlpha: 0, duration: 0.6, stagger: 0.09, ease: 'power2.out',
        scrollTrigger: { trigger: $('.checks', plan), start: 'top 90%' },
      });
    });
    gsap.from('.tariffs__cta', { y: 20, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.tariffs__cta', start: 'top 94%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    let rw = innerWidth;
    addEventListener('resize', () => {
      if (innerWidth === rw) return;
      rw = innerWidth;
      buildCurve();
      gsap.set(line, { strokeDasharray: 'none', strokeDashoffset: 0 });
    });
    addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
