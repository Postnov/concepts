// Андрей Ткаченко — моушн концепта.
// Фирменная идея — «контуры дыхания»: топографические линии с его баннера вокруг портрета дышат
// (вдох 4 с, выдох 6 с), и жёлтая волна дыхания проходит сквозь них от центра и обратно.
// В расписании та же идея — линия-дыхание: между соседними программами один «вдох-выдох».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- контуры ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const TAU = Math.PI * 2;
  // Один контур: окружность с мягкими волнами по углу. phase чуть меняется от кольца к кольцу —
  // соседние линии похожи, поэтому вложены и не пересекаются (как горизонтали на карте)
  function ring(R, phase, t, wob, squash) {
    const n = 96;
    let d = '';
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU;
      const w = 0.55 * Math.sin(3 * a + phase + t * 0.21)
        + 0.3 * Math.sin(5 * a - phase * 1.6 - t * 0.13)
        + 0.15 * Math.sin(2 * a + phase * 0.7 + t * 0.08);
      const r = R * (1 + wob * w);
      d += (k ? 'L' : 'M') + (r * Math.cos(a)).toFixed(1) + ' ' + (r * Math.sin(a) * squash).toFixed(1);
    }
    return d + 'Z';
  }
  // Дыхание 0..1: вдох 4 с, выдох 6 с, мягко по косинусу
  const IN = 4, OUT = 6, CYCLE = IN + OUT;
  const breath = t => {
    const u = ((t % CYCLE) + CYCLE) % CYCLE;
    return u < IN ? 0.5 - 0.5 * Math.cos(Math.PI * u / IN) : 0.5 + 0.5 * Math.cos(Math.PI * (u - IN) / OUT);
  };

  function field(svg, cfg) {
    const mk = cls => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('class', cls);
      p.setAttribute('pathLength', '1');
      svg.appendChild(p);
      return p;
    };
    const lines = Array.from({ length: cfg.count }, () => mk(cfg.soft ? 'c-line c-line--soft' : 'c-line'));
    const pulse = cfg.pulse ? mk('c-pulse') : null;
    const draw = t => {
      lines.forEach((p, i) => {
        const s = 1 + cfg.amp * breath(t - i * 0.14);
        p.setAttribute('d', ring((cfg.r0 + i * cfg.gap) * s, i * 0.2, t, cfg.wob, cfg.squash));
      });
      if (pulse) {
        const b = breath(t);
        const f = 0.3 + b * cfg.reach; // «номер кольца», где сейчас волна
        const s = 1 + cfg.amp * b;
        pulse.setAttribute('d', ring((cfg.r0 + f * cfg.gap) * s, f * 0.2, t, cfg.wob, cfg.squash));
        pulse.setAttribute('stroke-opacity', (0.25 + 0.75 * Math.sin(Math.PI * Math.min(1, f / (cfg.reach + 1)))).toFixed(3));
      }
    };
    return { svg, lines, pulse, draw, active: true };
  }
  // Толщина линий в единицах viewBox = 1 px на экране. Не vector-effect: non-scaling-stroke —
  // с ним pathLength считается в другом масштабе и прорисовка (stroke-dash) обрывается на части контура
  const fitStroke = () => all.forEach(f => {
    const w = f.svg.getBoundingClientRect().width;
    if (w) f.svg.style.setProperty('--u', (1000 / w).toFixed(3));
  });

  // Поля контуров: hero — вокруг портрета, disc — круг в колонке расписания (десктоп), retreat — фон тёмной карточки
  const fields = {};
  const svgOf = id => $(`[data-contours="${id}"]`);
  if (svgOf('hero')) fields.hero = field(svgOf('hero'), { count: 16, r0: 74, gap: 27, amp: 0.055, wob: 0.075, squash: 0.92, pulse: true, reach: 6 });
  if (svgOf('disc')) fields.disc = field(svgOf('disc'), { count: 13, r0: 40, gap: 36, amp: 0.07, wob: 0.08, squash: 1, pulse: true, reach: 10 });
  if (svgOf('retreat')) fields.retreat = field(svgOf('retreat'), { count: 12, r0: 50, gap: 38, amp: 0.05, wob: 0.09, squash: 1, soft: true });
  const all = Object.values(fields);
  all.forEach(f => f.draw(1.6));
  fitStroke();
  window.addEventListener('resize', fitStroke);

  /* ---------- линия-дыхание в расписании: через все точки, между соседними — один вдох-выдох ---------- */
  const tl = $('.tl');
  const wave = $('.tl__wave');
  let waveStops = [];
  function buildWave() {
    if (!tl || !wave) return;
    const h = wave.getBoundingClientRect().height;
    const top = wave.getBoundingClientRect().top;
    const ys = $$('.tl__list > .ev', tl).map(ev => {
      const dot = $('.ev__dot', ev);
      const r = (dot && getComputedStyle(dot).display !== 'none' ? dot : ev).getBoundingClientRect();
      return Math.max(0, Math.min(h, r.top + 7 - top));
    });
    const pts = [0, ...ys.filter(y => y > 1), h].sort((a, b) => a - b);
    let d = 'M11 0';
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k], b = pts[k + 1], len = b - a;
      for (let y = a + 3; y <= b; y += 3) {
        const u = (y - a) / len;
        d += ` L${(11 + 6 * Math.sin(u * TAU)).toFixed(2)} ${y.toFixed(1)}`;
      }
    }
    wave.setAttribute('viewBox', `0 0 22 ${h.toFixed(1)}`);
    $$('path', wave).forEach(p => p.setAttribute('d', d));
    waveStops = ys.map(y => y / h);
  }
  buildWave();

  if (!animate) {
    window.addEventListener('resize', buildWave);
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines', linesClass: 'ln' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- общий тикер контуров (только пока поле на экране) ---------- */
    gsap.ticker.add(time => all.forEach(f => f.active && f.draw(time + 1.6)));
    // Поле дышит, только пока видно (и пока не скрыто вёрсткой, как круг на мобильном)
    const watch = (f, trigger) => {
      if (!f) return;
      f.active = false;
      ScrollTrigger.create({
        trigger, start: 'top bottom', end: 'bottom top',
        onToggle: s => { f.active = s.isActive && f.lines[0].getClientRects().length > 0; },
      });
    };
    watch(fields.hero, '.hero');
    watch(fields.disc, '.program');
    watch(fields.retreat, '.ev--retreat');

    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__line', { type: 'words,chars', wordsClass: 'sw', charsClass: 'ch', mask: 'chars' });
    const heroLines = fields.hero ? fields.hero.lines : [];
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      // контуры прорисовываются от центра наружу
      .fromTo(heroLines, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, stagger: 0.06, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, 0.1)
      .from('.hero .c-pulse', { autoAlpha: 0, duration: 1 }, 1.4)
      .from('.portrait__img', { yPercent: 10, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.35)
      .from('.hero .kicker > *', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.5)
      .from(name.chars, { yPercent: 110, duration: 1.05, ease: 'expo.out', stagger: { each: 0.035, from: 'center' } }, 0.55)
      .from('.hero__lead', { y: 18, autoAlpha: 0, duration: 0.9 }, 0.95)
      .fromTo('.hl', { '--hl': '0%' }, { '--hl': '100%', duration: 0.9, ease: 'power2.inOut' }, 1.3)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35)
      .from('.bio li', { x: -14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.5);

    // Лёгкий параллакс портрета
    gsap.to('.portrait__img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Программы ---------- */
    gsap.from('.program .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.program .sec-head', start: 'top 84%' } });
    revealLines('.program h2', '.program .sec-head');
    if (fields.disc) {
      gsap.timeline({ scrollTrigger: { trigger: '.breath-disc', start: 'top 85%' } })
        .from('.breath-disc', { scale: 0.85, autoAlpha: 0, duration: 1.2, ease: 'expo.out' })
        .fromTo(fields.disc.lines, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, stagger: 0.06, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, 0.1);
    }

    // Линия-дыхание рисуется прокруткой и не «отматывается» назад; точки загораются, когда линия до них дошла
    const draw = $('.tl__draw');
    const dots = $$('.tl__list > .ev .ev__dot');
    let reached = 0;
    const lit = new Set();
    ScrollTrigger.create({
      trigger: '.tl', start: 'top 72%', end: 'bottom 70%',
      onUpdate: s => {
        if (s.progress <= reached) return;
        reached = s.progress;
        gsap.set(draw, { strokeDashoffset: 1 - reached });
        waveStops.forEach((stop, i) => {
          if (reached + 0.01 >= stop && !lit.has(i) && dots[i]) {
            lit.add(i);
            gsap.fromTo(dots[i], { '--on': 0 }, { '--on': 1, duration: 0.6, ease: 'back.out(3)' });
          }
        });
      },
      onRefresh: () => { buildWave(); },
    });

    // Обычные программы: дата, заголовок, текст и кнопка — короткой лесенкой
    $$('.tl__list > .ev:not(.ev--retreat)').forEach(ev => {
      gsap.from([...ev.children].filter(n => !n.matches('.ev__dot, .point')), {
        y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: ev, start: 'top 84%' },
      });
    });

    // «Андреевские молчания»: карточка раскрывается, контуры прорисовываются, фразы проступают из тишины по одной
    const retreat = $('.ev--retreat');
    if (retreat) {
      const rLines = fields.retreat ? fields.retreat.lines : [];
      gsap.timeline({ scrollTrigger: { trigger: retreat, start: 'top 80%' } })
        .fromTo(retreat, { clipPath: 'inset(8% 6% 8% 6% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.2, ease: 'expo.out', clearProps: 'clipPath' })
        .fromTo(rLines, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, stagger: 0.07, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, 0)
        .from($$('.ev__date, .ev__title, .ev__type', retreat), { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.2)
        .from($$('.silence li', retreat), { autoAlpha: 0, filter: 'blur(8px)', y: 8, duration: 1.1, stagger: 0.55, ease: 'power2.out', clearProps: 'filter' }, 0.7)
        .from($$('.ev__text, .btn', retreat), { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 2.1);
    }

    // «Точка сборки»: круги сходятся к точке
    const point = $('.point');
    if (point) {
      gsap.timeline({ scrollTrigger: { trigger: point, start: 'top 86%' } })
        .from($$('span', point), { scale: 1.9, autoAlpha: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out' })
        .from($('i', point), { scale: 0, duration: 0.7, ease: 'back.out(3)' }, 0.7);
    }

    /* ---------- 3. Курсы и каналы ---------- */
    gsap.from('.links .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.links .sec-head', start: 'top 84%' } });
    revealLines('.links h2', '.links .sec-head');
    $$('.tile').forEach((tile, i) => {
      gsap.timeline({ scrollTrigger: { trigger: tile, start: 'top 90%' }, delay: (i % 3) * 0.08 })
        .fromTo(tile, { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.1, ease: 'expo.inOut', clearProps: 'clipPath' })
        .from($$('.tile__k, .tile__t', tile), { yPercent: 40, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.45)
        .from($('.tile__arrow', tile), { rotate: -90, autoAlpha: 0, duration: 0.8 }, 0.55);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
