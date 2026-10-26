// Анастасия Максимова — моушн концепта.
// Фирменная идея: «волшебной таблетки нет, но есть я» — капсула на первом экране раскрывается, а внутри она.
// Дальше капсула живёт как язык страницы: маркеры, номера секций и «доза» поддержки в тарифах.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно, капсула открыта, циферблат и «дозы» на месте

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // Заголовок строками из-под маски; после анимации нарезку снимаем
  function revealLines(selector, trigger, vars = {}) {
    const el = $(selector);
    if (!el) return;
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
    gsap.from(split.lines, {
      yPercent: 135, duration: 1.05, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => split.revert(),
      ...vars,
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: капсула раскрывается ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', charsClass: 'ch', mask: 'chars' });
    const claim = SplitText.create('.hero__claim', { type: 'lines', mask: 'lines', linesClass: 'ln' });
    const caps = { top: $('.capsule__cap--top'), bot: $('.capsule__cap--bot') };

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); claim.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 135, stagger: 0.032, duration: 1.0, ease: 'expo.out' }, 0.25)
      .from('.sun', { scale: 0.3, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.35)
      // закрытая капсула «падает» на место
      .fromTo([caps.top, caps.bot], { autoAlpha: 1 }, { autoAlpha: 1, duration: 0.01 }, 0)
      .from('.capsule', { y: -60, rotation: -16, scale: 0.82, duration: 1.1, ease: 'expo.out' }, 0.45)
      .from('.capsule__ring', { scale: 0.86, autoAlpha: 0, duration: 0.9 }, 0.9)
      // щелчок: половинки разъезжаются, внутри — она
      .to(caps.top, { yPercent: -70, duration: 1.1, ease: 'power3.inOut' }, 1.35)
      .to(caps.bot, { yPercent: 70, duration: 1.1, ease: 'power3.inOut' }, 1.35)
      .to([caps.top, caps.bot], { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, 1.95)
      .from('.capsule__win img', { scale: 1.28, duration: 1.8, ease: 'expo.out' }, 1.45)
      .from(claim.lines, { yPercent: 135, stagger: 0.1, duration: 0.95, ease: 'expo.out' }, 1.55)
      .from('.stat', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.9)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.15);

    // Солнце и фото чуть отстают при прокрутке
    gsap.to('.sun', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.capsule__win img', { yPercent: -5, scale: 1.04, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Онлайн-консультация: полчаса на циферблате и диалог ---------- */
    revealLines('.consult h2', '.consult .sec-head');
    gsap.from('.consult .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.consult .sec-head', start: 'top 84%' } });

    gsap.timeline({ scrollTrigger: { trigger: '.dial', start: 'top 78%' } })
      .from('.dial__svg', { scale: 0.86, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
      .from('.dial__arc', { strokeDasharray: '0 100', duration: 1.5, ease: 'power2.inOut' }, 0.2)
      .from('.dial__hand', { rotation: -180, svgOrigin: '100 100', duration: 1.5, ease: 'power2.inOut' }, 0.2)
      .from('.dial__text', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.5)
      .from('.dial__caption', { y: 10, autoAlpha: 0, duration: 0.6 }, 0.9);

    // Реплики по очереди, как в переписке: вы — я — вы — я — я
    const you = $$('.talk__col:not(.talk__col--me) .bubble');
    const me = $$('.talk__col--me .bubble');
    const order = [you[0], me[0], you[1], me[1], me[2]].filter(Boolean);
    const chat = gsap.timeline({ scrollTrigger: { trigger: '.talk', start: 'top 80%' } });
    chat.from('.talk__who', { y: 14, autoAlpha: 0, stagger: 0.2, duration: 0.6 }, 0);
    order.forEach((b, i) => {
      const mine = b.classList.contains('bubble--me');
      chat.from(b, {
        y: 18, scale: 0.86, autoAlpha: 0, transformOrigin: mine ? '100% 100%' : '0% 100%',
        duration: 0.6, ease: 'back.out(1.6)',
      }, 0.25 + i * 0.28);
    });

    gsap.timeline({ scrollTrigger: { trigger: '.price', start: 'top 84%' } })
      .fromTo('.price', { clipPath: 'inset(18% 6% 0% 6% round 30px)', y: 40 }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', y: 0, duration: 1.2, ease: 'expo.out' })
      .from('.price__label', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.25)
      // цена появляется целиком, без счётчика
      .from('.price__sum', { y: 22, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.35)
      .from(['.price__note', '.price__pay', '.price .btn', '.price__disclaimer'], { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.55)
      .add(() => gsap.set('.price', { clearProps: 'clipPath' }));

    /* ---------- 3. Сопровождение: зачёркнутые запреты и «дозы» поддержки ---------- */
    revealLines('.care h2', '.care .sec-head');
    gsap.from('.care .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.care .sec-head', start: 'top 84%' } });

    const strikes = $$('.x');
    gsap.set(strikes, { backgroundSize: '0% 2px' });
    gsap.timeline({ scrollTrigger: { trigger: '.care__no', start: 'top 80%' } })
      .from('.care__no .care__q', { y: 12, autoAlpha: 0, duration: 0.6 })
      .from('.care__no-text', { y: 22, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.1)
      .to(strikes, { backgroundSize: '100% 2px', duration: 0.55, stagger: 0.3, ease: 'power2.inOut' }, 0.7);

    gsap.from('.care__inc .care__q', { y: 12, autoAlpha: 0, duration: 0.6, scrollTrigger: { trigger: '.care__inc', start: 'top 86%' } });
    const inc = $$('.inc li');
    gsap.set(inc, { x: -18, autoAlpha: 0 });
    ScrollTrigger.batch(inc, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }),
    });

    $$('.tariff').forEach((card, i) => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
        .from(card, { y: 56, autoAlpha: 0, duration: 1.0, ease: 'expo.out', delay: (i % 2) * 0.08 })
        .from($('.dose__pill i', card), { scaleX: 0, duration: 1.1, ease: 'power2.inOut' }, 0.35)
        .from($('.dose__label', card), { x: -8, autoAlpha: 0, duration: 0.6 }, 0.5)
        .from($('.tariff__price', card), { y: 14, autoAlpha: 0, duration: 0.8 }, 0.45);
    });
    gsap.from('.tariffs__btn', { y: 18, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.tariffs__btn', start: 'top 94%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
