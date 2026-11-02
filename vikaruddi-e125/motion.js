// Моушн демо @vikaruddi. Фирменная идея — «матрица судьбы»: октаграмма из двух квадратов
// прорисовывается вокруг портрета, а квадраты медленно вращаются навстречу друг другу.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  // «Подробнее» в карточках услуг
  function setOpen(btn, open) {
    const body = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(open));
    if (!animate) { body.hidden = !open; return; }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, {
        height: 'auto', duration: 0.6, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from(body.children, { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.05, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.42, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.svc__toggle').forEach(btn => btn.addEventListener('click', () => setOpen(btn, btn.getAttribute('aria-expanded') !== 'true')));

  // Навигация по услугам — плавная прокрутка к карточке
  $$('.svc-nav a').forEach(a => a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: animate ? 'smooth' : 'auto', block: 'start' });
  }));

  if (!animate) return;

  // Прорисовка матрицы: линии по pathLength=1, затем узлы по кругу
  function drawMatrix(svg, { dur = 1.3, stagger = 0.08 } = {}) {
    const lines = $$('.m-line', svg);
    const nodes = $$('.m-node', svg).sort((a, b) => {
      const ang = n => (Math.atan2(+n.getAttribute('cx'), -n.getAttribute('cy')) + Math.PI * 2) % (Math.PI * 2);
      return ang(a) - ang(b);
    });
    const tl = gsap.timeline();
    tl.fromTo(lines, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut', stagger }, 0);
    if (nodes.length) tl.from(nodes, { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(3)', stagger: 0.06 }, dur * 0.55);
    return tl;
  }
  // Матрица медленно поворачивается целиком, как печать (геометрия не ломается)
  function spinMatrix(svg, dur, delay = 0) {
    gsap.to($('.matrix__turn', svg), { rotation: 360, svgOrigin: '0 0', duration: dur, ease: 'none', repeat: -1, delay });
  }

  function revealTitle(selector, trigger) {
    const split = SplitText.create(selector, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from(split.chars, {
      yPercent: 110, duration: 1.1, stagger: 0.05, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }

  // Цена прокручивается барабаном, как цифры на табло; исходный текст остаётся на месте (прозрачным),
  // поэтому вёрстка не сдвигается ни во время, ни после анимации
  function rollPrice(el, delay) {
    const color = getComputedStyle(el).color;
    const roll = document.createElement('span');
    roll.className = 'roll';
    roll.setAttribute('aria-hidden', 'true');
    roll.style.color = color;
    const strips = [];
    [...el.textContent].forEach(ch => {
      if (!/\d/.test(ch)) { const sp = document.createElement('span'); sp.textContent = ch; roll.append(sp); return; }
      const d = Number(ch);
      const reel = document.createElement('span');
      reel.className = 'reel';
      reel.innerHTML = `<span class="reel__ghost">${ch}</span>`;
      const strip = document.createElement('span');
      strip.className = 'reel__strip';
      for (let k = 0; k <= 10 + d; k++) strip.insertAdjacentHTML('beforeend', `<span>${k % 10}</span>`);
      reel.append(strip);
      roll.append(reel);
      strips.push({ strip, steps: 10 + d, reel });
    });
    el.append(roll);
    el.style.color = 'transparent';
    const tl = gsap.timeline({
      delay,
      onComplete: () => { roll.remove(); el.style.color = ''; },
    });
    strips.forEach(({ strip, steps, reel }, i) => {
      const h = reel.getBoundingClientRect().height;
      tl.fromTo(strip, { y: 0 }, { y: -steps * h, duration: 1.5 + i * 0.14, ease: 'power3.inOut' }, 0);
    });
  }

  MotionBase.ready(() => {
    // ---------- Hero ----------
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    const heroMatrix = $('.matrix--hero');

    gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      // занавес раздвигается: портрет открывается от центра к краям
      .fromTo('.hero__photo .frame', { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.25, duration: 2.1, ease: 'expo.out' }, 0.25)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.3)
      .from(name.chars, { yPercent: 110, stagger: 0.05, duration: 1.1, ease: 'expo.out' }, 0.35)
      .add(drawMatrix(heroMatrix), 0.7)
      .from(lead.lines, { yPercent: 100, stagger: 0.1, duration: 0.95 }, 1.0)
      .from('.pills li', { y: 12, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.2)
      .from('.hero__side--right .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.3);

    spinMatrix(heroMatrix, 120, 2.4);
    gsap.to(heroMatrix, {
      rotation: 45, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // ---------- Подход: фраза проявляется по словам вместе с прокруткой ----------
    gsap.from('.about__tags span', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.about', start: 'top 85%' } });
    const statement = SplitText.create('.about__statement', { type: 'words', wordsClass: 'sw' });
    gsap.fromTo(statement.words, { opacity: 0.14 }, {
      opacity: 1, duration: 0.7, stagger: 0.07, ease: 'power1.out',
      scrollTrigger: { trigger: '.about__statement', start: 'top 78%' },
      onComplete: () => statement.revert(),
    });
    gsap.from('.about__text', { y: 18, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.about__text', start: 'top 90%' } });

    // ---------- Услуги ----------
    gsap.from('.services .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.services .sec-head', start: 'top 85%' } });
    revealTitle('.services .sec-title', '.services .sec-head');
    gsap.from('.svc-nav a', { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.svc-nav', start: 'top 90%' } });

    const sideMatrix = $('.matrix--side');
    const sideDraw = drawMatrix(sideMatrix, { dur: 1.6 }).pause();
    ScrollTrigger.create({ trigger: '.services .sec-head', start: 'top 80%', once: true, onEnter: () => sideDraw.play() });
    spinMatrix(sideMatrix, 90);
    gsap.to(sideMatrix, {
      rotation: 90, ease: 'none',
      scrollTrigger: { trigger: '.svc-list', start: 'top 70%', end: 'bottom 40%', scrub: true },
    });

    const cards = $$('.svc');
    gsap.set(cards, { y: 44, autoAlpha: 0 });
    ScrollTrigger.batch(cards, {
      start: 'top 88%', once: true,
      onEnter: els => gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out', overwrite: true }),
    });

    $$('.svc__prices').forEach(group => {
      ScrollTrigger.create({
        trigger: group, start: 'top 88%', once: true,
        onEnter: () => $$('.price__num', group).forEach((el, i) => rollPrice(el, 0.25 + i * 0.18)),
      });
    });

    const mark = $('.matrix--mark');
    const markDraw = drawMatrix(mark, { dur: 1.8 }).pause();
    ScrollTrigger.create({ trigger: '.svc--feature', start: 'top 80%', once: true, onEnter: () => markDraw.play() });
    gsap.to(mark, {
      rotation: 120, ease: 'none',
      scrollTrigger: { trigger: '.svc--feature', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    // ---------- Отзывы: голосовые «проигрываются» при появлении ----------
    gsap.from('.reviews .eyebrow', { y: 14, autoAlpha: 0, duration: 0.7, scrollTrigger: { trigger: '.reviews .sec-head', start: 'top 85%' } });
    revealTitle('.reviews .sec-title', '.reviews .sec-head');

    $$('.voice').forEach((voice, i) => {
      const bars = $$('.wave i', voice);
      const tl = gsap.timeline({ scrollTrigger: { trigger: voice, start: 'top 88%' } });
      tl.from(voice, { y: 40, x: i % 2 ? 18 : -18, rotation: i % 2 ? 1.5 : -1.5, autoAlpha: 0, duration: 0.95, ease: 'power3.out' });
      if (bars.length) {
        gsap.set(bars, { backgroundColor: 'rgba(21, 14, 15, .2)' });
        tl.from(bars, { scaleY: 0.12, duration: 0.6, ease: 'power2.out', stagger: { each: 0.018, from: 'start' } }, 0.25)
          .to(bars, { backgroundColor: '#a3201b', duration: 0.25, ease: 'none', stagger: 0.045 }, 0.6);
      }
    });
    gsap.from('.reviews__cta .btn', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.reviews__cta', start: 'top 92%' } });

    // ---------- Финал ----------
    const endMatrix = $('.matrix--end');
    const endTl = gsap.timeline({ scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });
    endTl.add(drawMatrix(endMatrix, { dur: 1.2, stagger: 0.06 }), 0)
      .from('.concept-end > :not(svg)', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0.2);
    spinMatrix(endMatrix, 60);

    window.addEventListener('load', refresh, { once: true });
  });
})();
