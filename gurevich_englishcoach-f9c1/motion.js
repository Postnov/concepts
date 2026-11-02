// Ольга Гуревич — моушн концепта.
// Фирменная идея — переключатель RU → EN («переключаю ваш мозг на английский»): в hero он щёлкает на EN,
// и чёрно-белый портрет «включается» тёплым светом; в фактах большой переключатель едет за прокруткой.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- переключатель в hero: работает и без GSAP ---------- */
  const hero = $('.hero');
  const sw = $('.hero .switch');
  const setLang = en => {
    sw.classList.toggle('is-en', en);
    sw.setAttribute('aria-pressed', String(en));
    hero.classList.toggle('is-ru', !en);
  };
  sw.addEventListener('click', () => setLang(!sw.classList.contains('is-en')));

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    // Начальное состояние RU без CSS-переходов (страница ещё скрыта)
    hero.classList.add('no-trans');
    setLang(false);
    hero.offsetWidth; // eslint-disable-line no-unused-expressions
    hero.classList.remove('no-trans');

    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__eyebrow > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.2)
      .fromTo('.hero__photo .frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.3, duration: 2.1, ease: 'expo.out' }, 0.3)
      .from('.hero__outline', { x: -14, y: -14, autoAlpha: 0, duration: 1.2 }, 0.9)
      .from(name.chars, { yPercent: 112, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.55)
      .from('.hero__lead', { y: 22, autoAlpha: 0, duration: 0.9 }, 1.0)
      .from(['.hero__sub', '.hero__cta .btn', '.hero__note'], { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.15)
      // щелчок RU → EN: фото «включается»
      .call(() => setLang(true), null, 1.5)
      .from('.stamp', { autoAlpha: 0, scale: 1.5, rotation: -14, duration: 0.75, ease: 'back.out(1.5)' }, 1.95);

    /* Блик на главных кнопках раз в несколько секунд */
    $$('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.2, delay: 3 + i * 0.7 });
    });

    /* Лёгкий параллакс портрета */
    gsap.to('.hero__photo img', {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. С чего начнём ---------- */
    revealLines('.start h2', '.start .sec-head');
    gsap.from('.start .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.start .sec-head', start: 'top 84%' } });
    $$('.offer').forEach(card => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 82%' } });
      tl.fromTo(card, { clipPath: 'inset(0% 0% 100% 0%)', y: 40 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.2, ease: 'expo.out' })
        .from($('h3', card), { y: 24, autoAlpha: 0, duration: 0.8 }, 0.25)
        // стрелка «прочерчивается» слева направо
        .fromTo($('.offer__arrow', card), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' }, 0.45)
        .from($$('.offer__label, .offer__lead', card), { y: 14, autoAlpha: 0, duration: 0.7 }, 0.5)
        .from($$('.offer__list li', card), { x: -16, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.6)
        .from($$('.tags li', card), { scale: 0.8, autoAlpha: 0, stagger: 0.07, duration: 0.55, ease: 'back.out(2)' }, 0.65)
        .from($('.btn', card), { y: 16, autoAlpha: 0, duration: 0.7 }, 0.85);
    });

    /* ---------- 3. Факты ---------- */
    revealLines('.facts h2', '.facts .sec-head');
    gsap.from('.facts .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.facts .sec-head', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.duo', start: 'top 80%' } })
      .fromTo('.duo__big .pic', { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .from('.duo__big img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.15)
      .from('.duo__small', { y: 70, rotation: -5, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.6);
    // маленькое фото обгоняет большое при прокрутке
    gsap.to('.duo__small', {
      yPercent: -22, ease: 'none',
      scrollTrigger: { trigger: '.duo', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    const rows = $$('.facts__list li');
    gsap.set(rows, { y: 26, autoAlpha: 0 });
    ScrollTrigger.batch(rows, {
      start: 'top 90%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' }),
    });

    /* Большой переключатель едет за прокруткой: RU → EN, карточка теплеет */
    const big = $('.switch--big');
    const knob = $('.switch__knob', big);
    const travel = () => -(big.querySelector('.switch__track').offsetWidth - knob.offsetWidth - 8);
    big.classList.remove('is-en');
    gsap.timeline({
      scrollTrigger: {
        trigger: '.flip', start: 'top 85%', end: 'center 45%', scrub: 0.6,
        onUpdate: self => big.classList.toggle('is-en', self.progress > 0.55),
      },
    })
      .fromTo(knob, { x: travel }, { x: 0, ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('.flip__glow', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, ease: 'none', duration: 1 }, 0)
      .fromTo('.flip__text b', { color: '#95a3b2' }, { color: '#e8cd9c', ease: 'none', duration: 0.4 }, 0.6);
    gsap.from(['.flip__idx', '.flip__text'], { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.flip', start: 'top 88%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
