// Общий motion.js для демо и полной версии (блоки, которых нет на странице, просто пропускаются).
// Фирменная идея — «сканер»: светящаяся линия проходит по медицинским объектам (портрет, «>20 лет»,
// обложка гайда, таблицы цен, бланк обследований) и проявляет их. Остальное входит своими движениями.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  function setOpen(head, open) {
    const body = document.getElementById(head.getAttribute('aria-controls'));
    head.setAttribute('aria-expanded', String(open));
    if (!animate) {
      body.hidden = !open;
      return;
    }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, {
        height: 'auto', duration: 0.6, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from(body.children, { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.06, delay: 0.1, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.45, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.acc__head').forEach(head => head.addEventListener('click', () => setOpen(head, head.getAttribute('aria-expanded') !== 'true')));

  if (!animate) return;

  // Скан: обрезка расширена наружу на 30/60 px, чтобы тень и свечение линии не срезались и не «выпрыгивали» в конце
  const SCAN_EASE = 'power3.out';
  const CLIP_FROM = 'inset(-30px -30px 100% -30px)';
  const CLIP_TO = 'inset(-30px -30px -60px -30px)';
  const scanTime = el => gsap.utils.clamp(0.45, 0.85, 0.35 + el.offsetHeight / 900);
  function scan(el, { duration = scanTime(el), delay = 0 } = {}) {
    const line = document.createElement('i');
    line.className = 'scanline';
    line.setAttribute('aria-hidden', 'true');
    el.appendChild(line);
    return gsap.timeline({ delay, onComplete: () => line.remove() })
      .fromTo(el, { clipPath: CLIP_FROM }, {
        clipPath: CLIP_TO, duration, ease: SCAN_EASE,
        onComplete: () => gsap.set(el, { clearProps: 'clipPath' }),
      }, 0)
      .fromTo(line, { y: 0, yPercent: -100 }, { y: () => el.offsetHeight, yPercent: -100, duration, ease: SCAN_EASE }, 0)
      .to(line, { autoAlpha: 0, duration: 0.35, ease: 'power1.out' }, duration * 0.8);
  }

  function countUp(el, { delay = 0, step = 1, trigger } = {}) {
    const to = Number(el.dataset.count);
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    const o = { v: 0 };
    return gsap.to(o, {
      v: to, duration: 1.5, delay, ease: 'power2.out', snap: { v: step },
      scrollTrigger: trigger ? { trigger, start: 'top 90%', once: true } : undefined,
      onStart: () => { el.textContent = MotionBase.money(0); },
      onUpdate: () => { el.textContent = MotionBase.money(o.v); },
    });
  }

  function splitLines(el) {
    return SplitText.create(el, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
  }

  // Карточки поднимаются пачками по мере прокрутки
  function rise(targets, { y = 28, stagger = 0.09, start = 'top 90%' } = {}) {
    const els = typeof targets === 'string' ? $$(targets) : targets;
    if (!els.length) return;
    gsap.set(els, { y, autoAlpha: 0 });
    ScrollTrigger.batch(els, {
      start, once: true,
      onEnter: batch => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.8, stagger, ease: 'power3.out' }),
    });
  }

  MotionBase.ready(() => {
    // ── Первый экран
    const surname = SplitText.create('.hero__surname', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const given = SplitText.create('.hero__given', { type: 'words', wordsClass: 'sw', mask: 'words' });
    const role = splitLines('.hero__role');
    const years = $('.years');
    const yearsN = $('.years__n');
    yearsN.style.minWidth = yearsN.getBoundingClientRect().width + 'px';
    gsap.set(years, { clipPath: CLIP_FROM });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { surname.revert(); given.revert(); role.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.mast .reg', { scale: 0, rotate: -90, duration: 0.7, stagger: 0.1, ease: 'expo.out' }, 0.1)
      .from('.mast__rule', { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0.1)
      .from('.mast span', { autoAlpha: 0, x: -8, duration: 0.6 }, 0.25)
      .from(surname.chars, { yPercent: 112, stagger: 0.04, duration: 1.0, ease: 'expo.out' }, 0.2)
      .from(given.words, { yPercent: 110, stagger: 0.08, duration: 0.9, ease: 'expo.out' }, 0.5)
      .from('.stage__circle', { scale: 0.55, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.3)
      .from('.sonar circle:not(.sonar__echo)', { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%', stagger: 0.12, duration: 1.2, ease: 'expo.out' }, 0.5)
      .from('.stage .reg', { scale: 0, rotate: -90, duration: 0.6, stagger: 0.1, ease: 'expo.out' }, 0.6)
      .add(scan($('.stage__scan'), { duration: 1.0 }), 0.55)
      .from(role.lines, { yPercent: 105, stagger: 0.08, duration: 0.85 }, 1.0)
      .from('.hero__cta', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.15)
      .add(scan(years, { duration: 0.7 }), 1.3)
      .add(countUp(yearsN), 1.3);
    if ($('.toc')) intro.from('.toc a', { autoAlpha: 0, y: 10, duration: 0.7, stagger: 0.06 }, 1.5);

    gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay: 2.4 })
      .fromTo('.sonar__echo', { attr: { r: 30 }, opacity: 0.7 }, { attr: { r: 99 }, opacity: 0, duration: 2.6, ease: 'sine.out' });

    // ── Шапки секций: линия, номер, строки заголовка
    $$('.panel__head').forEach(head => {
      const title = splitLines($('.panel__title', head));
      gsap.timeline({
        scrollTrigger: { trigger: head, start: 'top 86%', once: true },
        onComplete: () => title.revert(),
      })
        .from($('.panel__rule', head), { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0)
        .from($('.panel__num span', head), { yPercent: 110, duration: 0.9, ease: 'expo.out' }, 0.15)
        .from(title.lines, { yPercent: 105, stagger: 0.08, duration: 1.0, ease: 'expo.out' }, 0.2);
    });

    // ── Скан медицинских объектов: обложка гайда, таблицы цен, бланк
    const scans = $$('[data-scan]');
    gsap.set(scans, { clipPath: CLIP_FROM });
    ScrollTrigger.batch(scans, {
      start: 'top 92%', once: true,
      onEnter: els => els.forEach((el, i) => scan(el, { delay: i * 0.07 })),
    });

    // ── 01. Путь: строки поднимаются, крупные цифры выезжают из маски, галочки ставятся
    const rows = $$('.path li');
    gsap.set(rows, { y: 22, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
        const nums = els.flatMap(li => $$('.path__mark b, .path__mark small', li));
        if (nums.length) gsap.from(nums, { yPercent: 110, duration: 0.8, stagger: 0.06, delay: 0.1, ease: 'expo.out' });
        const ticks = els.map(li => $('.tick i', li)).filter(Boolean);
        if (ticks.length) gsap.from(ticks, { scale: 0, duration: 0.5, stagger: 0.08, delay: 0.25, ease: 'expo.out' });
      },
    });

    // ── 02. Чем помочь: кольца номеров дорисовываются
    const helps = $$('.help__item');
    const C = 2 * Math.PI * 18;
    gsap.set(helps, { y: 26, autoAlpha: 0 });
    gsap.set('.help__n circle', { strokeDasharray: C, strokeDashoffset: C });
    ScrollTrigger.batch(helps, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' });
        const rings = els.map(li => $('.help__n circle', li)).filter(Boolean);
        gsap.to(rings, { strokeDashoffset: 0, duration: 1.1, stagger: 0.09, delay: 0.2, ease: 'power2.inOut' });
      },
    });

    // ── 03. Гайд: карточка поднимается, обложка сканируется (data-scan), текст следом
    gsap.timeline({ scrollTrigger: { trigger: '.guide', start: 'top 88%', once: true } })
      .from('.guide', { y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0)
      .from('.guide__text > *', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, 0.2);

    // ── 04. Курсы: иллюстрация вырастает, плашка «Бесплатно/Курс» появляется следом, затем текст и кнопка
    const courses = $$('.course');
    courses.forEach(c => {
      gsap.set(c, { autoAlpha: 0, y: 20 });
      gsap.set($('.course__pic img', c), { scale: 0.92, autoAlpha: 0 });
      gsap.set($('.chip', c), { autoAlpha: 0, x: -8 });
      gsap.set([$('.course__text', c), $('.btn--card', c)], { autoAlpha: 0, y: 10 });
    });
    ScrollTrigger.batch(courses, {
      start: 'top 90%', once: true,
      onEnter: els => els.forEach((c, i) => {
        gsap.timeline({ delay: i * 0.08, defaults: { ease: 'power3.out' } })
          .to(c, { autoAlpha: 1, y: 0, duration: 0.7 }, 0)
          .to($('.course__pic img', c), { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'expo.out' }, 0.1)
          .to($('.chip', c), { autoAlpha: 1, x: 0, duration: 0.5 }, 0.4)
          .to([$('.course__text', c), $('.btn--card', c)], { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06 }, 0.45);
      }),
    });

    // ── 05. Консультации
    rise('.visit, .prodoc, .acc, .remote', { y: 30 });
    gsap.from('.visit__btns .btn', { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.visit__btns', start: 'top 92%', once: true } });
    rise('.fmt', { y: 18 });
    const lead = splitLines($('.online__lead'));
    gsap.from(lead.lines, {
      yPercent: 105, stagger: 0.08, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: '.online__lead', start: 'top 88%', once: true },
      onComplete: () => lead.revert(),
    });
    $$('.price [data-count]').forEach(el => countUp(el, { step: 100, delay: 0.3, trigger: el }));

    // ── 06. Бланк: после скана ставятся галочки и выпадают показатели
    gsap.timeline({ scrollTrigger: { trigger: '.form', start: 'top 82%', once: true }, delay: 0.4 })
      .from('.box i', { scale: 0, duration: 0.45, stagger: 0.24, ease: 'expo.out' }, 0)
      .from('.markers li', { y: 8, autoAlpha: 0, duration: 0.45, stagger: 0.03, ease: 'power2.out' }, 0.15);

    // ── 07. Отзывы: пузырь «приходит» от угла, текст проявляется, галочка прочтения
    const msgs = $$('.msg');
    gsap.set(msgs, { scale: 0.88, autoAlpha: 0, y: 20, transformOrigin: '0% 100%' });
    ScrollTrigger.batch(msgs, {
      start: 'top 92%', once: true,
      onEnter: els => els.forEach((msg, i) => {
        gsap.timeline({ delay: i * 0.12 })
          .to(msg, { scale: 1, autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0)
          .from($('blockquote', msg), { autoAlpha: 0, y: 8, duration: 0.6, ease: 'power2.out' }, 0.2)
          .from($('.msg__tick', msg), { scale: 0, duration: 0.45, ease: 'expo.out' }, 0.6);
      }),
    });
    if ($('.more')) gsap.from('.more', { autoAlpha: 0, x: -12, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.more', start: 'top 95%', once: true } });

    // ── 08. Контакты
    gsap.timeline({ scrollTrigger: { trigger: '.contacts', start: 'top 88%', once: true } })
      .from('.channel', { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out' }, 0)
      .from('.channel__arrow', { x: -10, y: 10, autoAlpha: 0, duration: 0.6, stagger: 0.14, ease: 'expo.out' }, 0.35);

    // Подвал (full) / блок концепта (демо)
    if ($('.foot')) {
      gsap.timeline({ scrollTrigger: { trigger: '.foot', start: 'top 92%', once: true } })
        .from('.foot__rule', { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0)
        .from('.foot__top .reg', { scale: 0, rotate: -90, duration: 0.6, stagger: 0.1, ease: 'expo.out' }, 0.1)
        .from('.foot__id > *, .foot__col', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.2);
    }
    if ($('.concept-end')) {
      gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%', once: true } });
    }

    window.addEventListener('load', refresh, { once: true });
  });
})();
