(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
  const desktop = matchMedia('(min-width: 900px)').matches;

  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    const n1 = SplitText.create('.hero__n1', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const n2 = SplitText.create('.hero__n2', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const band = desktop ? '.shelf' : '.hero__band';

    // Интро: портрет «встаёт» на красную сцену, имя поднимается по буквам
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { n1.revert(); n2.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.arch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.inOut' }, 0.05)
      .from('.arch img', { yPercent: 14, scale: 1.14, duration: 1.7, ease: 'expo.out' }, 0.2)
      .from('.hero__outline', { scaleY: 0, duration: 1.4, ease: 'expo.inOut' }, 0.25)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(n1.chars, { yPercent: 118, stagger: 0.05, duration: 1.05, ease: 'expo.out' }, 0.38)
      .from(n2.chars, { yPercent: 118, stagger: 0.05, duration: 1.05, ease: 'expo.out' }, 0.55)
      .fromTo(band, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' }, 0.8)
      .from(lead.lines, { yPercent: 105, stagger: 0.09, duration: 0.95 }, 1.05)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3);

    // Полка: 30 корешков вырастают по очереди, число набегает до 30 (это не цена)
    const spines = $$('.spines li');
    const num = $('.shelf__num');
    const count = { v: 0 };
    num.textContent = '0';
    let idle;
    gsap.from(spines, {
      scaleY: 0, transformOrigin: '50% 100%', duration: 1.15, ease: 'expo.out', stagger: 0.04,
      scrollTrigger: { trigger: '.spines', start: 'top 94%', once: true },
      onComplete: () => {
        // иногда по корешкам словно проводят пальцем
        idle = gsap.timeline({ repeat: -1, repeatDelay: 5.5, delay: 2.5 })
          .to(spines, { y: -9, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1, stagger: 0.03 });
        ScrollTrigger.create({ trigger: '.shelf', onToggle: s => idle.paused(!s.isActive) });
      },
    });
    gsap.to(count, {
      v: 30, duration: 1.5, ease: 'power2.out', snap: { v: 1 },
      scrollTrigger: { trigger: '.spines', start: 'top 94%', once: true },
      onUpdate: () => { num.textContent = String(Math.round(count.v)); },
      onComplete: () => { num.textContent = '30'; },
    });

    // Курсы: обложки «открываются» на петле у корешка
    revealLines('.courses h2', '.courses .sec-head');
    gsap.from('.courses .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.courses .sec-head', start: 'top 86%' } });
    const books = $$('.book');
    gsap.set(books, { rotateY: -84, transformOrigin: '0% 50%', transformPerspective: 1400, autoAlpha: 0 });
    gsap.set($$('.book__body > *'), { y: 14, autoAlpha: 0 });
    ScrollTrigger.batch(books, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { rotateY: 0, autoAlpha: 1, duration: 1.3, stagger: 0.14, ease: 'expo.out' });
        els.forEach((el, i) => gsap.to($$('.book__body > *', el), { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07, delay: 0.35 + i * 0.14, ease: 'power3.out' }));
      },
    });

    // Ток-шоу и клуб
    revealLines('.meet h2', '.meet .sec-head');
    gsap.from('.meet .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.meet .sec-head', start: 'top 86%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.ticket', start: 'top 86%' } })
      .fromTo('.ticket', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
      .from('.ticket__main > *', { y: 16, autoAlpha: 0, stagger: 0.09, duration: 0.8, ease: 'power3.out' }, 0.45)
      .from('.ticket__bars', { scaleY: 0, duration: 0.9, ease: 'expo.out' }, 0.7);
    gsap.timeline({ scrollTrigger: { trigger: '.club', start: 'top 86%' } })
      .from('.club', { y: 56, rotateX: 20, transformPerspective: 1000, transformOrigin: '50% 100%', autoAlpha: 0, duration: 1.25, ease: 'expo.out' })
      .fromTo('.club__sheen', { '--sheen': '-120%' }, { '--sheen': '120%', duration: 1.8, ease: 'power2.inOut' }, 0.7);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
