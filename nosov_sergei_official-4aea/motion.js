(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- топографические линии: замкнутые контуры вокруг «вершины», у каждого блока свой рельеф ----------
  const rng = seed => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const spline = p => {
    const n = p.length, f = v => v.toFixed(1);
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 0; i < n; i++) {
      const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n], e = p[(i + 2) % n];
      d += `C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`;
    }
    return d + 'Z';
  };
  function buildTopo(el, o) {
    const r = rng(o.seed), H = [2, 3, 4, 5, 7];
    const ph = H.map(() => r() * Math.PI * 2), dl = H.map(() => (r() - 0.5) * 0.5);
    let out = '';
    for (let k = 0; k < o.n; k++) {
      const t = k / (o.n - 1), R = o.r0 + (o.r1 - o.r0) * Math.pow(t, 1.12), pts = [];
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        let s = 0;
        H.forEach((h, j) => { s += Math.sin(h * a + ph[j] + dl[j] * k) / (h * 0.7); });
        const rr = R * (1 + (0.04 + 0.1 * t) * s);
        pts.push([o.cx + rr * Math.cos(a) * (o.sx || 1), o.cy + rr * Math.sin(a)]);
      }
      out += `<path class="${k % (o.idx || 4) === 0 ? 'is-index' : ''}" d="${spline(pts)}" pathLength="1"/>`;
    }
    el.innerHTML = `<svg viewBox="0 0 ${o.w} ${o.h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${out}</svg>`;
  }
  const TOPO = {
    '.topo--hero': { w: 1000, h: 1000, cx: 500, cy: 410, n: 17, r0: 120, r1: 900, seed: 7, sx: 1 },
    '.topo--adv': { w: 1000, h: 1400, cx: 640, cy: 520, n: 14, r0: 60, r1: 900, seed: 21, sx: 1 },
    '.topo--photo': { w: 800, h: 600, cx: 690, cy: 120, n: 10, r0: 40, r1: 620, seed: 33, sx: 1.25 },
    '.topo--books': { w: 1000, h: 1000, cx: 760, cy: 500, n: 14, r0: 60, r1: 820, seed: 5, sx: 1 },
  };
  Object.entries(TOPO).forEach(([sel, o]) => $$(sel).forEach(el => buildTopo(el, o)));

  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // ---------- общий приём: заголовок режется на строки и поднимается из-под маски ----------
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 110, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  // рельеф «прорисовывается» линия за линией
  const drawTopo = (el, vars = {}) => {
    const paths = $$('path', el);
    gsap.fromTo(paths, { strokeDasharray: 1, strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 2.6, stagger: 0.07, ease: 'power2.inOut',
      onComplete: () => gsap.set(paths, { clearProps: 'strokeDasharray,strokeDashoffset' }), ...vars,
    });
  };

  MotionBase.ready(() => {
    // ---------- компас: курс = прокрутка страницы; в интро картушка разворачивается и находит север ----------
    const ring = $('.compass__ring');
    const hudAz = $('.hud__az b');
    const hudDir = $('.hud__dir');
    const DIRS = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const state = { spin: 250, scroll: 0 };
    const render = () => {
      const heading = (((state.spin + state.scroll) % 360) + 360) % 360;
      const rot = -(state.spin + state.scroll);
      gsap.set(ring, { rotation: rot, '--r': rot });
      hudAz.textContent = String(Math.round(heading) % 360).padStart(3, '0') + '°';
      hudDir.textContent = DIRS[Math.round(heading / 45) % 8];
    };
    render();

    // ---------- интро ----------
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__photo img', { autoAlpha: 0, scale: 1.16, duration: 2.6, ease: 'expo.out' }, 0.05)
      .from('.compass', { autoAlpha: 0, scale: 0.86, duration: 1.8, ease: 'expo.out' }, 0.2)
      .to(state, { spin: 0, duration: 3.1, ease: 'expo.out', onUpdate: render }, 0.2)
      .from('.compass__mark', { autoAlpha: 0, y: -10, duration: 0.7 }, 1.2)
      .from('.kicker i', { scaleX: 0, transformOrigin: 'left', duration: 0.8 }, 0.55)
      .from('.kicker span', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.65)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.7)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.1)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25);
    drawTopo($('.topo--hero'), { delay: 0.4 });

    // экранчик азимута появляется, когда первый экран пройден (не мешает кнопкам героя)
    gsap.set('.hud', { autoAlpha: 0, y: 14 });
    ScrollTrigger.create({
      start: 420,
      onEnter: () => gsap.to('.hud', { autoAlpha: 1, y: 0, duration: 0.5, overwrite: true }),
      onLeaveBack: () => gsap.to('.hud', { autoAlpha: 0, y: 14, duration: 0.4, overwrite: true }),
    });

    // курс по прокрутке: 0° в начале страницы, 340° внизу
    gsap.to(state, {
      scroll: 340, ease: 'none', onUpdate: render,
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    });
    gsap.to('.hero__photo img', {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    gsap.utils.toArray('.btn:not(.btn--ghost)').slice(0, 1).forEach(btn => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 3 });
    });

    // регалии и цифры
    gsap.from('.creds li', {
      x: -18, autoAlpha: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out',
      scrollTrigger: { trigger: '.creds', start: 'top 90%' },
    });
    gsap.from('.creds', {
      clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.creds', start: 'top 90%' },
    });
    gsap.from('.stats > div', {
      y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.stats', start: 'top 92%' },
    });
    $$('.stats [data-count]').forEach(el => {
      const to = +el.dataset.count, obj = { v: 0 };
      gsap.to(obj, {
        v: to, duration: 1.8, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: '.stats', start: 'top 92%', once: true },
      });
    });

    // ---------- 2. Преимущества: маршрут по точкам ----------
    revealLines('.adv h2', '.adv .sec-head');
    gsap.from('.adv .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.adv .sec-head', start: 'top 82%' } });
    ScrollTrigger.create({ trigger: '.adv', start: 'top 70%', once: true, onEnter: () => drawTopo($('.topo--adv'), { duration: 3.2, stagger: 0.09 }) });

    const rail = $('.route__rail');
    gsap.to('.route__fill', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.route', start: 'top 62%', end: 'bottom 70%', scrub: true },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.route', start: 'top 62%', end: 'bottom 70%', scrub: true, invalidateOnRefresh: true } })
      .fromTo('.route__scout', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0)
      .fromTo('.route__scout', { y: 0 }, { y: () => rail.offsetHeight, ease: 'none', duration: 1 }, 0)
      .to('.route__scout', { autoAlpha: 0, duration: 0.03 }, 0.97);
    $$('.stop').forEach(stop => {
      ScrollTrigger.create({
        trigger: stop, start: 'top 62%', once: true,
        onEnter: () => {
          stop.classList.add('is-reached');
          gsap.fromTo($('.stop__pin', stop), { boxShadow: '0 0 0 0 rgba(255,122,20,.55)' }, { boxShadow: '0 0 0 14px rgba(255,122,20,0)', duration: 1.2, ease: 'power2.out' });
        },
      });
      const parts = [$('.stop__tag', stop), $('.stop__icon', stop), $('h3', stop), $('h3 ~ p', stop)];
      gsap.from(parts, {
        y: 22, autoAlpha: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: stop, start: 'top 80%' },
      });
    });
    const photo = $('.stop__photo');
    gsap.timeline({ scrollTrigger: { trigger: photo, start: 'top 85%' } })
      .fromTo(photo, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .from('.stop__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.1)
      .add(() => drawTopo($('.topo--photo'), { duration: 2.2, stagger: 0.12 }), 0.5);

    // ---------- 3. Книги ----------
    revealLines('.books h2', '.books .sec-head');
    gsap.from('.books .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.books .sec-head', start: 'top 82%' } });
    ScrollTrigger.create({ trigger: '.books', start: 'top 70%', once: true, onEnter: () => drawTopo($('.topo--books'), { duration: 3.2, stagger: 0.09 }) });
    gsap.timeline({ scrollTrigger: { trigger: '.books__grid', start: 'top 82%' } })
      .fromTo('.books__photo .frame', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
      .from('.books__photo img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.1)
      .from('.stamp', { scale: 2.4, autoAlpha: 0, rotation: -24, duration: 0.42, ease: 'power3.in' }, 1.0)
      .from('.books__lead', { y: 20, autoAlpha: 0, duration: 0.9 }, 0.5)
      .from('.books__side .btn', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.75);
    gsap.to('.stamp__ring', { rotation: 360, duration: 22, ease: 'none', repeat: -1 });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
