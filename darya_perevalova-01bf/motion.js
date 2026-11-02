// Дарья Перевалова — моушн концепта. Фирменная идея — «путь фишки Лилы»: по змейке из её Taplink
// при прокрутке катится тёплая фишка-свеча и зажигает вехи «Обо мне». В hero тот же свет свечи проявляет фото.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  const whenReady = fn => (window.MotionBase ? MotionBase.ready(fn) : document.addEventListener('DOMContentLoaded', fn, { once: true }));

  /* ---------- «Подробнее» в карточках услуг: работает и без GSAP ---------- */
  function setOpen(box, open) {
    const head = $('.more__head', box);
    const body = $('.more__body', box);
    if (head.getAttribute('aria-expanded') === String(open)) return;
    head.setAttribute('aria-expanded', String(open));
    if (!animate) { body.hidden = !open; return; }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, {
        height: 'auto', duration: 0.6, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from(body.children, { y: 10, autoAlpha: 0, duration: 0.45, stagger: 0.05, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.42, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.more').forEach(box => $('.more__head', box).addEventListener('click', () => {
    setOpen(box, $('.more__head', box).getAttribute('aria-expanded') !== 'true');
  }));

  /* ---------- Путь «Обо мне»: змейка строится по вёрстке вех ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const wrap = $('.path');
  const svg = $('.path__svg');
  const stations = $$('.station');
  const base = $('.path__base');
  const line = $('.path__line');
  const nodesG = $('.path__nodes');
  const token = $('.path__token');
  const geo = { L: 0, stops: [], nodes: [], rings: [], lit: -1 };
  const state = { p: animate ? 0 : 1, target: 0 };

  function build() {
    if (!wrap || !stations.length) return;
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const rx = parseFloat(getComputedStyle($('.path__list')).getPropertyValue('--rx')) || 46;
    const xL = 8, xR = W - 8;
    const b = stations.map(s => s.offsetTop);
    const last = stations[stations.length - 1];
    b.push(last.offsetTop + last.offsetHeight);

    // Мерить длину до вершины каждой дуги — временным path внутри svg
    const probe = document.createElementNS(NS, 'path');
    probe.setAttribute('fill', 'none');
    svg.appendChild(probe);
    const lenOf = parts => { probe.setAttribute('d', parts.join(' ')); return probe.getTotalLength(); };

    const parts = [`M${xL} ${b[0]}`];
    const apex = [];
    stations.forEach((s, k) => {
      const right = s.classList.contains('station--r');
      const y0 = b[k], y1 = b[k + 1], ry = (y1 - y0) / 2, mid = y0 + ry;
      if (right) {
        parts.push(`H${xR - rx}`, `A${rx} ${ry} 0 0 1 ${xR} ${mid}`);
        apex.push({ x: xR, y: mid, len: lenOf(parts) });
        parts.push(`A${rx} ${ry} 0 0 1 ${xR - rx} ${y1}`);
      } else {
        parts.push(`H${xL + rx}`, `A${rx} ${ry} 0 0 0 ${xL} ${mid}`);
        apex.push({ x: xL, y: mid, len: lenOf(parts) });
        parts.push(`A${rx} ${ry} 0 0 0 ${xL + rx} ${y1}`);
      }
    });
    const endRight = last.classList.contains('station--l');
    parts.push(`H${endRight ? xR : xL}`);
    const d = parts.join(' ');
    probe.remove();

    base.setAttribute('d', d);
    line.setAttribute('d', d);
    geo.L = line.getTotalLength();
    geo.stops = apex.map(a => a.len);
    line.style.strokeDasharray = `${geo.L} ${geo.L + 10}`;

    // Узлы: старт, вершины дуг (вехи), финиш
    nodesG.textContent = '';
    const circle = (x, y, r, cls) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r); c.setAttribute('class', cls);
      nodesG.appendChild(c);
      return c;
    };
    circle(xL, b[0], 4.5, 'path__node path__node--end is-lit');
    geo.rings = apex.map(a => circle(a.x, a.y, 8, 'path__ring'));
    geo.nodes = apex.map(a => circle(a.x, a.y, 7.5, 'path__node'));
    geo.endNode = circle(endRight ? xR : xL, b[b.length - 1], 4.5, 'path__node path__node--end');
    geo.lit = -1;
    render(state.p, true);
  }

  function render(p, silent) {
    if (!geo.L) return;
    const len = geo.L * p;
    line.style.strokeDashoffset = String(geo.L - len);
    const pt = line.getPointAtLength(len);
    token.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    let lit = -1;
    geo.stops.forEach((s, i) => { if (len >= s - 1) lit = i; });
    if (lit !== geo.lit) {
      stations.forEach((st, i) => {
        st.classList.toggle('is-lit', i <= lit);
        geo.nodes[i].classList.toggle('is-lit', i <= lit);
      });
      // Вспышка-кольцо у только что зажжённой вехи
      if (animate && !silent && lit > geo.lit) {
        for (let i = geo.lit + 1; i <= lit; i++) {
          gsap.fromTo(geo.rings[i], { attr: { r: 8 }, opacity: 0.85 }, { attr: { r: 30 }, opacity: 0, duration: 1.2, ease: 'expo.out' });
        }
      }
      geo.lit = lit;
    }
    geo.endNode.classList.toggle('is-lit', p >= 0.999);
  }

  // Прогресс только растёт: пройденный путь остаётся гореть
  function advance(prog) {
    if (prog <= state.target + 0.0005) return;
    state.target = prog;
    gsap.to(state, { p: prog, duration: 0.7, ease: 'power2.out', overwrite: true, onUpdate: () => render(state.p) });
  }

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 160); });

  if (!animate) {
    whenReady(build);
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger, delay = 0) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out', delay,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: свет свечи проявляет фото, имя поднимается из-под маски ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const role = SplitText.create('.hero__role', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const claim = SplitText.create('.hero__claim', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); role.revert(); claim.revert(); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__light', { '--lr': '0%' }, { '--lr': '120%', duration: 2.6, ease: 'power2.inOut' }, 0.1)
      .from('.hero__light img', { scale: 1.16, duration: 2.8, ease: 'expo.out' }, 0.1)
      .from('.hero__halo', { scale: 0.35, autoAlpha: 0, duration: 2.2, ease: 'expo.out' }, 0.25)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 118, stagger: 0.035, duration: 1.15, ease: 'expo.out' }, 0.35)
      .from(role.lines, { yPercent: 100, stagger: 0.08, duration: 0.9 }, 1.0)
      .from(claim.lines, { yPercent: 100, stagger: 0.08, duration: 1 }, 1.12)
      .from('.hero__lead', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.3)
      .from('.hero__actions', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.45);

    // Пламя «дышит»: ореол за фото чуть меняет яркость
    gsap.to('.hero__halo', { opacity: 0.55, scale: 1.05, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.6 });
    gsap.to('.hero__light img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Обо мне: фишка идёт по змейке ---------- */
    revealLines('.about h2', '.about .sec-head');
    gsap.from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 84%' } });
    gsap.set(stations, { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch(stations, {
      start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.1, ease: 'power3.out' }),
    });
    build();
    ScrollTrigger.create({
      trigger: '.path', start: 'top 66%', end: 'bottom 60%',
      onUpdate: self => advance(self.progress),
      onRefresh: self => { build(); advance(self.progress); },
    });
    gsap.to('.path__halo', { attr: { r: 28 }, opacity: 0.75, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // Миссия: фото раскрывается из центра, как пламя
    gsap.from('.mission__label', { x: -16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.mission__text', start: 'top 84%' } });
    revealLines('.mission__quote', '.mission__text', 0.1);
    gsap.timeline({ scrollTrigger: { trigger: '.mission__photo', start: 'top 84%' } })
      .fromTo('.mission__photo .frame',
        { clipPath: 'inset(18% 22% 18% 22% round 26px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.5, ease: 'expo.inOut' })
      .from('.mission__photo img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.1);

    /* ---------- 3. Услуги: карточка поднимается, фото открывается шторкой ---------- */
    revealLines('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 84%' } });
    $$('.svc').forEach((card, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' }, delay: i * 0.08 });
      tl.from(card, { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .fromTo($('.frame', card), { clipPath: 'inset(0% 0% 100% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
        .from($('.frame img', card), { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.2)
        .from($$('.svc__body > *', card), { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'power2.out' }, 0.45);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
