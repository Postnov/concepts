// Данияр Жанабилов — моушн концепта.
// Фирменная идея — «поток воздуха»: тонкие линии потока за фото и в карточках. На входе они турбулентные,
// затем выпрямляются в ровный ламинарный поток — как свободное носовое дыхание («задышать полной грудью»).
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1000;

  /* ---------- линии потока: рисуются и без GSAP (статично, ровные) ---------- */
  function Flow(svg, o) {
    const lines = [];
    for (let i = 0; i < o.lines; i++) {
      const p = document.createElementNS(NS, 'path');
      const dashed = i % 3 === 1;
      p.setAttribute('stroke', dashed ? o.dash : o.color);
      p.setAttribute('stroke-width', dashed ? o.width * 1.6 : o.width);
      if (dashed) p.setAttribute('stroke-dasharray', o.dashArray || '2 16');
      svg.appendChild(p);
      // Линии чуть гуще к середине — как струя, а не сетка
      const k = (i + 0.5) / o.lines;
      const y = o.top + (o.bottom - o.top) * (0.5 + (k - 0.5) * (0.82 + 0.18 * Math.abs(k - 0.5) * 2));
      lines.push({ el: p, y, s: i * 1.618 + o.seed, dashed });
    }
    const st = { turb: o.turb, t: 0, run: 0 };
    const draw = () => {
      for (const L of lines) {
        let d = '';
        for (let x = -20; x <= W + 20; x += 20) {
          const a = st.turb * o.amp * (
            Math.sin(x * 0.011 + st.t * 1.25 + L.s * 2.1) * 0.55 +
            Math.sin(x * 0.027 - st.t * 0.85 + L.s * 1.3) * 0.3 +
            Math.sin(x * 0.055 + st.t * 2.0 + L.s) * 0.15);
          const c = o.calm * Math.sin(x * 0.0045 + st.t * 0.45 + L.s * 0.7);
          d += (x === -20 ? 'M' : 'L') + x + ' ' + (L.y + a + c).toFixed(1);
        }
        L.el.setAttribute('d', d);
        if (L.dashed) L.el.setAttribute('stroke-dashoffset', (-st.run).toFixed(1));
      }
    };
    draw();
    return { st, draw, svg };
  }

  // Пресеты: светлый фон (hero, финал) и цветная карточка Fast Track
  const flows = {};
  const make = (name, o) => {
    const svg = $(`[data-flow="${name}"]`);
    if (svg) flows[name] = Flow(svg, { lines: 12, top: 60, bottom: 560, amp: 46, calm: 7, width: 1, seed: 0, ...o });
  };
  make('hero', { color: 'rgba(75,106,155,.2)', dash: 'rgba(75,106,155,.55)', lines: 12, top: 140, bottom: 385, turb: animate ? 1 : 0.08, amp: 52 });
  make('ft', { color: 'rgba(255,255,255,.15)', dash: 'rgba(156,199,236,.55)', lines: 9, top: 30, bottom: 330, turb: animate ? 1 : 0.06, amp: 56, seed: 3 });
  make('end', { color: 'rgba(75,106,155,.16)', dash: 'rgba(75,106,155,.4)', lines: 7, top: 480, bottom: 590, turb: 0.1, amp: 30, calm: 4, seed: 7 });

  if (!animate) return;

  // Поток «течёт» только пока виден
  const tick = (flow, speed) => {
    let on = false;
    ScrollTrigger.create({ trigger: flow.svg.parentElement, start: 'top bottom', end: 'bottom top', onToggle: s => (on = s.isActive) });
    gsap.ticker.add((time, dt) => {
      if (!on) return;
      flow.st.t += dt / 1000 * speed;
      flow.st.run += dt / 1000 * 26;
      flow.draw();
    });
  };

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 86%' }, ...vars,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: обложка ---------- */
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { last.revert(); first.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__kicker > *', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.15)
      .from(last.chars, { yPercent: 110, stagger: 0.025, duration: 0.8, ease: 'expo.out' }, 0.25)
      .from(first.chars, { yPercent: 108, stagger: 0.055, duration: 1.15, ease: 'expo.out' }, 0.3)
      .from('.hero__patr', { autoAlpha: 0, x: -10, duration: 0.7 }, 0.75)
      .fromTo('.hero__figure', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.35)
      .from('.hero__figure img', { yPercent: 8, scale: 1.08, transformOrigin: '50% 0%', duration: 1.8, ease: 'expo.out' }, 0.5)
      .from('.hero__facts li', { x: -14, autoAlpha: 0, stagger: 0.09, duration: 0.7 }, 1.0)
      .from('.hero__role', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.9)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 1.0, ease: 'expo.out' }, 1.0)
      .from('.hero__sub', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.25)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35);

    // Вход: турбулентный поток выпрямляется — «вдох свободно»
    const hero = flows.hero;
    if (hero) {
      tick(hero, 0.55);
      gsap.to(hero.st, { turb: 0.09, duration: 3.2, ease: 'power2.inOut', delay: 0.25, onUpdate: hero.draw });
    }

    // Лёгкий параллакс: имя уходит вперёд по потоку, фото — вверх
    gsap.to('.hero__first', { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__figure img', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Специализация: строки «прочерчиваются» слева направо ---------- */
    revealLines('.spec h2', '.spec .sec-head');
    fadeUp(['.spec .eyebrow', '.spec .sec-sub'], '.spec .sec-head', { stagger: 0.15 });
    const items = $$('.spec__item');
    gsap.set(items, { '--sx': 0 });
    gsap.set($$('.spec__t, .spec__num'), { x: -16, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { '--sx': 1, duration: 1.1, stagger: 0.1, ease: 'expo.inOut' });
        gsap.to(els.flatMap(el => [$('.spec__num', el), $('.spec__t', el)]), { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.05, delay: 0.2, ease: 'power3.out' });
      },
    });

    // Fast Track: карточка раскрывается слева, поток в ней выпрямляется прокруткой
    const ftTitle = SplitText.create('.ft__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ scrollTrigger: { trigger: '.ft', start: 'top 82%' }, onComplete: () => ftTitle.revert() })
      .fromTo('.ft', { clipPath: 'inset(0% 100% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.inOut' })
      .from('.ft__label', { autoAlpha: 0, y: 10, duration: 0.6 }, 0.6)
      .from(ftTitle.chars, { yPercent: 105, stagger: 0.025, duration: 0.9, ease: 'expo.out' }, 0.65)
      .from('.ft__text', { autoAlpha: 0, y: 14, duration: 0.8 }, 0.9);
    const ft = flows.ft;
    if (ft) {
      tick(ft, 0.6);
      gsap.to(ft.st, { turb: 0.06, ease: 'none', onUpdate: ft.draw, scrollTrigger: { trigger: '.ft', start: 'top 90%', end: 'center 50%', scrub: 0.6 } });
    }

    /* ---------- 3. Услуги: карточки входят по потоку, цены появляются целиком ---------- */
    revealLines('.svc h2', '.svc .sec-head');
    fadeUp('.svc .eyebrow', '.svc .sec-head');
    $$('.svc__group').forEach(group => {
      gsap.from($('.svc__cap', group), { autoAlpha: 0, x: -12, duration: 0.8, scrollTrigger: { trigger: group, start: 'top 86%' } });
      gsap.from($$('.card', group), {
        x: -28, autoAlpha: 0, duration: 1.0, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: $('.svc__grid', group), start: 'top 86%' },
      });
    });
    $$('.card__price').forEach(el => gsap.from(el, { y: 12, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
    gsap.timeline({ scrollTrigger: { trigger: '.ask', start: 'top 84%' } })
      .from('.ask', { scale: 0.96, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
      .from(['.ask__num', '.ask__title', '.ask__text'], { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.2)
      .from('.ask__phone', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.4)
      .from('.ask .btn', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.5);
    gsap.from('.note', { autoAlpha: 0, x: -12, duration: 0.9, scrollTrigger: { trigger: '.note', start: 'top 92%' } });

    /* ---------- финал ---------- */
    if (flows.end) tick(flows.end, 0.4);
    fadeUp('.concept-end > :not(.flow)', '.concept-end');

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
