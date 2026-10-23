// Вадим Левашов — моушн концепта. Фирменный жест: «гибкая строка» — буквы изгибаются волной, как позвоночник в практике.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // без GSAP / при reduced motion — статичная страница

  /* Гибкая строка: текст в буквы, два одинаковых набора для бесшовной ленты; волна — CSS, ход ленты — GSAP */
  function buildWave() {
    const wave = $('.wave');
    if (!wave) return null;
    const words = $('.wave__src', wave).textContent.split('·').map(w => w.trim()).filter(Boolean);
    const makeSet = () => {
      const set = document.createElement('span');
      set.className = 'wave__set';
      set.setAttribute('aria-hidden', 'true');
      let i = 0;
      const items = [];
      words.forEach(w => {
        [...w].forEach(c => items.push({ c }));
        items.push({ dot: true });
      });
      const n = items.length;
      items.forEach(it => {
        const el = document.createElement('span');
        el.className = it.dot ? 'wave__dot' : 'wave__ch';
        if (!it.dot) el.textContent = it.c;
        el.style.setProperty('--i', i++);
        el.style.setProperty('--n', n);
        set.append(el);
      });
      return set;
    };
    const track = document.createElement('span');
    track.className = 'wave__track';
    // набор шире экрана, чтобы лента не обрывалась
    const sets = Math.max(2, Math.ceil((innerWidth * 2) / 1000) * 2);
    for (let k = 0; k < sets; k++) track.append(makeSet());
    wave.append(track);
    $('.wave__src', wave).className = 'sr-only';
    wave.classList.add('is-live');
    return { wave, track, sets };
  }

  MotionBase.ready(() => {
    const live = buildWave();

    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__photo', { autoAlpha: 0, scale: 1.16, transformOrigin: '30% 50%', duration: 2.4, ease: 'expo.out' }, 0.1)
      .fromTo('.hero__ring', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut' }, 0.3)
      .from('.hero__sun', { scale: 0, svgOrigin: '200 4', duration: 0.9, ease: 'back.out(2.2)' }, 0.5)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.4)
      .from(name.chars, { yPercent: 118, rotate: 7, stagger: 0.045, duration: 1.1, ease: 'expo.out' }, 0.5)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.9)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.25);

    // Солнце ходит по кольцу вокруг его головы
    gsap.to('.hero__spin', { rotation: 360, svgOrigin: '200 200', duration: 40, ease: 'none', repeat: -1 });
    // Лёгкий параллакс фото
    gsap.to('.hero__photo', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Коротко ---------- */
    gsap.from('.facts .eyebrow', { x: -16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.facts', start: 'top 80%' } });
    // Фото раскрывается слева направо — «солнце восходит»
    gsap.fromTo('.facts__photo img', { clipPath: 'inset(0 100% 0 0)', scale: 1.14 }, {
      clipPath: 'inset(0 0% 0 0)', scale: 1, duration: 1.7, ease: 'expo.inOut', transformOrigin: '20% 50%',
      scrollTrigger: { trigger: '.facts__photo', start: 'top 82%' },
      onComplete: function () { gsap.set(this.targets(), { clearProps: 'clipPath' }); },
    });
    $$('.stat').forEach(el => {
      const num = $('b', el);
      const to = +num.dataset.count;
      const st = { trigger: el, start: 'top 88%', once: true };
      gsap.fromTo(el, { '--draw': 0 }, { '--draw': 1, duration: 1.1, ease: 'expo.out', scrollTrigger: st });
      gsap.from($$('.stat__pre, .stat__num i, .stat__label', el), { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out', scrollTrigger: st });
      // счётчик не цены, а лет и учеников
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', scrollTrigger: st, onUpdate: () => { num.textContent = Math.round(o.v); } });
    });

    /* ---------- Гибкая строка ---------- */
    if (live) {
      const first = $('.wave__set', live.track);
      const w = first.getBoundingClientRect().width;
      const loop = gsap.to(live.track, { x: -w * (live.sets / 2), duration: (w * (live.sets / 2)) / 70, ease: 'none', repeat: -1 });
      // прокрутка разгоняет строку, остановка возвращает ход
      ScrollTrigger.create({
        trigger: '.wave', start: 'top bottom', end: 'bottom top',
        onUpdate: self => {
          const v = gsap.utils.clamp(-3, 3, self.getVelocity() / 600);
          gsap.to(loop, { timeScale: 1 + v, duration: 0.3, overwrite: true });
          gsap.to(loop, { timeScale: 1, duration: 1.4, delay: 0.3, overwrite: 'auto' });
        },
      });
      gsap.fromTo('.wave', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.wave', start: 'top 90%' }, onComplete: function () { gsap.set(this.targets(), { clearProps: 'clipPath' }); } });
    }

    /* ---------- 3. Курсы ---------- */
    revealChars('.courses .sec-title', '.courses .sec-head');
    gsap.from('.courses .eyebrow', { x: -16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses .sec-head', start: 'top 82%' } });
    const items = $$('.list__item');
    gsap.set(items, { y: 28, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }),
    });

    /* ---------- конец ---------- */
    gsap.from('.concept-end > *', { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.concept-end', start: 'top 80%' } });
  });

  // Заголовок буквами из-под маски, с лёгким кренением — как волна по позвоночнику
  function revealChars(selector, trigger) {
    const split = SplitText.create(selector, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from(split.chars, {
      yPercent: 118, rotate: 7, duration: 1.1, stagger: 0.04, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }
})();
