// Екатерина Синицына — моушн концепта. Одна идея: пульс.
// Красная точка бежит по кардиограмме позади портрета, на каждом «зубце» диск отзывается кольцом;
// линия пульса идёт и вдоль списка справочников — на каждой карточке бьётся ещё раз.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- линия пульса вдоль списка: строится и без GSAP ---------- */
  const list = $('.glist');
  const cards = $$('.g', list);
  let rail, railBase, railLive, railLen = 0, nodes = [];
  const mk = (tag, cls) => { const el = document.createElementNS(NS, tag); if (cls) el.setAttribute('class', cls); return el; };
  function buildRail() {
    if (!rail) {
      rail = mk('svg', 'glist__rail');
      rail.setAttribute('aria-hidden', 'true');
      railBase = mk('path', 'rail__base');
      railLive = mk('path', 'rail__live');
      rail.append(railBase, railLive);
      nodes = cards.map(() => { const c = mk('circle', 'rail__node'); c.setAttribute('r', '6'); c.setAttribute('cx', '13'); rail.append(c); return c; });
      list.prepend(rail);
    }
    const H = list.offsetHeight;
    rail.setAttribute('viewBox', `0 0 26 ${H}`);
    rail.setAttribute('height', H);
    let d = 'M13,0';
    cards.forEach((c, i) => {
      const y = c.offsetTop;
      // узел у верха карточки, ниже — вертикальный «зубец» ЭКГ: P, Q, R, S, T
      d += ` L13,${y + 44} Q20,${y + 50} 13,${y + 57} L13,${y + 68} L8,${y + 75} L22,${y + 90} L3,${y + 106} L13,${y + 114} L13,${y + 126} Q19,${y + 132} 13,${y + 139}`;
      nodes[i].setAttribute('cy', y + 26);
    });
    d += ` L13,${H}`;
    railBase.setAttribute('d', d);
    railLive.setAttribute('d', d);
    railLen = railLive.getTotalLength();
    railLive.style.strokeDasharray = `${railLen}`;
    if (!animate) railLive.style.strokeDashoffset = '0';
  }
  const setRail = p => { railLive.style.strokeDashoffset = String(railLen * (1 - p)); };
  buildRail();

  if (!animate) {
    nodes.forEach(n => n.classList.add('is-on'));
    return;
  }
  ScrollTrigger.addEventListener('refreshInit', () => {
    const p = railLen ? 1 - parseFloat(railLive.style.strokeDashoffset || '0') / railLen : 0;
    buildRail();
    setRail(Number.isFinite(p) ? p : 0);
  });

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
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
    const name = SplitText.create('.hero__first, .hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const base = $('.ecg__base');
    const baseLen = base.getTotalLength();
    base.style.strokeDasharray = `${baseLen}`;

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); startSweep(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__disk', { scale: 0.55, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.1)
      .from('.hero__cut', { yPercent: 16, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0.4)
      .fromTo(base, { strokeDashoffset: baseLen }, { strokeDashoffset: 0, duration: 1.9, ease: 'power2.inOut' }, 0.5)
      .from('.hero__tag', { x: -26, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 118, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.45)
      .from('.hero__exp', { x: -22, autoAlpha: 0, duration: 0.8 }, 0.95)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.0)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.25)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.45);

    /* Пульс: красная точка бежит по линии, на зубце R диск отвечает кольцом */
    const live = $('.ecg__live');
    const head = $('.ecg__head');
    const dot = $('.ecg__dot');
    const L = live.getTotalLength();
    const TAIL = 360;
    const HEAD = 80;
    live.style.strokeDasharray = `${TAIL} ${L + TAIL}`;
    head.style.strokeDasharray = `${HEAD} ${L + HEAD}`;
    const lenAtX = x => { for (let l = 0; l <= L; l += 2) if (live.getPointAtLength(l).x >= x) return l; return L; };
    const beats = [lenAtX(142), lenAtX(650)];
    const beat = () => gsap.fromTo('.hero__ring',
      { scale: 1, autoAlpha: 0.6 },
      { scale: 1.3, autoAlpha: 0, duration: 1.3, ease: 'power2.out', stagger: 0.14, overwrite: true });
    const sweep = { p: 0 };
    let prev = 0;
    const draw = () => {
      const h = sweep.p * (L + TAIL);
      live.style.strokeDashoffset = String(TAIL - h);
      head.style.strokeDashoffset = String(HEAD - h);
      const pt = live.getPointAtLength(Math.min(h, L));
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);
      dot.setAttribute('r', h > L ? 0 : 6);
      beats.forEach(b => { if (prev < b && h >= b) beat(); });
      prev = h;
    };
    gsap.set([live, head, dot], { autoAlpha: 0 });
    function startSweep() {
      gsap.to([live, head, dot], { autoAlpha: 1, duration: 0.4 });
      gsap.to(sweep, {
        p: 1, duration: 3.4, ease: 'none', repeat: -1, repeatDelay: 0.7,
        onUpdate: draw, onRepeat: () => { prev = 0; },
      });
    }
    draw();

    /* Блик на главных кнопках раз в несколько секунд */
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i });
    });

    /* Портрет чуть плывёт вверх при прокрутке */
    gsap.to('.hero__cut', {
      yPercent: -3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Справочники ---------- */
    revealLines('.guides h2', '.guides .sec-head');
    gsap.from(['.guides .eyebrow', '.guides .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.12,
      scrollTrigger: { trigger: '.guides .sec-head', start: 'top 84%' },
    });
    gsap.from('.arrows span', {
      y: -14, autoAlpha: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.arrows', start: 'top 92%' },
      onComplete: () => gsap.to('.arrows span', { y: 7, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.16 }),
    });

    /* «Актуально сейчас»: солнце всходит, книга раскрывается от корешка */
    gsap.to('.feature__sun i', { rotation: 360, duration: 120, ease: 'none', repeat: -1 });
    const feat = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: '.feature', start: 'top 80%' } });
    feat
      .from('.feature__sun', { scale: 0.4, autoAlpha: 0, duration: 1.9, ease: 'expo.out' }, 0)
      .from('.feature .chip', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.1)
      .fromTo('.feature .book',
        { rotateY: -78, x: -34, autoAlpha: 0, transformPerspective: 1200, transformOrigin: '0% 50%' },
        { rotateY: 0, x: 0, autoAlpha: 1, duration: 1.6, ease: 'expo.out' }, 0.15)
      .from('.feature__title', { y: 34, autoAlpha: 0, duration: 0.95, ease: 'expo.out' }, 0.25)
      .from('.feature__lead', { y: 18, autoAlpha: 0, duration: 0.8 }, 0.5)
      .from('.feature__actions .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 0.65);

    /* Карточки выезжают, как лента кардиографа; на каждой бьётся узел линии пульса */
    cards.forEach((li, i) => {
      const card = $('.g__card', li);
      const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 87%' } });
      tl
        .fromTo(card, { clipPath: 'inset(0% 0% 100% 0% round 22px)' }, {
          clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.0, ease: 'power3.inOut',
          onComplete: () => { card.style.clipPath = ''; },
        }, 0)
        .from($('.book', li), { rotateY: -58, x: -18, autoAlpha: 0, transformPerspective: 900, transformOrigin: '0% 50%', duration: 1.2, ease: 'expo.out' }, 0.3)
        .from($$('.g__num, .g__title, .g__text, .btn', li), { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.4);
      ScrollTrigger.create({
        trigger: li, start: 'top 72%',
        onEnter: () => {
          nodes[i].classList.add('is-on');
          gsap.fromTo(nodes[i], { attr: { r: 6 } }, { attr: { r: 10 }, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' });
        },
        onLeaveBack: () => nodes[i].classList.remove('is-on'),
      });
    });
    ScrollTrigger.create({
      trigger: list, start: 'top 75%', end: 'bottom 62%',
      onUpdate: self => setRail(self.progress),
    });
    setRail(0);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
