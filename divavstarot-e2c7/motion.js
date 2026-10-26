// Diva V.S — моушн концепта. Фирменная идея «закат над Коста-Бравой»:
// портрет-солнце встаёт над морем в арочном окне, при прокрутке садится, и страница уходит в ночь со звёздами.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Звёзды ночной секции: декор, есть и в статичной версии (детерминированно, без Math.random — одинаково на всех экранах)
  const sky = $('.stars');
  if (sky) {
    for (let i = 0; i < 46; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      const x = (i * 37.3 + 11) % 100;
      const y = (i * 61.7 + 7) % 100;
      s.style.left = x + '%';
      s.style.top = y + '%';
      s.style.opacity = String(0.35 + ((i * 13) % 10) / 16);
      if (i % 5 === 0) s.style.width = s.style.height = '3px';
      sky.append(s);
    }
  }

  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const mark = SplitText.create('.hero__mark', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { mark.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(mark.chars, { yPercent: 110, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.25)
      .from('.hero__name', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.65)
      .from('.hero__slogan', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.8)
      .from('.strike i', { scaleX: 0, duration: 0.7, ease: 'power2.inOut' }, 1.6)
      .from('.hero__slogan em', { color: 'rgba(42, 29, 51, .35)', duration: 0.6, ease: 'none' }, 2.0)
      // окно открывается снизу вверх, солнце встаёт из-за горизонта
      .fromTo('.scene', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0.15)
      .from('.scene__glow', { scale: 0.3, autoAlpha: 0, duration: 2.4, ease: 'power2.out' }, 0.7)
      .from('.sun', { yPercent: 118, duration: 2.4, ease: 'power3.out' }, 0.7)
      .from('.scene__reflect', { scaleY: 0, autoAlpha: 0, duration: 1.8, ease: 'power2.out' }, 1.2)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.95 }, 0.9)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.pills li', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 1.35)
      .from('.stat', { y: 10, autoAlpha: 0, duration: 0.7 }, 1.6);

    /* Живое море: блики дрожат, рябь плывёт, свечение дышит */
    gsap.to('.scene__reflect', { scaleX: 1.14, opacity: 0.75, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3 });
    gsap.to('.scene__waves', { backgroundPositionY: '28px', duration: 3.2, ease: 'none', repeat: -1 });
    gsap.to('.scene__glow', { scale: 1.08, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3 });

    /* При прокрутке солнце садится, небо темнеет */
    gsap.timeline({ scrollTrigger: { trigger: '.scene', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.sun', { yPercent: 70, ease: 'none' }, 0)
      .to('.scene__sky', { '--dusk': 1, ease: 'none' }, 0)
      .to('.scene__glow', { autoAlpha: 0.3, ease: 'none' }, 0);

    /* Блик на главной кнопке раз в несколько секунд */
    gsap.fromTo('.hero .btn', { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.8 });

    /* ---------- 2. Курсы: арки встают, как солнце из-за горизонта ---------- */
    gsap.from('.courses .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses .sec-head', start: 'top 84%' } });
    const h2 = SplitText.create('.courses h2', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from(h2.chars, {
      yPercent: 110, stagger: 0.04, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.courses .sec-head', start: 'top 82%' },
      onComplete: () => h2.revert(),
    });
    $$('.arc').forEach(arc => {
      gsap.timeline({ scrollTrigger: { trigger: arc, start: 'top 88%' } })
        .fromTo(arc, { clipPath: 'inset(100% 0% 0% 0% round 0px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.2, ease: 'expo.inOut' })
        .from($('.arc__num', arc), { yPercent: 160, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.45)
        .from([$('.arc__title', arc), $('.arc__text', arc), $('.arc__link', arc)], { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 0.6)
        .set(arc, { clearProps: 'clipPath' });
    });
    gsap.from('.sites__note', { y: 20, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.sites', start: 'top 85%' } });
    gsap.from('.site', {
      x: i => (i ? 40 : -40), autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.sites__grid', start: 'top 88%' },
    });

    /* ---------- 3. Ночь ---------- */
    gsap.from('.night .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.night .sec-head', start: 'top 84%' } });
    revealLines('.night h2', '.night .sec-head');
    gsap.from('.night .sec-sub', { y: 14, autoAlpha: 0, duration: 0.8, delay: 0.3, scrollTrigger: { trigger: '.night .sec-head', start: 'top 82%' } });
    // звёзды зажигаются по одной и мерцают
    gsap.from('.star', {
      scale: 0, autoAlpha: 0, duration: 0.6, ease: 'back.out(3)', stagger: { each: 0.03, from: 'random' },
      scrollTrigger: { trigger: '.night', start: 'top 40%' },
    });
    $$('.star').forEach((s, i) => {
      if (i % 3) return;
      gsap.to(s, { autoAlpha: 0.15, duration: 1.4 + (i % 5) * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 + (i % 7) * 0.4 });
    });
    $$('.free__item').forEach(item => {
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 88%' } })
        .from($('.free__title', item), { yPercent: 60, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0)
        .from($('.free__sub', item), { y: 10, autoAlpha: 0, duration: 0.7 }, 0.15)
        .from($('.free__arrow', item), { scale: 0, rotate: -90, duration: 0.8, ease: 'back.out(2)' }, 0.2);
    });
    gsap.from('.chan', {
      y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.channels', start: 'top 88%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
