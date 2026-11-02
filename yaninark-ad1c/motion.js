// Яна Рожкова — моушн концепта. Фирменная идея «свет из тени»: в юнгианском анализе осознавание — это свет,
// который падает на то, что было в тени. Портрет проступает из темноты, слова цитаты и строки запросов
// загораются по мере прокрутки (один раз — прочитанное остаётся в свету), чёрно-белое фото «проявляется», как отпечаток в тёмной комнате.
(function () {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  // Без GSAP или при reduced motion — статичная страница: весь текст уже освещён, фото проявлены
  if (!animate) return;

  const css = getComputedStyle(document.documentElement);
  const SHADE = css.getPropertyValue('--shade').trim();
  const INK = css.getPropertyValue('--ink').trim();

  MotionBase.ready(() => {
    /* ---------- 1. Hero: свет включается на лице, имя поднимается из темноты ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', charsClass: 'ch', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__light', { '--r': '-62%' }, { '--r': '40%', duration: 2.6, ease: 'power2.inOut' }, 0.1)
      .from('.hero__light img', { scale: 1.2, duration: 3, ease: 'expo.out' }, 0.1)
      .from(name.chars, { yPercent: 140, duration: 1.25, stagger: 0.055, ease: 'expo.out' }, 1.0)
      .from('.hero__role > *', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35)
      .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.85 }, 1.5)
      .from('.facts li', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.6)
      .from('.hero__cta > *', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.75);

    // Уходя вниз, портрет снова погружается в тень, свет «переходит» к тексту
    const heroScroll = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero__light img', { yPercent: 5, ease: 'none', scrollTrigger: heroScroll });
    gsap.to('.hero__dusk', { opacity: 0.6, ease: 'none', scrollTrigger: { ...heroScroll, start: 'top -10%' } });

    /* ---------- 2. Цитата Юнга: слова загораются по одному ---------- */
    const quote = SplitText.create('.epigraph__text', { type: 'words', wordsClass: 'sw' });
    // Один раз, без отката назад: прочитанное остаётся освещённым
    gsap.fromTo(quote.words, { color: SHADE }, {
      color: INK, duration: 0.9, ease: 'power1.inOut', stagger: 0.13,
      scrollTrigger: { trigger: '.epigraph', start: 'top 70%' },
    });
    gsap.from('.epigraph__by', { y: 12, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.epigraph__by', start: 'top 92%' } });

    /* ---------- 2. Запросы ---------- */
    const asksHead = SplitText.create('.asks h2', { type: 'lines', mask: 'lines' });
    gsap.from(asksHead.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.asks .sec-head', start: 'top 82%' },
      onComplete: () => asksHead.revert(),
    });
    gsap.from('.asks .eyebrow', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.asks .sec-head', start: 'top 85%' } });
    // Карточка-примечание открывается шторкой слева
    gsap.fromTo('.note', { clipPath: 'inset(0% 100% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut',
      scrollTrigger: { trigger: '.note', start: 'top 86%' },
    });
    gsap.from('.note p', { x: -16, autoAlpha: 0, duration: 0.9, delay: 0.45, ease: 'power3.out', scrollTrigger: { trigger: '.note', start: 'top 86%' } });

    // Каждая строка выходит из тени, когда проходит «луч» в середине экрана
    $$('.group li').forEach(li => {
      gsap.fromTo(li, { color: SHADE }, {
        color: INK, duration: 1.1, ease: 'power1.inOut',
        scrollTrigger: { trigger: li, start: 'top 68%' },
      });
    });
    $$('.group').forEach(g => {
      gsap.from(g.querySelector('.group__n'), { y: 10, autoAlpha: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 84%' } });
    });

    /* ---------- 3. Формат: фото проявляется, строки условий прочерчиваются ---------- */
    // Проявка: из почти чёрного к отпечатку, медленно, как в кювете
    gsap.fromTo('.develop img', { filter: 'brightness(0.1) contrast(1.6)' }, {
      filter: 'brightness(1.28) contrast(1.06)', duration: 2.6, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.format__photo', start: 'top 72%' },
    });
    gsap.fromTo('.develop img', { scale: 1.14 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.format__photo', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    const formatHead = SplitText.create('.format h2', { type: 'lines', mask: 'lines' });
    gsap.from(formatHead.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.format .sec-head', start: 'top 84%' },
      onComplete: () => formatHead.revert(),
    });
    gsap.from('.format .eyebrow', { y: 12, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.format .sec-head', start: 'top 86%' } });
    const terms = $$('.term');
    // Линия над строкой прочерчивается слева направо (--draw — scaleX псевдоэлемента), затем всплывают значения
    gsap.timeline({ scrollTrigger: { trigger: '.terms', start: 'top 84%' } })
      .fromTo(terms, { '--draw': 0 }, { '--draw': 1, duration: 1.1, stagger: 0.12, ease: 'expo.inOut' }, 0)
      .from(terms.map(t => t.querySelector('dt')), { yPercent: 40, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out' }, 0.1)
      .from(terms.map(t => t.querySelector('dd')), { x: 14, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0.25);
    gsap.from('.format__notes > *', {
      y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out',
      scrollTrigger: { trigger: '.format__notes', start: 'top 88%' },
    });
    gsap.from('.format__cta > *', {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.format__cta', start: 'top 92%' },
    });

    gsap.from('.concept-end > *', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
