// Абай Баймагамбетов — моушн концепта. Фирменная идея: «смещённые позвонки встают на свои места» (его слова из таплинка).
// Кольцо позвонков вокруг портрета собирается из хаоса, а в списке «Что я лечу» кривой позвоночник выпрямляется по мере прокрутки.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // без GSAP и при reduced motion страница статичная и полностью рабочая

  const rnd = gsap.utils.random;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, vars = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 85%' }, ...vars,
  });

  MotionBase.ready(() => {
    /* ---------- 1. Hero: позвонки-кольцо собираются, портрет раскрывается кругом ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        name.revert(); lead.revert();
        // Кольцо медленно вращается, как шанырак: после сборки позвонки уже на своих местах
        gsap.to('.ring', { rotation: 360, duration: 160, ease: 'none', repeat: -1 });
      },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.ring__v svg', {
        x: () => rnd(-30, 30), y: () => rnd(-90, 90), rotation: () => rnd(-80, 80), autoAlpha: 0,
        duration: 1.7, ease: 'back.out(1.7)', stagger: { each: 0.03, from: 'random' },
      }, 0.15)
      .from('.ring__d i', { scale: 0, autoAlpha: 0, duration: 0.6, stagger: { each: 0.03, from: 'random' }, ease: 'back.out(3)' }, 0.9)
      .from('.portrait', { scale: 0.86, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.2)
      .fromTo('.portrait img', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.5, ease: 'expo.inOut' }, 0.35)
      .from('.portrait img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.35)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.7)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.8)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.15)
      .from('.hero__tag', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.4)
      .from('.hero .btn', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.75 }, 1.55);

    /* Блик на главных кнопках раз в несколько секунд */
    $$('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.7 });
    });

    /* Силуэты Айкуне за героем чуть отстают от прокрутки */
    gsap.to('.hero__chev', {
      yPercent: 14, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Что я лечу: позвоночник выпрямляется ---------- */
    revealLines('.treat h2', '.treat .sec-head');
    fadeUp('.treat .eyebrow', '.treat .sec-head');
    gsap.to('.spine__axis i', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.spine', start: 'top 72%', end: 'bottom 55%', scrub: true },
    });
    // Каждый позвонок стартует со смещением по S-образной кривой (сколиоз) и встаёт на ось, когда строка доходит до середины экрана
    $$('.spine__item').forEach((item, i) => {
      const k = 1.2 * i + 0.4;
      gsap.fromTo($('.vert', item),
        { x: 17 * Math.sin(k), rotation: 24 * Math.cos(k) },
        { x: 0, rotation: 0, ease: 'power1.out', scrollTrigger: { trigger: item, start: 'top 90%', end: 'top 50%', scrub: 0.5 } });
      gsap.from($('p', item), {
        x: 22, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 88%' },
      });
    });
    gsap.from('.callout', {
      y: 36, autoAlpha: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.callout', start: 'top 90%' },
    });

    /* ---------- 3. Как записаться: позвоночник уже прямой, шаги зажигаются по очереди ---------- */
    revealLines('.steps-sec h2', '.steps-sec .sec-head');
    fadeUp('.steps-sec .eyebrow', '.steps-sec .sec-head');
    gsap.to('.steps__rail', {
      '--p': 1, ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 70%', scrub: true },
    });
    $$('.step').forEach(step => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: step, start: 'top 85%' } });
      tl.fromTo($('.vert svg', step), { fill: 'rgba(245,238,225,.1)', stroke: 'rgba(245,238,225,.3)' }, { fill: '#e6b93c', stroke: '#7b4b37', duration: 0.9, ease: 'power2.out' }, 0)
        .from($('.vert', step), { scale: 0.7, duration: 0.9, ease: 'back.out(2.4)' }, 0)
        .from([$('h3', step), $('p', step)], { y: 24, autoAlpha: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out' }, 0.15);
    });
    gsap.from('.cta-row .btn', {
      y: 26, autoAlpha: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-row', start: 'top 92%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
