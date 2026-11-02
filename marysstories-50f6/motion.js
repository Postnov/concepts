// Мария Кардакова — моушн концепта. Фирменная идея: двойная спираль ДНК из точек (как тату на её руке) —
// медленно вращается в hero и ускоряется от прокрутки: «научно обоснованное питание» как живая молекула.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- спираль: строим в SVG; без моушна остаётся статичной ---------- */
  function buildHelix(svg) {
    const pairs = Number(svg.dataset.pairs || 16);
    const horizontal = svg.classList.contains('helix--mini');
    const W = horizontal ? 240 : 60, H = horizontal ? 60 : 400;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    const items = [];
    for (let i = 0; i < pairs; i++) {
      const line = document.createElementNS(NS, 'line');
      const a = document.createElementNS(NS, 'circle');
      const b = document.createElementNS(NS, 'circle');
      a.setAttribute('class', 'dot-a');
      b.setAttribute('class', 'dot-b');
      svg.append(line, a, b);
      items.push({ line, a, b });
    }
    const draw = phase => {
      items.forEach(({ line, a, b }, i) => {
        const t = phase + i * 0.62;
        const s = Math.sin(t), c = Math.cos(t);
        const along = (i + 0.5) / pairs;
        const amp = horizontal ? H * 0.36 : W * 0.4;
        const pos = horizontal ? W * along : H * along;
        const mid = horizontal ? H / 2 : W / 2;
        const p1 = mid + amp * s, p2 = mid - amp * s;
        // Глубина: точка «спереди» крупнее и ярче
        const r1 = 2.6 + 1.6 * (c + 1) / 2, r2 = 2.6 + 1.6 * (1 - c) / 2;
        if (horizontal) {
          a.setAttribute('cx', pos); a.setAttribute('cy', p1);
          b.setAttribute('cx', pos); b.setAttribute('cy', p2);
          line.setAttribute('x1', pos); line.setAttribute('x2', pos);
          line.setAttribute('y1', p1); line.setAttribute('y2', p2);
        } else {
          a.setAttribute('cx', p1); a.setAttribute('cy', pos);
          b.setAttribute('cx', p2); b.setAttribute('cy', pos);
          line.setAttribute('x1', p1); line.setAttribute('x2', p2);
          line.setAttribute('y1', pos); line.setAttribute('y2', pos);
        }
        a.setAttribute('r', r1.toFixed(2));
        b.setAttribute('r', r2.toFixed(2));
        a.style.opacity = (0.55 + 0.45 * (c + 1) / 2).toFixed(2);
        b.style.opacity = (0.55 + 0.45 * (1 - c) / 2).toFixed(2);
      });
    };
    draw(0);
    return { svg, draw, items };
  }
  const helices = $$('[data-helix]').map(buildHelix);

  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- вращение спиралей: базовая скорость + импульс от прокрутки ---------- */
    let phase = 0, boost = 0;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => { boost = Math.min(Math.abs(self.getVelocity()) / 900, 6); },
    });
    gsap.ticker.add((time, dt) => {
      boost *= 0.93;
      phase += (dt / 1000) * (0.9 + boost);
      helices.forEach(h => h.draw(phase));
    });

    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const heroHelix = helices.find(h => h.svg.closest('.hero'));

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero .frame', { clipPath: 'inset(0% 0% 100% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.35, ease: 'expo.inOut' }, 0.05)
      .from('.hero .frame img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.2)
      .from('.hero__badge', { y: -10, autoAlpha: 0, duration: 0.7 }, 0.9);
    if (heroHelix) {
      const dots = heroHelix.items.flatMap(it => [it.a, it.b]);
      intro.from(dots, { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box', duration: 0.6, stagger: 0.025, ease: 'back.out(2.4)' }, 0.7)
        .from(heroHelix.items.map(it => it.line), { autoAlpha: 0, duration: 0.6, stagger: 0.025 }, 0.9);
    }
    intro
      .from('.hero__kicker span', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.55)
      .from(first.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.6)
      .from(last.chars, { yPercent: 115, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.8)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.tags li', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.55 }, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.75 }, 1.3);

    // Параллакс портрета
    gsap.to('.hero .frame img', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Обо мне: «источники» проявляются, числа считаются ---------- */
    revealLines('.about h2', '.about .sec-head');
    gsap.from('.about .eyebrow', { x: -14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 84%' } });
    const refs = $$('.ref');
    gsap.set(refs, { y: 34, autoAlpha: 0 });
    ScrollTrigger.batch(refs, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.1, ease: 'expo.out' }),
    });
    $$('.ref__fig--word').forEach(el => {
      const s = SplitText.create(el, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
      gsap.from(s.chars, {
        yPercent: 110, stagger: 0.05, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }, onComplete: () => s.revert(),
      });
    });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.4, ease: 'power2.out', snap: { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = '0'; },
        onUpdate: () => { el.textContent = String(Math.round(o.v)); },
      });
    });

    /* ---------- 3. Курсы: стопка — карточка, на которую ложится следующая, слегка уходит назад ---------- */
    revealLines('.courses h2', '.courses .sec-head');
    gsap.from('.courses .eyebrow', { x: -14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses .sec-head', start: 'top 84%' } });
    const cards = $$('.course');
    cards.forEach((card, i) => {
      gsap.from(card.children, {
        y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 82%' },
      });
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card, {
        scale: 0.93, filter: 'brightness(.86)', ease: 'none',
        scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 25%', scrub: true },
      });
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
