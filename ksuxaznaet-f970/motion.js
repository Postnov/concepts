// Ксюха Знает — моушн концепта. Фирменная идея «Расклад»: карты рассдаются рубашкой вверх и переворачиваются лицом при прокрутке.
// Фоном — солнце и месяц на золотых орбитах вокруг неё. Всё без резких эффектов.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- «Показать все вопросы»: работает и без GSAP ---------- */
  function setMore(card, open, instant) {
    const btn = $('.more', card);
    const list = $('.bullets', card);
    const extra = $$('.more-li', card);
    if (!btn || btn.getAttribute('aria-expanded') === String(open)) return;
    btn.setAttribute('aria-expanded', String(open));
    $('span', btn).textContent = open ? 'Свернуть' : 'Показать все вопросы';
    if (!animate || instant) {
      extra.forEach(li => { li.hidden = !open; });
      return refresh();
    }
    gsap.killTweensOf([list, ...extra]);
    const from = list.offsetHeight;
    if (open) {
      extra.forEach(li => { li.hidden = false; });
      const to = list.offsetHeight;
      gsap.fromTo(list, { height: from }, { height: to, duration: 0.6, ease: 'power3.out', onComplete: () => { list.style.height = ''; refresh(); } });
      gsap.from(extra, { x: -12, autoAlpha: 0, duration: 0.5, stagger: 0.05, delay: 0.08, ease: 'power2.out' });
    } else {
      extra.forEach(li => { li.hidden = true; });
      const to = list.offsetHeight;
      extra.forEach(li => { li.hidden = false; });
      gsap.fromTo(list, { height: from }, {
        height: to, duration: 0.45, ease: 'power3.inOut',
        onComplete: () => { extra.forEach(li => { li.hidden = true; }); list.style.height = ''; refresh(); },
      });
    }
  }
  $$('.tcard').forEach(card => {
    const btn = $('.more', card);
    if (btn) btn.addEventListener('click', () => setMore(card, btn.getAttribute('aria-expanded') !== 'true'));
  });

  if (!animate) return;

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
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const rings = $$('.halo__ring');
    const lens = rings.map(r => r.getTotalLength());

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { first.revert(); lead.revert(); rings.forEach(r => gsap.set(r, { clearProps: 'strokeDashoffset' })); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__photo img', { autoAlpha: 0, scale: 1.1, duration: 2, ease: 'expo.out' }, 0.05)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.4)
      .from(rings[0], { strokeDasharray: lens[0], strokeDashoffset: lens[0], duration: 2.4, ease: 'power2.inOut' }, 0.3)
      .from('.halo__sun, .halo__moon', { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%', stagger: 0.2, duration: 0.8, ease: 'back.out(2)' }, 1.6)
      .from(first.chars, { yPercent: 110, stagger: 0.06, duration: 1.1, ease: 'expo.out' }, 0.55)
      .fromTo('.hero__script', { clipPath: 'inset(-40% 100% -40% -8%)' }, { clipPath: 'inset(-40% -10% -40% -8%)', duration: 1.5, ease: 'power2.inOut' }, 1.05)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.2)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.45)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.55)
      .from('.facts li', { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.75);

    // Солнце и месяц ходят по орбите вокруг неё
    gsap.to('.halo__orbit', { rotation: 360, duration: 70, ease: 'none', repeat: -1, svgOrigin: '200 200' });
    gsap.to(rings[1], { strokeDashoffset: -14, duration: 3, ease: 'none', repeat: -1 });

    // Блик на главных кнопках раз в несколько секунд
    $$('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.7 });
    });

    // Лёгкий параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Консультации: расклад ---------- */
    revealLines('.deck h2', '.deck .sec-head');
    gsap.from(['.deck .eyebrow', '.deck .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.deck .sec-head', start: 'top 84%' },
    });
    $$('.tcard').forEach((card, i) => {
      const inner = $('.tcard__inner', card);
      const price = $('.tcard__price', card);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: card, start: 'top 86%' },
        onComplete: () => { gsap.set([card, inner], { clearProps: 'transform' }); },
      });
      tl.from(card, { y: 140, rotate: i % 2 ? 4 : -4, autoAlpha: 0, duration: 1.0, ease: 'power3.out' }, 0)
        .from(inner, { rotationY: 180, duration: 1.25, ease: 'power3.inOut' }, 0.25)
        .fromTo($('.tcard__shine', card), { '--sweep': '0%' }, { '--sweep': '560%', duration: 1.5, ease: 'power2.inOut' }, 1.1);
      // Цена появляется целиком, без счётчика
      gsap.from(price, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: price, start: 'top 94%' } });
    });

    /* ---------- 3. Как проходит ---------- */
    revealLines('.how h2', '.how .sec-head');
    gsap.from('.how .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.how .sec-head', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.how__photo', start: 'top 82%' } })
      .fromTo('.how__photo .frame', { clipPath: 'inset(100% 0% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.4, ease: 'expo.inOut' })
      .from('.how__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.15);
    const steps = $$('.steps li');
    gsap.set(steps, { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch(steps, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }),
    });
    gsap.to('.steps__rail span', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 62%', scrub: true } });

    // Запись: над горизонтом встаёт солнце
    gsap.fromTo('.signup__sun', { yPercent: 70 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.signup', start: 'top 75%', end: 'bottom 72%', scrub: true } });
    gsap.from('.signup > :not(.signup__sun)', { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.12, scrollTrigger: { trigger: '.signup', start: 'top 72%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
