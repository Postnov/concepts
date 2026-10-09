// Анна Януш — моушн концепта.
// Фирменная идея: две окружности. Двое сближаются и пересекаются, но у каждого остаётся свой центр;
// там, где они встречаются, загорается тёплый свет. Потом пара «дышит»: чуть отходит и снова сближается.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: окружности уже стоят в финальном положении

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  const CX = 200; // центр viewBox у пар окружностей
  const len = el => 2 * Math.PI * el.r.baseVal.value;

  // Пара окружностей: одно число gap (расстояние между центрами) двигает обе окружности,
  // их маску пересечения и центральные точки
  function makePair(svg) {
    const a = $$('[data-a]', svg);
    const b = $$('[data-b]', svg);
    const state = { gap: Number(svg.dataset.gap) };
    return {
      state,
      gap: state.gap,
      from: Number(svg.dataset.from),
      apply() {
        const h = state.gap / 2;
        a.forEach(el => el.setAttribute('cx', CX - h));
        b.forEach(el => el.setAttribute('cx', CX + h));
      },
    };
  }

  // Прорисовка окружности: левая идёт по часовой, правая навстречу
  function drawRings(tl, rings, at, duration) {
    tl.fromTo(rings,
      { strokeDasharray: (i, el) => len(el), strokeDashoffset: (i, el) => (i % 2 ? -1 : 1) * len(el) },
      {
        strokeDashoffset: 0, duration, ease: 'power2.inOut',
        onComplete: () => gsap.set(rings, { clearProps: 'strokeDasharray,strokeDashoffset' }),
      }, at);
  }

  // Строки заголовка из-под маски; после анимации split снимаем, чтобы перенос жил при ресайзе
  function revealLines(el, trigger, delay = 0) {
    const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', linesClass: 'ln', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, delay, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: окружности сходятся, имя поднимается ---------- */
    const heroSvg = $('.pair--hero');
    const P = makePair(heroSvg);
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', charsClass: 'ch', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', linesClass: 'ln', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); breathe(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from(P.state, { gap: P.from, duration: 2.5, ease: 'expo.inOut', onUpdate: P.apply }, 0.1)
      .from($$('.pair__dot', heroSvg), { attr: { r: 0 }, duration: 0.9, stagger: 0.1, ease: 'back.out(3)' }, 0.3)
      .from($$('.pair__echo', heroSvg), { autoAlpha: 0, duration: 1.8, ease: 'power1.out' }, 0.8)
      .from($('.pair__lens', heroSvg), { opacity: 0, duration: 1.6, ease: 'power2.out' }, 1.7)
      .from('.glow', { autoAlpha: 0, scale: 0.4, duration: 2, ease: 'expo.out' }, 1.8)
      .from('.hero__top > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.3)
      .from(name.chars, { yPercent: 118, stagger: 0.055, duration: 1.15, ease: 'expo.out' }, 0.55)
      .from(lead.lines, { yPercent: 105, stagger: 0.1, duration: 1 }, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.4);
    drawRings(intro, $$('.pair__ring', heroSvg), 0.1, 2.2);

    // «Дыхание» пары: расходятся на шаг и снова сближаются, точки-орбиты текут навстречу друг другу
    function breathe() {
      gsap.to(P.state, { gap: P.gap + 26, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: P.apply });
      gsap.to('.glow', { scale: 0.86, autoAlpha: 0.7, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
    const echoes = $$('.pair__echo', heroSvg);
    gsap.to(echoes[0], { strokeDashoffset: -65, duration: 6, ease: 'none', repeat: -1 });
    gsap.to(echoes[1], { strokeDashoffset: 65, duration: 6, ease: 'none', repeat: -1 });

    // При прокрутке пара уходит чуть медленнее текста
    gsap.to('.hero__art', {
      yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Направления: каждый знак собирается на входе ---------- */
    gsap.from('.ways .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.ways', start: 'top 82%' } });
    $$('.way').forEach((way, i) => {
      const glyph = $('.way__glyph', way);
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: window.innerWidth >= 900 ? i * 0.12 : 0,
        scrollTrigger: { trigger: way, start: 'top 86%' },
      });
      tl.from(way, { y: 30, autoAlpha: 0, duration: 0.9 }, 0)
        .from($('.way__num', way), { x: -10, autoAlpha: 0, duration: 0.7 }, 0.2);

      if (glyph.classList.contains('glyph-pair')) {
        // 01 — две окружности сходятся
        tl.from($$('.g-a', glyph), { attr: { cx: 20 }, duration: 1.4, ease: 'expo.inOut' }, 0.1)
          .from($$('.g-b', glyph), { attr: { cx: 76 }, duration: 1.4, ease: 'expo.inOut' }, 0.1);
      } else if (glyph.classList.contains('glyph-axis')) {
        // 02 — ось вырастает из опоры, круг замыкается вокруг центра
        tl.from($('.g-ground', glyph), { attr: { x1: 48, x2: 48 }, duration: 0.8 }, 0.1)
          .from($('.g-axis', glyph), { attr: { y1: 60 }, duration: 0.9, ease: 'power2.inOut' }, 0.4)
          .from($('.g-dot', glyph), { attr: { r: 0 }, duration: 0.6, ease: 'back.out(3)' }, 1.1);
        drawRings(tl, [$('.g-ring', glyph)], 0.7, 1.1);
      } else {
        // 03 — окружности растут одна из другой
        tl.from($$('.g-grow', glyph), { attr: { r: 0, cy: 60 }, duration: 1.2, stagger: 0.18, ease: 'expo.out' }, 0.15);
      }
      revealLines($('.way__title', way), way, 0.15 + (window.innerWidth >= 900 ? i * 0.12 : 0));
    });

    /* ---------- 3. Результат: большая пара сходится за фразой ---------- */
    const resSvg = $('.pair--result');
    const R = makePair(resSvg);
    const res = gsap.timeline({ scrollTrigger: { trigger: '.result', start: 'top 72%' } });
    res.from(R.state, { gap: R.from, duration: 2.6, ease: 'expo.inOut', onUpdate: R.apply }, 0)
      .from($('.pair__lens', resSvg), { opacity: 0, duration: 1.6, ease: 'power2.out' }, 1.5);
    drawRings(res, $$('.pair__ring', resSvg), 0, 2.2);

    gsap.from('.result .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.result__inner', start: 'top 82%' } });
    revealLines('.result__quote', '.result__inner', 0.15);
    gsap.from(['.result__label', '.result__btns .btn'], {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.result__cta', start: 'top 88%' },
    });
    // «Запись здесь 👇»: по линии вниз стекает свет
    gsap.fromTo('.drop i', { yPercent: -100 }, { yPercent: 100, duration: 1.5, ease: 'power1.inOut', repeat: -1, repeatDelay: 0.5 });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
