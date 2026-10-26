// Михаил Кезин — моушн концепта. Фирменная идея: красная ручка учителя.
// Фразы дописываются от руки, ключевые слова подчёркиваются, цена обводится, у каждого пункта программы ставится галочка.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- галочки у пунктов программы: рисуются тут, чтобы разметка была короче ---------- */
  $$('.ticks li').forEach(li => li.insertAdjacentHTML('afterbegin',
    '<svg class="tk" viewBox="0 0 22 22" aria-hidden="true"><path pathLength="1" d="M3 12.5 L9 18 L19.5 4"/></svg>'));
  const drawTicks = body => animate && gsap.from($$('.tk path', body), { strokeDashoffset: 1, duration: 0.5, stagger: 0.07, ease: 'power2.out', overwrite: 'auto' });

  /* ---------- выпадающие блоки курса: работают и без GSAP ---------- */
  function setOpen(drop, open, instant) {
    const head = $('.drop__head', drop);
    const body = $('.drop__body', drop);
    if (head.getAttribute('aria-expanded') === String(open)) return;
    head.setAttribute('aria-expanded', String(open));
    if (!animate || instant) {
      body.hidden = !open;
      return refresh();
    }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, {
        height: 'auto', duration: 0.6, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      drawTicks(body);
      gsap.from($$('.note, .prose p', body), { y: 10, autoAlpha: 0, duration: 0.6, stagger: 0.1, delay: 0.25, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.4, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.drop').forEach(drop => $('.drop__head', drop).addEventListener('click', () => setOpen(drop, $('.drop__head', drop).getAttribute('aria-expanded') !== 'true')));
  // Плавная прокрутка к якорям (чипы классов)
  $$('a[href^="#c"], a[href="#courses"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: MotionBase.reduce ? 'auto' : 'smooth', block: 'start' });
  }));

  if (!animate) {
    $$('.course').forEach((c, i) => (!i || matchMedia('(min-width: 900px)').matches) && setOpen($('.drop', c), true, true));
    return;
  }

  // Заголовок строками из-под маски; после анимации split снимаем, затем ручка подчёркивает слово
  function revealHead(selector, trigger) {
    const el = $(selector);
    if (!el) return;
    const split = SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: 'top 84%' },
      onComplete: () => {
        split.revert();
        const path = $('.u path', el);
        if (path) gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' });
      },
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const title = SplitText.create('.hero__title', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const frame = $('.hero .frame');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { title.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__block', { scale: 0.7, rotate: -9, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.1)
      .fromTo(frame, { clipPath: 'inset(0% 100% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.3, ease: 'expo.inOut' }, 0.15)
      .from('.hero .frame img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(title.lines, { yPercent: 112, stagger: 0.11, duration: 1.05, ease: 'expo.out' }, 0.4)
      .fromTo('.mark', { '--mark': 0 }, { '--mark': 1, duration: 0.9, ease: 'power3.inOut' }, 1.15)
      .fromTo('.hero__pen-text', { clipPath: 'inset(-20% 100% -40% -2%)' }, { clipPath: 'inset(-20% -4% -40% -2%)', duration: 1.1, ease: 'power2.inOut' }, 1.1)
      .from('.hero__pen-line path', { strokeDashoffset: 1, duration: 0.7, ease: 'power2.inOut' }, 2.1)
      .from('.hero__pen-tick path', { strokeDashoffset: 1, duration: 0.5, ease: 'power2.out' }, 2.4)
      .from('.plate', { y: 24, rotate: 4, autoAlpha: 0, duration: 0.9 }, 1.0)
      .from('.stamp', { scale: 0.4, rotate: -70, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.5)' }, 1.2)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.hero__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3)
      .from('.chips li', { scale: 0.7, autoAlpha: 0, stagger: 0.08, duration: 0.55, ease: 'back.out(2)' }, 1.5);

    // Штамп «10+» медленно вращается
    gsap.to('.stamp svg', { rotate: 360, duration: 30, ease: 'none', repeat: -1 });
    // Лёгкий параллакс портрета
    gsap.to('.hero .frame img', {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Курсы ---------- */
    revealHead('.courses h2', '.courses .sec-head');
    gsap.from(['.courses .eyebrow', '.courses .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.courses .sec-head', start: 'top 84%' },
    });
    const entrance = [
      { y: 80, rotate: -2.5, x: 0 },
      { y: 40, rotate: 2, x: 40 },
      { y: 80, rotate: -1.5, x: -30 },
    ];
    $$('.course').forEach((c, i) => {
      const digits = $('.course__digits', c);
      const word = $('.course__word', c);
      const ring = $('.price__ring path', c);
      const e = entrance[i % 3];
      const split = SplitText.create(digits, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
      gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 84%' }, onComplete: () => split.revert() })
        .from(c, { ...e, transformOrigin: '50% 100%', autoAlpha: 0, duration: 1.2, ease: 'expo.out' })
        .from(split.chars, { yPercent: 110, stagger: 0.07, duration: 0.9, ease: 'expo.out' }, 0.25)
        .fromTo(digits, { '--mk': 0 }, { '--mk': 1, duration: 0.8, ease: 'power3.inOut' }, 0.7)
        .from([word, $('.course__label', c)], { x: -14, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.5);
      // Цена появляется целиком, ручка обводит её
      gsap.from($('.price', c).firstElementChild, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: $('.price', c), start: 'top 94%' } });
      gsap.from(ring, { strokeDashoffset: 1, duration: 1.1, ease: 'power2.inOut', delay: 0.35, scrollTrigger: { trigger: $('.price', c), start: 'top 94%' } });
      gsap.from($$('.drop', c), { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: $('.course__body', c), start: 'top 90%' } });
    });
    // Программа раскрывается сама: на телефоне у первого курса, на широком экране у всех, чтобы карточки не были пустыми
    const wide = matchMedia('(min-width: 900px)').matches;
    $$('.course').forEach((c, i) => {
      if (i && !wide) return;
      ScrollTrigger.create({
        trigger: $('.course__body', c), start: 'top 72%', once: true,
        onEnter: () => gsap.delayedCall(0.8, () => setOpen($('.drop', c), true)),
      });
    });

    /* ---------- 3. Кто я такой ---------- */
    revealHead('.about h2', '.about__head');
    gsap.timeline({ scrollTrigger: { trigger: '.about__grid', start: 'top 80%' } })
      .fromTo('.about .frame', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 28px 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 28px 28px)', duration: 1.4, ease: 'expo.inOut' })
      .from('.about .frame img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.15)
      .from('.about__block', { scale: 0.75, rotate: -8, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.1)
      .from('.about .eyebrow, .about__role', { y: 14, autoAlpha: 0, stagger: 0.12, duration: 0.7 }, 0.3)
      .from('.about .prose p', { y: 16, autoAlpha: 0, stagger: 0.14, duration: 0.8 }, 0.55)
      .from('.about__blogs', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.0)
      .from('.stats li', { y: 26, scale: 0.92, autoAlpha: 0, stagger: 0.14, duration: 0.8, ease: 'expo.out' }, 1.1)
      .from('.footnote', { autoAlpha: 0, duration: 0.8 }, 1.5);

    /* ---------- конец демо ---------- */
    revealHead('.concept-end__title', '.concept-end');
    gsap.from('.concept-end__text, .concept-end .btn', {
      y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1,
      scrollTrigger: { trigger: '.concept-end', start: 'top 85%' },
    });

    window.addEventListener('load', refresh, { once: true });
  });
})();
