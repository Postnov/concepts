// Олеся Армашова — моушн концепта. Идея: приборная панель. Стрелка разгоняется до «20 000», одометр прокручивается,
// янтарные лампы жалоб гаснут одна за другой (у неё «все ключи»), а в блоке приёма «эндоскоп» медленно проходит маршрут обследований.
// Без GSAP / при reduced motion страница статична: стрелка стоит на 20, одометр показывает 20 000, лампы зелёные.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: приборная панель ---------- */
    const MAX = 25, TARGET = 20;
    const needle = $('.needle');
    const arc = $('.dial__arc');
    const gauge = { v: 0 };
    const render = v => {
      gsap.set(needle, { rotation: -135 + (v * 270) / MAX, svgOrigin: '200 200' });
      arc.setAttribute('stroke-dasharray', `${((Math.min(v, TARGET) / MAX) * 100).toFixed(2)} 100`);
    };
    render(0);

    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const cols = $$('.odo__col');

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__panel', { clipPath: 'inset(0% 0% 100% 0% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.2, ease: 'expo.inOut' }, 0.05)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.4)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.45)
      .from(lead.lines, { yPercent: 105, stagger: 0.09, duration: 0.9 }, 0.85)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.1)
      // циферблат собирается: риски, подписи, дорожка, красная зона
      .from('.dial__bezel', { scale: 0.92, autoAlpha: 0, transformOrigin: '50% 50%', duration: 1, ease: 'expo.out' }, 0.5)
      .from('.t', { autoAlpha: 0, duration: 0.35, stagger: { each: 0.014, from: 'start' }, ease: 'none' }, 0.65)
      .from('.lbl', { autoAlpha: 0, duration: 0.5, stagger: 0.07 }, 0.95)
      .from(['.dial__track', '.dial__red', '.dial__ring'], { autoAlpha: 0, duration: 0.7 }, 1.0)
      .from('.dial__photo', { scale: 0.7, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.8)
      .from('.odo__cell', { autoAlpha: 0, y: 8, duration: 0.5, stagger: 0.05 }, 1.2)
      .from('.keys__label', { autoAlpha: 0, y: 8, duration: 0.6 }, 1.5)
      .from('.lamps li', { autoAlpha: 0, y: 10, stagger: 0.06, duration: 0.5 }, 1.55)
      .from('.dial__cap > *', { y: 12, autoAlpha: 0, stagger: 0.12, duration: 0.8 }, 2.1);

    // Лампы стартуют янтарными и по очереди «успокаиваются»
    intro.from('.lamp', {
      backgroundColor: '#f0a73a', boxShadow: '0 0 9px 1px rgba(240,167,58,.75)',
      duration: 0.45, stagger: 0.32, ease: 'power1.out',
    }, 2.0);

    // Стрелка: разгон в красную зону и возврат на «20»; дуга и одометр идут следом
    const SW = 1.3;
    intro
      .to(gauge, { v: 21.6, duration: 2.0, ease: 'power2.inOut', onUpdate: () => render(gauge.v) }, SW)
      .to(gauge, { v: TARGET, duration: 0.8, ease: 'power2.out', onUpdate: () => render(gauge.v) }, SW + 2.0)
      .from(cols, { yPercent: i => parseFloat(cols[i].style.getPropertyValue('--f')) * 5, duration: 2.5, stagger: 0.14, ease: 'power3.out' }, SW + 0.1)
      .from('.odo__plus', { autoAlpha: 0, scale: 0.4, duration: 0.5, ease: 'back.out(2)' }, SW + 2.6);

    /* ---------- 2. Консультации ---------- */
    revealLines('.consult h2', '.consult .sec-head');
    gsap.from(['.consult .eyebrow', '.consult .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.14,
      scrollTrigger: { trigger: '.consult .sec-head', start: 'top 84%' },
    });
    const tiles = $$('.tile');
    gsap.set(tiles, { clipPath: 'inset(0% 100% 0% 0% round 26px)' });
    ScrollTrigger.batch(tiles, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.2, stagger: 0.14, ease: 'expo.out', clearProps: 'clipPath' });
        els.forEach((tile, i) => {
          const a = $('.timer__arc', tile);
          const to = a.getAttribute('stroke-dasharray');
          gsap.fromTo(a, { attr: { 'stroke-dasharray': '0 100' } }, { attr: { 'stroke-dasharray': to }, duration: 1.5, delay: 0.35 + i * 0.14, ease: 'power3.inOut' });
          gsap.from($('.tile__price', tile), { y: 14, autoAlpha: 0, duration: 0.8, delay: 0.5 + i * 0.14, ease: 'power3.out' });
        });
      },
    });
    gsap.from('.note', { y: 22, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.note', start: 'top 92%' } });

    /* ---------- 3. Очный приём ---------- */
    revealLines('.clinic h2', '.clinic .sec-head');
    gsap.from(['.clinic .eyebrow', '.places li', '.clinic .sec-sub', '.clinic .sec-head .btn'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1,
      scrollTrigger: { trigger: '.clinic .sec-head', start: 'top 84%' },
    });
    const route = $('.route');
    const stops = $$('.stop');
    const light = () => {
      const tip = $('.route__tip').getBoundingClientRect();
      const y = tip.top + tip.height / 2;
      stops.forEach(s => s.classList.toggle('is-lit', $('.stop__node', s).getBoundingClientRect().top + 5 <= y));
    };
    gsap.fromTo(route, { '--p': 0 }, {
      '--p': 1, ease: 'none', onUpdate: light,
      scrollTrigger: { trigger: route, start: 'top 68%', end: 'bottom 72%', scrub: 0.5, onRefresh: light },
    });
    gsap.from('.stop p', {
      x: -14, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: route, start: 'top 82%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
