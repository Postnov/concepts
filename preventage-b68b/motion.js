// PreventAge® — моушн концепта.
// Фирменная идея: спираль ДНК из логотипа института. В hero она собирается от центра и медленно вращается
// (прокрутка её подкручивает), перекладины-«пары оснований» окрашены в цвета программ с Taplink.
// В списке программ та же спираль идёт рельсом слева и раскручивается прокруткой; карточки «прокрашиваются» цветом своей программы.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  // Цвета программ (как плашки на Taplink) — перекладины спирали
  const PALETTE = ['#41a93d', '#3c4884', '#c4557d', '#005058', '#2c1880', '#cc4c8c', '#4f6f99', '#7c503c'];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);

  /* ---------- Спираль ДНК на canvas: ось вдоль длинной стороны контейнера ---------- */
  function Helix(wrap, o = {}) {
    const canvas = $('canvas', wrap);
    const ctx = canvas.getContext('2d');
    const st = { phase: o.phase ?? 0.9, build: 1, w: 0, h: 0, dpr: 1 };

    function draw() {
      const { w, h, dpr } = st;
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const vertical = h > w;
      const len = vertical ? h : w;
      const cross = vertical ? w : h;
      const amp = cross * (o.amp ?? 0.33);
      const period = o.period ?? clamp(cross * 1.75, 230, 430);  // px на полный оборот
      const step = o.step ?? period / 11;                         // шаг перекладин
      const sub = o.sub ?? 3;                                     // точек «хребта» на шаг
      const mid = cross / 2;
      const fadeLen = o.fade ?? len * 0.1;
      const items = [];
      const pt = (a, c) => (vertical ? [c, a] : [a, c]);
      const total = Math.floor(len / (step / sub));
      const start = (len - total * (step / sub)) / 2;
      for (let i = 0; i <= total; i++) {
        const s = start + i * (step / sub);
        // сборка: от центра к краям
        const dist = Math.abs(s / len - 0.5) * 2;
        const k = ease(clamp((st.build - dist * 0.45) / 0.55, 0, 1));
        if (k <= 0) continue;
        const edge = fadeLen ? clamp(Math.min(s, len - s) / fadeLen, 0, 1) : 1;
        const t = (s / period) * Math.PI * 2 + st.phase;
        const sin = Math.sin(t), cos = Math.cos(t);
        const a = { p: pt(s, mid + amp * sin * k), z: cos };
        const b = { p: pt(s, mid - amp * sin * k), z: -cos };
        items.push({ dot: a, z: a.z, k, edge });
        items.push({ dot: b, z: b.z, k, edge });
        if (i % sub === 0) {
          const n = Math.round(i / sub);
          const col = o.colorAt ? o.colorAt(s) : PALETTE[n % PALETTE.length];
          const col2 = o.colorAt ? col : PALETTE[(n + 4) % PALETTE.length];
          const m = [(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2];
          // перекладина — две половины («пара оснований»), каждая на своей глубине
          items.push({ line: [a.p, m], col, z: a.z / 2 - 0.01, k, edge });
          items.push({ line: [m, b.p], col: col2, z: b.z / 2 - 0.01, k, edge });
        }
      }
      items.sort((x, y) => x.z - y.z);
      const dotR = o.dot ?? clamp(cross * 0.022, 3.8, 7), rungW = o.rung ?? clamp(cross * 0.022, 3.8, 7);
      ctx.lineCap = 'round';
      for (const it of items) {
        const d = (it.z + 1) / 2;                       // 0 — сзади, 1 — спереди
        ctx.globalAlpha = (0.22 + 0.78 * d) * it.k * it.edge;
        if (it.dot) {
          ctx.fillStyle = d > 0.5 ? (o.front ?? '#28842e') : (o.back ?? '#7cc477');
          ctx.beginPath();
          ctx.arc(it.dot.p[0], it.dot.p[1], dotR * (0.5 + 0.5 * d), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = it.col;
          ctx.lineWidth = rungW * (0.6 + 0.4 * d);
          ctx.beginPath();
          ctx.moveTo(it.line[0][0], it.line[0][1]);
          ctx.lineTo(it.line[1][0], it.line[1][1]);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    function resize() {
      const r = wrap.getBoundingClientRect();
      st.dpr = Math.min(2, window.devicePixelRatio || 1);
      st.w = r.width; st.h = r.height;
      canvas.width = Math.round(r.width * st.dpr);
      canvas.height = Math.round(r.height * st.dpr);
      o.onResize && o.onResize();
      draw();
    }
    new ResizeObserver(resize).observe(wrap);
    resize();
    // Рисуем только на экране
    st.visible = true;
    new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; }).observe(wrap);
    return { st, draw, resize };
  }

  /* ---------- Рельс в программах: перекладины в цвет карточки, мимо которой идут ---------- */
  const list = $('.programs__list');
  const cards = $$('.prog');
  let spans = [];
  const measureCards = () => {
    spans = cards.map(c => ({ top: c.offsetTop, bottom: c.offsetTop + c.offsetHeight, col: getComputedStyle(c).getPropertyValue('--ink').trim() }));
  };
  const rail = Helix($('.helix--rail'), {
    period: 120, step: 15, sub: 2, amp: 0.38, dot: 2.4, rung: 2.6, fade: 40, phase: 0.4,
    colorAt: s => (spans.find(x => s >= x.top + 14 && s <= x.bottom - 14) || { col: '#c4d3c7' }).col,
    onResize: measureCards,
  });
  const hero = Helix($('.helix--hero'), { phase: 0.9 });

  if (!animate) return; // reduced motion / без GSAP: спирали нарисованы статично, всё видно

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    hero.st.build = 0;
    hero.draw();

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { title.revert(); lead.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__logo img', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' }, 0.1)
      .from('.kicker', { y: 10, autoAlpha: 0, duration: 0.6 }, 0.4)
      .from(title.chars, { yPercent: 112, stagger: 0.022, duration: 1, ease: 'expo.out' }, 0.45)
      .to(hero.st, { build: 1, duration: 2, ease: 'power2.out' }, 0.55)
      .from('.hero__years', { y: 24, autoAlpha: 0, duration: 0.8 }, 0.95)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.9 }, 1.05)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.2)
      .from('.hero__legal', { autoAlpha: 0, duration: 0.9 }, 1.4);

    // Вращение: базовая скорость + подкрутка от скорости прокрутки
    let boost = 0;
    ScrollTrigger.create({ onUpdate: self => { boost = Math.min(5, boost + Math.abs(self.getVelocity()) / 2500); } });
    gsap.ticker.add((time, dt) => {
      boost *= 0.94;
      hero.st.phase += (dt / 1000) * (0.55 + boost);
      if (hero.st.visible) hero.draw();
    });

    /* ---------- 2. Базовый цикл: три основы сходятся в одну систему ---------- */
    revealLines('.cycle h2', '.cycle .sec-head');
    gsap.from(['.cycle .eyebrow', '.cycle .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.cycle .sec-head', start: 'top 84%' },
    });
    gsap.timeline({ defaults: { duration: 1.6, ease: 'expo.inOut' }, scrollTrigger: { trigger: '.venn', start: 'top 72%' } })
      .from('.venn__c', { scale: 0.6, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }, 0)
      .from('.venn__c--a', { xPercent: -16, yPercent: -9 }, 0)
      .from('.venn__c--b', { xPercent: 16, yPercent: -9 }, 0)
      .from('.venn__c--c', { yPercent: 18 }, 0)
      .from('.venn__core', { scale: 0.4, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.8)' }, 1.15);
    gsap.from('.cycle__text', { y: 24, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.cycle__text', start: 'top 88%' } });
    gsap.from('.stream', {
      y: 40, autoAlpha: 0, duration: 0.95, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.streams', start: 'top 88%' },
    });

    /* ---------- 3. Программы: карточка прокрашивается цветом программы от её точки ---------- */
    revealLines('.programs h2', '.programs .sec-head');
    gsap.from('.programs .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.programs .sec-head', start: 'top 84%' } });
    cards.forEach(card => {
      const dot = $('.prog__dot', card);
      const at = () => {
        const c = card.getBoundingClientRect(), d = dot.getBoundingClientRect();
        return `${d.left - c.left + d.width / 2}px ${d.top - c.top + d.height / 2}px`;
      };
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 86%' } })
        .from(card, { y: 46, duration: 1, ease: 'expo.out' }, 0)
        .fromTo($('.prog__fill', card), { clipPath: () => `circle(0% at ${at()})` }, { clipPath: () => `circle(150% at ${at()})`, duration: 1.4, ease: 'power2.inOut' }, 0.1)
        .from(card.querySelectorAll('.prog__meta, .prog__title, .prog__text, .btn'), { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.2);
    });
    // Рельс раскручивается прокруткой
    ScrollTrigger.create({
      trigger: list, start: 'top 85%', end: 'bottom 15%',
      onUpdate: self => { rail.st.phase = 0.4 + self.progress * Math.PI * 6; rail.draw(); },
    });
    gsap.from('.helix--rail', { autoAlpha: 0, duration: 1, scrollTrigger: { trigger: list, start: 'top 85%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
