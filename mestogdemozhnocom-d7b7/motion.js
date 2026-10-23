// «Место, где можно» — моушн концепта. Фирменная идея: розовое кольцо «от руки» из знака площадки
// обводит главное — знак «п», слово «можно», по очереди «Просто. Профессионально. Доступно.», ключевое слово каждой секции.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- кольцо от руки ---------- */
  // Псевдослучайность с зерном: при перестройке (ресайз) кольцо остаётся тем же
  const rand = seed => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // Овал в 1,1 оборота (суперэллипс: чуть «квадратнее» эллипса, лучше обнимает слово):
  // радиус чуть «гуляет», к концу штрих уходит наружу и перехлёстывает начало
  function ringD(cx, cy, rx, ry, tilt, seed, turns = 1.1, pw = 0.72) {
    const r = rand(seed);
    const ph1 = r() * 6.28, ph2 = r() * 6.28, start = Math.PI * (0.9 + r() * 0.12);
    const n = 72, pts = [];
    const sp = v => Math.sign(v) * Math.abs(v) ** pw;
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = start + t * turns * Math.PI * 2;
      const k = 1 + 0.028 * Math.sin(a * 2 + ph1) + 0.018 * Math.sin(a * 3 + ph2) + (t > 0.78 ? (t - 0.78) * 0.2 : 0);
      const x = rx * k * sp(Math.cos(a)), y = ry * k * sp(Math.sin(a));
      pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
    }
    // Сглаживание Catmull-Rom → кубические кривые
    const f = p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    let d = `M${f(pts[0])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${f([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${f([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${f(p2)}`;
    }
    return d;
  }

  // Кольца вокруг слов [data-ring]: svg кладётся в ближайший [data-ring-host] и ставится по коробке слова
  const rings = new Map();
  const M = 8; // запас под толщину штриха
  const ctx = document.createElement('canvas').getContext('2d');
  function setDash(paths, drawn) {
    paths.forEach(p => {
      const len = p.getTotalLength() + 2;
      p.style.strokeDasharray = `${len} ${len}`;
      p.style.strokeDashoffset = drawn ? 0 : len;
    });
  }
  function buildRings() {
    $$('[data-ring]').forEach((word, i) => {
      const id = word.dataset.ring;
      const host = word.closest('[data-ring-host]');
      let ring = rings.get(id);
      if (!ring) {
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'ring');
        svg.setAttribute('aria-hidden', 'true');
        const soft = document.createElementNS(NS, 'path');
        soft.setAttribute('class', 'ring__soft');
        const main = document.createElementNS(NS, 'path');
        svg.append(soft, main);
        host.append(svg);
        ring = { svg, paths: [main, soft], drawn: false, seed: 11 + i * 37 };
        rings.set(id, ring);
      }
      const hb = host.getBoundingClientRect(), b = word.getBoundingClientRect();
      // Высота кольца — по контуру букв (canvas measureText), а не по коробке строки: строчные «можно» и «Ближайшие» с «й» обводятся по-разному.
      // Верх коробки inline-элемента = базовая линия − ascent шрифта
      const cs = getComputedStyle(word), fs = parseFloat(cs.fontSize);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ctx.measureText(word.textContent.trim());
      const base = b.top - hb.top + m.fontBoundingBoxAscent;
      const inkTop = base - m.actualBoundingBoxAscent, inkBottom = base + m.actualBoundingBoxDescent;
      const py = fs * +(word.dataset.ringPy || 0.3);
      // Поля по бокам; кольцо не выходит за край секции (иначе горизонтальный скролл)
      let px = b.width * 0.03 + fs * 0.2;
      px = Math.max(4, Math.min(px, b.left - hb.left - M, hb.right - b.right - M));
      const W = b.width + px * 2 + M * 2, H = inkBottom - inkTop + py * 2 + M * 2;
      const top = inkTop - py - M;
      const { svg, paths, seed } = ring;
      svg.setAttribute('viewBox', `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`);
      Object.assign(svg.style, {
        left: `${(b.left - hb.left - px - M).toFixed(1)}px`, top: `${top.toFixed(1)}px`,
        width: `${W.toFixed(1)}px`, height: `${H.toFixed(1)}px`,
      });
      const rx = W / 2 - M, ry = H / 2 - M;
      paths[0].setAttribute('d', ringD(W / 2, H / 2, rx, ry, -0.035, seed));
      paths[1].setAttribute('d', ringD(W / 2 + 1, H / 2 + 1.5, rx * 1.012, ry * 0.95, -0.05, seed + 5, 1.04));
      setDash(paths, ring.drawn);
    });
  }
  // Кольцо вокруг знака «п» — как в логотипе: наклонённый эллипс
  const markPaths = $$('.mark__ring');
  if (markPaths.length) {
    markPaths[1].setAttribute('d', ringD(200, 210, 168, 88, -0.3, 5, 1.08, 1));
    markPaths[0].setAttribute('d', ringD(201, 213, 172, 84, -0.31, 9, 1.02, 1));
  }

  const draw = (id, vars = {}) => {
    const ring = rings.get(id);
    if (!ring) return null;
    ring.drawn = true;
    return gsap.to(ring.paths, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', stagger: 0.07, ...vars });
  };

  if (!animate) {
    // Статичная версия: кольца уже нарисованы (кроме тройки, которую кольцо обходит по очереди только в моушне)
    MotionBase && MotionBase.ready(() => {
      buildRings();
      rings.forEach((ring, id) => { if (!/^trio/.test(id)) { ring.drawn = true; setDash(ring.paths, true); } });
      window.addEventListener('resize', () => buildRings());
    });
    return;
  }

  function revealLines(selector, trigger, onDone) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => { split.revert(); onDone && onDone(); },
    });
  }

  MotionBase.ready(() => {
    // Коробки слов меряем до нарезки: revert вернёт текст ровно туда же
    buildRings();

    /* ---------- 1. Hero ---------- */
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    setDash(markPaths, false);
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => title.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.mark__glyph', { y: 70, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.15)
      .from('.mark__glow', { scale: 0.5, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.2)
      .to(markPaths, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.12 }, 0.55)
      .from('.kicker', { x: -14, autoAlpha: 0, duration: 0.8 }, 0.35)
      .from(title.chars, { yPercent: 115, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.45)
      .add(() => draw('hero', { duration: 1 }), 1.35)
      .from('.trio li', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.15)
      .from('.hero__for', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.4)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.5);

    // Знак «дышит»: кольцо-орбита чуть покачивается, блик скользит по «п»
    gsap.to('.mark__orbit', { rotation: 4, scale: 1.03, svgOrigin: '200 210', duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
    gsap.fromTo('.mark__shine', { x: -170 }, { x: 170, duration: 2.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.5, delay: 2.6 });

    // Кольцо обходит «Просто. Профессионально. Доступно.» по очереди: обвело — подержало — стёрло — дальше
    let trioTl;
    const trio = () => {
      if (trioTl) trioTl.kill();
      ['trio-1', 'trio-2', 'trio-3'].forEach(id => { const r = rings.get(id); r.drawn = false; setDash(r.paths, false); });
      trioTl = gsap.timeline({ repeat: -1, delay: 0.4 });
      ['trio-1', 'trio-2', 'trio-3'].forEach(id => {
        const { paths } = rings.get(id);
        trioTl
          .to(paths, { strokeDashoffset: 0, duration: 0.85, ease: 'power2.inOut', stagger: 0.06 })
          .to(paths, { strokeDashoffset: (i, p) => -(p.getTotalLength() + 2), duration: 0.55, ease: 'power2.in', stagger: 0.04 }, '+=1.5')
          .set(paths, { strokeDashoffset: (i, p) => p.getTotalLength() + 2 });
      });
    };
    intro.add(trio, 1.9);

    /* ---------- 2. Мероприятия: билеты ---------- */
    revealLines('.events h2', '.events .sec-head', () => draw('events'));
    gsap.from('.events .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.events .sec-head', start: 'top 82%' } });
    $$('.ticket').forEach((t, i) => {
      gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 88%' } })
        .from(t, { y: 70, rotation: i % 2 ? 3 : -3, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: i * 0.08 })
        .from($('.ticket__cut span', t), { scaleX: 0, duration: 0.9, ease: 'power2.inOut' }, 0.35)
        .from($('.ticket__big', t), { y: 16, autoAlpha: 0, duration: 0.8 }, 0.45)
        .from($('.ticket__go', t), { scale: 0.4, autoAlpha: 0, duration: 0.7, ease: 'back.out(2)' }, 0.6);
    });

    /* ---------- 3. Курсы сезона: арки ---------- */
    revealLines('.season h2', '.season .sec-head', () => draw('season'));
    gsap.from('.season .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.season .sec-head', start: 'top 82%' } });
    $$('.arch').forEach((a, i) => {
      gsap.timeline({ scrollTrigger: { trigger: a, start: 'top 88%' }, delay: window.innerWidth >= 900 ? i * 0.12 : 0 })
        .from(a, { y: 80, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .from($('.arch__glow', a), { scaleY: 0.2, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.2)
        .from($('.arch__num', a), { scale: 0.5, autoAlpha: 0, duration: 0.7, ease: 'back.out(2)' }, 0.3)
        .from([$('.arch__title', a), $('.arch__sub', a), $('.btn', a)], { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.4);
    });

    /* ---------- финал ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } })
      .from('.concept-end > *:not(.ring)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1 })
      .add(() => draw('end'), 0.6);

    // Ресайз меняет коробки слов: перестраиваем кольца, тройку перезапускаем
    let w = window.innerWidth, tid;
    window.addEventListener('resize', () => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      clearTimeout(tid);
      tid = setTimeout(() => { buildRings(); if (trioTl) trio(); }, 200);
    });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
