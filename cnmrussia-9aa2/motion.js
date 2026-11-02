// CNM — моушн концепта. Фирменная идея: глобус из 112 точек-стран (по числу стран выпускников),
// из Великобритании к ним тянутся золотые дуги — «международный диплом онлайн из любой точки мира».
// Глобус рисуется на canvas и без GSAP; при reduced motion — один статичный кадр.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= Глобус ================= */
  function createGlobe(canvas) {
    const ctx = canvas.getContext('2d');
    const N = 112;
    const GOLD = '230, 194, 122';
    const IVORY = '244, 239, 226';
    const LEAF = '157, 211, 160';
    const TILT = 0.42; // наклон оси к зрителю: видно северное полушарие
    const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

    // Равномерные точки на сфере (решётка Фибоначчи)
    const pts = [];
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - ((i + 0.5) / N) * 2;
      const r = Math.sqrt(1 - y * y);
      pts.push({ x: Math.cos(i * ga) * r, y, z: Math.sin(i * ga) * r, lit: -10, order: rnd() });
    }
    // Порядок появления точек при интро — вразброс
    const appear = pts.map((p, i) => i).sort((a, b) => pts[a].order - pts[b].order);
    appear.forEach((idx, k) => { pts[idx].rank = k; });
    // «Великобритания»: широта ~52°
    const lat0 = 52 * Math.PI / 180, lon0 = -0.3;
    const origin = { x: Math.cos(lat0) * Math.sin(lon0), y: Math.sin(lat0), z: Math.cos(lat0) * Math.cos(lon0) };

    let W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;
    const resize = () => {
      const b = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = b.width; H = b.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      R = Math.min(W, H) * 0.41; cx = W / 2; cy = H * 0.5;
    };

    // Поворот: Великобритания (долгота lon0) держится на видимой стороне, глобус покачивается вокруг неё
    const BASE = 0.1;
    let angle = BASE;
    const proj = (p, lift = 1) => {
      const ca = Math.cos(angle), sa = Math.sin(angle);
      const x1 = p.x * ca + p.z * sa, z1 = -p.x * sa + p.z * ca, y1 = p.y;
      const ct = Math.cos(TILT), st = Math.sin(TILT);
      const y2 = y1 * ct - z1 * st, z2 = y1 * st + z1 * ct;
      return { x: cx + x1 * R * lift, y: cy - y2 * R * lift, z: z2 };
    };
    // Точка дуги: сферическая интерполяция с подъёмом над поверхностью
    const slerp = (a, b, t, om) => {
      const s = Math.sin(om);
      const k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
      return { x: a.x * k1 + b.x * k2, y: a.y * k1 + b.y * k2, z: a.z * k1 + b.z * k2 };
    };
    const hidden = q => q.z < 0 && Math.hypot(q.x - cx, q.y - cy) < R * 0.995;

    const arcs = [];
    const spawn = (now, done) => {
      // Цель — видимая сейчас точка, не слишком близко к источнику
      const cand = pts.filter(p => {
        const om = Math.acos(Math.max(-1, Math.min(1, p.x * origin.x + p.y * origin.y + p.z * origin.z)));
        return om > 0.55 && proj(p).z > 0.05 && !arcs.some(a => a.to === p);
      });
      if (!cand.length) return;
      const to = cand[Math.floor(rnd() * cand.length)];
      const om = Math.acos(to.x * origin.x + to.y * origin.y + to.z * origin.z);
      arcs.push({ to, om, h: 0.05 + om * 0.07, t0: done ? -10 : now, life: 3.6, fixed: !!done });
    };

    const latLine = (lat, steps = 72) => {
      const out = [];
      for (let i = 0; i <= steps; i++) {
        const lon = (i / steps) * Math.PI * 2;
        out.push({ x: Math.cos(lat) * Math.sin(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) });
      }
      return out;
    };
    const lonLine = (lon, steps = 48) => {
      const out = [];
      for (let i = 0; i <= steps; i++) {
        const lat = -Math.PI / 2 + (i / steps) * Math.PI;
        out.push({ x: Math.cos(lat) * Math.sin(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) });
      }
      return out;
    };
    const grid = [
      ...[-60, -30, 0, 30, 60].map(d => latLine(d * Math.PI / 180)),
      ...[0, 30, 60, 90, 120, 150].map(d => lonLine(d * Math.PI / 180)),
    ];
    const strokePath = (list, styleFront, styleBack) => {
      for (const [style, front] of [[styleBack, false], [styleFront, true]]) {
        ctx.beginPath();
        let pen = false;
        for (const p of list) {
          const q = proj(p);
          if ((q.z >= 0) === front) { pen ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); pen = true; } else pen = false;
        }
        ctx.strokeStyle = style; ctx.stroke();
      }
    };

    const state = { intro: 1, count: null };
    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const k = state.intro;

      // Мягкое свечение и контур сферы
      const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R * 1.15);
      g.addColorStop(0, `rgba(${LEAF}, ${0.16 * k})`);
      g.addColorStop(0.7, `rgba(${LEAF}, ${0.05 * k})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${IVORY}, ${0.22 * k})`;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      // Параллели и меридианы
      ctx.lineWidth = 0.8;
      grid.forEach(line => strokePath(line, `rgba(${IVORY}, ${0.1 * k})`, `rgba(${IVORY}, ${0.03 * k})`));

      // Точки-страны
      const shown = k * N;
      for (const p of pts) {
        if (p.rank >= shown) continue;
        const a = Math.min(1, shown - p.rank);
        const q = proj(p);
        const front = q.z >= 0;
        const lit = Math.max(0, 1 - (now - p.lit) / 2.2);
        const size = front ? 1.5 + q.z * 1.4 : 1.1;
        ctx.globalAlpha = a * (front ? 0.45 + q.z * 0.55 : 0.16);
        ctx.fillStyle = lit > 0 ? `rgb(${GOLD})` : `rgb(${IVORY})`;
        ctx.beginPath(); ctx.arc(q.x, q.y, size + lit * 1.2, 0, Math.PI * 2); ctx.fill();
        if (lit > 0 && front) { // круг от «прилетевшей» дуги
          ctx.globalAlpha = lit * 0.7;
          ctx.strokeStyle = `rgb(${GOLD})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(q.x, q.y, size + (1 - lit) * 14, 0, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Золотые дуги
      for (let i = arcs.length - 1; i >= 0; i--) {
        const a = arcs[i];
        const t = a.fixed ? 1 : (now - a.t0) / a.life * 2; // 0..1 — рост, 1..2 — уход хвоста
        if (t >= 2) { arcs.splice(i, 1); continue; }
        const head = Math.min(1, t), tail = Math.max(0, t - 1);
        const steps = 40;
        let prev = null;
        ctx.lineWidth = 1.6; ctx.lineCap = 'round';
        for (let s = 0; s <= steps; s++) {
          const u = tail + (head - tail) * (s / steps);
          const q = proj(slerp(origin, a.to, u, a.om), 1 + a.h * Math.sin(Math.PI * u));
          if (prev && !hidden(q) && !hidden(prev)) {
            ctx.strokeStyle = `rgba(${GOLD}, ${(0.25 + 0.75 * (s / steps)) * k})`;
            ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
          prev = q;
        }
        if (t < 1 && prev && !hidden(prev)) { // яркая «голова» дуги
          ctx.fillStyle = `rgba(${GOLD}, 1)`;
          ctx.beginPath(); ctx.arc(prev.x, prev.y, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        if (!a.fired && t >= 1) { a.fired = true; a.to.lit = now; }
      }

      // Источник — Великобритания
      const o = proj(origin);
      if (o.z > -0.05) {
        const pulse = (now % 2.4) / 2.4;
        ctx.globalAlpha = k;
        ctx.fillStyle = `rgb(${GOLD})`;
        ctx.beginPath(); ctx.arc(o.x, o.y, 3.4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(${GOLD}, ${(1 - pulse) * 0.8})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(o.x, o.y, 4 + pulse * 16, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '500 10px "Wix Madefor Text", system-ui, sans-serif';
        ctx.fillStyle = `rgba(${IVORY}, .85)`;
        ctx.fillText('UK', o.x + 9, o.y - 7);
        ctx.globalAlpha = 1;
      }
    }

    resize();
    let raf = 0, visible = true, spawnAt = 0, spawned = 0, t0 = performance.now();
    const api = {
      state,
      // Статичный кадр: все точки и несколько готовых дуг
      still() {
        resize(); state.intro = 1; angle = BASE;
        for (let i = 0; i < 6; i++) spawn(0, true);
        arcs.forEach(a => { a.to.lit = -10; a.fired = true; });
        draw(0);
      },
      play() {
        for (let i = arcs.length - 1; i >= 0; i--) if (arcs[i].fixed) arcs.splice(i, 1);
        const loop = ts => {
          raf = requestAnimationFrame(loop);
          if (!visible) return;
          const now = (ts - t0) / 1000;
          angle = BASE + 0.75 * Math.sin(now * 0.15) + window.scrollY * 0.0012;
          if (state.intro > 0.35 && now > spawnAt) {
            // первые три дуги — почти разом, дальше по одной
            spawn(now); spawned++;
            spawnAt = now + (spawned < 3 ? 0.18 : 0.3 + rnd() * 0.3);
          }
          if (arcs.length > 9) arcs.shift();
          draw(now);
        };
        raf = requestAnimationFrame(loop);
        new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);
      },
      resize() { resize(); },
    };
    new ResizeObserver(() => { resize(); if (!raf) draw(0); }).observe(canvas);
    return api;
  }

  const canvas = $('.globe__canvas');
  const globe = canvas && canvas.getContext ? createGlobe(canvas) : null;

  if (!animate) {
    // Без анимаций: статичный глобус после загрузки шрифтов (подпись UK рисуется шрифтом сайта)
    if (globe) (window.MotionBase ? MotionBase.ready(() => globe.still()) : globe.still());
    if (globe && !reduce) globe.play();
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger, delay = 0) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.09, ease: 'expo.out', delay,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  function revealChars(selector, trigger) {
    const split = SplitText.create(selector, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from(split.chars, {
      yPercent: 110, duration: 1.1, stagger: 0.035, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const title = SplitText.create('.hero__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const count = $('.globe__count');
    const counter = { v: 0 };
    globe.state.intro = 0;

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { title.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.crest__logo', { rotate: -140, scale: 0.5, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.1)
      .from('.crest__name > *', { x: -14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.3)
      .from('.hero .kicker > *', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.35)
      .from(title.chars, { yPercent: 112, stagger: 0.022, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from('.globe', { scale: 0.86, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.45)
      // Точки-страны загораются по одной, счётчик стран идёт вместе с ними (это не цена)
      .to(globe.state, { intro: 1, duration: 1.6, ease: 'power2.inOut' }, 0.6)
      .fromTo(counter, { v: 0 }, {
        v: 112, duration: 1.6, ease: 'power2.inOut',
        onUpdate: () => { count.textContent = Math.round(counter.v); },
      }, 0.6)
      .from('.globe__stat', { y: 16, autoAlpha: 0, stagger: 0.15, duration: 0.8 }, 0.9)
      .from('.globe__note', { autoAlpha: 0, duration: 0.8 }, 1.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.95 }, 0.8)
      .from('.hero__cta > *', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.05);
    globe.play();

    // Блик на главных кнопках раз в несколько секунд
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i * 0.7 });
    });
    // Глобус на прокрутке уходит чуть медленнее текста
    gsap.to('.globe', {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Обучение ---------- */
    revealChars('.programs h2', '.programs .sec-head');
    gsap.from('.programs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.programs .sec-head', start: 'top 84%' } });
    // Карточки программ раскрываются сверху вниз, как разворачивают диплом
    $$('.prog').forEach(card => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
        .fromTo(card, { clipPath: 'inset(0% 0% 100% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' })
        .from($('.prog__num', card), { yPercent: 70, rotate: -12, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.35)
        .from($$('.prog__kind, .prog__title, .prog__tags > span', card), { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.4)
        .from($('.prog__go', card), { scale: 0, rotate: -90, duration: 0.8, ease: 'back.out(1.7)' }, 0.6);
    });
    gsap.timeline({ scrollTrigger: { trigger: '.consult', start: 'top 86%' } })
      .from('.consult', { scale: 0.94, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.consult__label', { y: 10, autoAlpha: 0, duration: 0.6 }, 0.25)
      .from('.consult__actions > *', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, 0.5);
    revealLines('.consult__title', '.consult', 0.3);

    /* ---------- 3. Премия: медаль «ставится печатью» ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.award__seal', start: 'top 80%' } })
      .from('.award__badge', { scale: 1.6, rotate: -24, autoAlpha: 0, duration: 0.75, ease: 'power4.in' })
      .to('.award__badge', { keyframes: { scale: [1, 0.96, 1] }, duration: 0.45, ease: 'power2.out' })
      .from('.award__rays', { scale: 0.4, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.7)
      // Блик по медали: сразу после «печати», дальше раз в несколько секунд
      .add(() => gsap.fromTo('.award__glint', { '--glint': '160%' }, { '--glint': '-60%', duration: 1.5, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.5 }), 1.1);
    gsap.to('.award__rays', { rotate: 360, duration: 90, ease: 'none', repeat: -1 });
    gsap.from('.award .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.award__text', start: 'top 84%' } });
    revealChars('.award__num', '.award__text');
    revealLines('.award__title', '.award__text', 0.15);
    gsap.from('.video-link', { y: 20, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.video-link', start: 'top 92%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
