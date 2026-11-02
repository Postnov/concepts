// Мария Трифанова — моушн концепта. Фирменная идея «примерочная»: бархатная шторка на латунных кольцах
// отъезжает в сторону и собирается складками, открывая фото; так же открываются комплекты из примерочной.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: шторки собраны сбоку, всё видно

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Шторка: задёрнута → «подёргали» → отъезжает к краю, складки собираются плотнее
  const bunchOf = el => getComputedStyle(el).getPropertyValue('--bunch').trim() || '12%';
  function closeCurtain(box, fold) {
    gsap.set($('.curtain', box), { width: '100%', '--fold': fold + 'px' });
    gsap.set($('.booth__photo img', box), { scale: 1.14 });
  }
  function openCurtain(box, { fold = 9, tug = true, delay = 0, rings = null } = {}) {
    const curtain = $('.curtain', box);
    const bunch = bunchOf(box);
    const tl = gsap.timeline({ delay });
    if (tug) {
      tl.to(curtain, { width: '93%', duration: 0.38, ease: 'power2.out' });
      if (rings) tl.to(rings, { width: '93%', duration: 0.38, ease: 'power2.out' }, '<');
    }
    tl.to(curtain, { width: bunch, '--fold': fold + 'px', duration: 1.35, ease: 'power3.inOut' }, tug ? '+=0.12' : 0);
    if (rings) tl.to(rings, { width: bunch, duration: 1.35, ease: 'power3.inOut' }, '<');
    tl.to($('.booth__photo img', box), { scale: 1, duration: 2.1, ease: 'expo.out' }, '<0.25');
    return tl;
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const heroBox = $('.booth--hero .booth__box');
    const heroRings = $('.booth--hero .booth__rings');
    closeCurtain(heroBox, 34);
    gsap.set(heroRings, { width: '98%' });

    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.booth--hero .booth__rod', { scaleX: 0, transformOrigin: '100% 50%', duration: 0.9, ease: 'expo.out' }, 0.05)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 112, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.25)
      .add(openCurtain(heroBox, { fold: 9, rings: heroRings }), 0.75)
      .from(lead.lines, { yPercent: 100, stagger: 0.1, duration: 1 }, 1.35)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.55)
      .from('.stats li', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.65)
      .from('.hero__cta .btn', { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.8);

    /* Собранная шторка чуть качается от скорости прокрутки, как ткань */
    const curtains = $$('.curtain');
    gsap.set(curtains, { transformOrigin: '50% 0%' });
    const sway = gsap.quickTo(curtains, 'skewX', { duration: 0.7, ease: 'power3.out' });
    let settle;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => {
        sway(gsap.utils.clamp(-5, 5, self.getVelocity() / -320));
        if (settle) settle.kill();
        settle = gsap.delayedCall(0.18, () => sway(0));
      },
    });

    /* ---------- 2. Для кого ---------- */
    revealLines('.fit h2', '.fit .sec-head');
    gsap.from('.fit .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.fit .sec-head', start: 'top 86%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.fit__photo', start: 'top 82%' } })
      .fromTo('.fit__frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .from('.fit__frame img', { scale: 1.25, duration: 2, ease: 'expo.out' }, 0.15);
    const items = $$('.fit__item');
    gsap.set(items, { '--ln': 0 });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { '--ln': 1, duration: 1.1, stagger: 0.12, ease: 'expo.inOut' });
        gsap.from(els.flatMap(el => [...el.children]), { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out', delay: 0.1 });
      },
    });
    gsap.from('.quotes span', {
      y: 14, rotation: -5, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.quotes', start: 'top 90%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.share', start: 'top 92%' } })
      .from('.share__bar span', { scaleX: 0, duration: 1.4, ease: 'expo.inOut' })
      .from('.share__marks i', { scaleY: 0, transformOrigin: '50% 100%', duration: 0.4, stagger: 0.05 }, 0.2);

    /* ---------- 3. Услуги ---------- */
    revealLines('.services h2', '.services .sec-head');
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.services .sec-head', start: 'top 86%' } });
    gsap.from('.looks__cap', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.looks', start: 'top 86%' } });

    // Комплекты: каждая «кабинка» открывается, когда попадает в кадр (и при прокрутке ленты вбок)
    const scroller = $('.looks__scroller');
    const looks = $$('.look');
    looks.forEach(l => closeCurtain($('.booth__box', l), 26));
    let armed = false;
    let queue = 0;
    const openVisible = () => {
      if (!armed) return;
      const sr = scroller.getBoundingClientRect();
      looks.forEach(l => {
        if (l.dataset.open) return;
        const r = l.getBoundingClientRect();
        if (r.left < sr.right - r.width * 0.35 && r.top < innerHeight * 0.86) {
          l.dataset.open = '1';
          openCurtain($('.booth__box', l), { fold: 7, tug: false, delay: 0.14 * queue++ });
          gsap.delayedCall(0.2, () => { queue = Math.max(0, queue - 1); });
        }
      });
    };
    ScrollTrigger.create({
      trigger: '.looks', start: 'top 78%', end: 'bottom top',
      onEnter: () => { armed = true; openVisible(); },
      onUpdate: openVisible,
    });
    scroller.addEventListener('scroll', openVisible, { passive: true });
    gsap.from('.look', {
      y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.looks', start: 'top 82%' },
    });

    // Бирки: качнулись на нитке и замерли
    $$('.tag').forEach((tag, i) => {
      gsap.timeline({ scrollTrigger: { trigger: tag, start: 'top 88%' }, delay: (i % 4) * 0.1 })
        .from(tag, { y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0)
        .set(tag, { rotation: -7, transformOrigin: '50% 24px' }, 0)
        .to(tag, { keyframes: { rotation: [3, -1.2, 0], easeEach: 'sine.inOut' }, duration: 1.6 }, 0)
        .from($('.tag__price', tag), { y: 12, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.35);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
