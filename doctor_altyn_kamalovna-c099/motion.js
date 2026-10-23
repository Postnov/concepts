// Алтын Камаловна — моушн концепта. Фирменная идея — «полутоновый растр», как иллюстрация в научном журнале:
// тысячи разрозненных точек слетаются и складываются в её портрет (из хаоса — ясная картина), фото проявляется из растра,
// а точки вокруг продолжают тихо расходиться волнами. Ниже тот же растр: «мифы» без доказательной базы рассыпаются в точки,
// точечные линейки «печатаются» под пунктами и ценами.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- растр портрета (canvas): работает и без GSAP — тогда рисуется один раз, статично ---------- */
  const fig = $('.hero__stage');
  const canvas = $('.raster__canvas');
  const photoWrap = $('.hero__photo');
  const photo = $('.hero__photo img');
  const ctx = canvas.getContext('2d');
  const PLUM = '#5c2239';
  const CRIMSON = '#a8174f';
  // Состояние: gather — сбор точек (0 → 1), reveal — проявление фото (0 → 1), scroll — уход hero (0 → 1), time — секунды для волн
  const state = { gather: 1, reveal: 1, scroll: 0, time: 0 };
  let dots = [];
  let geo = null;

  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeOut = t => 1 - Math.pow(1 - t, 4);
  // Детерминированный «случай», чтобы раскладка точек не менялась от запуска к запуску
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  function build() {
    const W = fig.clientWidth;
    const H = fig.clientHeight;
    if (!W || !H || !photo.naturalWidth) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const R = photoWrap.offsetWidth / 2;
    const cx = W / 2;
    const cy = H * 0.5;
    const step = Math.max(4.6, (2 * R) / 50); // ~50 точек на диаметр портрета
    const rowH = step * 0.866;                // шестигранная сетка, как растр печати
    // зазор-паспарту между фото и ореолом: тонкое кольцо-рамка остаётся на чистом фоне
    const gap = $('.hero__ring').getBoundingClientRect().width / 2 - R + step * 0.9;
    const halo = Math.max(W, H) * 0.5 - R;    // докуда тянется растр вокруг фото (у краёв холста ещё и гаснет)

    // Яркость фото в клетках сетки: картинку уменьшаем до размера сетки, браузер сам усредняет пиксели
    const cells = Math.ceil((2 * R) / step);
    const off = document.createElement('canvas');
    off.width = cells; off.height = cells;
    const octx = off.getContext('2d', { willReadFrequently: true });
    octx.drawImage(photo, 0, 0, cells, cells);
    const px = octx.getImageData(0, 0, cells, cells).data;
    const lum = (u, v) => {
      const i = (Math.min(cells - 1, Math.max(0, v)) * cells + Math.min(cells - 1, Math.max(0, u))) * 4;
      return (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
    };

    seed = 7;
    dots = [];
    const rMax = step * 0.58;
    for (let row = 0, y = step / 2; y < H + step; row++, y += rowH) {
      for (let x = (row % 2 ? step / 2 : 0); x < W + step; x += step) {
        const d = Math.hypot(x - cx, y - cy);
        if (d > R + halo) continue;
        const u = Math.floor(((x - (cx - R)) / (2 * R)) * cells);
        const v = Math.floor(((y - (cy - R)) / (2 * R)) * cells);
        const inside = d < R;
        if (!inside && d < R + gap) continue;
        // Внутри — полутон самого фото; снаружи — ореол: точки крупные у портрета и тают к краю холста
        const edge = smooth(0, step * 5, Math.min(x, W - x, y, H - y));
        const dark = inside ? clamp01((1 - lum(u, v) - 0.06) / 0.82) : 0.82 * Math.pow(1 - smooth(R + gap, R + halo, d), 1.3) * edge;
        const r = inside ? rMax * (0.18 + 0.82 * Math.pow(dark, 0.85)) : rMax * dark;
        if (r < 0.32) continue;
        const a = rand() * Math.PI * 2;
        const spread = 0.35 + rand() * 0.9;
        dots.push({
          x, y, r, d, inside,
          // откуда летит точка: разлёт по всей площади вокруг центра
          sx: cx + Math.cos(a) * Math.max(W, H) * spread,
          sy: cy + Math.sin(a) * Math.max(W, H) * spread * 0.8,
          delay: rand() * 0.42 + (d / (R + halo)) * 0.12,
          ux: (x - cx) / (d || 1), uy: (y - cy) / (d || 1),
        });
      }
    }
    geo = { W, H, R, cx, cy, step, halo };
    draw();
  }

  function draw() {
    if (!geo) return;
    const { W, H, R, step } = geo;
    ctx.clearRect(0, 0, W, H);
    const g = state.gather;
    const revealR = state.reveal * (R + step);
    const t = state.time;
    const sc = state.scroll;
    const k = (Math.PI * 2) / (R * 0.62); // длина волны ореола
    const paths = [new Path2D(), new Path2D()];
    for (const p of dots) {
      const local = easeOut(clamp01((g - p.delay) / 0.5));
      if (local <= 0) continue;
      let r = p.r * local;
      if (p.inside) {
        // фото проявляется из центра: точки под ним уходят
        r *= smooth(revealR - step * 1.4, revealR, p.d);
      } else {
        // волны «сигнала» расходятся от портрета
        r *= 1 + 0.26 * Math.sin(p.d * k - t * 1.7) * state.reveal;
        r *= 1 - sc * 0.55;
      }
      if (r < 0.25) continue;
      const drift = sc * 46 * (p.d / R);
      const x = p.sx + (p.x - p.sx) * local + p.ux * drift;
      const y = p.sy + (p.y - p.sy) * local + p.uy * drift;
      const path = p.inside ? paths[0] : paths[1];
      path.moveTo(x + r, y);
      path.arc(x, y, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = PLUM;
    ctx.fill(paths[0]);
    ctx.fillStyle = CRIMSON;
    ctx.globalAlpha = 0.78;
    ctx.fill(paths[1]);
    ctx.globalAlpha = 1;
  }

  const photoReady = photo.complete && photo.naturalWidth
    ? Promise.resolve()
    : new Promise(r => { photo.addEventListener('load', r, { once: true }); photo.addEventListener('error', r, { once: true }); });
  let lastW = 0;
  const onResize = () => {
    if (fig.clientWidth === lastW) return; // на мобильном высота окна «дышит» от панели браузера — растр не пересобираем
    lastW = fig.clientWidth;
    build();
  };
  photoReady.then(() => {
    lastW = fig.clientWidth;
    build();
    if (window.ResizeObserver) new ResizeObserver(onResize).observe(fig);
    else window.addEventListener('resize', onResize);
  });

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: точки слетаются в портрет, фото проявляется ---------- */
    state.gather = 0;
    state.reveal = 0;
    draw();
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const ring = $('.hero__ring circle');

    gsap.set(photoWrap, { clipPath: 'circle(0% at 50% 50%)' });
    gsap.set(ring, { strokeDashoffset: 100 });
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.meta > *', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.15)
      .to(state, { gather: 1, duration: 1.9, ease: 'none', onUpdate: draw }, 0.1)
      .to(state, {
        reveal: 1, duration: 1.25, ease: 'power2.inOut',
        onUpdate: () => { gsap.set(photoWrap, { clipPath: `circle(${state.reveal * 50}% at 50% 50%)` }); draw(); },
        onComplete: () => gsap.set(photoWrap, { clearProps: 'clipPath' }),
      }, 2.05) // полутоновый портрет держится полсекунды, потом проявляется фото
      .from(photo, { scale: 1.22, duration: 1.8, ease: 'expo.out' }, 2.05)
      .to(ring, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 2.1)
      .from('.fig-cap > *', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 2.6)
      .from(first.chars, { yPercent: 112, stagger: 0.05, duration: 1.05, ease: 'expo.out' }, 0.45)
      .from(last.chars, { yPercent: 112, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.62)
      .from(lead.lines, { yPercent: 100, stagger: 0.1, duration: 0.95 }, 1.0)
      .from('.stat > *', { y: 16, autoAlpha: 0, stagger: 0.06, duration: 0.7 }, 1.25)
      .from('.hero__actions > *', { y: 18, autoAlpha: 0, stagger: 0.12, duration: 0.75 }, 1.45);

    /* Ореол дышит волнами, пока hero на экране */
    let running = false;
    const tick = (time) => { state.time = time; draw(); };
    const setRunning = on => {
      if (on === running) return;
      running = on;
      if (on) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
    };
    intro.call(() => setRunning(true), null, 2.6);
    ScrollTrigger.create({
      trigger: '.hero', start: 'top bottom', end: 'bottom top',
      onToggle: self => intro.progress() > 0.8 && setRunning(self.isActive),
    });
    // При уходе hero растр расходится и редеет
    gsap.to(state, {
      scroll: 1, ease: 'none',
      scrollTrigger: { trigger: '.hero__fig', start: 'center 45%', end: 'bottom top', scrub: true },
      onUpdate: () => running || draw(),
    });

    /* ---------- 2. Специализация: линейки печатаются точками ---------- */
    revealLines('.spec .sec-head h2', '.spec .sec-head');
    gsap.from('.spec .sec-head .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.spec .sec-head', start: 'top 82%' } });
    $$('.spec__item').forEach(item => {
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 88%' } })
        .from($('.rule', item), { scaleX: 0, duration: 1.1, ease: 'power2.inOut' }, 0)
        .from($('.spec__num', item), { autoAlpha: 0, x: -8, duration: 0.6 }, 0.1)
        .from($('.spec__text', item), { yPercent: 40, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.15);
    });
    gsap.from('.spec__note', { x: -14, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.spec__note', start: 'top 90%' } });

    /* Доказательная неврология: карточка раскрывается, «мифы» рассыпаются в растр */
    gsap.fromTo('.evidence',
      { clipPath: 'inset(8% 5% 8% 5% round 30px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: '.evidence', start: 'top 85%' }, onComplete() { gsap.set('.evidence', { clearProps: 'clipPath' }); } });
    revealLines('.evidence__title', '.evidence');
    gsap.from('.evidence .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.evidence', start: 'top 80%' } });
    $$('.myth').forEach(myth => {
      const chips = $$('.chip', myth);
      gsap.timeline({ scrollTrigger: { trigger: myth, start: 'top 80%' } })
        .from($$('.myth__lead, .myth__tail', myth), { y: 14, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' }, 0)
        // Сначала «миф» звучит весомо — сплошная заливка…
        .fromTo(chips, { '--dot': '4.6px', '--dot-a': 1, color: '#ffffff', scale: 0.86, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.15)
        // …и рассыпается в точки: доказательной базы нет
        .to(chips, { '--dot': '1.2px', '--dot-a': 0.24, color: CRIMSON, duration: 1.4, stagger: 0.14, ease: 'power2.inOut' }, 1.05);
    });

    /* ---------- 3. Стоимость: тёмная карточка, точки-лидеры и цены целиком ---------- */
    gsap.fromTo('.price',
      { clipPath: 'inset(5% 4% 5% 4% round 30px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: '.price', start: 'top 85%' }, onComplete() { gsap.set('.price', { clearProps: 'clipPath' }); } });
    revealLines('.price__head h2', '.price__head');
    gsap.from(['.price .eyebrow', '.price__note'], { y: 14, autoAlpha: 0, stagger: 0.15, duration: 0.8, scrollTrigger: { trigger: '.price__head', start: 'top 82%' } });
    $$('.rate').forEach(rate => {
      gsap.timeline({ scrollTrigger: { trigger: rate, start: 'top 90%' } })
        .from($('.rate__name', rate), { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0)
        .from($('.rate__dots', rate), { scaleX: 0, duration: 0.9, ease: 'power2.inOut' }, 0.1)
        // цена появляется целиком, без счётчика
        .from($('.rate__sum', rate), { y: 10, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.7);
    });
    gsap.from('.price__book > *', { y: 16, autoAlpha: 0, stagger: 0.12, duration: 0.8, scrollTrigger: { trigger: '.price__book', start: 'top 90%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
