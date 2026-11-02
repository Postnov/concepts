// Мария Иванова — моушн концепта. Идея «голос»: радужные волны расходятся от портрета, как звук речи; нотный стан в песенках рисуется и «играет».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.0, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    gsap.set('.w', { svgOrigin: '200 200', rotation: i => [20, 120, 210, 300, 60, 160][i] });
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero .frame', { scale: 0.55, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.1)
      .from('.hero .frame img', { scale: 1.5, duration: 1.8, ease: 'expo.out' }, 0.1)
      .from('.w', { scale: 0.5, autoAlpha: 0, duration: 1.4, stagger: 0.09, ease: 'expo.out' }, 0.25)
      .from('.sticker', { scale: 0, rotate: -40, autoAlpha: 0, duration: 0.9, ease: 'back.out(2)' }, 0.9)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.0, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.9 }, 0.8)
      .from('.hero__about', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.0)
      .from('.pills li', { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 1.1)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3);

    /* Голос: кольца расходятся по очереди и возвращаются, как звуковая волна; слабое вращение дуг */
    gsap.timeline({ repeat: -1, delay: 1.8 })
      .to('.w', { scale: 1.045, duration: 1.3, ease: 'sine.inOut', stagger: { each: 0.12, yoyo: true, repeat: 1 } })
      .to({}, { duration: 0.9 });
    $$('.w').forEach((w, i) => gsap.to(w, { rotation: '+=' + (i % 2 ? -360 : 360), duration: 60 + i * 12, ease: 'none', repeat: -1 }));

    gsap.to('.hero__photo', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Проекты ---------- */
    revealLines('.projects h2', '.projects .sec-head');
    gsap.from('.projects .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.projects .sec-head', start: 'top 84%' } });

    gsap.timeline({ scrollTrigger: { trigger: '.lab', start: 'top 82%' } })
      .from('.lab', { clipPath: 'inset(0% 0% 100% 0% round 32px)', duration: 1.1, ease: 'expo.inOut' })
      .from('.lab__logo', { scale: 0, rotate: 30, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.8)' }, 0.5)
      .from('.lab .tag', { x: -20, autoAlpha: 0, duration: 0.6 }, 0.6)
      .from('.lab__title', { y: 26, autoAlpha: 0, duration: 0.9 }, 0.7)
      .from('.lab__flasks', { y: 60, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.4)' }, 0.9)
      .from('.lab .btn', { y: 16, autoAlpha: 0, duration: 0.7 }, 1.0);

    gsap.timeline({ scrollTrigger: { trigger: '.course', start: 'top 80%' } })
      .from('.course', { clipPath: 'inset(0% 100% 0% 0% round 32px)', duration: 1.2, ease: 'expo.inOut' })
      .from('.course__frame img', { scale: 1.4, duration: 1.7, ease: 'expo.out' }, 0.2)
      .from('.course .tag', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.7)
      .from('.course__title', { y: 24, autoAlpha: 0, duration: 0.8 }, 0.8)
      .from('.course__sub', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.95)
      .from('.course__call', { rotate: -4, y: 12, autoAlpha: 0, duration: 0.7 }, 1.1)
      .from('.dots i', { scale: 0, stagger: 0.08, duration: 0.5, ease: 'back.out(2.5)' }, 1.15)
      .from('.course .btn', { y: 16, autoAlpha: 0, duration: 0.7 }, 1.3);

    /* ---------- 3. Песенки ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.staff', start: 'top 90%' } })
      .from('.staff line', { scaleX: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out' })
      .from('.note', { scale: 0, y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.14, ease: 'back.out(3)' }, 0.5);
    $$('.note').forEach((n, i) => gsap.to(n, { y: i % 2 ? 6 : -6, duration: 1.4 + i * 0.12, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 + i * 0.2 }));

    revealLines('.songs h2', '.songs .sec-head');
    gsap.from('.songs .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.songs .sec-head', start: 'top 84%' } });

    const sum = gsap.timeline({ scrollTrigger: { trigger: '.sum', start: 'top 80%' } });
    sum
      .from('.sum', { y: 40, autoAlpha: 0, duration: 0.9 })
      .from('.sum__bomb', { scale: 0.3, rotate: -30, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.8)' }, 0.2)
      .from('.sum__line:not(.sum__line--result), .sum__op', { x: -18, autoAlpha: 0, stagger: 0.2, duration: 0.6 }, 0.5)
      .from('.sum__line--result', { scale: 0.85, transformOrigin: '0 50%', autoAlpha: 0, duration: 0.8, ease: 'back.out(2)' }, 1.5)
      .to('.sum__bomb', { scale: 1.12, duration: 0.18, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 1.5);

    gsap.from('.songs__text > *', { y: 22, autoAlpha: 0, stagger: 0.14, duration: 0.8, scrollTrigger: { trigger: '.songs__text', start: 'top 86%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
