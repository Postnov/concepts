// Полина Жданова — моушн концепта. Фирменная идея «растяжка цвета»: цвет стекает от тёмного корня к светлым длинам —
// в имени, лого и линиях-прядях; шторка «до/после» проходит по работе, как кисть.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- до/после: работает и без GSAP ---------- */
  const setPos = (ba, v) => {
    ba.style.setProperty('--pos', `${v}%`);
    $('.ba__range', ba).value = v;
  };
  $$('[data-ba]').forEach(ba => {
    const range = $('.ba__range', ba);
    range.addEventListener('input', () => {
      ba.dataset.user = '1';
      setPos(ba, Number(range.value));
    });
  });

  if (!animate) return;

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
    /* ---------- 1. Hero ---------- */
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => lead.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      // фото «прокрашивается» сверху вниз
      .fromTo('.hero__photo .frame', { clipPath: 'inset(0% 0% 100% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.35, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.28, duration: 2, ease: 'expo.out' }, 0.3)
      .fromTo('.strand span', { scaleY: 0 }, { scaleY: 1, duration: 1.6, ease: 'expo.inOut' }, 0.35)
      .from('.tag', { y: 14, autoAlpha: 0, duration: 0.7 }, 1.05)
      // лого: от сплошного тёмного к растяжке
      .fromTo('.logo__paint', { backgroundPosition: '0% 50%' }, { backgroundPosition: '100% 50%', duration: 1.8, ease: 'power2.inOut' }, 0.2)
      .from('.logo', { autoAlpha: 0, y: 10, duration: 0.8 }, 0.15)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.4)
      // имя: строка проявляется сверху вниз, цвет стекает от корня к длинам
      .fromTo('.hero__line', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% -10% 0%)', duration: 1.1, stagger: 0.16, ease: 'expo.out' }, 0.45)
      .fromTo('.hero__line', { backgroundPosition: '50% 0%' }, { backgroundPosition: '50% 100%', duration: 2.1, stagger: 0.16, ease: 'power2.inOut' }, 0.55)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.9)
      .from(lead.lines, { yPercent: 100, stagger: 0.08, duration: 0.95 }, 1.0)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.25)
      .from('.hero__phone', { autoAlpha: 0, duration: 0.8 }, 1.45);

    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. До и после ---------- */
    revealLines('.works h2', '.works .sec-head');
    gsap.from(['.works .eyebrow', '.works .sec-sub'], {
      y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.works .sec-head', start: 'top 82%' },
    });
    $$('[data-ba]').forEach((ba, i) => {
      gsap.from(ba, { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', delay: i * 0.08, scrollTrigger: { trigger: ba, start: 'top 88%' } });
      // Шторка проходит по работе, как кисть: от «до» к «после» и обратно в середину
      const st = { v: 50 };
      ScrollTrigger.create({
        trigger: ba, start: 'top 62%', once: true,
        onEnter: () => {
          if (ba.dataset.user) return;
          st.v = 92;
          setPos(ba, st.v);
          gsap.timeline({ delay: 0.25 + i * 0.2 })
            .to(st, { v: 10, duration: 1.5, ease: 'power2.inOut', onUpdate: () => !ba.dataset.user && setPos(ba, Math.round(st.v * 10) / 10) })
            .to(st, { v: 50, duration: 1.1, ease: 'power3.out', onUpdate: () => !ba.dataset.user && setPos(ba, Math.round(st.v * 10) / 10) });
        },
      });
    });
    const tiles = $$('.swatches li');
    gsap.set(tiles, { clipPath: 'inset(0% 0% 100% 0% round 18px)' });
    ScrollTrigger.batch(tiles, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.1, stagger: 0.09, ease: 'expo.inOut' });
        gsap.from(els.map(el => $('img', el)), { scale: 1.25, duration: 1.6, stagger: 0.09, ease: 'expo.out' });
      },
    });
    gsap.from('.works__more .btn', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.works__more', start: 'top 92%' } });

    /* ---------- 3. О нас ---------- */
    revealLines('.about h2', '.about .sec-head');
    gsap.from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 82%' } });
    gsap.fromTo('.about__rail span', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.about__grid', start: 'top 75%', end: 'bottom 55%', scrub: true },
    });
    gsap.from('.about__body > *', {
      y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out',
      scrollTrigger: { trigger: '.about__body', start: 'top 84%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.hours', start: 'top 86%' } })
      .from('.hours', { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out' })
      .fromTo('.hours__time i', { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 0.25)
      .from('.hours__time span', { y: 16, autoAlpha: 0, stagger: 0.12, duration: 0.7 }, 0.2)
      .from(['.hours__text', '.hours__cta .btn'], { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.5);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
