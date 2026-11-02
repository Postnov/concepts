// Анна — моушн концепта. Фирменная идея: единичная окружность. Точка обегает фото, из кольца вытекает синусоида;
// дальше по странице — «дано / решение / ответ»: линии чертятся, галочки рисуются, цена появляется целиком.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- единичная окружность ---------- */
  const fig = $('.hero__fig');
  const photo = $('.hero__photo');
  const svg = $('.hero__svg');
  const el = sel => $(sel, svg);
  const TH0 = 0.9;                 // стартовый угол, рад
  const OMEGA = (Math.PI * 2) / 11; // оборот за 11 секунд
  let g = null;                    // геометрия: центр, радиусы, длина волны
  let theta = TH0;
  let active = true;

  const set = (node, attrs) => { for (const k in attrs) node.setAttribute(k, attrs[k]); };

  function layout() {
    const W = fig.clientWidth, H = fig.clientHeight;
    const r = photo.offsetWidth / 2;
    const cx = photo.offsetLeft + r, cy = photo.offsetTop + r;
    const gap = parseFloat(getComputedStyle(fig).getPropertyValue('--gap')) || 27;
    const R = r + gap, x0 = cx + R;
    const A = R * 0.5;
    const periods = W > 640 ? 1.55 : 1.15;
    const k = Math.max(12, (W - x0 - 6) / (Math.PI * 2 * periods));
    g = { W, H, cx, cy, r, R, x0, A, k };
    set(svg, { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
    set(el('.ring'), { cx, cy, r: R });
    set(el('.ax--x'), { x1: 0, y1: cy, x2: W, y2: cy });
    set(el('.ax--y'), { x1: cx, y1: cy - R - 16, x2: cx, y2: cy + R + 16 });
    const grad = $('#wave-fade', svg);
    set(grad, { x1: x0, x2: W, y1: 0, y2: 0 });
    set(el('.wave-clip'), { x: x0 - 8, y: -40, height: H + 80, width: W - x0 + 16 });
    set(el('.lbl'), { x: W - 12, y: cy + A + 34, 'text-anchor': 'end' });
    draw(theta);
  }

  function draw(th) {
    if (!g) return;
    const { W, cx, cy, R, x0, A, k } = g;
    const dx = cx + R * Math.cos(th), dy = cy - R * Math.sin(th);
    const hy = cy - A * Math.sin(th);
    set(el('.dot'), { cx: dx, cy: dy });
    set(el('.dot-halo'), { cx: dx, cy: dy });
    set(el('.spoke'), { x1: cx, y1: cy, x2: dx, y2: dy });
    set(el('.tether'), { x1: dx, y1: dy, x2: x0, y2: hy });
    set(el('.head'), { cx: x0, cy: hy });
    let d = '';
    for (let x = x0; x <= W + 6; x += 4) {
      const y = cy - A * Math.sin(th - (x - x0) / k);
      d += `${x === x0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    set(el('.wave'), { d });
  }

  layout();
  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => { layout(); if (introDone) set(el('.wave-clip'), { width: g.W - g.x0 + 16 }); });
  });
  let introDone = false;

  if (!animate) { introDone = true; return; }

  gsap.ticker.add(time => {
    if (!active) return;
    theta = TH0 + time * OMEGA;
    draw(theta);
  });
  ScrollTrigger.create({ trigger: fig, start: 'top bottom', end: 'bottom top', onToggle: self => { active = self.isActive; } });

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const clip = el('.wave-clip');
    const fullW = g.W - g.x0 + 16;

    gsap.set(clip, { attr: { width: 0 } });
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); gsap.set(photo, { clearProps: 'clipPath' }); introDone = true; },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 115, stagger: 0.07, duration: 1.15, ease: 'expo.out' }, 0.35)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.9 }, 0.85)
      .fromTo(photo, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(76% at 50% 50%)', duration: 1.5, ease: 'expo.inOut' }, 0.25)
      .from('.hero__photo img', { scale: 1.4, duration: 2, ease: 'expo.out' }, 0.3)
      .from('.ring', { strokeDashoffset: 1, duration: 1.8, ease: 'power2.inOut' }, 0.45)
      .from('.ax', { autoAlpha: 0, duration: 1, stagger: 0.15 }, 0.7)
      .from(['.dot', '.dot-halo', '.spoke'], { autoAlpha: 0, duration: 0.8 }, 1.25)
      .to(clip, { attr: { width: fullW }, duration: 1.9, ease: 'power2.inOut' }, 1.1)
      .from(['.head', '.tether', '.lbl'], { autoAlpha: 0, duration: 0.9 }, 1.5)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.95)
      .from('.tags li', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.3)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.45);

    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Обо мне ---------- */
    gsap.from('.about__card', { y: 56, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.about__card', start: 'top 88%' } });
    revealLines('.about h2', '.about__card');
    gsap.from('.about .eyebrow', { x: -16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about__card', start: 'top 80%' } });
    $$('.card-wave path').forEach(path => gsap.from(path, { strokeDashoffset: 1, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: path.closest('.about__card, .price__card'), start: 'top 80%' } }));
    gsap.from('.about__num', {
      yPercent: 28, autoAlpha: 0, scale: 0.92, transformOrigin: '0% 60%', duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: '.about__years', start: 'top 85%' },
    });
    gsap.from('.about__lead', { y: 18, autoAlpha: 0, duration: 0.9, delay: 0.15, scrollTrigger: { trigger: '.about__years', start: 'top 85%' } });
    $$('.checks li').forEach(li => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%' } });
      tl.from(li, { x: -22, autoAlpha: 0, duration: 0.8, ease: 'power3.out' })
        .from($('circle', li), { strokeDashoffset: 1, duration: 0.8, ease: 'power2.inOut' }, 0.05)
        .from($('path', li), { strokeDashoffset: 1, duration: 0.55, ease: 'power2.out' }, 0.45);
    });

    /* ---------- 3. Занятия ---------- */
    revealLines('.lessons h2', '.lessons .sec-head');
    gsap.from('.lessons .eyebrow', { x: -16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.lessons .sec-head', start: 'top 85%' } });
    $$('.qa__row').forEach(row => {
      const body = $('dd', row);
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%' } });
      tl.from($('dt', row), { y: 12, autoAlpha: 0, duration: 0.7 })
        .from(body.children.length ? [...body.children] : body, { y: 26, autoAlpha: 0, duration: 0.95, stagger: 0.12, ease: 'expo.out' }, 0.12);
    });
    $$('.dashes li').forEach((li, i) => gsap.from(li, { x: -14, autoAlpha: 0, duration: 0.7, delay: i * 0.05, scrollTrigger: { trigger: li, start: 'top 92%' } }));
    gsap.from('.devices svg', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.1, scrollTrigger: { trigger: '.devices', start: 'top 92%' } });

    /* ---------- 4. Стоимость: цена появляется целиком, без счётчика ---------- */
    gsap.from('.price__card', { y: 56, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.price__card', start: 'top 88%' } });
    const pt = gsap.timeline({ scrollTrigger: { trigger: '.price__line', start: 'top 86%' } });
    pt.from('.price__label', { y: 14, autoAlpha: 0, duration: 0.8 })
      .from('.price__from', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.1)
      .from('.price__sum', { y: 26, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.18)
      .from('.price__unit', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.4)
      .from('.price__rule i', { scaleX: 0, duration: 0.9, stagger: 0.14, ease: 'expo.out' }, 0.7)
      .from('.price__card .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.0);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
