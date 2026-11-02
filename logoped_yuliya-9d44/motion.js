// Юлия Корсакова — моушн концепта. Фирменная идея: «первые слова». Пузырьки растут от «а» до «Буду говорить!»,
// а рисованные звёздочки и сердечки из её баннеров дорисовываются при прокрутке. Без резких эффектов.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная полностью рабочая страница

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  // Штрих дорисовывается линией (у path задан pathLength=1)
  function draw(svg, vars, st) {
    const paths = $$('path', svg);
    return gsap.fromTo(paths, { strokeDasharray: 1, strokeDashoffset: 1 }, {
      strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.12, ...vars,
      scrollTrigger: st || undefined,
      onComplete: () => gsap.set(paths, { clearProps: 'strokeDasharray,strokeDashoffset' }),
    });
  }
  const refresh = () => ScrollTrigger.refresh();

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const phrase = SplitText.create('.bub--4', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const frame = $('.hero .frame');
    const bubs = $$('.bub');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); phrase.revert(); idle(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.25)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.3)
      .from('.blob', { scale: 0.2, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.35)
      .from('.ring', { scale: 0.6, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.6)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0.15)
      .from('.hero .frame img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.pills li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' }, 1.05)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.2);
    // «Первые слова»: каждый пузырёк чуть больше прежнего
    bubs.forEach((b, i) => {
      intro.from(b, { scale: 0, autoAlpha: 0, transformOrigin: '16% 100%', duration: 0.6, ease: 'back.out(2.4)' }, 1.2 + i * 0.42);
    });
    intro.from(phrase.chars, { yPercent: 120, stagger: 0.035, duration: 0.5 }, 1.2 + 3 * 0.42 + 0.25);
    intro.add(draw($('.doodle--star'), { duration: 1.2 }), 1.0);
    intro.add(draw($('.doodle--heart-s'), { duration: 1.1 }), 1.6);

    // Покой: пузырьки чуть покачиваются, как будто разговор продолжается
    function idle() {
      bubs.forEach((b, i) => gsap.to(b, { y: i % 2 ? 5 : -5, duration: 2.6 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }
    ScrollTrigger.create({
      trigger: '.course', start: 'top 70%', once: true,
      onEnter: () => $$('.wd').forEach((w, i) => gsap.to(w, { y: i % 2 ? 6 : -6, duration: 2.4 + i * 0.3, delay: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })),
    });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero .frame img', {
      yPercent: -4, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Обо мне ---------- */
    revealLines('.about h2', '.about .sec-head');
    gsap.from('.about .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 82%' } });
    draw($('.doodle--heart'), { delay: 0.3 }, { trigger: '.about .sec-head', start: 'top 82%' });
    gsap.timeline({ scrollTrigger: { trigger: '.about__grid', start: 'top 80%' } })
      .from('.about__photo .frame', { scale: 0.7, autoAlpha: 0, rotate: -10, duration: 1.3, ease: 'expo.out' })
      .from('.about__spot', { scale: 0, duration: 1, ease: 'back.out(2)' }, 0.35);
    const facts = $$('.fact');
    gsap.set(facts, { x: -26, autoAlpha: 0 });
    ScrollTrigger.batch(facts, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.85, stagger: 0.14, ease: 'power3.out' });
        gsap.from(els.map(e => $('.fact__d', e)), { scale: 0, rotate: 180, stagger: 0.14, duration: 0.8, ease: 'back.out(2.4)', delay: 0.15 });
      },
    });
    // «5000 семей»: поле точек заполняется по одной, как первые слова у малышей
    gsap.timeline({ scrollTrigger: { trigger: '.reach', start: 'top 82%' } })
      .from('.reach', { y: 40, autoAlpha: 0, duration: 0.9 })
      .from('.reach__dots i', { scale: 0, autoAlpha: 0, duration: 0.5, ease: 'back.out(2.6)', stagger: { each: 0.018, from: 'start' } }, 0.2)
      .from('.reach__text, .reach__note', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 0.7);

    /* ---------- 3. Услуги ---------- */
    revealLines('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 82%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.course', start: 'top 82%' } })
      .from('.course', { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.stage', { scaleY: 0.6, transformOrigin: '50% 100%', duration: 1.1, ease: 'expo.out' }, 0.1)
      .from('.wd', { scale: 0, autoAlpha: 0, transformOrigin: '18% 100%', duration: 0.6, ease: 'back.out(2.4)', stagger: 0.16 }, 0.45)
      .add(draw($('.doodle--star2'), { duration: 1.1 }), 0.7)
      .from('.course__body > *', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.7);
    $$('.svc-item').forEach(item => {
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 90%' } })
        .from($('.svc__line', item), { scaleX: 0, duration: 1.1, ease: 'expo.out' }, 0)
        .from($$('.svc__n, .svc__t, .svc__go', item), { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.09 }, 0.1);
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
