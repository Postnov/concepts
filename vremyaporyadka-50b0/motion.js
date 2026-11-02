// Время порядка — моушн концепта. Идея «наведение порядка»: буквы заголовка встают на место в случайном порядке,
// вещи на штанге сортируются по цвету, фото «ставятся на полку».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  const rnd = gsap.utils.random;
  const NICHE = 'round 18px 18px 4px 4px';

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Фото «ставится на полку»: небольшой наклон и подъём, полка прорисовывается слева направо
  function placeOnShelf(wrap, start = 'top 82%') {
    const frame = $('.frame', wrap), img = $('img', wrap), shelf = $('.shelf', wrap);
    gsap.timeline({ scrollTrigger: { trigger: wrap, start } })
      .fromTo(frame, { clipPath: `inset(100% 0% 0% 0% ${NICHE})` }, { clipPath: `inset(0% 0% 0% 0% ${NICHE})`, duration: 1.3, ease: 'expo.inOut' }, 0)
      .from(frame, { y: -36, rotate: () => rnd(-3.5, 3.5), duration: 1.4, ease: 'power3.out' }, 0)
      .from(img, { scale: 1.28, duration: 1.8, ease: 'expo.out' }, 0.1)
      .from(shelf, { scaleX: 0, transformOrigin: '0 50%', duration: 1.1, ease: 'expo.out' }, 0.35);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      // буквы поднимаются не по порядку, а вразнобой — и встают в слова
      .from(name.chars, { yPercent: 118, rotate: () => rnd(-9, 9), stagger: { each: 0.05, from: 'random' }, duration: 1.1, ease: 'expo.out' }, 0.3)
      .fromTo('.hero__photo .frame', { clipPath: `inset(100% 0% 0% 0% ${NICHE})` }, { clipPath: `inset(0% 0% 0% 0% ${NICHE})`, duration: 1.3, ease: 'expo.inOut' }, 0.15)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.hero__photo .shelf', { scaleX: 0, transformOrigin: '0 50%', duration: 1.1, ease: 'expo.out' }, 0.9)
      .from('.badge', { y: 34, rotate: () => rnd(-14, 14), autoAlpha: 0, duration: 1.1, stagger: 0.16, ease: 'expo.out' }, 1.0)
      .from('.hero__lead', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.9)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.1)
      .from('.hero__note', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.25);

    // Лёгкий параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- Штанга: вещи сортируются по цвету ---------- */
    const rail = $('.rail');
    const hangs = $$('.hang', rail).filter(h => h.offsetParent !== null); // на телефоне часть вещей скрыта
    const n = hangs.length;
    // Фиксированная «перемешанная» раскладка (7 и n взаимно просты): вещь i стоит на чужом месте perm[i]
    const perm = hangs.map((_, i) => (i * 7 + 5) % n);
    const slot = () => rail.clientWidth / n;
    gsap.timeline({ scrollTrigger: { trigger: rail, start: 'top 96%', once: true, invalidateOnRefresh: true }, delay: 1.1 })
      .fromTo(hangs, { x: i => (perm[i] - i) * slot() }, { x: 0, duration: 1.8, ease: 'power3.inOut', stagger: { each: 0.035, from: 'random' } }, 0)
      .fromTo(hangs, { rotation: () => rnd(-17, 17) }, { rotation: 0, duration: 2.6, ease: 'elastic.out(1, 0.5)', stagger: { each: 0.035, from: 'random' } }, 0.5);

    /* ---------- 2. Игра-тренинг ---------- */
    revealLines('.game h2', '.game .sec-head');
    gsap.from('.game .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.game .sec-head', start: 'top 86%' } });
    placeOnShelf($('.game__photo'), 'top 80%');
    gsap.timeline({ scrollTrigger: { trigger: '.game__copy', start: 'top 80%' } })
      .from('.game__days b', { yPercent: 45, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0)
      .from('.game__days span', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.2)
      .from('.game .btn', { y: 22, autoAlpha: 0, duration: 0.8 }, 0.4)
      .from('.gift', { y: 22, autoAlpha: 0, duration: 0.9 }, 0.55);

    /* ---------- 3. Программы обучения ---------- */
    revealLines('.programs h2', '.programs .sec-head');
    gsap.from(['.programs .eyebrow', '.programs .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.programs .sec-head', start: 'top 86%' },
    });
    $$('.course').forEach(course => {
      placeOnShelf($('.course__photo', course), 'top 82%');
      gsap.from($('.course__num', course), { scale: 0.6, autoAlpha: 0, duration: 0.7, ease: 'back.out(2)', scrollTrigger: { trigger: course, start: 'top 78%' } });
      gsap.from($$('.course__body > *', course), {
        y: 24, autoAlpha: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: $('.course__body', course), start: 'top 86%' },
      });
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
