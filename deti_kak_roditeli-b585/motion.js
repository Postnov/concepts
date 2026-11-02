// Таша Валеева — моушн концепта.
// Фирменная идея — ростомер: малиновая линия «роста» поднимается по линейке снизу вверх,
// и на каждой высоте карандаш прочерчивает отметку её проекта (как рост ребёнка на дверном косяке).
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // reduced motion / нет GSAP — статичная рабочая страница

  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  const mobile = matchMedia('(max-width: 899px)').matches;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger, opts = {}) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out', ...opts,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Ростомер: линия растёт снизу, отметки прочерчиваются в момент, когда линия до них дорастает
  function growthTimeline() {
    const chart = $('.growth__chart');
    const marks = $$('.mark', chart);
    const H = chart.offsetHeight;
    const grow = 2.4;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.ruler', { clipPath: 'inset(100% 0% 0% 0% round 6px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', duration: 1.1, ease: 'expo.inOut' }, 0)
      .fromTo('.ruler__fill', { scaleY: 0 }, { scaleY: 1, duration: grow, ease: 'power1.inOut' }, 0.5);
    // снизу вверх: время отметки пропорционально её высоте от пола
    marks.slice().reverse().forEach(mark => {
      const y = mark.offsetTop + 25;
      const at = 0.5 + grow * gsap.utils.clamp(0, 1, (H - y) / H) * 0.92;
      tl.fromTo($('.mark__pencil path', mark), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, at)
        .from($('.mark__num', mark), { yPercent: 50, autoAlpha: 0, duration: 0.8 }, at + 0.15)
        .from($('.mark__text', mark), { y: 10, autoAlpha: 0, duration: 0.8 }, at + 0.25);
    });
    tl.from('.growth__note > *', { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, '-=0.5');
    return tl;
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name .ln', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__glow', { scale: 0.6, autoAlpha: 0, duration: 2.2, ease: 'expo.out' }, 0.1)
      .from('.avatar img', { scale: 0.55, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.2)
      .fromTo('.avatar__line', { strokeDasharray: '0 1' }, { strokeDasharray: '1 0', duration: 1.4, ease: 'expo.inOut' }, 0.25)
      .from('.avatar__ticks', { rotation: -120, svgOrigin: '60 60', autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.3)
      .from('.brand__text > *', { x: -14, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 0.45)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.5)
      .from(lead.lines, { yPercent: 105, stagger: 0.1, duration: 1 }, 0.95)
      .from('.tags li', { y: 10, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.1)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.3);

    /* ---------- Ростомер ---------- */
    const growth = growthTimeline();
    growth.pause();
    // карточка ростомера: если видна сразу — выходит следом за интро, иначе при прокрутке
    gsap.set('.growth', { y: 40, autoAlpha: 0 });
    gsap.set('.growth__cap', { y: 14, autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: '.growth', start: 'top 98%', once: true,
      onEnter: () => {
        const wait = Math.max(0, (mobile ? 1.2 : 0.3) - intro.time());
        gsap.to('.growth', { y: 0, autoAlpha: 1, duration: 1, delay: wait, ease: 'power3.out' });
        gsap.to('.growth__cap', { y: 0, autoAlpha: 1, duration: 0.8, delay: wait + 0.2, ease: 'power3.out' });
      },
    });
    ScrollTrigger.create({
      trigger: '.growth__chart', start: 'top 80%', once: true,
      // на десктопе ростомер виден сразу — ждём, пока доиграет имя
      onEnter: () => gsap.delayedCall(mobile ? 0.1 : Math.max(0, 1.4 - intro.time()), () => growth.play()),
    });

    /* ---------- 2. Вебинар: «экран включается» ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.webinar', start: 'top 82%' } })
      .fromTo('.webinar__panel',
        { clipPath: 'inset(7% 6% 7% 6% round 34px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 34px)', duration: 1.3, ease: 'expo.inOut' })
      .from('.webinar__glow', { autoAlpha: 0, scale: 1.25, duration: 1.8, ease: 'power2.out' }, 0.2);
    const wTitle = SplitText.create('.webinar__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: '.webinar__head', start: 'top 80%' },
      onComplete: () => wTitle.revert(),
    })
      .from('.webinar .eyebrow', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.3)
      .from(wTitle.chars, { yPercent: 118, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from('.webinar__sub', { y: 18, autoAlpha: 0, duration: 0.9 }, 0.75)
      .from('.webinar__head .btn', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.9);
    gsap.from('.webinar__side > *', {
      y: 40, autoAlpha: 0, duration: 1, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.webinar__side', start: 'top 88%' },
    });
    // Гаджет «гаснет»: свечение панели плавно уходит при прокрутке дальше
    gsap.to('.webinar__glow', {
      opacity: 0.45, ease: 'none',
      scrollTrigger: { trigger: '.webinar', start: 'center center', end: 'bottom top', scrub: true },
    });

    /* ---------- 3. Продукты: обложки ложатся на полку ---------- */
    revealLines('.products h2', '.products .sec-head');
    gsap.from('.products .eyebrow', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.products .sec-head', start: 'top 84%' } });
    const books = $$('.book');
    if (mobile) {
      // по одной: обложка ложится с лёгким поворотом, как книга на стол
      books.forEach((book, i) => {
        gsap.from(book, { y: 70, rotation: i % 2 ? 2.5 : -2.5, transformOrigin: i % 2 ? '100% 100%' : '0% 100%', autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: book, start: 'top 94%' } });
      });
    } else {
      gsap.from(books, {
        y: 80, rotation: -3, transformOrigin: '0% 100%', autoAlpha: 0,
        duration: 1.15, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.shelf', start: 'top 82%' },
      });
    }

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
