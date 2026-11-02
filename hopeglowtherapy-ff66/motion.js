// Hope.glow — моушн концепта. Фирменная идея — «блеск волос»: золотые пряди прорисовываются вокруг фото,
// по портрету и по имени раз в несколько секунд проходит мягкий отблеск, как свет по гладким волосам.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно и работает без GSAP

  // Прядь: длина пути = 1, рисуем через dashoffset 1 → 0
  const prepStroke = paths => paths.forEach(p => {
    p.setAttribute('pathLength', '1');
    p.style.strokeDasharray = '1';
    p.style.strokeDashoffset = '1';
  });

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const nameEl = $('.hero__name');
    const name = SplitText.create(nameEl, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const hello = SplitText.create('.hero__hello', { type: 'lines', mask: 'lines' });
    const strands = $$('.strand');
    prepStroke(strands);

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        name.revert(); hello.revert();
        nameEl.classList.add('is-glow');
        startGlow();
      },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.2)
      .from(name.chars, { yPercent: 110, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.25)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 30px 30px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 30px 30px)', duration: 1.4, ease: 'expo.inOut' }, 0.35)
      .from('.arch img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.5)
      .to(strands, { strokeDashoffset: 0, duration: 2.2, stagger: 0.18, ease: 'power2.inOut' }, 0.7)
      .from('.seal', { scale: 0.4, rotate: -60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 1.2)
      .from(hello.lines, { yPercent: 100, stagger: 0.1, duration: 0.95 }, 0.9)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.1)
      .from('.pills li', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.25)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35);

    /* Печать «баланс · красота · лёгкость» медленно вращается */
    gsap.to('.seal svg:first-child', { rotate: 360, duration: 26, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });

    /* Блеск: отблеск по портрету и по имени в один такт, раз в ~5 секунд */
    function startGlow() {
      gsap.timeline({ repeat: -1, repeatDelay: 3.4 })
        .fromTo('.glint', { '--glint': '-70%' }, { '--glint': '70%', duration: 1.6, ease: 'power2.inOut' }, 0)
        .fromTo(nameEl, { '--sheen': '100%' }, { '--sheen': '0%', duration: 1.6, ease: 'power2.inOut' }, 0.25);
    }

    /* Пряди мягко колышутся */
    gsap.to('.strands', { y: -6, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    /* Блик на главных кнопках */
    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.7 });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.arch img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Протокол: прядь «прошивает» пункты ---------- */
    gsap.from('.protocol__inner', {
      clipPath: 'inset(6% 4% 6% 4% round 34px)', duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: '.protocol', start: 'top 88%' },
    });
    revealLines('.protocol h2', '.protocol .sec-head');
    gsap.from(['.protocol .eyebrow', '.protocol .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.protocol .sec-head', start: 'top 82%' },
    });
    // Золотая прядь проявляется сверху вниз вслед за прокруткой (маска, а не dash: у линии non-scaling-stroke)
    gsap.fromTo('.protocol__strand--fg', { clipPath: 'inset(0% 0% 100% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: '.protocol__list', start: 'top 72%', end: 'bottom 55%', scrub: true },
    });
    $$('.get').forEach(get => {
      gsap.timeline({ scrollTrigger: { trigger: get, start: 'top 86%' } })
        .from(get, { x: 26, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
        .from($('.get__icon', get), { scale: 0.3, rotate: -40, duration: 0.9, ease: 'back.out(2)' }, 0.1);
    });
    gsap.from('.offer > *', {
      y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.offer', start: 'top 88%' },
    });

    /* ---------- 3. Питание и связь ---------- */
    gsap.from('.more .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.more', start: 'top 82%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.menu-card', start: 'top 84%' } })
      .fromTo('.menu-card', { clipPath: 'inset(0% 0% 100% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.inOut' })
      .from('.menu-card__glow', { scale: 0.3, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.4)
      .from('.menu-card__body > *, .menu-card__go', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, 0.6);
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 1 };
      gsap.to(o, {
        v: to, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = Math.round(o.v); },
      });
    });
    gsap.from('.contact', {
      y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.contacts', start: 'top 88%' },
    });
    gsap.from('.contact__icon', {
      scale: 0, duration: 0.8, stagger: 0.12, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.contacts', start: 'top 88%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
