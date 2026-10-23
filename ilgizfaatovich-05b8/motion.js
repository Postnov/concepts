// Ильгиз Фаатович — моушн концепта. Фирменная идея: «напряжение отпускает».
// В hero жгут тугих, спутанных нитей (как зажатые мышцы и фасции) распускается слева направо
// в ровные плавные линии; после этого нити спокойно дышат и мягко уступают прикосновению курсора/пальца.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- нити: геометрия и отрисовка (работает и без GSAP, тогда рисуется один раз спокойное состояние) ---------- */
  function strands() {
    const hero = $('.hero');
    const svg = $('.strands');
    if (!hero || !svg) return null;
    const NS = 'http://www.w3.org/2000/svg';
    const COUNT = 9;
    // Спокойные цвета нитей и «горячий» цвет напряжения
    const calm = ['#e3a84d', '#93a96c', '#f4ecd8', '#e3a84d', '#93a96c', '#e3a84d', '#f4ecd8', '#93a96c', '#e3a84d'];
    const alpha = [.9, .75, .45, .7, .85, .55, .4, .7, .8];
    const lines = Array.from({ length: COUNT }, (_, i) => {
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-width', (0.9 + (i % 3) * 0.35).toFixed(2));
      path.setAttribute('stroke-opacity', alpha[i]);
      svg.appendChild(path);
      return { path, a: i * 2.17 + 0.6, b: i * 1.31 + 2.1, c: i * 3.07 + 0.2, k: i / (COUNT - 1) - 0.5 };
    });

    const S = { p: window.MotionBase && animate ? 0 : 1, time: 0, px: 0, py: 0, tx: 0, ty: 0, infl: 0 };
    let W = 0, H = 0, x0 = 0, cx = 0, cy = 0, spread = 0, step = 8, active = true;
    const smooth = t => t * t * (3 - 2 * t);
    const clamp01 = v => Math.max(0, Math.min(1, v));

    function layout() {
      const r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      svg.setAttribute('viewBox', `0 0 ${W.toFixed(1)} ${H.toFixed(1)}`);
      const arch = $('.hero__photo .arch').getBoundingClientRect();
      cx = arch.left - r.left + arch.width / 2;
      // Жгут лежит у основания портрета (плечи): напряжение видно, а лицо и борода не закрыты
      cy = arch.top - r.top + arch.height * 0.94;
      spread = arch.height * 0.12;
      step = W < 700 ? 8 : 10;
      x0 = W < 900 ? 0 : W * 0.5;
      draw();
    }

    function draw() {
      const time = S.time;
      lines.forEach((ln, i) => {
        let d = '';
        for (let x = -10; x <= W + 10 + step; x += step) {
          // На десктопе левая половина hero скрыта маской: распускание бежит по видимой правой части
          const xn = clamp01((x - x0) / (W - x0));
          // Прогресс «распускания» бежит слева направо
          const rel = clamp01((S.p * 1.7 - xn) / 0.7);
          const T = 1 - smooth(rel);
          // Спокойная нить: параллельные плавные волны
          const wave = Math.sin(x * 0.0062 + ln.a + time * 0.32) * 15 + Math.sin(x * 0.0135 + ln.b - time * 0.22) * 7;
          const calmY = cy + ln.k * 2 * spread + wave * (0.7 + (i % 3) * 0.2);
          // Тугой жгут: все нити сбиты в полосу и дёргаются с высокой частотой
          const noise = Math.sin(x * 0.085 + ln.a * 3) * 0.5 + Math.sin(x * 0.23 + ln.b * 2) * 0.3 + Math.sin(x * 0.47 + ln.c) * 0.2;
          const knotY = cy + Math.sin(x * 0.02 + time * 0.8) * 6 + noise * 24 + ln.k * 18;
          let y = calmY + (knotY - calmY) * T;
          // Прикосновение: нить обходит курсор
          if (S.infl > 0.001) {
            const dy = y - S.py;
            const fall = Math.exp(-((x - S.px) ** 2) / (2 * 95 * 95)) * Math.exp(-(dy * dy) / (2 * 80 * 80));
            y += Math.tanh(dy / 26) * fall * 30 * S.infl;
          }
          d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
        }
        ln.path.setAttribute('d', d);
        ln.path.setAttribute('stroke', tint(ln, S.p));
      });
    }
    // Цвет: от «горячего» напряжения к спокойному цвету нити
    const mix = (a, b, t) => {
      const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
      const c = s => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
      return `rgb(${c(16)},${c(8)},${c(0)})`;
    };
    function tint(ln, p) { return mix('#d9603a', calm[lines.indexOf(ln)], smooth(clamp01(p * 1.15))); }

    layout();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });

    // Прикосновение курсора / пальца
    const onMove = e => {
      const r = hero.getBoundingClientRect();
      S.tx = e.clientX - r.left; S.ty = e.clientY - r.top;
      if (!S.hover) { S.px = S.tx; S.py = S.ty; S.hover = true; }
      if (animate) gsap.to(S, { infl: 1, duration: 0.6, overwrite: 'auto' });
    };
    const onLeave = () => { S.hover = false; if (animate) gsap.to(S, { infl: 0, duration: 1.1, overwrite: 'auto' }); };
    hero.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', onLeave);
    hero.addEventListener('pointercancel', onLeave);
    hero.addEventListener('pointerup', e => e.pointerType === 'touch' && onLeave());

    if (animate) {
      gsap.ticker.add(() => {
        if (!active) return;
        S.time = gsap.ticker.time;
        S.px += (S.tx - S.px) * 0.12;
        S.py += (S.ty - S.py) * 0.12;
        draw();
      });
      ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: st => { active = st.isActive; } });
    }
    return { S, layout, draw };
  }

  const heroStrands = strands();

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    if (heroStrands) heroStrands.layout();

    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const arch = $('.hero__photo .arch');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); gsap.set(arch, { clearProps: 'clipPath' }); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(arch, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.2)
      .from('.hero__photo', { '--ol': 0, duration: 1.2, ease: 'power1.out' }, 0.9)
      .from('.hero__glow', { autoAlpha: 0, scale: 0.8, duration: 2.2, ease: 'power2.out' }, 0.2)
      .from('.strands', { autoAlpha: 0, duration: 1.2, ease: 'power1.out' }, 0.2)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.45)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.5)
      .from('.hero__brand', { y: 12, autoAlpha: 0, duration: 0.8 }, 0.95)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.35)
      .from('.facts li', { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.5);

    // Жгут распускается: слева направо, ~3 секунды
    if (heroStrands) {
      gsap.to(heroStrands.S, { p: 1, duration: 3.6, delay: 0.7, ease: 'power2.inOut' });
    }

    // Лёгкий параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Методика ---------- */
    revealLines('.method h2', '.method .sec-head');
    gsap.from('.method .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.method .sec-head', start: 'top 82%' } });
    gsap.from('.method__closing', { y: 22, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.method__closing', start: 'top 90%' } });
    $$('.tool').forEach(tool => {
      const strokes = $$('.tool__icon *', tool);
      gsap.set(strokes, { strokeDashoffset: 1 });
      gsap.timeline({ scrollTrigger: { trigger: tool, start: 'top 82%' }, defaults: { ease: 'power3.out' } })
        .to(strokes, { strokeDashoffset: 0, duration: 1.4, stagger: 0.18, ease: 'power2.inOut' }, 0)
        .from($('.tool__num', tool), { x: -14, autoAlpha: 0, duration: 0.6 }, 0.1)
        .from($('.tool__title', tool), { y: 22, autoAlpha: 0, duration: 0.9 }, 0.15)
        .from($('.tool__text', tool), { y: 20, autoAlpha: 0, duration: 0.9 }, 0.3);
    });

    /* ---------- 3. Стоимость ---------- */
    revealLines('.pricing h2', '.pricing .sec-head');
    gsap.from('.pricing .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.pricing .sec-head', start: 'top 82%' } });
    $$('.price').forEach(row => {
      gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%' }, defaults: { ease: 'power3.out' } })
        .from(row, { y: 40, autoAlpha: 0, duration: 0.9 }, 0)
        .from($('.price__sum', row), { y: 14, autoAlpha: 0, duration: 0.8 }, 0.25);
    });
    gsap.from('.pricing__cta > *', { y: 18, autoAlpha: 0, stagger: 0.12, duration: 0.8, scrollTrigger: { trigger: '.pricing__cta', start: 'top 92%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
