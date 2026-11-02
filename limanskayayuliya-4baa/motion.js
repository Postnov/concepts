// Юлия Лиманская — моушн концепта. Фирменная идея: «нить» (отсылка к титановым нитям) — тонкая линия с жемчужиной
// (жемчуг с её фото) тянется вниз вместе с прокруткой и «прошивает» страницу; линейки из её баннера вычерчиваются.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const frame = $('.hero__photo .frame');
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__handle span', { x: 24, autoAlpha: 0, duration: 0.8 }, 0.1)
      .from('.hero__handle i', { scaleX: 0, duration: 0.9, ease: 'expo.out' }, 0.2)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.25)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.8)
      .from('.rule', { scaleX: 0, duration: 1.4, ease: 'expo.inOut', stagger: 0.12 }, 0.3)
      .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.inOut' }, 0.35)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.5)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.15);

    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- «Нить»: жемчужина едет по линии, линия дорисовывается за ней ---------- */
    const main = $('main');
    const st = { trigger: main, start: 'top top', end: 'bottom bottom', scrub: 0.4, invalidateOnRefresh: true };
    gsap.to('.thread__fill', { scaleY: 1, ease: 'none', scrollTrigger: st });
    gsap.to('.thread__pearl', { y: () => main.offsetHeight, ease: 'none', scrollTrigger: st });

    /* ---------- 2. Курсы ---------- */
    revealLines('.courses h2', '.courses .sec-head');
    gsap.from('.courses .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses .sec-head', start: 'top 84%' } });
    $$('.offer').forEach(el => {
      gsap.from(el, { y: 36, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
      gsap.from($('.offer__title', el), { x: 18, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    gsap.from('.courses__care', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses__care', start: 'top 94%' } });

    /* ---------- 3. Об авторе ---------- */
    revealLines('.about h2', '.about .sec-head');
    gsap.from('.about .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.about__grid', start: 'top 82%' } })
      .fromTo('.about__photo .frame', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 26px 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 26px 26px)', duration: 1.5, ease: 'expo.inOut' })
      .from('.about__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.15);
    gsap.from('.stats li', { y: 24, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 88%' } });
    // Счётчики только у «700+» и «20» (не цены)
    $$('.stat__num[data-count]').forEach(el => {
      const end = +el.dataset.count, suffix = el.dataset.suffix || '', o = { v: 0 };
      gsap.to(o, {
        v: end, duration: 1.8, ease: 'power2.out', snap: { v: 1 },
        onUpdate: () => { el.textContent = Math.round(o.v) + suffix; },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
    gsap.from('.about__text > *', { y: 20, autoAlpha: 0, stagger: 0.12, duration: 0.85, scrollTrigger: { trigger: '.about__text', start: 'top 88%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
