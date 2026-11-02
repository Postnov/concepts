// Анна Яковлева — моушн концепта. Идея «вдох»: потоки воздуха вьются за фото и дышат в такт, галочки спектра ставятся по одной.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, { yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: trigger || selector, start: 'top 85%' }, onComplete: () => split.revert() });
  }

  MotionBase.ready(() => {
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__photo .frame', { clipPath: 'inset(100% 0% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.32, duration: 1.9, ease: 'expo.out' }, 0.3)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.4)
      .from('.hero__lead', { y: 14, autoAlpha: 0, duration: 0.7 }, 0.9)
      .from('.stats', { y: 24, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.2);

    // Годы стажа набегают (это не цена)
    const years = $('[data-count]');
    const obj = { v: 0 };
    gsap.to(obj, { v: 20, duration: 1.6, delay: 1.1, ease: 'power2.out', onUpdate: () => { years.textContent = Math.round(obj.v); } });

    // Потоки воздуха: рисуются, затем текут и «дышат»
    $$('.air path').forEach((p, i) => {
      gsap.fromTo(p, { strokeDashoffset: 0 }, { strokeDashoffset: -400, duration: 7 + i * 1.3, ease: 'none', repeat: -1 });
    });
    gsap.from('.air', { autoAlpha: 0, duration: 1.6, delay: 0.8 });
    gsap.to('.air', { scaleY: 1.1, transformOrigin: '50% 50%', duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.hero__photo img', { yPercent: -4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    gsap.utils.toArray('.btn:not(.btn--ghost)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.4 + i });
    });

    // Спектр: галочки появляются по одной
    revealLines('.spectrum h2', '.spectrum .sec-head');
    gsap.from('.spectrum .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.spectrum .sec-head', start: 'top 85%' } });
    $$('.checks li').forEach(li => {
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 92%' } })
        .from(li, { x: -26, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
        .fromTo(li, { '--k': 0 }, { '--k': 1, duration: 0.55, ease: 'back.out(2.2)' }, 0.25);
    });

    // Обо мне
    revealLines('.about h2', '.about .sec-head');
    gsap.from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.about .sec-head', start: 'top 85%' } });
    gsap.from(['.about__lead', '.about__text'], { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.15, scrollTrigger: { trigger: '.about__body', start: 'top 85%' } });
    gsap.from('.clinic', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.clinic', start: 'top 88%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
