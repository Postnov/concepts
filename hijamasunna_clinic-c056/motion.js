// Хиджама Сунна — моушн концепта. Фирменная идея — «банки»: фото клиники проявляется кругами,
// которые ставятся и «присасываются» по очереди, как банки при хиджаме, а потом сливаются в целый кадр.
// Тот же круг дальше открывает фото и карточки при прокрутке.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  // reduced motion / нет GSAP — статичная, полностью рабочая страница (фото без маски, всё видно)
  if (!animate) return;

  const refresh = () => ScrollTrigger.refresh();

  // Текст строками из-под маски; после анимации нарезку снимаем, чтобы переносы жили при ресайзе
  function revealLines(target, trigger, vars = {}) {
    (typeof target === 'string' ? $$(target) : [target]).forEach(el => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
      gsap.from(split.lines, {
        yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out', ...vars,
        scrollTrigger: { trigger: trigger || el, start: 'top 86%' },
        onComplete: () => split.revert(),
      });
    });
  }
  // Слово по буквам из-под маски (только words,chars — без переноса посреди слова)
  function revealChars(el, trigger, vars = {}) {
    const split = SplitText.create(el, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    return gsap.from(split.chars, {
      yPercent: 110, duration: 0.95, stagger: 0.035, ease: 'expo.out', ...vars,
      scrollTrigger: trigger ? { trigger, start: 'top 88%' } : undefined,
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: банки ---------- */
    const img = $('.cups__img');
    const photo = $('.cups__photo');
    const clip = $$('#cups-clip circle');
    const rings = $$('.cups__rings circle');
    const radii = clip.map(c => +c.getAttribute('r'));
    // Маска включается только здесь: без JS фото целое
    photo.setAttribute('clip-path', 'url(#cups-clip)');
    gsap.set(clip, { attr: { r: 0 } });
    gsap.set(rings, { transformOrigin: '50% 50%' });

    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.brand__logo', { scale: 0.55, rotate: -50, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.1)
      .from('.brand__tags span', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.55 }, 0.3)
      .from(name.chars, { yPercent: 110, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.3)
      .from(lead.lines, { yPercent: 105, stagger: 0.08, duration: 0.9 }, 0.7)
      .from('.cups-frame', { y: 34, autoAlpha: 0, duration: 0.9 }, 0.4)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.05);

    // Банки ставятся по очереди: кольцо опускается, круг фото «присасывается» с отскоком, кольцо чуть сжимается
    const order = [3, 0, 4, 2, 1, 6, 5];
    const start = 0.75, step = 0.15;
    order.forEach((i, k) => {
      const t = start + k * step;
      intro
        .fromTo(rings[i], { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.42, ease: 'power2.out' }, t)
        .to(clip[i], { attr: { r: radii[i] }, duration: 0.75, ease: 'back.out(2.6)' }, t + 0.3)
        .to(rings[i], { scale: 0.92, duration: 0.16, ease: 'power2.in', yoyo: true, repeat: 1 }, t + 0.42);
    });
    // Круги сливаются в целый кадр, кольца уходят, маска снимается
    const flood = start + order.length * step + 0.6;
    intro
      .to(clip, { attr: { r: 780 }, duration: 1.25, ease: 'expo.inOut', stagger: 0.035 }, flood)
      .to(rings, { opacity: 0, scale: 1.7, duration: 0.95, ease: 'power2.in', stagger: 0.035 }, flood)
      .fromTo(img, { scale: 1.1, svgOrigin: '427 512' }, { scale: 1, svgOrigin: '427 512', duration: 2.2, ease: 'expo.out' }, flood)
      .add(() => photo.removeAttribute('clip-path'), flood + 1.5)
      .from('.seal', { scale: 0.4, rotate: -120, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, flood - 0.2);

    // Печать медленно вращается; при прокрутке слегка уплывает вверх
    gsap.to('.seal__ring', { rotate: 360, duration: 36, ease: 'none', repeat: -1 });
    gsap.to('.seal', { y: -36, ease: 'none', scrollTrigger: { trigger: '.hero__photo', start: 'top 40%', end: 'bottom top', scrub: true } });

    // Миссия
    gsap.from('.mission__label', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.mission', start: 'top 88%' } });
    revealLines('.mission__text', '.mission', { delay: 0.15 });

    /* ---------- 2. Направления: каждая строка — банка, которая «присасывается» ---------- */
    gsap.from('.dirs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.dirs', start: 'top 86%' } });
    $$('.dir').forEach(row => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%' } });
      tl.from($('.dir__cup', row), { scale: 1.4, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 0)
        .from($('.dir__cup i', row), { scale: 0, duration: 0.8, ease: 'back.out(3)' }, 0.25)
        .add(revealChars($('.dir__name', row)), 0.1)
        .from($('.dir__num', row), { x: 12, autoAlpha: 0, duration: 0.6 }, 0.35);
    });

    const cure = gsap.timeline({ scrollTrigger: { trigger: '.cure', start: 'top 80%' } });
    cure
      .fromTo('.cure__panel', { clipPath: 'circle(0% at 82% 0%)' }, { clipPath: 'circle(150% at 82% 0%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
      .from('.cure__photo', { scale: 0.55, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.8)' }, 0.15)
      .from('.cure__photo img', { scale: 1.35, duration: 1.8, ease: 'expo.out' }, 0.15)
      .from('.cure__kicker', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.7)
      .from('.cure .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.05);
    revealLines('.cure__title', '.cure', { delay: 0.75 });

    /* ---------- 3. Клиники ---------- */
    gsap.from('.clinics .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.clinics', start: 'top 86%' } });
    revealLines('.clinics h2', '.clinics .sec-head');
    $$('.clinic').forEach(card => {
      gsap.from($('.clinic__num', card), { autoAlpha: 0, y: 10, duration: 0.6, scrollTrigger: { trigger: card, start: 'top 88%' } });
      revealLines($('.clinic__addr', card), card);
      // Фото открываются кругом — как банка
      const items = $$('.gallery__item', card);
      gsap.fromTo(items,
        { clipPath: 'circle(0% at 50% 50%)' },
        { clipPath: 'circle(72% at 50% 50%)', duration: 1.25, ease: 'expo.inOut', stagger: 0.12, clearProps: 'clipPath',
          scrollTrigger: { trigger: $('.gallery', card), start: 'top 86%' } });
      gsap.from($$('img', card), { scale: 1.25, duration: 1.8, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: $('.gallery', card), start: 'top 86%' } });
    });

    gsap.timeline({ scrollTrigger: { trigger: '.contact', start: 'top 84%' } })
      .fromTo('.contact__main', { clipPath: 'circle(0% at 88% 18%)' }, { clipPath: 'circle(150% at 88% 18%)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
      .from('.contact__arrow', { scale: 0, rotate: -90, duration: 0.8, ease: 'back.out(2.2)' }, 0.5)
      .from('.contact__row', { x: -16, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.3);
    revealLines('.contact__main-title', '.contact', { delay: 0.45 });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
