// Татьяна Вещикова — моушн концепта. Фирменная идея: «лента дыхания» — золотые линии, как на баннере её курса,
// скручиваются и расправляются вдохом-выдохом; в карточке «Мышечные зажимы» лента сначала собрана в узлы и расслабляется при прокрутке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const TAU = Math.PI * 2;
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- лента: n линий вокруг волнистой оси, ширина «скручивается» косинусом ---------- */
  // y линии i в точке x (0..1): ось + u * ширина * cos(скрутка). u от −1 до 1.
  function ribbonY(i, n, x, p) {
    const u = (i / (n - 1)) * 2 - 1;
    const axis = p.h / 2 + p.amp * (Math.sin(x * TAU * 1.15 + p.phase) * 0.62 + Math.sin(x * TAU * 2.3 - p.phase * 1.4 + 1.2) * 0.38);
    const twist = Math.cos(x * Math.PI * p.tw + p.phase * 0.7);
    const silk = Math.sin(x * TAU * 1.6 + p.phase + u * 0.9) * p.amp * 0.12;
    const jitter = p.jitter ? Math.sin(x * TAU * 9 + u * 2.4 + p.phase * 2) * p.jitter : 0;
    return axis + u * p.spread * twist + silk + jitter;
  }
  const mix = (a, b, k) => Math.round(a + (b - a) * k);

  function createRibbon(canvas) {
    const ctx = canvas.getContext('2d');
    const st = { w: 0, h: 0, dpr: 1, phase: 0.6, breath: 0.55, draw: 1, scroll: 0 };
    function resize() {
      const r = canvas.getBoundingClientRect();
      st.w = r.width; st.h = r.height; st.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(st.w * st.dpr); canvas.height = Math.round(st.h * st.dpr);
      render();
    }
    function render() {
      const { w, h } = st;
      if (!w || !h) return;
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const n = 26, pts = Math.min(190, Math.max(48, Math.round(w / 7)));
      const k = 0.78 + 0.22 * st.breath;
      const p = { h, amp: h * 0.2 * k, spread: h * 0.27 * k, tw: 1.7, phase: st.phase + st.scroll, jitter: 0 };
      const last = Math.max(2, Math.round(pts * st.draw));
      ctx.lineWidth = 1; ctx.lineJoin = 'round';
      for (let i = 0; i < n; i++) {
        const u = (i / (n - 1)) * 2 - 1;
        const mid = 1 - Math.abs(u);
        ctx.strokeStyle = `rgba(${mix(219, 246, mid)},${mix(183, 226, mid)},${mix(116, 176, mid)},${(0.16 + 0.5 * Math.pow(mid, 1.4)).toFixed(3)})`;
        ctx.beginPath();
        for (let j = 0; j <= last; j++) {
          const x = j / pts;
          const y = ribbonY(i, n, x, p);
          j ? ctx.lineTo(x * w, y) : ctx.moveTo(x * w, y);
        }
        ctx.stroke();
      }
      // мягкие края слева и справа
      ctx.globalCompositeOperation = 'destination-in';
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.14, 'rgba(0,0,0,1)'); g.addColorStop(0.86, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    new ResizeObserver(resize).observe(canvas);
    resize();
    return { st, render };
  }

  /* ---------- лента-узел в карточке «Мышечные зажимы» (SVG) ---------- */
  function createTension(svg) {
    const NS = 'http://www.w3.org/2000/svg';
    const n = 11, W = 360, H = 150, pts = 72;
    const paths = Array.from({ length: n }, (_, i) => {
      const el = document.createElementNS(NS, 'path');
      el.setAttribute('stroke-opacity', (0.32 + 0.6 * (1 - Math.abs((i / (n - 1)) * 2 - 1))).toFixed(2));
      svg.append(el);
      return el;
    });
    const st = { t: 0, flow: 0 };
    function render() {
      const t = st.t;
      // t = 0 — зажим: линии стянуты в частые узлы, дрожат; t = 1 — расслабление: одна широкая плавная волна
      const p = { h: H, amp: 8 + 14 * t, spread: 9 + 46 * t, tw: 9 - 7.6 * t, phase: 0.8 + st.flow, jitter: 4.5 * (1 - t) };
      paths.forEach((el, i) => {
        let d = '';
        for (let j = 0; j <= pts; j++) {
          const x = j / pts;
          d += (j ? 'L' : 'M') + (x * W).toFixed(1) + ' ' + ribbonY(i, n, x, p).toFixed(1);
        }
        el.setAttribute('d', d);
      });
    }
    render();
    return { st, render };
  }

  const ribbon = createRibbon($('.ribbon'));
  const tension = createTension($('.tension__svg'));

  if (!animate) {
    // без анимации: лента расправлена, зажим расслаблен
    tension.st.t = 1; tension.render();
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    ribbon.st.draw = 0;

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .to(ribbon.st, { draw: 1, duration: 2.6, ease: 'power2.inOut' }, 0.15)
      .fromTo('.avatar__pic', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(72% at 50% 50%)', duration: 1.5, ease: 'expo.inOut' }, 0.2)
      .from('.avatar__pic img', { scale: 1.5, duration: 2.1, ease: 'expo.out' }, 0.3)
      .from('.avatar__ring', { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0.9)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.3)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 105, stagger: 0.1, duration: 1, ease: 'expo.out' }, 0.9)
      .from('.hero__text--low .btn', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.15);

    /* «Дыхание»: цикл 10 секунд, вдох короче выдоха; лента и кольца вокруг аватара движутся в такт.
       Фаза ленты дрейфует сама и сдвигается при прокрутке — тело как будто течёт вслед за пальцем */
    const ring = $('.avatar__ring');
    const hero = $('.hero');
    let heroVisible = true;
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }, { threshold: 0 }).observe(hero);
    const t0 = performance.now();
    gsap.ticker.add(() => {
      if (!heroVisible) return;
      const c = ((performance.now() - t0) / 1000 % 10) / 10;
      // 0..0.4 вдох, 0.4..1 выдох
      const b = c < 0.4 ? 0.5 - 0.5 * Math.cos(Math.PI * (c / 0.4)) : 0.5 + 0.5 * Math.cos(Math.PI * ((c - 0.4) / 0.6));
      ribbon.st.breath = b;
      ribbon.st.phase = 0.6 + (performance.now() - t0) / 1000 * 0.22;
      ribbon.st.scroll = window.scrollY * 0.0022;
      ring.style.setProperty('--ring', (1 + b * 0.045).toFixed(4));
      ribbon.render();
    });

    // Появление «о ней» и цифры
    gsap.from('.hero__bio', { y: 20, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.hero__about', start: 'top 92%' } });
    const num = $('.stat__num');
    const counter = { v: 0 };
    gsap.from('.stat', { y: 20, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.stat', start: 'top 94%' } });
    ScrollTrigger.create({
      trigger: '.stat', start: 'top 94%', once: true,
      onEnter: () => gsap.to(counter, {
        v: 7000, duration: 2.2, ease: 'power2.out',
        onUpdate: () => { num.textContent = MotionBase.money(counter.v) + '+'; },
        onComplete: () => { num.innerHTML = '7&nbsp;000+'; },
      }),
    });

    /* ---------- 2. Курсы ---------- */
    revealLines('.courses h2', '.courses .sec-head');
    gsap.from('.courses .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses .sec-head', start: 'top 86%' } });

    // «Из головы в тело»: свет проходит по фигуре сверху вниз и проявляет её
    const art = $('.flag__art');
    const flagTitle = SplitText.create('.flag__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ scrollTrigger: { trigger: '.flag', start: 'top 78%' }, onComplete: () => flagTitle.revert() })
      .fromTo(art, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power2.inOut' }, 0)
      .from('.flag__art img', { scale: 1.3, duration: 2.2, ease: 'expo.out' }, 0)
      .fromTo('.flag__scan', { top: '0%', opacity: 1 }, { top: '100%', duration: 1.6, ease: 'power2.inOut' }, 0)
      .to('.flag__scan', { opacity: 0, duration: 0.3 }, 1.4)
      .from('.flag .tag', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.9)
      .from(flagTitle.chars, { yPercent: 118, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 1.0)
      .from('.flag__sub', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.5)
      .from('.flag__body .btn', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.7);

    // «Мышечные зажимы»: лента расслабляется по мере прокрутки
    gsap.from('.tension', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.tension', start: 'top 92%' } });
    gsap.to(tension.st, {
      t: 1, ease: 'none', onUpdate: tension.render,
      scrollTrigger: { trigger: '.tension', start: 'top 88%', end: 'center 42%', scrub: 0.6 },
    });
    gsap.to(tension.st, {
      flow: 2.4, ease: 'none', onUpdate: tension.render,
      scrollTrigger: { trigger: '.tension', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.from(['.tension .tag', '.tension__title', '.tension__body .btn'], {
      y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.tension__body', start: 'top 92%' },
    });

    /* ---------- 3. Сессии ---------- */
    revealLines('.sessions h2', '.sessions .sec-head');
    gsap.from('.sessions .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.sessions .sec-head', start: 'top 86%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.sess--me', start: 'top 82%' } })
      .from('.sess--me', { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0% round 160px 160px 18px 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 160px 160px 18px 18px)', duration: 1.4, ease: 'expo.inOut' }, 0.1)
      .from('.arch img', { scale: 1.4, duration: 1.9, ease: 'expo.out' }, 0.2)
      .from('.sess--me .sess__body > *', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 0.9);
    gsap.timeline({ scrollTrigger: { trigger: '.sess--team', start: 'top 84%' } })
      .from('.sess--team', { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0)
      .from('.rings img', { scale: 1.25, duration: 2, ease: 'expo.out' }, 0.1)
      .from('.sess--team .sess__body > *', { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 0.5);
    gsap.fromTo('.rings img', { yPercent: 0 }, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.rings', start: 'top bottom', end: 'bottom top', scrub: true } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
