// Настя Идея — моушн концепта. Фирменная идея — «проявка»: картинки теста проявляются, как полароид,
// из молочной дымки в цвет (игра слов с её «проявленностью»); нашивка «прошивается» строчкой, заголовок проступает из размытия.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- тест: выбор картинки → расшифровка (работает и без GSAP) ---------- */
  let current = 0;
  function pick(n, { instant = false, scroll = false } = {}) {
    if (n === current) return;
    const prev = current && $(`#arch-${current}`);
    const next = $(`#arch-${n}`);
    current = n;
    $$('[data-pick]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.pick === n)));
    if (prev) prev.hidden = true;
    next.hidden = false;
    if (animate && !instant) {
      gsap.killTweensOf([next, ...$$('*', next)]);
      gsap.fromTo(next, { autoAlpha: 0, y: 16, filter: 'blur(10px)' }, {
        autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', clearProps: 'filter',
      });
      gsap.from($$('.dash li, .arch__problem', next), { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.04, delay: 0.18, ease: 'power2.out' });
    }
    // refresh до прокрутки: он восстанавливает позицию и оборвал бы плавный скролл
    refresh();
    // На телефоне расшифровка ниже сетки — подводим к ней, если она вне экрана
    if (scroll) {
      const top = next.getBoundingClientRect().top;
      if (top > innerHeight * 0.75 || top < 0) window.scrollTo({ top: scrollY + top - 90, behavior: animate ? 'smooth' : 'auto' });
    }
  }
  $$('[data-pick]').forEach(b => b.addEventListener('click', () => pick(+b.dataset.pick, { scroll: b.classList.contains('pola') })));

  if (!animate) {
    pick(1, { instant: true });
    return;
  }

  // Проявка полароида: «молоко» уходит, снимок набирает цвет и резкость
  const MILKY = 'saturate(0.1) brightness(1.45) contrast(0.6) blur(5px)';
  const CLEAR = 'saturate(1) brightness(1) contrast(1) blur(0px)';
  function develop(polas, { delay = 0, stagger = 0.22, duration = 2.1 } = {}) {
    const tl = gsap.timeline({ delay });
    polas.forEach((p, i) => {
      const img = $('img', p), milk = $('.pola__milk', p);
      tl.fromTo(img, { filter: MILKY }, { filter: CLEAR, duration, ease: 'sine.inOut', clearProps: 'filter' }, i * stagger)
        .fromTo(milk, { opacity: 0.92 }, { opacity: 0, duration: duration * 0.85, ease: 'sine.inOut' }, i * stagger);
    });
    return tl;
  }
  // До старта проявки снимки «молочные»
  const undeveloped = polas => polas.forEach(p => {
    gsap.set($('img', p), { filter: MILKY });
    gsap.set($('.pola__milk', p), { opacity: 0.92 });
  });

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Рукописное слово «пишется» слева направо (запас клипа по краям — у кисти длинные хвосты)
  function write(el, vars = {}) {
    return gsap.fromTo(el,
      { clipPath: 'inset(-30% 104% -30% -6%)' },
      { clipPath: 'inset(-30% -6% -30% -6%)', duration: 1.3, ease: 'power2.inOut', clearProps: 'clipPath', ...vars });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const heroPolas = $$('.hero__pola .pola');
    const title = SplitText.create('.patch__title', { type: 'words', wordsClass: 'sw' });
    undeveloped(heroPolas);

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => title.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__tag', { y: 12, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.15)
      .from('.clover--top', { scale: 0.4, rotation: -60, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.6)' }, 0.2)
      .from('.patch', { scale: 0.86, rotation: -5, autoAlpha: 0, duration: 1.15, ease: 'expo.out' }, 0.2)
      .fromTo('.seam-draw', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.9, ease: 'power2.inOut' }, 0.45)
      .from('.patch__arc', { autoAlpha: 0, duration: 1.2, ease: 'power2.out' }, 0.75)
      .from(title.words, { autoAlpha: 0, y: 10, filter: 'blur(12px)', duration: 0.9, stagger: 0.08, clearProps: 'filter' }, 0.6)
      .from(heroPolas, { y: -46, rotation: i => (i % 2 ? 8 : -8), autoAlpha: 0, duration: 1, stagger: 0.09, ease: 'expo.out' }, 0.35)
      .add(develop(heroPolas, { stagger: 0.28, duration: 2.2 }), 0.7)
      .from('.hero__time', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.05)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 1.15)
      .from('.hero__bio', { y: 20, autoAlpha: 0, duration: 0.8 }, 1.3);

    // Клевер чуть поворачивается при прокрутке
    gsap.to('.clover--top', { rotation: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Тест ---------- */
    revealLines('.test h2', '.test .sec-head');
    gsap.from(['.test .eyebrow', '.test .sec-sub'], { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: '.test .sec-head', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.note', start: 'top 88%' } })
      .from('.note', { y: 24, rotation: -1.5, autoAlpha: 0, duration: 0.9, ease: 'expo.out' })
      .from('.note__bang', { scale: 0.3, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(2.2)' }, 0.25)
      .from('.arrow', { y: -14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.35);
    gsap.to('.arrow', { y: 6, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });

    // Карточки теста ложатся на стол и проявляются по мере прокрутки
    const gridPolas = $$('.grid .pola');
    undeveloped(gridPolas);
    gsap.set(gridPolas, { y: -28, autoAlpha: 0 });
    ScrollTrigger.batch(gridPolas, {
      start: 'top 92%', once: true,
      onEnter: els => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: 'expo.out', clearProps: 'transform' });
        develop(els, { delay: 0.15, stagger: 0.16, duration: 1.9 });
      },
    });

    write('.panel__title', { scrollTrigger: { trigger: '.panel', start: 'top 84%' } });
    gsap.from('.chip', { y: 12, autoAlpha: 0, duration: 0.55, stagger: 0.03, ease: 'power2.out', scrollTrigger: { trigger: '.chips', start: 'top 90%' } });
    // Пока ничего не выбрано — расшифровка первой картинки открывается сама, чтобы было видно, что тест живой
    ScrollTrigger.create({ trigger: '.chips', start: 'top 70%', once: true, onEnter: () => gsap.delayedCall(0.5, () => { if (!current) pick(1); }) });
    gsap.from('.panel__note', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.panel__note', start: 'top 92%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.gift', start: 'top 88%' } })
      .from('.gift', { y: 30, rotation: 1.5, autoAlpha: 0, duration: 0.95, ease: 'expo.out' })
      .from('.gift > *', { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.2);

    /* ---------- 3. Мастер-класс ---------- */
    const mk = gsap.timeline({ scrollTrigger: { trigger: '.mk .sec-head', start: 'top 82%' } });
    mk.from('.mk .eyebrow', { y: 12, autoAlpha: 0, duration: 0.7 })
      .add(write('.mk__brush', { duration: 1.4 }), 0.1)
      .from('.mk__patch', { scale: 0.6, rotation: 12, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.8)' }, 0.75)
      .fromTo('.mk__seam', { strokeDashoffset: 64 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out' }, 0.9)
      .from('.mk__name', { y: 16, autoAlpha: 0, duration: 0.8 }, 0.9)
      .from('.mk .sec-sub', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.05);

    // Нить программы тянется вниз, дни пришиваются к ней
    gsap.fromTo('.days__thread', { clipPath: 'inset(0% 0% 100% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 2.6, ease: 'power1.inOut', clearProps: 'clipPath',
      scrollTrigger: { trigger: '.days', start: 'top 80%' },
    });
    const days = $$('.day');
    gsap.set(days, { x: 26, autoAlpha: 0 });
    ScrollTrigger.batch(days, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'expo.out', clearProps: 'transform' }),
    });

    gsap.timeline({ scrollTrigger: { trigger: '.tariff', start: 'top 84%' } })
      .from('.tariff', { y: 50, rotation: -2, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
      .from('.tariff__title, .tariff__lead', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.25)
      .from('.ticks li', { x: -12, autoAlpha: 0, duration: 0.55, stagger: 0.07, ease: 'power2.out' }, 0.4);
    // Цена появляется целиком, без счётчика
    gsap.from('.tariff__price > *', { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.tariff__price', start: 'top 92%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
