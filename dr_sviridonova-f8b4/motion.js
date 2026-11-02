// Марина Свиридонова — моушн концепта.
// Фирменная идея: «кривая приходит в норму» — рваный график (гормоны, вес) успокаивается в ровную волну внутри полосы нормы.
// В первом экране это интро, ниже — разделители секций, которые выравниваются при прокрутке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- кривая ---------- */
  // Рваный «анализ»: отклонения от середины полосы, −1…1
  const CHAOS = [0.1, -0.78, 0.62, -0.3, 0.94, -0.92, 0.4, -0.58, 0.98, -0.42, 0.72, -0.86, 0.34, -0.12];
  const N = CHAOS.length;
  const W = 1000, MID = 100, AMP_CHAOS = 88, AMP_CALM = 17, WAVES = 1.5;

  // Сглаживание Catmull-Rom → кубические Безье; s — 0 почти ломаная, 1 — плавная
  function toPath(pts, s) {
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const k = s / 6;
      d += `C${(p1[0] + (p2[0] - p0[0]) * k).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) * k).toFixed(1)} `
        + `${(p2[0] - (p3[0] - p1[0]) * k).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) * k).toFixed(1)} `
        + `${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }
  const calmY = (f, phase) => MID + Math.sin(f * Math.PI * 2 * WAVES + phase) * AMP_CALM;
  // Состояние кривой: t — 0 хаос … 1 норма, phase — сдвиг волны, seed — свой рисунок для каждой кривой
  function draw(c) {
    const pts = [];
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1);
      const chaos = MID + CHAOS[(i + c.seed) % N] * AMP_CHAOS * (i % 2 ? 1 : 0.85);
      pts.push([f * W, chaos + (calmY(f, c.phase) - chaos) * c.t]);
    }
    c.path.setAttribute('d', toPath(pts, 0.25 + 0.75 * c.t));
    if (c.dot) {
      // Точка-маркер едет по волне в 72% ширины
      const f = 0.72, x = f * (N - 1), i = Math.floor(x), fr = x - i;
      const chaos = MID + (CHAOS[(i + c.seed) % N] * (1 - fr) + CHAOS[(i + 1 + c.seed) % N] * fr) * AMP_CHAOS * 0.92;
      c.dot.style.top = `${((chaos + (calmY(f, c.phase) - chaos) * c.t) / 200) * 100}%`;
    }
  }
  const curves = $$('[data-curve]').map((el, i) => {
    const svg = $('svg', el);
    const path = $('.curve__line', el);
    // «Развёртка» линии слева направо, как на мониторе: клип-прямоугольник в координатах viewBox
    const ns = 'http://www.w3.org/2000/svg';
    const clip = document.createElementNS(ns, 'clipPath');
    clip.id = `sweep-${i}`;
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', '-10'); rect.setAttribute('y', '-40');
    rect.setAttribute('width', String(W + 20)); rect.setAttribute('height', '280');
    clip.append(rect);
    svg.prepend(clip);
    path.setAttribute('clip-path', `url(#${clip.id})`);
    const c = { el, path, rect, dot: $('.curve__dot', el), t: 1, phase: 0.6 + i * 1.3, seed: i * 3 };
    draw(c);
    return c;
  });

  if (!animate) return; // статичная страница: кривые уже в норме

  MotionBase.ready(() => {
    const hero = curves.find(c => c.el.dataset.curve === 'hero');
    const minis = curves.filter(c => c.el.dataset.curve === 'mini');

    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    hero.t = 0; draw(hero);
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      // Фото «наводится на резкость»: круг раскрывается от лица
      .fromTo('.hero__photo', { clipPath: 'circle(0% at 54% 40%)' }, { clipPath: 'circle(75% at 54% 40%)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.05)
      .from('.hero__photo img', { scale: 1.3, filter: 'saturate(.85) contrast(1.04) blur(6px)', duration: 2.1, ease: 'expo.out' }, 0.2)
      .from('.hero__kicker span', { y: 30, autoAlpha: 0, duration: 0.9 }, 0.5)
      .from(name.chars, { yPercent: 112, stagger: 0.032, duration: 1.05, ease: 'expo.out' }, 0.45)
      .from('.hero__role', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.95)
      // Кривая: полоса нормы, развёртка рваного графика, затем он успокаивается внутрь полосы
      .from(hero.el.querySelectorAll('.curve__band, .curve__edge'), { scaleY: 0, transformOrigin: '50% 50%', autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.5)
      .fromTo(hero.rect, { attr: { width: 0 } }, { attr: { width: W + 20 }, duration: 1.1, ease: 'power2.inOut' }, 0.55)
      .to(hero, { t: 1, duration: 1.5, ease: 'power3.inOut', onUpdate: () => draw(hero) }, 1.3)
      .from(hero.dot, { scale: 0, autoAlpha: 0, duration: 0.6, ease: 'back.out(2.4)' }, 2.3)
      .from('.curve--hero .curve__label', { x: 10, autoAlpha: 0, duration: 0.6 }, 2.3)
      .from(lead.lines, { yPercent: 100, stagger: 0.1, duration: 0.95 }, 1.15)
      .from('.hero__tags li', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 1.45)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.12, duration: 0.7 }, 1.6);

    // Волна «дышит», пока первый экран виден
    let live = true;
    ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: s => { live = s.isActive; } });
    gsap.ticker.add((time, delta) => {
      if (!live || intro.time() < 1.3) return;
      hero.phase += delta * 0.0011;
      draw(hero);
    });

    // Лёгкий параллакс фото
    gsap.to('.hero__photo img', {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- мини-кривые секций: выравниваются при прокрутке ---------- */
    minis.forEach(c => {
      c.t = 0; draw(c);
      // Один раз при появлении: развёртка рваной линии, затем она уходит в полосу нормы
      gsap.timeline({ scrollTrigger: { trigger: c.el, start: 'top 88%' } })
        .from(c.el.querySelector('.curve__band'), { scaleY: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'expo.out' }, 0)
        .fromTo(c.rect, { attr: { width: 0 } }, { attr: { width: W + 20 }, duration: 0.9, ease: 'power2.inOut' }, 0.1)
        .to(c, { t: 1, phase: c.phase + 1.2, duration: 1.3, ease: 'power3.inOut', onUpdate: () => draw(c) }, 0.75);
    });

    // Заголовок строками из-под маски; после анимации split снимаем
    function revealLines(selector, trigger, vars = {}) {
      const el = $(selector);
      if (!el) return;
      const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out', ...vars,
        scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
        onComplete: () => split.revert(),
      });
    }

    /* ---------- 2. О себе ---------- */
    const hello = SplitText.create('.about__hello', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ scrollTrigger: { trigger: '.about .sec-head', start: 'top 82%' }, onComplete: () => hello.revert() })
      .from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0)
      .from(hello.chars, { yPercent: 105, rotate: 6, transformOrigin: '0% 100%', stagger: 0.04, duration: 1, ease: 'expo.out' }, 0.1);
    revealLines('.about__intro', '.about__intro');
    revealLines('.about__ally', '.about__ally');
    $$('.check').forEach(li => {
      const icon = $('.check__icon', li);
      const strokes = $$('circle, path', icon);
      strokes.forEach(s => s.setAttribute('pathLength', '1'));
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 88%' } })
        .fromTo(strokes, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.25, ease: 'power2.inOut' }, 0)
        .from(li.querySelector('p'), { x: -14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.15);
    });

    /* ---------- 3. Запись ---------- */
    gsap.from('.visit .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.visit .sec-head', start: 'top 84%' } });
    revealLines('.visit h2', '.visit .sec-head');
    $$('.plan').forEach((card, i) => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' } })
        .fromTo(card,
          { clipPath: 'inset(18% 0% 0% 0% round 28px)', y: 50 },
          { clipPath: 'inset(0% 0% 0% 0% round 28px)', y: 0, duration: 1.15, ease: 'expo.out', clearProps: 'clipPath', delay: window.innerWidth >= 900 ? i * 0.12 : 0 })
        .from(card.querySelectorAll('.plan__tag, .plan__title, .plan__phone'), { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' }, 0.25);
    });
    // Цена появляется целиком, без счётчика
    gsap.from('.plan__price', { y: 16, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.plan__price', start: 'top 92%' } });
    // Сообщение «консультация» уходит в чат, потом галочки «прочитано»
    const ticks = $('.chat__ticks path');
    ticks.setAttribute('pathLength', '1');
    gsap.timeline({ scrollTrigger: { trigger: '.chat', start: 'top 88%' } })
      .from('.chat__bubble', { scale: 0.6, y: 20, autoAlpha: 0, transformOrigin: '100% 100%', duration: 0.7, ease: 'back.out(1.8)' })
      .fromTo(ticks, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, 0.55);
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
