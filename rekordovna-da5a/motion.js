(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Заголовок по строкам: маска, подъём, потом возврат исходной вёрстки
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  const fadeUp = (targets, trigger, extra = {}) => gsap.from(targets, {
    y: 18, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 86%' }, ...extra,
  });

  MotionBase.ready(() => {
    /* ——— 1. Hero: «мягкая перезагрузка» — кольцо-кнопка питания замыкается, свет включается из его центра ——— */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const photoOrigin = window.matchMedia('(min-width: 860px)').matches ? '62% 44%' : '73% 48%';

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__photo', { clipPath: `circle(0% at ${photoOrigin})` }, { clipPath: `circle(150% at ${photoOrigin})`, duration: 2.1, ease: 'power2.inOut' }, 0.15)
      .from('.hero__photo img', { scale: 1.22, duration: 2.6, ease: 'expo.out' }, 0.15)
      .from('.hero__glow', { autoAlpha: 0, scale: 0.55, duration: 2.2, ease: 'power2.out' }, 0.2)
      .from('.ring__track', { autoAlpha: 0, duration: 1.2 }, 0.3)
      .fromTo('.ring__arc', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, 0.3)
      .from('.ring__tick', { scaleY: 0, svgOrigin: '200 4', duration: 0.9, ease: 'power3.out' }, 1.55)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.45)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.5)
      .from('.hero__mantra span', { x: -14, autoAlpha: 0, stagger: 0.12, duration: 0.9 }, 1.0)
      .from('.reset', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.hero__bottom .btn', { y: 18, autoAlpha: 0, duration: 0.8 }, 1.35)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.2)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.4)
      .from('.pills li', { y: 12, autoAlpha: 0, stagger: 0.09, duration: 0.7 }, 1.55);

    // дыхание кольца и света: медленно, как вдох-выдох
    gsap.to('.ring svg', { scale: 1.03, duration: 4.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4, transformOrigin: '50% 50%' });
    gsap.to('.hero__glow', { opacity: 0.9, duration: 4.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4 });
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ——— 2. Принцип: цепочка «здоровье → результат» прорисовывается по мере прокрутки ——— */
    revealLines('.principle h2', '.principle .sec-head');
    fadeUp('.principle .eyebrow', '.principle .sec-head');
    gsap.timeline({ scrollTrigger: { trigger: '.principle__photo', start: 'top 84%' } })
      .fromTo('.principle__photo .frame',
        { clipPath: 'inset(0% 0% 100% 0% round 28px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' })
      .from('.principle__photo img', { scale: 1.28, duration: 2, ease: 'expo.out' }, 0.15);
    fadeUp(['.principle__lead', '.principle__then'], '.principle__body', { stagger: 0.12 });

    gsap.fromTo('.chain', { '--p': 0 }, {
      '--p': 1, ease: 'none',
      scrollTrigger: { trigger: '.chain', start: 'top 72%', end: 'bottom 62%', scrub: 0.4 },
    });
    $$('.chain__step').forEach(step => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: step, start: 'top 76%' } });
      tl.from($('.chain__ring', step), { strokeDashoffset: 1, duration: 1.2, ease: 'power2.inOut' })
        .from($('.chain__dot', step), { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'power3.out' }, 0.7)
        .from($('.chain__idx', step), { autoAlpha: 0, duration: 0.6 }, 0.2)
        .from($('.chain__name', step), { x: -16, autoAlpha: 0, duration: 0.9 }, 0.15);
    });

    /* ——— 3. Программы: свет «включается» на фоне, карточки раскрываются шторкой ——— */
    gsap.fromTo('.programs__glow img', { opacity: 0.35, scale: 1.18 }, {
      opacity: 1, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.programs', start: 'top 92%', end: 'top 18%', scrub: 0.5 },
    });
    revealLines('.programs h2', '.programs .sec-head');
    fadeUp(['.programs .eyebrow', '.programs .sec-sub'], '.programs .sec-head', { stagger: 0.14 });
    gsap.from('.stack li', {
      y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.stack', start: 'top 90%' },
    });

    const cards = $$('.card');
    cards.forEach(card => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 90%' } });
      tl.fromTo(card, { clipPath: 'inset(0% 0% 100% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.1, ease: 'expo.inOut', clearProps: 'clipPath' })
        .from($('.card__num', card), { x: -22, autoAlpha: 0, duration: 0.9 }, 0.3)
        .from($$('.card__main > *', card), { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.7 }, 0.35);
    });

    fadeUp('.safe', '.safe');
    const bonus = gsap.timeline({ scrollTrigger: { trigger: '.bonus', start: 'top 82%' } });
    bonus
      .from('.bonus', { y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out' })
      .fromTo('.bonus__arc', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' }, 0.2)
      .from('.bonus__tick', { scaleY: 0, svgOrigin: '200 4', duration: 0.9 }, 1.8)
      .from(['.bonus__title', '.bonus__text'], { y: 16, autoAlpha: 0, stagger: 0.14, duration: 0.9 }, 0.35);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
