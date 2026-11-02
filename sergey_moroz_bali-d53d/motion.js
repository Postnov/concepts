// Сергей Мороз — моушн концепта. Одна идея: кольца от поющей чаши. Из точки в hero расходится рябь, по странице идёт тонкая линия-«канал»,
// и в каждом узле, куда она доходит, снова вспыхивает кольцо. Без резких эффектов, спокойный ритм.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;
  const refresh = () => ScrollTrigger.refresh();
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Бесконечная рябь: кольца стартуют с разных фаз, поэтому с первой секунды на экране уже целое поле
  function loopRipples(rings, max, period) {
    rings.forEach((ring, i) => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.fromTo(ring, { attr: { r: 6 } }, { attr: { r: max }, duration: period, ease: 'power2.out' }, 0)
        .fromTo(ring, { opacity: 0.8 }, { opacity: 0, duration: period, ease: 'sine.in' }, 0);
      tl.progress(i / rings.length);
    });
  }

  // Одно кольцо из точки (касание hero, вспышка узла)
  function ping(parent, x, y, r1, dur) {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('class', 'ripple');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 0);
    parent.appendChild(c);
    gsap.fromTo(c, { attr: { r: 4 }, opacity: 0.85 }, { attr: { r: r1 }, opacity: 0, duration: dur, ease: 'power2.out', onComplete: () => c.remove() });
  }

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const hero = $('.hero');
    const name = SplitText.create('.hero__line', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const tag = SplitText.create('.hero__tag', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); tag.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.ripples', { autoAlpha: 0, duration: 2, ease: 'power1.out' }, 0.2)
      .from('.ripples__core', { attr: { r: 0 }, duration: 1.4, ease: 'expo.out' }, 0.3)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 118, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.4)
      .from('.hero__role', { y: 14, autoAlpha: 0, duration: 0.8 }, 0.95)
      .from(tag.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.3);

    // Поле ряби дышит само; радиус берём по размеру hero, чтобы кольца успевали раствориться до края
    const rings = $$('.ripple', $('.ripples__rings'));
    loopRipples(rings, Math.max(hero.offsetWidth, hero.offsetHeight) * 0.82, 11);
    gsap.to('.ripples__halo', { attr: { r: 84 }, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.ripples__core', { attr: { r: 6 }, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // Касание hero — своё кольцо из точки касания
    hero.addEventListener('pointerdown', e => {
      if (e.target.closest('a')) return;
      const o = $('.ripples').getBoundingClientRect();
      ping($('.ripples__rings'), e.clientX - o.left, e.clientY - o.top, 300, 2.2);
    });

    /* ---------- канал: линия по странице и узлы ---------- */
    const body = $('.body');
    const fill = $('.rail__fill');
    const head = $('.rail__head');
    const setFill = gsap.quickSetter(fill, 'scaleY');
    const setHead = gsap.quickSetter(head, 'y', 'px');
    gsap.set(fill, { scaleY: 0 });
    ScrollTrigger.create({
      trigger: body, start: 'top 66%', end: 'bottom 66%',
      onUpdate: self => { setFill(self.progress); setHead(self.progress * body.offsetHeight); },
      onToggle: self => gsap.to(head, { autoAlpha: self.isActive ? 1 : 0, duration: 0.3 }),
    });
    $$('.node').forEach(node => {
      const ring = $('.node__ring', node);
      ScrollTrigger.create({
        trigger: node, start: 'top+=60 66%',
        onEnter: () => {
          node.classList.add('is-lit');
          gsap.fromTo(ring, { attr: { r: 6 }, opacity: 0.9 }, { attr: { r: 58 }, opacity: 0, duration: 1.8, ease: 'power2.out' });
        },
        onLeaveBack: () => node.classList.remove('is-lit'),
      });
    });

    /* ---------- 2. Школа и направления ---------- */
    gsap.from('.sec--paper .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.sec--paper .eyebrow', start: 'top 88%' } });
    // Утверждение «читается» по слову вместе с прокруткой
    const words = SplitText.create('.statement', { type: 'words', wordsClass: 'sw' });
    gsap.fromTo(words.words, { opacity: 0.16 }, {
      opacity: 1, stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: '.statement', start: 'top 82%', end: 'bottom 52%', scrub: true },
    });
    gsap.from('.sec-sub', { y: 16, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.sec-sub', start: 'top 90%' } });

    $$('.dir').forEach(row => {
      const t = SplitText.create($('.dir__t', row), { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 90%' }, onComplete: () => t.revert() });
      tl.from($('.dir__line', row), { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, 0)
        .from($('.dir__n', row), { autoAlpha: 0, x: -10, duration: 0.7 }, 0.15)
        .from(t.chars, { yPercent: 112, stagger: 0.035, duration: 1, ease: 'expo.out' }, 0.1)
        .from($('.dir__ring', row), { autoAlpha: 0, scale: 0.6, duration: 0.9, ease: 'power3.out' }, 0.3);
      // Строка, у которой проходит «луч» (центр экрана), загорается, остальные приглушены
      const rc = $$('.dir__ring circle', row);
      ScrollTrigger.create({
        trigger: row, start: 'top 66%', end: 'bottom 40%',
        onToggle: self => {
          row.classList.toggle('is-on', self.isActive);
          if (self.isActive) rc.forEach((c, i) => gsap.fromTo(c, { attr: { r: 3 }, opacity: 0.9 }, { attr: { r: [3, 9, 15][i] }, opacity: 0.55, duration: 1.2, delay: i * 0.1, ease: 'power2.out', overwrite: true }));
        },
      });
    });

    /* ---------- 3. Соц-сети и контакты ---------- */
    gsap.from('.sec--dark .eyebrow', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.sec--dark .eyebrow', start: 'top 88%' } });
    $$('.sec--dark .title').forEach(el => revealLines(el, el));
    $$('.link').forEach(link => {
      gsap.from(link, { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: link, start: 'top 92%' } });
      gsap.from($('.link__ic', link), { x: -14, autoAlpha: 0, duration: 0.9, delay: 0.15, scrollTrigger: { trigger: link, start: 'top 92%' } });
    });
    gsap.from('.btn--wide', { y: 24, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.btn--wide', start: 'top 94%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
