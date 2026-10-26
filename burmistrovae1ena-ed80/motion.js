// Елена Бурмистрова — моушн концепта.
// Фирменная идея «один оборот — одна сессия»: лаймовая дуга со стрелкой обегает портрет
// и складывается в значок перезагрузки ↻; тот же жест повторяется в иконках секций и в кольце «5 кризисов».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: все конечные состояния уже в CSS

  const HEAD_DEG = 338.4; // дуга замыкается на 94% круга, оставляя зазор под стрелку
  const refresh = () => ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // «Перезагрузка»: дуга рисуется, стрелка едет по окружности вместе с её концом
  function reboot(arc, head, origin, duration) {
    return gsap.timeline()
      .fromTo(arc, { strokeDashoffset: 1 }, { strokeDashoffset: 0.06, duration, ease: 'power2.inOut' }, 0)
      .fromTo(head, { rotation: 0, svgOrigin: origin }, { rotation: HEAD_DEG, svgOrigin: origin, duration, ease: 'power2.inOut' }, 0)
      .fromTo(head, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const first = SplitText.create('.name__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.name__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const arc = $('.orbit__arc');
    const head = $('.orbit__head');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.orbit__photo', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.1)
      .from('.orbit__photo img', { scale: 1.35, duration: 1.9, ease: 'expo.out' }, 0.25)
      .from('.orbit__glow', { scale: 0.5, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.3)
      .from('.orbit__track', { autoAlpha: 0, duration: 0.8 }, 0.4)
      .add(reboot(arc, head, '200 200', 1.8), 0.55)
      // в момент замыкания — короткий «щелчок» точки
      .fromTo('.orbit__dot', { scale: 1 }, { scale: 1.45, transformOrigin: '50% 50%', duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1 }, 2.35)
      .from('.orbit__text', { rotation: -70, svgOrigin: '200 200', autoAlpha: 0, duration: 2, ease: 'expo.out' }, 0.6)
      .from('.roles li', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.6)
      .from(first.chars, { yPercent: 112, stagger: 0.05, duration: 1.15, ease: 'expo.out' }, 0.45)
      .from(last.chars, { yPercent: 112, stagger: 0.025, duration: 1, ease: 'expo.out' }, 0.7)
      // строки лида — без SplitText: у них разные кегли, после revert строки сдвинулись бы
      .from('.lead > *', { y: 22, autoAlpha: 0, stagger: 0.12, duration: 0.95 }, 1.0)
      .from('.hero__ctas .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25);

    // Фраза «Ко мне не нужно ходить годами» медленно обходит портрет
    gsap.to('.orbit__spin', { rotation: 360, svgOrigin: '200 200', duration: 60, ease: 'none', repeat: -1 });

    // Вернулись к началу страницы — кольцо «перезагружается» ещё раз
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom 30%',
      onEnterBack: () => reboot(arc, head, '200 200', 1.2),
    });

    // Лёгкий параллакс портрета
    gsap.to('.orbit', {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // Блик на главной кнопке раз в несколько секунд
    gsap.fromTo('.hero .btn:not(.btn--ghost)', { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.8 });

    /* ---------- заголовки секций ---------- */
    $$('.sec-head').forEach(headEl => {
      const icon = $('.reload', headEl);
      const tl = gsap.timeline({ scrollTrigger: { trigger: headEl, start: 'top 84%' } });
      tl.from($('.eyebrow', headEl), { y: 14, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0)
        .from(icon, { rotation: -180, transformOrigin: '50% 50%', duration: 1.2, ease: 'expo.out' }, 0)
        .add(reboot($('.reload__arc', icon), $('.reload__head', icon), '20 20', 1.1), 0.05);
      revealLines($('h2', headEl), headEl);
    });

    /* ---------- 2. Гайды и эфир ---------- */
    const guides = $$('.guide');
    gsap.set(guides, { y: 60, autoAlpha: 0 });
    ScrollTrigger.batch(guides, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.12, ease: 'expo.out', clearProps: 'transform' }),
    });
    guides.forEach(card => {
      gsap.fromTo($('.guide__art', card), { y: 26 }, {
        y: -14, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    // «10 правил»: число набирается до десяти
    const ten = $('.guide--forest .guide__num');
    const o = { v: 0 };
    gsap.to(o, {
      v: 10, duration: 1.3, ease: 'power2.out', snap: { v: 1 },
      scrollTrigger: { trigger: ten, start: 'top 88%', once: true },
      onStart: () => { ten.textContent = '0'; },
      onUpdate: () => { ten.textContent = String(Math.round(o.v)); },
    });
    gsap.from('.guide__step', { x: -16, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.guide--paper', start: 'top 80%' } });
    gsap.from('.guide__play', { scale: 0.4, rotation: -90, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.guide--lime', start: 'top 80%' } });

    /* ---------- 3. Марафоны ---------- */
    gsap.from('.mara', {
      y: 60, autoAlpha: 0, duration: 1.05, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.mara__grid', start: 'top 86%' },
    });
    // Формула: слагаемые встают по очереди, плюсы проворачиваются
    gsap.timeline({ scrollTrigger: { trigger: '.formula', start: 'top 82%' } })
      .from('.formula__w', { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.16, ease: 'expo.out' }, 0)
      .from('.formula__op', { scale: 0, rotation: -180, duration: 0.9, stagger: 0.16, ease: 'expo.out' }, 0.16);

    // «5 кризисов»: пять отрезков дорисовываются один за другим, цифра считает их
    const num = $('.crisis__num');
    const c = { v: 0 };
    gsap.timeline({ scrollTrigger: { trigger: '.crisis', start: 'top 82%' } })
      .from('.crisis__dial', { rotation: -72, duration: 2, ease: 'expo.out' }, 0)
      .fromTo('.crisis__seg', { strokeDasharray: '0 1' }, { strokeDasharray: '0.16 0.84', duration: 0.5, stagger: 0.24, ease: 'power2.out' }, 0.1)
      .fromTo(c, { v: 0 }, {
        v: 5, duration: 1.46, ease: 'none', snap: { v: 1 },
        onStart: () => { num.textContent = '0'; },
        onUpdate: () => { num.textContent = String(Math.round(c.v)); },
      }, 0.1)
      .from('.crisis__text', { x: 16, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.3);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
