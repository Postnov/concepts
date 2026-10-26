// Елена Мун — моушн концепта. Фирменное: «лунная нить» — луна ползёт по правому краю и растёт вместе с прокруткой;
// большие картинки поднимаются кругом, как луна из-за горизонта.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- звёзды: расставляем по зерну, мерцание — на CSS ---------- */
  $$('[data-stars]').forEach((host, k) => {
    let seed = 11 + k * 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const n = +host.dataset.stars || 30;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      s.style.cssText = `left:${(rnd() * 100).toFixed(1)}%;top:${(rnd() * 100).toFixed(1)}%;--s:${(0.8 + rnd() * 1.9).toFixed(1)}px;--d:${(2.4 + rnd() * 4.2).toFixed(1)}s;--l:${(-rnd() * 6).toFixed(1)}s;--o:${(0.3 + rnd() * 0.6).toFixed(2)}`;
      frag.appendChild(s);
    }
    host.appendChild(frag);
  });

  /* ---------- лунная нить: фаза растёт с прокруткой (новая → полная) ---------- */
  const lit = $('.lunar__lit');
  const lunar = $('.lunar');
  const phase = p => {
    const k = Math.cos(2 * Math.PI * p);
    lit.setAttribute('d', `M0 -10A10 10 0 0 1 0 10A${(Math.abs(k) * 10).toFixed(2)} 10 0 0 ${k > 0 ? 0 : 1} 0 -10Z`);
  };
  phase(0.06);

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Круг, как восходящая луна: картинка раскрывается из точки (x y)
  function moonrise(el, at, opts = {}) {
    return gsap.fromTo(el, { clipPath: `circle(0% at ${at})` }, {
      clipPath: `circle(100% at ${at})`, duration: 1.9, ease: 'expo.out', clearProps: 'clipPath', ...opts,
    });
  }

  MotionBase.ready(() => {
    /* ---------- лунная нить ---------- */
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => {
        lunar.style.setProperty('--p', self.progress.toFixed(4));
        phase(0.06 + 0.44 * self.progress);
      },
    });
    gsap.from(lunar, { autoAlpha: 0, duration: 1.2, delay: 1.6 });

    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .add(moonrise('.hero__art', '50% 42%', { duration: 2.2 }), 0.1)
      .from('.hero__art img', { scale: 1.32, duration: 2.8, ease: 'expo.out' }, 0.1)
      .from('.hero__halo', { scale: 0.5, autoAlpha: 0, duration: 2, ease: 'expo.out' }, 0.5)
      .from('.hero .stars', { autoAlpha: 0, duration: 1.8 }, 0.9)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.55)
      .from(name.chars, { yPercent: 118, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.6)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.hero__cta .btn', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3)
      .from('.hero__who', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.55);

    // Лунное свечение «дышит» за луной
    gsap.to('.hero__halo', { scale: 1.1, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.4 });

    // Блик на главных кнопках раз в несколько секунд
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.8 });
    });

    // Лёгкий параллакс неба
    gsap.to('.hero__art img', {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Ковчег ---------- */
    gsap.from('.kovcheg .stars', { autoAlpha: 0, duration: 1.6, scrollTrigger: { trigger: '.kovcheg', start: 'top 80%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.kovcheg__art', start: 'top 84%' } })
      .add(moonrise('.kovcheg .frame', '50% 72%', { duration: 2 }))
      .from('.kovcheg .frame img', { scale: 1.3, duration: 2.4, ease: 'expo.out' }, 0);
    // Огонь в окнах ковчега чуть пульсирует
    gsap.to('.kovcheg__lamp', { autoAlpha: 0.45, scale: 0.86, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    revealLines('.kovcheg h2', '.kovcheg__text');
    gsap.from(['.kovcheg .eyebrow', '.kovcheg .sec-sub', '.kovcheg .bot', '.kovcheg .actions .btn', '.kovcheg .textlink'], {
      y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1,
      scrollTrigger: { trigger: '.kovcheg__text', start: 'top 80%' },
    });

    /* ---------- 3. Практики ---------- */
    revealLines('.practice h2', '.practice .sec-head');
    gsap.from('.practice .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.practice .sec-head', start: 'top 84%' } });
    $$('.tile').forEach(tile => {
      gsap.timeline({ scrollTrigger: { trigger: tile, start: 'top 86%' } })
        .add(moonrise($('.tile__img', tile), '86% 90%', { duration: 1.8 }))
        .from($('.tile__zoom img', tile), { scale: 1.3, duration: 2.2, ease: 'expo.out' }, 0)
        .from($$('.tile__body > *', tile), { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0.5)
        .from($('.tile__go', tile), { scale: 0.5, autoAlpha: 0, duration: 0.7 }, 0.7);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
