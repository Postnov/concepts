// Анастасия Полоцкая — моушн концепта. Идея «От почвы к цветению»: сухая лоза-тропа оживает, зеленеет и распускается
// ромашками — как на её интенсиве «Всё начинается с кишечника». Без GSAP и при reduced motion лоза рисуется сразу целиком.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  // Детерминированный «случай»: лоза выглядит одинаково при каждой загрузке
  const rng = seed => () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const LEAF = 'M0 0 C3 -6 11 -7 17 0 C11 7 3 6 0 0Z';
  function chamomile(parent, r) {
    for (let i = 0; i < 12; i++) {
      mk('ellipse', { class: 'v-petal', cx: 0, cy: (-r * 0.64).toFixed(2), rx: (r * 0.2).toFixed(2), ry: (r * 0.46).toFixed(2), transform: `rotate(${i * 30})` }, parent);
    }
    mk('circle', { class: 'v-core', r: (r * 0.32).toFixed(2) }, parent);
  }
  function blossom(parent, r) {
    for (let i = 0; i < 5; i++) {
      mk('circle', { class: 'v-petal v-petal--pink', cx: 0, cy: (-r * 0.5).toFixed(2), r: (r * 0.44).toFixed(2), transform: `rotate(${i * 72})` }, parent);
    }
    mk('circle', { class: 'v-core', r: (r * 0.24).toFixed(2) }, parent);
  }

  // Лоза по ломаной pts: «сухая» основа (почва) + зелёный побег, который прорисовывается, листья и цветы по пути.
  // Возвращает timeline длиной 1 (позиции — доли длины пути); растянуть — tl.duration(сек).
  function vine(svg, pts, o = {}) {
    const r = rng(o.seed || 11);
    const g = mk('g', {}, svg);
    const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
    const common = { d, 'stroke-width': o.width || 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    mk('path', { ...common, class: 'v-base' }, g);
    const grow = mk('path', { ...common, class: 'v-grow' }, g);
    const L = grow.getTotalLength();
    const at = s => {
      const p = grow.getPointAtLength(s), q = grow.getPointAtLength(Math.min(L, s + 2));
      return { x: p.x, y: p.y, a: Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI };
    };
    const decos = [];
    let side = 1;
    const gap = o.leafGap || 30, [lmin, lmax] = o.leaf || [11, 18];
    for (let s = gap * 0.5; s < L - 8; s += gap * (0.8 + r() * 0.5)) {
      const p = at(s), len = lmin + r() * (lmax - lmin);
      const holder = mk('g', { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(p.a + side * (48 + r() * 24)).toFixed(1)})` }, g);
      const sc = mk('g', { class: 's' }, holder);
      mk('path', { d: LEAF, class: 'v-leaf v-leaf--' + (1 + Math.floor(r() * 3)), transform: `scale(${(len / 17).toFixed(2)})` }, sc);
      decos.push({ el: sc, t: s / L, origin: '0% 50%', dur: 0.06, rot: -side * 24 });
      side = -side;
    }
    (o.flowers || []).forEach((f, i) => {
      const p = at(f.t * L);
      const holder = mk('g', { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(r() * 60).toFixed(1)})` }, g);
      const sc = mk('g', { class: 's' }, holder);
      (f.kind === 'pink' ? blossom : chamomile)(sc, f.r);
      decos.push({ el: sc, t: f.t, origin: '50% 50%', dur: 0.1, rot: 0 });
    });
    if (!animate) return null;
    const tl = gsap.timeline({ paused: true });
    {
      grow.style.strokeDasharray = L;
      grow.style.strokeDashoffset = L;
      tl.to(grow, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0);
      decos.forEach(dc => tl.fromTo(dc.el, { scale: 0, rotation: dc.rot, transformOrigin: dc.origin }, { scale: 1, rotation: 0, duration: dc.dur, ease: 'power2.out' }, Math.min(0.93, dc.t)));
    }
    return tl;
  }

  // Контур арки (фото 320×400 в viewBox 400×460): лоза вьётся снаружи, по левой стороне, над куполом и вниз по правой
  function archPoints() {
    const pts = [], R = 160, cx = 200, cy = 190, xl = 40, xr = 360, yb = 434;
    const straight = yb - cy, arc = Math.PI * R, total = straight * 2 + arc;
    const off = s => 15 + 7 * Math.sin(s / 29) + 3.5 * Math.sin(s / 11 + 1.3);
    for (let s = 0; s <= total; s += 6) {
      const o = off(s);
      if (s < straight) pts.push([xl - o, yb - s]);
      else if (s < straight + arc) {
        const phi = Math.PI - (s - straight) / R;
        pts.push([cx + (R + o) * Math.cos(phi), cy - (R + o) * Math.sin(phi)]);
      } else pts.push([xr + o, cy + (s - straight - arc)]);
    }
    return pts;
  }
  const heroVine = vine($('.vine--hero'), archPoints(), {
    seed: 5, width: 2.4, leafGap: 27, leaf: [11, 19],
    flowers: [
      { t: 0.08, r: 8, kind: 'pink' }, { t: 0.2, r: 11 }, { t: 0.33, r: 8, kind: 'pink' }, { t: 0.5, r: 14 },
      { t: 0.67, r: 8, kind: 'pink' }, { t: 0.8, r: 11 }, { t: 0.93, r: 9, kind: 'pink' },
    ],
  });

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const refresh = () => ScrollTrigger.refresh();

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.1)
      .from('.hero__frame img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.25)
      .add(() => heroVine.duration(2.9).play(0), 0.7)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.95)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.1)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.3)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.45);

    /* Блик на главной кнопке раз в несколько секунд */
    gsap.fromTo('.hero__cta .btn:not(.btn--ghost)', { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.8 });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__frame img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Программы и материалы ---------- */
    revealLines('.routes h2', '.routes .sec-head');
    gsap.from(['.routes .eyebrow', '.routes .sec-sub'], { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: '.routes .sec-head', start: 'top 84%' } });
    gsap.from('.feature', { y: 70, scale: 0.95, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.feature', start: 'top 88%' } });
    // Интенсив «от почвы к цветению»: иллюстрация оживает цветом по мере прокрутки
    gsap.fromTo('.feature__art img',
      { filter: 'saturate(0.12) sepia(0.55) brightness(0.96)' },
      { filter: 'saturate(1) sepia(0) brightness(1)', ease: 'none', scrollTrigger: { trigger: '.feature__art', start: 'top 82%', end: 'bottom 38%', scrub: true } });
    gsap.from('.feature__body > *, .feature__buy > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.feature__body', start: 'top 82%' } });
    // Книги заезжают сбоку по одной
    ScrollTrigger.batch('.book', {
      start: 'top 92%', once: true,
      onEnter: els => gsap.from(els, { x: 56, autoAlpha: 0, duration: 0.95, stagger: 0.12, ease: 'expo.out' }),
    });

    /* ---------- 3. Консультация ---------- */
    revealLines('.consult h2', '.consult .sec-head');
    gsap.from('.consult .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.consult .sec-head', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.consult__photo', start: 'top 84%' } })
      .fromTo('.consult .frame', { clipPath: 'circle(0% at 0% 100%)' }, { clipPath: 'circle(150% at 0% 100%)', duration: 1.6, ease: 'expo.inOut' })
      .from('.consult .frame img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.1);
    gsap.from('.consult__lead', { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.12, scrollTrigger: { trigger: '.consult__lead', start: 'top 88%' } });
    gsap.from('.consult__sub', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.consult__sub', start: 'top 90%' } });
    gsap.from('.checks li', { x: -16, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.checks', start: 'top 88%' } });
    gsap.from('.pay__card', { y: 36, autoAlpha: 0, duration: 0.95, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.pay', start: 'top 92%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
