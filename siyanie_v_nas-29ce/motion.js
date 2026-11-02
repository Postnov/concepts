// Сияние — моушн концепта. Фирменная идея — «Мотор!»: хлопушка захлопывается, и от хлопка вспыхивает сияние софита;
// дальше каждая сцена (секция) открывается своей маленькой хлопушкой.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно, хлопушки закрыты, занавес открыт

  const refresh = () => ScrollTrigger.refresh();
  const desktop = matchMedia('(min-width: 900px)').matches;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(target, trigger, vars = {}) {
    const split = SplitText.create(target, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out', ...vars,
      scrollTrigger: { trigger, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  // Маленькая хлопушка над заголовком сцены: открыта → хлопок → короткая отдача
  function clapSlate(slate, delay = 0) {
    const arm = $('.slate__arm', slate);
    return gsap.timeline({ delay, scrollTrigger: { trigger: slate, start: 'top 86%' } })
      .from(slate, { y: 14, autoAlpha: 0, duration: 0.5, ease: 'power3.out' })
      .fromTo(arm, { rotation: -32 }, { rotation: 0, duration: 0.24, ease: 'power4.in' }, 0.35)
      .to(arm, { rotation: -4, duration: 0.09, ease: 'power2.out' })
      .to(arm, { rotation: 0, duration: 0.16, ease: 'power2.in' });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: хлопок и вспышка ---------- */
    const title = SplitText.create('.clap__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const tag = SplitText.create('.hero__tag', { type: 'lines', mask: 'lines' });
    const CLAP = 1.15; // момент удара палки о доску

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { title.revert(); tag.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.top > *', { y: -10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.15)
      .from('.clap__inner', { y: 40, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.2)
      // палка поднята, чуть «дрожит» в руке — и захлопывается
      .fromTo('.clap__arm', { rotation: -22 }, { rotation: -25, duration: 0.45, ease: 'sine.inOut' }, 0.35)
      .to('.clap__arm', { rotation: 0, duration: 0.3, ease: 'power4.in' }, CLAP - 0.3)
      .to('.clap__arm', { rotation: -3, duration: 0.08, ease: 'power2.out' }, CLAP)
      .to('.clap__arm', { rotation: 0, duration: 0.18, ease: 'power2.in' }, CLAP + 0.08)
      .fromTo('.clap__board', { y: 0 }, { y: 5, duration: 0.06, ease: 'power2.out' }, CLAP)
      .to('.clap__board', { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.45)' }, CLAP + 0.06)
      // вспышка и сияние за доской
      .fromTo('.clap__flash', { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1.1, duration: 0.14, ease: 'power2.out' }, CLAP)
      .to('.clap__flash', { autoAlpha: 0, scale: 1.4, duration: 0.9, ease: 'power2.out' }, CLAP + 0.14)
      .from('.clap__glow', { scale: 0.35, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, CLAP)
      .from(title.chars, { yPercent: 110, stagger: 0.05, duration: 0.9, ease: 'expo.out' }, CLAP + 0.02)
      .from('.clap__label', { autoAlpha: 0, y: 8, duration: 0.5 }, CLAP + 0.1)
      .from('.clap__rows span', { autoAlpha: 0, y: 10, stagger: 0.08, duration: 0.55 }, CLAP + 0.25)
      .from(tag.lines, { yPercent: 100, stagger: 0.1, duration: 1, ease: 'expo.out' }, CLAP + 0.3)
      .from('.facts li', { x: -14, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, CLAP + 0.55)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, CLAP + 0.75);

    // Сияние живёт: лучи медленно вращаются, свет «дышит»
    gsap.to('.clap__rays', { rotation: 360, duration: 140, ease: 'none', repeat: -1 });
    gsap.to('.clap__glow', { opacity: 0.78, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: CLAP + 1.6 });
    // При прокрутке сцена уходит в затемнение
    gsap.to('.clap__glow', {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Пробные занятия: билеты ---------- */
    $$('.sec-head .slate').forEach(s => clapSlate(s));
    revealLines('.trial h2', '.trial .sec-head', { delay: 0.45 });
    gsap.from('.trial .sec-sub', { y: 12, autoAlpha: 0, duration: 0.8, delay: 0.7, scrollTrigger: { trigger: '.trial .sec-head', start: 'top 82%' } });

    // Билеты «выдаются» по одному: подъём с лёгким наклоном, номера занятий пробиваются компостером
    const cards = $$('.tickets > li');
    cards.forEach((card, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } });
      tl.from(card, {
        y: 70, rotation: i % 2 ? 2.5 : -2.5, autoAlpha: 0, transformOrigin: '50% 100%',
        duration: 1, ease: 'expo.out', delay: desktop ? (i % 3) * 0.12 : 0,
      });
      const nums = $$('.dates__n', card);
      if (nums.length) tl.from(nums, { scale: 1.7, autoAlpha: 0, duration: 0.45, stagger: 0.09, ease: 'power3.out' }, '-=0.6');
      const price = $('.ticket__price', card);
      if (price) tl.from(price, { y: 10, autoAlpha: 0, duration: 0.6 }, '-=0.35'); // цена появляется целиком
    });
    gsap.from('.rating__stars', { autoAlpha: 0, x: -10, duration: 0.8, scrollTrigger: { trigger: '.apply', start: 'top 85%' }, delay: 0.3 });

    /* ---------- 3. Премьера: занавес раскрывается прокруткой, софит разгорается ---------- */
    const open = desktop ? 76 : 84;
    // Один раз: сцена въезжает закрытой, занавес расходится, софит разгорается, на свет выходит название
    const ptitle = SplitText.create('.premiere__title', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.timeline({ scrollTrigger: { trigger: '.stage', start: 'top 62%' }, onComplete: () => ptitle.revert() })
      .fromTo('.curtain--l', { xPercent: open }, { xPercent: 0, duration: 1.7, ease: 'power3.inOut' }, 0)
      .fromTo('.curtain--r', { xPercent: -open }, { xPercent: 0, duration: 1.7, ease: 'power3.inOut' }, 0)
      .from('.stage__light', { autoAlpha: 0, scaleY: 0.6, transformOrigin: '50% 0%', duration: 1.4, ease: 'power2.out' }, 0.7)
      .from('.stage .slate', { y: 14, autoAlpha: 0, duration: 0.5, ease: 'power3.out' }, 0.8)
      .fromTo('.stage .slate__arm', { rotation: -32 }, { rotation: 0, duration: 0.24, ease: 'power4.in' }, 1.1)
      .from('.premiere__kicker', { y: 12, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 1.0)
      .from(ptitle.chars, { yPercent: 110, stagger: 0.035, duration: 0.9, ease: 'expo.out' }, 1.1)
      .from('.premiere__date > *', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' }, 1.5)
      .from('.stage .btn', { y: 16, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 1.7);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
