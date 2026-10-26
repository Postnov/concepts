// Алексей Ситников — моушн концепта. Академичная сдержанность: три кольца-степени сходятся в DBA,
// решётка точек с его фона проявляется кругом, золотая нить прокладывается по расписанию.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница полностью рабочая

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
    const n1 = SplitText.create('.n1', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const n2 = SplitText.create('.n2', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { n1.revert(); n2.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.top > *', { y: -10, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 0.15)
      .fromTo('.hero .lattice', { '--r': '0%' }, { '--r': '130%', duration: 2.8, ease: 'power2.out' }, 0.2)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(n1.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.45)
      .from(n2.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.65)
      .from('.trio__orbit', { opacity: 0, duration: 1.6 }, 0.6)
      .from('.ring__line', { strokeDashoffset: 1, duration: 2.1, stagger: 0.28, ease: 'power2.inOut' }, 0.55)
      .from('.ring__fill', { opacity: 0, duration: 1.8, stagger: 0.28, ease: 'power1.out' }, 1.1)
      .from('.ring__dot', { opacity: 0, duration: 0.6, stagger: 0.2 }, 2.0)
      .from('.ring__label', { autoAlpha: 0, y: 6, stagger: 0.16, duration: 0.8 }, 1.6)
      .from('.trio__core', { autoAlpha: 0, duration: 1.1, ease: 'power2.out' }, 2.0)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.85 }, 1.25)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.75 }, 1.4);

    /* Кольца плывут, пересечение живёт; по каждому кольцу ходит точка */
    const drift = [[-6, 5, 6.5], [6, -6, 7.5], [-5, 6, 8]];
    $$('.ring').forEach((g, i) => {
      const [x, y, d] = drift[i];
      gsap.to(g, { x, y, duration: d, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to($('.ring__orbit', g), {
        rotation: i % 2 ? -360 : 360, svgOrigin: `${g.dataset.cx} ${g.dataset.cy}`,
        duration: [17, 23, 20][i], ease: 'none', repeat: -1,
      });
    });
    gsap.to('.trio__orbit', { rotation: 360, svgOrigin: '170 160', duration: 140, ease: 'none', repeat: -1 });

    /* Уходя с экрана, кольца расходятся */
    gsap.to('.trio', {
      yPercent: -7, scale: 1.08, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Мероприятия ---------- */
    revealLines('.events h2', '.events .sec-head');
    gsap.from('.events .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.events .sec-head', start: 'top 84%' } });

    gsap.to('.timeline__rail span', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 68%', end: 'bottom 58%', scrub: true },
    });
    const rows = $$('.timeline__list > li');
    rows.forEach(li => {
      ScrollTrigger.create({
        trigger: li, start: 'top 64%',
        onEnter: () => li.classList.add('is-on'),
        onLeaveBack: () => li.classList.remove('is-on'),
      });
    });
    // Строки выезжают по одной; линия под строкой прочерчивается следом
    gsap.set($$('.event'), { '--line': 0 });
    gsap.set($$('.event > :not(.event__go)'), { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch($$('.event'), {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { '--line': 1, duration: 1.1, stagger: 0.1, ease: 'power3.inOut' });
        els.forEach((el, i) => gsap.to($$(':scope > :not(.event__go)', el), { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.07, delay: i * 0.1, ease: 'power3.out' }));
        gsap.from(els.map(el => $('.event__go', el)), { scale: 0.6, autoAlpha: 0, duration: 0.7, stagger: 0.1, delay: 0.3, ease: 'power3.out' });
      },
    });
    gsap.set($$('.month span'), { x: -14, autoAlpha: 0 });
    ScrollTrigger.batch($$('.month span'), {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' }),
    });

    /* ---------- 3. Проекты ---------- */
    revealLines('.works h2', '.works .sec-head');
    gsap.from('.works .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.works .sec-head', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.feature', start: 'top 84%' } })
      .fromTo('.feature', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
      .from('.feature__lat', { opacity: 0, duration: 1.4 }, 0.5)
      .from('.feature > :not(.feature__lat)', { y: 22, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 0.55);
    gsap.set($$('.rows li'), { '--line': 0 });
    gsap.set($$('.row'), { autoAlpha: 0, y: 18 });
    ScrollTrigger.batch($$('.rows li'), {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { '--line': 1, duration: 1.0, stagger: 0.09, ease: 'power3.inOut' });
        gsap.to(els.map(el => $('.row', el)), { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' });
      },
    });

    gsap.from('.concept-end > :not(.lattice)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
