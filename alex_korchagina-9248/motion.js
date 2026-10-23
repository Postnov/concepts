// Александра Корчагина — моушн концепта. Одна идея: «растяжка».
// Буквы заголовков вытягиваются вверх от базовой линии, фото раскрываются из центральной линии («шпагат»),
// а плашка в списке запросов тянется от строки к строке, как резинка.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // без GSAP / при reduced motion — статичная полностью рабочая страница

  /* ---------- список запросов: плашка-«резинка» ---------- */
  const rows = $$('.ask__row');
  const list = $('.ask');
  const bar = document.createElement('span');
  bar.className = 'ask__bar';
  bar.setAttribute('aria-hidden', 'true');
  list.prepend(bar);
  let cur = -1;
  const box = i => ({ y: rows[i].offsetTop, h: rows[i].offsetHeight });
  function activate(i) {
    if (i === cur) return;
    const to = box(i);
    gsap.killTweensOf(bar);
    rows.forEach((r, k) => r.classList.toggle('is-on', k === i));
    if (cur < 0) {
      gsap.set(bar, { y: to.y, height: 0 });
      gsap.to(bar, { height: to.h, duration: 0.5, ease: 'power3.out' });
    } else {
      const from = box(cur);
      const top = Math.min(from.y, to.y);
      const span = Math.max(from.y + from.h, to.y + to.h) - top;
      gsap.timeline()
        .to(bar, { y: top, height: span, duration: 0.2, ease: 'power2.out' })
        .to(bar, { y: to.y, height: to.h, duration: 0.45, ease: 'power3.inOut' });
    }
    cur = i;
  }
  const resizeBar = () => { if (cur >= 0) { const b = box(cur); gsap.set(bar, { y: b.y, height: b.h }); } };
  window.addEventListener('resize', resizeBar);
  rows.forEach((row, i) => {
    ScrollTrigger.create({ trigger: row, start: 'top 60%', end: 'bottom 60%', onToggle: self => self.isActive && activate(i) });
    row.addEventListener('pointerenter', e => e.pointerType === 'mouse' && activate(i));
    row.addEventListener('click', () => activate(i));
  });

  /* ---------- заголовки: буквы вытягиваются вверх ---------- */
  function stretchText(el, trigger, opts = {}) {
    const split = SplitText.create(el, { type: 'words,chars', wordsClass: 'sw' });
    gsap.from(split.chars, {
      scaleY: 0.05, autoAlpha: 0, transformOrigin: '50% 100%',
      duration: 0.95, stagger: { each: 0.028, from: 'start' }, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || el, start: opts.start || 'top 86%' },
      onComplete: () => split.revert(),
    });
  }
  // Фото раскрывается из центральной линии, как шпагат
  function openPhoto(frame, img, radius = 0) {
    gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 84%' } })
      .fromTo(frame, { clipPath: `inset(50% 0% 50% 0% round ${radius}px)` }, { clipPath: `inset(0% 0% 0% 0% round ${radius}px)`, duration: 1.35, ease: 'expo.inOut' })
      .from(img, { scale: 1.22, duration: 1.8, ease: 'expo.out' }, 0.1);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const plate = $('.hero__plate');
    const head = $('.hero__head');
    const layers = [plate, head];
    const wide = matchMedia('(min-width: 960px)').matches;
    // Фото и «голова» увеличиваются вокруг одной точки кадра, иначе голова разъедется с фоном
    const pr = plate.getBoundingClientRect();
    const px = pr.left + pr.width * 0.58, py = pr.top + pr.height * 0.2;
    layers.forEach(el => {
      const r = el.getBoundingClientRect();
      gsap.set(el, { transformOrigin: `${px - r.left}px ${py - r.top}px` });
    });

    // Раскрытие «шпагатом» из центральной линии кадра: обрезка головы считается в координатах кадра, чтобы слои не разъезжались
    const opening = { p: 0 };
    const hh = head.offsetHeight, ht = head.offsetTop, H = plate.offsetHeight;
    const openSplit = p => {
      const top = (H / 2) * (1 - p);
      plate.style.clipPath = `inset(${top}px 0px ${top}px 0px)`;
      const a = Math.min(hh, Math.max(0, top - ht)), b = Math.min(hh, Math.max(0, ht + hh - (H - top)));
      head.style.clipPath = `inset(${a}px 0px ${b}px 0px)`;
    };
    openSplit(0);

    const l1 = SplitText.create('.hero__name .l1', { type: 'words,chars', wordsClass: 'sw' });
    const l2 = SplitText.create('.hero__name .l2', { type: 'words,chars', wordsClass: 'sw' });
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { l1.revert(); l2.revert(); plate.style.clipPath = head.style.clipPath = ''; } });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo(opening, { p: 0 }, { p: 1, duration: 1.4, ease: 'expo.inOut', onUpdate: () => openSplit(opening.p) }, 0.1)
      .from(layers, { scale: 1.16, duration: 2, ease: 'expo.out' }, 0.1)
      .from(l1.chars, { scaleY: 0.04, autoAlpha: 0, transformOrigin: '50% 100%', stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.55)
      .from(l2.chars, { scaleY: 0.04, autoAlpha: 0, transformOrigin: '50% 100%', stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.78)
      .from('.hero__tag', { y: 14, autoAlpha: 0, duration: 0.8 }, 1.2)
      .from('.chip', { y: 22, autoAlpha: 0, stagger: 0.14, duration: 0.8 }, 1.35)
      .from('.hero__cta .btn', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, wide ? 1.5 : 1.0);

    // Медленная «растяжка» кадра при прокрутке (не на узком экране — там фото занимает всю ширину)
    gsap.to(plate, {
      yPercent: -3, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    if (!wide) gsap.to(head, { yPercent: -3 * (1700 / 340), ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- 2. Запросы ---------- */
    gsap.from('.help .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.help .eyebrow', start: 'top 90%' } });
    stretchText('.help .h2', '.help .h2');
    openPhoto($('.help__photo'), $('.help__photo img'));
    $$('.ask__row').forEach((row, i) => {
      gsap.from(row, { y: 28, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 94%' } });
    });

    /* ---------- 3. Клуб ---------- */
    gsap.from('.club .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.club .eyebrow', start: 'top 92%' } });
    gsap.from('.club__sup', { y: 16, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.club__title', start: 'top 86%' } });
    $$('.club__w').forEach((w, i) => stretchText(w, '.club__title', { start: `top ${86 - i * 3}%` }));
    openPhoto($('.club__photo'), $('.club__photo img'), 28);
    gsap.from('.club__text', { y: 22, autoAlpha: 0, stagger: 0.12, duration: 0.85, scrollTrigger: { trigger: '.club__copy', start: 'top 86%' } });
    // Цена появляется целиком, без счётчика
    gsap.from('.price > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.9, scrollTrigger: { trigger: '.price', start: 'top 92%' } });
    gsap.from('.club__cta .btn', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.club__cta', start: 'top 96%' } });
    // Звёзды в подписях медленно вращаются
    gsap.to('.eyebrow .star', { rotation: 360, duration: 12, ease: 'none', repeat: -1 });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
