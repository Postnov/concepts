// Sofi Moshe — моушн концепта. Фирменная идея — «красная нить»: она прошивает имя петлёй,
// ведёт по шагам метода (узелки загораются по мере прокрутки) и завязывается золотым кольцом вокруг фото.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Рисование линии: штрих длиной во всю линию, сдвинутый за её конец (в единицах viewBox)
  const prepLine = el => { const len = el.getTotalLength(); gsap.set(el, { strokeDasharray: len, strokeDashoffset: len }); return el; };

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const heroThread = prepLine($('.thread--hero path'));

    // Искра: короткий золотой отрезок, который время от времени пробегает по нити
    const spark = heroThread.cloneNode();
    spark.classList.add('thread__spark');
    heroThread.after(spark);
    const sLen = heroThread.getTotalLength();
    gsap.set(spark, { strokeDasharray: `${sLen * 0.07} ${sLen * 1.2}`, strokeDashoffset: sLen * 0.07, autoAlpha: 0 });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__frame', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.05)
      .from('.hero__frame img', { scale: 1.3, duration: 2.2, ease: 'expo.out' }, 0.25)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.7)
      .from(name.chars, { yPercent: 112, stagger: 0.05, duration: 1.15, ease: 'expo.out' }, 0.75)
      .to(heroThread, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 1.05)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.2)
      .from('.trust', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.4)
      .from('.trust__list li', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.5)
      .from('.hero__sold', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.7)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.8);

    gsap.timeline({ repeat: -1, repeatDelay: 3.4, delay: 3.2 })
      .set(spark, { autoAlpha: 1, strokeDashoffset: sLen * 0.07 })
      .to(spark, { strokeDashoffset: -sLen * 1.13, duration: 2.6, ease: 'power1.inOut' })
      .set(spark, { autoAlpha: 0 });

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.8 + i * 0.6 });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__frame img', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Метод ---------- */
    revealLines('.method h2', '.method .sec-head');
    gsap.from(['.method .eyebrow', '.method .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.method .sec-head', start: 'top 82%' },
    });
    // Арки фото раскрываются снизу вверх, внутри — медленный параллакс
    $$('.ph').forEach((ph, i) => {
      gsap.fromTo(ph, { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 16px 16px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 999px 999px 16px 16px)', duration: 1.4, ease: 'expo.inOut', delay: i * 0.15,
        scrollTrigger: { trigger: '.method__photos', start: 'top 85%' },
      });
      gsap.fromTo($('img', ph), { yPercent: -10 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: ph, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    // Нить шагов тянется за прокруткой, узелки загораются, когда нить до них дошла
    const rail = prepLine($('.thread--rail .thread__draw'));
    gsap.to(rail, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 70%', scrub: 0.6 },
    });
    $$('.step').forEach(step => {
      ScrollTrigger.create({
        trigger: step, start: 'top 70%',
        onEnter: () => step.classList.add('is-on'),
        onLeaveBack: () => step.classList.remove('is-on'),
      });
      gsap.from(step.children, {
        x: 22, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 90%' },
      });
    });
    gsap.from('.method .btn--wide', { y: 20, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.method .btn--wide', start: 'top 94%' } });

    /* ---------- 3. Лично: нить завязывается в кольцо ---------- */
    const ring = $('.ring circle');
    ring.setAttribute('transform', 'rotate(-90 100 100)');
    prepLine(ring);
    gsap.timeline({ scrollTrigger: { trigger: '.personal__photo', start: 'top 78%' } })
      .fromTo('.personal__cut', { yPercent: 14, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.3, ease: 'expo.out' }, 0.15)
      .to(ring, { strokeDashoffset: 0, duration: 1.9, ease: 'power2.inOut' }, 0.1);
    gsap.from('.personal__photo', { y: 40, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.personal__photo', start: 'top 85%' } });
    revealLines('.personal h2', '.personal .sec-head');
    gsap.from('.personal .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.personal .sec-head', start: 'top 82%' } });
    $$('.offer').forEach((card, i) => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
        .fromTo(card, { clipPath: 'inset(0% 100% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.1, ease: 'expo.inOut', delay: i * 0.1 })
        .from($$('.offer__num, .offer__body > *, .offer__arrow', card), { x: -16, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, '-=0.5');
    });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
