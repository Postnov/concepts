// Ирина Потянова — моушн концепта.
// Фирменная идея — «тракт»: тонкая линия пищеварительного пути. В первом экране она обвивает печать с портретом
// и стекает по карточке, по ней бежит абрикосовая «капсула»; в курсах линия рисуется прокруткой и зажигает
// станции «желудок → поджелудочная → кишечник».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const NS = 'http://www.w3.org/2000/svg';
  const f = n => n.toFixed(1);

  /* ---------- геометрия линий (строится всегда, и без анимации) ---------- */

  // Hero: дуга вокруг печати → волна вниз по правому краю → по низу карточки влево
  function buildTract() {
    const card = $('.hero__card');
    const seal = $('.seal');
    const svg = $('.tract');
    const c = card.getBoundingClientRect();
    const s = seal.getBoundingClientRect();
    const w = c.width, h = c.height;
    svg.setAttribute('viewBox', `0 0 ${f(w)} ${f(h)}`);
    const cx = s.left - c.left + s.width / 2;
    const cy = s.top - c.top + s.height / 2;
    // На десктопе вокруг печати две орбиты — линия обходит внешнюю
    const far = $('.seal__orbit--far');
    const R = far && far.offsetWidth ? far.offsetWidth / 2 : seal.offsetWidth / 2 + 12;
    const at = deg => [cx + R * Math.cos(deg * Math.PI / 180), cy + R * Math.sin(deg * Math.PI / 180)];
    const [x0, y0] = at(200);
    const [x1, y1] = at(50);
    let d = `M${f(x0)} ${f(y0)} A${f(R)} ${f(R)} 0 1 1 ${f(x1)} ${f(y1)}`;
    // Спуск волной («перистальтика»): правый край, амплитуда 9 px, шаг 74 px
    const xr = w - 18, yb = h - 22, amp = 9, step = 74;
    d += ` C${f(x1 + 10)} ${f(y1 + 30)} ${f(xr)} ${f(y1 + 30)} ${f(xr)} ${f(y1 + 70)}`;
    let y = y1 + 70, side = 1;
    while (y + step < yb - 50) {
      d += ` C${f(xr + amp * side)} ${f(y + step * 0.35)} ${f(xr + amp * side)} ${f(y + step * 0.65)} ${f(xr)} ${f(y + step)}`;
      y += step; side = -side;
    }
    // Поворот в низ карточки и волна влево
    d += ` C${f(xr)} ${f(yb)} ${f(xr - 10)} ${f(yb)} ${f(xr - 44)} ${f(yb)}`;
    let x = xr - 44; side = 1;
    while (x - step > 60) {
      d += ` C${f(x - step * 0.35)} ${f(yb + 6 * side)} ${f(x - step * 0.65)} ${f(yb + 6 * side)} ${f(x - step)} ${f(yb)}`;
      x -= step; side = -side;
    }
    d += ` C${f(30)} ${f(yb)} ${f(22)} ${f(yb)} ${f(22)} ${f(h + 4)}`;
    $('.tract__path').setAttribute('d', d);
  }

  // Курсы: вертикальная волна слева от карточек, узлы — на уровне заголовков станций
  const ROUTE = { x: 16, amp: 6, period: 120 };
  const routeX = y => ROUTE.x + ROUTE.amp * Math.sin((y / ROUTE.period) * Math.PI * 2);
  let nodes = [];
  function buildRoute() {
    const list = $('.route__list');
    const svg = $('.route__line');
    const h = list.offsetHeight;
    svg.setAttribute('viewBox', `0 0 44 ${f(h)}`);
    let d = `M${f(routeX(0))} 0`;
    for (let y = 6; y <= h; y += 6) d += ` L${f(routeX(y))} ${f(y)}`;
    $('.route__base').setAttribute('d', d);
    $('.route__path').setAttribute('d', d);
    const g = $('.route__nodes');
    g.textContent = '';
    nodes = $$('.station').map(st => {
      const y = st.offsetTop + 30;
      const node = document.createElementNS(NS, 'circle');
      node.setAttribute('class', 'route__node');
      node.setAttribute('r', '7');
      node.setAttribute('cx', f(routeX(y)));
      node.setAttribute('cy', f(y));
      g.append(node);
      return { y, node };
    });
  }

  buildTract();
  buildRoute();

  if (!animate) {
    if (window.MotionBase) MotionBase.ready(() => { buildTract(); buildRoute(); });
    return;
  }

  MotionBase.ready(() => {
    buildTract();
    buildRoute();

    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const tract = $('.tract__path');
    const tractLen = () => tract.getTotalLength();
    let len = tractLen();
    gsap.set(tract, { strokeDasharray: len, strokeDashoffset: len });

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__card', { clipPath: 'inset(0% 0% 100% 0% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', duration: 1.15, ease: 'expo.inOut' }, 0.05)
      .from('.seal', { scale: 0.6, rotate: -40, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.55)
      .from('.seal__photo img', { scale: 1.4, duration: 1.6, ease: 'expo.out' }, 0.6)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.6)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.0, ease: 'expo.out' }, 0.7)
      .to(tract, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, 0.8)
      .from('.hero__lead', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.15)
      .from('.chips li', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.3)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.45);

    // Подпись печати медленно вращается
    gsap.to('.seal__ring', { rotate: 360, duration: 42, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    gsap.to('.seal__orbit--far', { rotate: -360, duration: 60, ease: 'none', repeat: -1 });
    intro.from('.seal__orbit', { scale: 0.7, autoAlpha: 0, stagger: 0.12, duration: 1.4, ease: 'expo.out' }, 0.75);

    // «Капсула» бежит по линии тракта, после того как линия нарисовалась
    const dot = $('.tract__dot');
    const run = { p: 0 };
    const place = () => {
      const pt = tract.getPointAtLength(run.p * len);
      dot.setAttribute('cx', f(pt.x));
      dot.setAttribute('cy', f(pt.y));
    };
    gsap.timeline({ delay: 3.0, repeat: -1, repeatDelay: 0.6 })
      .set(dot, { opacity: 0 })
      .set(run, { p: 0, onComplete: place })
      .to(dot, { opacity: 1, duration: 0.4 })
      .to(run, { p: 1, duration: Math.max(5, len / 150), ease: 'sine.inOut', onUpdate: place }, '<')
      .to(dot, { opacity: 0, duration: 0.4 }, '-=0.4');

    // Лёгкий параллакс печати
    gsap.to('.seal', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- заголовки секций строками из-под маски ---------- */
    function revealHead(sec) {
      const split = SplitText.create(`${sec} h2`, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
      const tl = gsap.timeline({ scrollTrigger: { trigger: `${sec} .sec-head`, start: 'top 82%' }, onComplete: () => split.revert() });
      tl.from(`${sec} .eyebrow`, { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0)
        .from(split.lines, { yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out' }, 0.1);
    }
    revealHead('.route');
    revealHead('.free');

    /* ---------- 2. Маршрут: линия рисуется прокруткой и зажигает станции ---------- */
    const rpath = $('.route__path');
    const rdot = $('.route__dot');
    let rlen = rpath.getTotalLength();
    gsap.set(rpath, { strokeDasharray: rlen, strokeDashoffset: rlen });
    const routeST = ScrollTrigger.create({
      trigger: '.route__list', start: 'top 72%', end: 'bottom 62%', scrub: 0.6,
      onUpdate: self => {
        const p = self.progress;
        rpath.style.strokeDashoffset = rlen * (1 - p);
        const pt = rpath.getPointAtLength(rlen * p);
        rdot.setAttribute('cx', f(pt.x));
        rdot.setAttribute('cy', f(pt.y));
        rdot.style.opacity = p > 0.002 && p < 0.998 ? 1 : 0;
        nodes.forEach(n => n.node.classList.toggle('is-on', pt.y >= n.y - 2 || p > 0.995));
      },
    });
    $$('.station').forEach(st => {
      gsap.timeline({ scrollTrigger: { trigger: st, start: 'top 84%' } })
        .from(st, { x: -28, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
        .from(st.querySelectorAll('.station__label, .station__title, .station__meta, .station__actions > *'), { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.6, ease: 'power3.out' }, 0.15);
    });

    /* ---------- 3. Бесплатно: карточки раскладываются веером ---------- */
    gsap.from('.pill-card', {
      y: 70, rotate: (i) => [-7, 5, -4][i % 3], autoAlpha: 0, transformOrigin: '50% 100%',
      duration: 1.1, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.free__grid', start: 'top 82%' },
    });
    gsap.from('.pill-card .capsule', {
      rotate: -200, scale: 0.4, duration: 1.2, stagger: 0.14, delay: 0.2, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.free__grid', start: 'top 82%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    /* ---------- пересчёт линий при изменении размеров ---------- */
    let rt;
    const rebuild = () => {
      buildTract();
      len = tractLen();
      gsap.set(tract, { strokeDasharray: len, strokeDashoffset: intro.progress() < 1 ? len * (1 - Math.min(1, Math.max(0, (intro.time() - 0.8) / 2.2))) : 0 });
      buildRoute();
      rlen = rpath.getTotalLength();
      rpath.style.strokeDasharray = rlen;
      routeST.refresh();
      routeST.vars.onUpdate(routeST);
    };
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(rebuild, 150); });
    window.addEventListener('load', () => { ScrollTrigger.refresh(); rebuild(); }, { once: true });
  });
})();
