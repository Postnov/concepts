// Ольга Кокшарова · OLYA.MATRIX — моушн концепта.
// Фирменная идея: «энергетическое полотно» — неоновая сетка с её баннера оживает. Полотно из тонких нитей
// течёт и перекручивается за портретом-зеркалом и перед ним, ускоряется от прокрутки (энергия откликается),
// а карточки практик «проходит чистка» — светящаяся нить пробегает по карточке и открывает её.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- энергетическое полотно на canvas ---------- */
  // Лента из N нитей: центр и ширина ленты — суммы синусов по x и времени; там, где ширина проходит через ноль,
  // лента перекручивается. Поперечные нити дают «сетку», как на её баннере. Цвет — по горизонтали: роза → сирень → мята.
  // Каждое полотно — одна или несколько лент; cy — центр по высоте canvas, wd — ширина ленты, k — частоты, p — фаза
  const PRESETS = {
    hero: [
      { lines: 44, cy: 0.44, a1: 0.17, a2: 0.07, wd: 0.22, k1: 3.1, k2: 6.4, k3: 4.2, p: 0.4, alpha: 0.5, cross: 3, colors: ['#ff4fae', '#c04dff', '#7a6bff', '#52f0b4'] },
      { lines: 30, cy: 0.6, a1: 0.12, a2: 0.06, wd: 0.15, k1: 2.4, k2: 7.2, k3: 3.3, p: 3.2, alpha: 0.4, cross: 4, speed: 0.8, colors: ['#52f0b4', '#6f7dff', '#d65bff', '#ff4fae'] },
    ],
    'hero-front': [
      { lines: 18, cy: 0.74, a1: 0.05, a2: 0.03, wd: 0.07, k1: 4.4, k2: 8.1, k3: 5.3, p: 2.3, alpha: 0.6, cross: 4, speed: 1.25, colors: ['#52f0b4', '#c97bff', '#ff5cb8'] },
    ],
    path: [
      { lines: 36, cy: 0.48, a1: 0.14, a2: 0.06, wd: 0.18, k1: 2.6, k2: 5.7, k3: 3.6, p: 4.1, alpha: 0.46, cross: 3, speed: 0.8, colors: ['#52f0b4', '#7d6bff', '#e5a8ff', '#ff5cb8'] },
      { lines: 22, cy: 0.56, a1: 0.1, a2: 0.05, wd: 0.11, k1: 3.4, k2: 6.6, k3: 4.8, p: 1.2, alpha: 0.34, cross: 4, speed: 1.1, colors: ['#ff5cb8', '#a35bff', '#52f0b4'] },
    ],
  };
  let scrollBoost = 0;

  function makeVeil(canvas) {
    const ribbons = PRESETS[canvas.dataset.veil];
    const ctx = canvas.getContext('2d');
    const st = { t: 1.5 + ribbons[0].p * 3, reveal: 1, flow: 1 };
    let w = 0, h = 0, raf = 0, last = 0, inView = false, live = false;

    function size() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function ribbon(o) {
      const t = st.t * (o.speed || 1), N = o.lines, step = 7;
      const cols = Math.ceil(w / step) + 1;
      // Размах — от высоты полотна, но не больше половины ширины (на десктопе полотно высокое)
      const S = Math.min(h, w * 0.75);
      const C = new Float32Array(cols), W = new Float32Array(cols);
      for (let j = 0; j < cols; j++) {
        const u = (j * step) / Math.max(w, 1);
        C[j] = h * o.cy + S * (o.a1 * Math.sin(u * o.k1 + t * 0.32 + o.p) + o.a2 * Math.sin(u * o.k2 - t * 0.21 + o.p * 1.7));
        W[j] = S * o.wd * Math.sin(u * o.k3 + t * 0.42 + o.p * 0.6) * (0.62 + 0.38 * Math.sin(u * 2.3 - t * 0.27));
      }
      const g = ctx.createLinearGradient(0, 0, w, 0);
      o.colors.forEach((c, i) => g.addColorStop(i / (o.colors.length - 1), c));
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = g;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < N; i++) {
        const s = i / (N - 1) - 0.5;
        // Края ленты бледнее середины
        ctx.globalAlpha = o.alpha * (0.3 + 0.7 * Math.pow(1 - Math.abs(s) * 2, 0.5));
        ctx.beginPath();
        for (let j = 0; j < cols; j++) {
          const x = j * step;
          const y = C[j] + s * W[j] * 2 + Math.sin(x * 0.018 + i * 0.45 + t * 0.9) * 1.4;
          if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      // Поперечные нити сетки
      ctx.globalAlpha = o.alpha * 0.32;
      ctx.beginPath();
      for (let j = 0; j < cols; j += o.cross) {
        const x = j * step;
        ctx.moveTo(x, C[j] - W[j]);
        ctx.lineTo(x, C[j] + W[j]);
      }
      ctx.stroke();
    }

    function draw() {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, w, h);
      if (!w || !h || st.reveal <= 0) return;
      ribbons.forEach(ribbon);
      // Проявление слева направо (интро): гасим всё правее «фронта»
      if (st.reveal < 1) {
        ctx.globalCompositeOperation = 'destination-in';
        ctx.globalAlpha = 1;
        const edge = st.reveal * (w + 220) - 60;
        const m = ctx.createLinearGradient(edge - 160, 0, edge, 0);
        m.addColorStop(0, 'rgba(0,0,0,1)');
        m.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = m;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    function tick(now) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      // Прокрутка разгоняет течение, потом оно плавно успокаивается
      st.flow += (1 + scrollBoost - st.flow) * 0.06;
      st.t += dt * st.flow;
      draw();
    }
    const play = () => { if (live && inView && !raf) { last = 0; raf = requestAnimationFrame(tick); } };
    const pause = () => { cancelAnimationFrame(raf); raf = 0; };

    size();
    draw();
    new ResizeObserver(() => { size(); draw(); }).observe(canvas);
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView ? play() : pause(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
    return { st, draw, start() { live = true; play(); } };
  }

  const veils = {};
  $$('canvas[data-veil]').forEach(c => { veils[c.dataset.veil] = makeVeil(c); });

  // Без анимаций — статичный кадр полотна (уже нарисован), всё остальное видно сразу
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: полотно втекает, зеркало открывается, имя поднимается ---------- */
    const heroVeils = [veils.hero, veils['hero-front']].filter(Boolean);
    heroVeils.forEach(v => { v.st.reveal = 0; v.draw(); v.start(); });
    if (veils.path) veils.path.start();

    const logo = SplitText.create('.hero__logo', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { logo.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .to(heroVeils.map(v => v.st), { reveal: 1, duration: 1.9, ease: 'power2.inOut', stagger: 0.2 }, 0.05)
      .from('.hero__halo', { scale: 0.5, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.2)
      .fromTo('.mirror', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.35)
      .from('.mirror img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.5)
      .from('.hero__ring', { scale: 0.86, autoAlpha: 0, duration: 1.2 }, 0.9)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.7)
      .from(logo.chars, { yPercent: 110, stagger: 0.045, duration: 1.1, ease: 'expo.out' }, 0.8)
      .from('.hero__name', { autoAlpha: 0, letterSpacing: '.6em', duration: 1.2 }, 1.15)
      .from(lead.lines, { yPercent: 100, stagger: 0.1, duration: 1 }, 1.2)
      .from('.hero__bio', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.45)
      .from('.marks li', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.55)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.7);

    // Свет медленно обходит зеркало
    gsap.to('.hero__ring', { rotate: 360, duration: 16, ease: 'none', repeat: -1 });

    // Энергия откликается на прокрутку: скорость прокрутки разгоняет течение полотна
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => { scrollBoost = Math.min(5, Math.abs(self.getVelocity()) / 700); },
    });
    gsap.ticker.add(() => { scrollBoost *= 0.92; });

    // Портрет чуть отстаёт при прокрутке
    gsap.to('.hero__portrait', {
      yPercent: -10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Практики: по каждой карточке проходит «чистка» ---------- */
    revealLines('.practices h2', '.practices .sec-head');
    gsap.from('.practices .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.practices .sec-head', start: 'top 84%' } });
    $$('.rite').forEach(card => {
      const sweep = $('.rite__sweep', card);
      const parts = $$('.rite__meta, .rite__title, .rite__text, .rite__note, .rite__list li, .btn', card);
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' } })
        .fromTo(card, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'power2.inOut', clearProps: 'clipPath' }, 0)
        .fromTo(sweep, { x: 0, autoAlpha: 1 }, { x: () => card.offsetWidth, duration: 1.15, ease: 'power2.inOut' }, 0)
        .to(sweep, { autoAlpha: 0, duration: 0.3 }, 1)
        .from(parts, { x: -16, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: 'power2.out' }, 0.3);
    });
    const moon = $('.rite__moon path');
    if (moon) {
      const len = moon.getTotalLength();
      gsap.fromTo(moon, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', delay: 0.5,
        scrollTrigger: { trigger: '.rite--tarot', start: 'top 86%' },
      });
      gsap.from('.rite__moon circle', { scale: 0, transformOrigin: '50% 50%', autoAlpha: 0, stagger: 0.2, duration: 0.8, delay: 1.6, scrollTrigger: { trigger: '.rite--tarot', start: 'top 86%' } });
    }

    /* ---------- 3. Курс: путь светится по мере прокрутки ---------- */
    revealLines('.path h2', '.path .sec-head');
    gsap.from(['.path .eyebrow', '.path__lead', '.path .sec-head .btn'], {
      y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.path .sec-head', start: 'top 82%' },
    });
    // Путь прочерчивается один раз, точки загораются, когда линия до них доходит
    const steps = $$('.step');
    const path = gsap.timeline({ scrollTrigger: { trigger: '.steps', start: 'top 74%' } })
      .to('.steps__rail span', { scaleY: 1, duration: 0.8 * steps.length, ease: 'none' }, 0);
    steps.forEach((step, i) => {
      path.call(() => step.classList.add('is-lit'), null, i * 0.8 + 0.05)
        .from($('p', step), { x: 22, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, i * 0.8);
    });
    gsap.from('.mentor > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.mentor', start: 'top 88%' } });
    revealLines('.voice__quote', '.voice');
    gsap.from('.voice .btn', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.voice', start: 'top 78%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
