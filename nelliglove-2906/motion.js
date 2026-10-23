// Нелли — моушн концепта. Фирменная идея «Вижу вас насквозь»:
// глаз открывается (веки-параболы), в зрачке её портрет; дальше «лупа» того же взгляда проходит по строкам и проявляет их.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная версия: глаз открыт (CSS), строки чёрные, лупа скрыта

  /* ---------- геометрия глаза (как --eye-open в CSS) ---------- */
  const N = 24;
  const r2 = v => Math.round(v * 100) / 100;
  const lid = $('.eye__lid');
  const top = $('.lid-top');
  const bot = $('.lid-bot');
  const [outerTop, outerBot] = $$('.lid-outer');
  // open: 0 — веки сомкнуты в линию, 1 — открыт полностью
  function setEye(open) {
    const up = [];
    const down = [];
    for (let i = 0; i <= N; i++) {
      const u = -1 + (2 * i) / N;
      const h = 50 * open * (1 - u * u);
      up.push(`${r2((u + 1) * 50)}% ${r2(50 - h)}%`);
      if (i > 0 && i < N) down.unshift(`${r2((u + 1) * 50)}% ${r2(50 + h)}%`);
    }
    lid.style.clipPath = `polygon(${up.concat(down).join(', ')})`;
    // квадратичная кривая Безье = та же парабола; контрольная точка вдвое выше вершины
    top.setAttribute('d', `M0 59Q80 ${r2(59 - 118 * open)} 160 59`);
    bot.setAttribute('d', `M0 59Q80 ${r2(59 + 118 * open)} 160 59`);
    outerTop.setAttribute('d', `M-5 59Q80 ${r2(59 - 132 * open)} 165 59`);
    outerBot.setAttribute('d', `M-5 59Q80 ${r2(59 + 132 * open)} 165 59`);
  }

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, extra = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 84%' }, ...extra,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: глаз открывается ---------- */
    const eye = { open: 0.015 };
    setEye(eye.open);
    const name = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const line = SplitText.create('.hero__line', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        name.revert();
        line.revert();
        // GSAP ставит инлайн scale:none — снимаем, чтобы работало CSS-увеличение кнопки при наведении
        gsap.set('.hero .btn', { clearProps: 'all' });
        // при уходе hero взгляд чуть «прищуривается»
        gsap.fromTo(eye, { open: 1 }, {
          open: 0.62, ease: 'none', immediateRender: false,
          onUpdate: () => setEye(eye.open),
          scrollTrigger: { trigger: '.eye', start: 'center 42%', end: 'bottom top', scrub: 0.6 },
        });
      },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__top > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.15)
      .from(name.chars, { yPercent: 112, stagger: 0.055, duration: 1.05, ease: 'expo.out' }, 0.2)
      .from('.eye__aura', { autoAlpha: 0, scale: 0.6, duration: 1.8, ease: 'expo.out' }, 0.3)
      .to(eye, { open: 1, duration: 1.35, ease: 'expo.inOut', onUpdate: () => setEye(eye.open) }, 0.35)
      .from('.eye__iris img', { scale: 1.4, duration: 1.9, ease: 'expo.out' }, 0.5)
      .from('.eye__dial', { rotate: -50, scale: 0.86, transformOrigin: '50% 50%', duration: 1.7, ease: 'expo.out' }, 0.55)
      .from('.eye__tip', { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%', stagger: 0.08, duration: 0.6 }, 1.25)
      // молния: короткая «вспышка»
      .fromTo('.bolt', { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.9)
      .to('.bolt', { keyframes: { opacity: [1, 0.25, 1, 0.5, 1] }, duration: 0.45, ease: 'none' }, 1.25)
      .from(line.lines, { yPercent: 100, stagger: 0.1, duration: 1 }, 0.95)
      .from('.hero__roles', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.3);

    // «живой» глаз: насечки радужки и фиолетовая дуга медленно вращаются, перламутр переливается
    gsap.to('.dial__ticks', { rotation: 360, svgOrigin: '80 59', duration: 120, repeat: -1, ease: 'none' });
    gsap.to('.dial__arc', { rotation: -360, svgOrigin: '80 59', duration: 26, repeat: -1, ease: 'none' });
    gsap.to('.eye__aura', { rotation: 360, duration: 40, repeat: -1, ease: 'none' });
    gsap.to('.lens__ticks', { rotation: 360, svgOrigin: '50 50', duration: 60, repeat: -1, ease: 'none' });

    // имя уходит «за» глаз при прокрутке — глубина обложки
    gsap.to('.hero__name', {
      yPercent: 16, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Обо мне: лупа проявляет строки ---------- */
    fadeUp('.sight .eyebrow', '.sight .sec-head');
    revealLines('.sight h2', '.sight .sec-head');

    const stage = $('.stage');
    const items = $$('.roles--base li');
    let geo = [];
    const ease = gsap.parseEase('sine.inOut');
    // Центры строк и горизонтальный ход лупы по фактической ширине текста
    function measure() {
      const sr = stage.getBoundingClientRect();
      const r = parseFloat(getComputedStyle(stage).getPropertyValue('--r')) || 60;
      geo = items.map(li => {
        const range = document.createRange();
        range.selectNodeContents($('.roles__t', li));
        const tr = range.getBoundingClientRect();
        const x0 = tr.left - sr.left + r * 0.45;
        const x1 = Math.max(x0, Math.min(tr.right - sr.left - r * 0.45, sr.width - r * 0.9));
        return { y: tr.top - sr.top + tr.height / 2, x0, x1 };
      });
    }
    // Путь «зигзагом»: строка слева направо, следующая справа налево
    function place(p) {
      const n = geo.length;
      const s = Math.min(p * n, n - 1e-4);
      const i = Math.floor(s);
      const t = s - i;
      const g = geo[i];
      const fwd = i % 2 === 0;
      const from = fwd ? g.x0 : g.x1;
      const to = fwd ? g.x1 : g.x0;
      let x = from + (to - from) * ease(Math.min(t / 0.78, 1));
      let y = g.y;
      const next = geo[i + 1];
      if (next && t > 0.78) {
        const m = ease((t - 0.78) / 0.22);
        const nextFrom = fwd ? next.x1 : next.x0;
        x = to + (nextFrom - to) * m;
        y = g.y + (next.y - g.y) * m;
      }
      stage.style.setProperty('--lx', `${r2(x)}px`);
      stage.style.setProperty('--ly', `${r2(y)}px`);
      items.forEach((li, j) => {
        if (j < i || (j === i && t > 0.5) || p > 0.995) li.classList.add('seen');
      });
    }
    const lens = { p: 0 };
    measure();
    place(0);
    gsap.to(lens, {
      p: 1, ease: 'none',
      onUpdate: () => place(lens.p),
      scrollTrigger: {
        trigger: stage, start: 'top 70%', end: 'bottom 45%', scrub: 0.7,
        onRefresh: () => { measure(); place(lens.p); },
      },
    });
    // Список и лупа появляются вместе (общий сдвиг сцены, чтобы копия под лупой совпадала с оригиналом)
    gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 86%' } })
      .from(stage, { y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
      .from(['.lens', '.lens__ring'], { scale: 0.3, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.25);

    // Счётчик подписчиков
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.8, ease: 'power2.out', snap: { v: 100 },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(o.v); },
      });
    });
    fadeUp('.stat > span', '.stat');

    /* ---------- 3. Связаться ---------- */
    fadeUp('.contact .eyebrow', '.contact .sec-head');
    revealLines('.contact h2', '.contact .sec-head');
    fadeUp('.who', '.who');
    gsap.from('.channels li', {
      y: 34, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.channels', start: 'top 86%' },
    });
    gsap.from('.contact__glow', {
      scale: 0.7, autoAlpha: 0, duration: 2.2, ease: 'power2.out',
      scrollTrigger: { trigger: '.contact', start: 'top 75%' },
    });

    fadeUp('.concept-end > *', '.concept-end', { onComplete: () => gsap.set('.concept-end .btn', { clearProps: 'all' }) });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
