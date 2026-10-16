// Олеся Макеева — моушн концепта «Обложка фитнес-журнала».
// Фирменная идея — шкала совпадений у чек-листа «Диагностика кортизола»: по скроллу отмечаются первые пункты,
// заливка трека идёт вдоль строк и на третьей галочке пересекает пунктир «3+» — трек вспыхивает, счётчик встаёт на розовое,
// проявляется её фраза. Дальше отмечать можно самой.
// Секции входят по-разному, журнальным языком обложки: стикер «Форматы работы», лента «Результаты», штамп «Ограничения».
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- высота плашки концепта → --bar-h: мобильная обложка с кнопками помещается в первый экран ----------
     (в записи рилса плашку прячут стилем на DOMContentLoaded — ResizeObserver увидит 0) */
  const bar = $('[data-concept]');
  const setBar = () => document.documentElement.style.setProperty('--bar-h', (bar ? bar.offsetHeight : 0) + 'px');
  setBar();
  if (bar && 'ResizeObserver' in window) new ResizeObserver(setBar).observe(bar);

  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- чек-лист и шкала: работают и без GSAP ---------- */
  const card = $('.test__card');
  const boxes = $$('.tick input', card);
  const rows = boxes.map(b => b.closest('li'));
  const gaugeEl = $('.gauge', card);
  const ticks = $$('.gauge__tick', card);
  const countEl = $('.gauge__num b', card);
  let touched = false; // она отметила пункт сама — демонстрация по скроллу больше не вмешивается
  let wasRisk = false;
  let onCount = null; // хук для моушна (выставляется ниже, если анимации включены)
  // нижняя граница k-й строки (1…6) от верха трека, px; строки и трек меряются от карточки (position: relative)
  const rowEdge = k => rows[k - 1].offsetTop + rows[k - 1].offsetHeight - gaugeEl.offsetTop;
  function layoutGauge() {
    const h = gaugeEl.offsetHeight || 1;
    [1, 2, 4, 5].forEach((k, i) => { ticks[i].style.top = `${rowEdge(k)}px`; });
    const risk = rowEdge(3); // порог «3+» — под третьей строкой
    card.style.setProperty('--risk-at', `${risk}px`);
    card.style.setProperty('--risk-y', `${gaugeEl.offsetTop + risk}px`);
    const n = boxes.filter(b => b.checked).length;
    card.style.setProperty('--level', n ? Math.min(1, rowEdge(n) / h).toFixed(4) : 0);
  }
  function update() {
    const n = boxes.filter(b => b.checked).length;
    countEl.textContent = n;
    rows.forEach((li, i) => li.classList.toggle('is-on', boxes[i].checked));
    layoutGauge();
    const risk = n >= 3;
    card.classList.toggle('is-risk', risk);
    if (onCount) onCount(n, risk && !wasRisk);
    wasRisk = risk;
  }
  boxes.forEach(b => b.addEventListener('change', e => { if (e.isTrusted) touched = true; update(); }));
  update();
  // строки меняют высоту при загрузке шрифта и повороте экрана — пересчитываем риски и заливку
  if ('ResizeObserver' in window) new ResizeObserver(layoutGauge).observe($('.test__list', card));

  /* ---------- свайп тарифов и результатов: индикатор ---------- */
  function railDots(rail, dotsBox) {
    const items = [...rail.children];
    const dots = $$('i', dotsBox);
    rail.addEventListener('scroll', () => {
      const step = items[1].offsetLeft - items[0].offsetLeft || 1;
      const atEnd = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4;
      const i = atEnd ? dots.length - 1 : Math.min(dots.length - 1, Math.round(rail.scrollLeft / step));
      dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    }, { passive: true });
  }
  const plans = $$('.plan', $('.plans__rail'));
  railDots($('.plans__rail'), $('.plans__dots'));
  railDots($('.results__rail'), $('.results__dots'));

  /* скриншоты за правым краем рельсы: lazy их не грузит, пока не пролистать вбок —
     подгружаем все, когда рельса подходит к экрану (и не тормозим шрифты на старте) */
  const railImgs = $$('.results__rail img[loading="lazy"]');
  const eager = () => railImgs.forEach(img => { img.loading = 'eager'; });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { eager(); io.disconnect(); }
    }, { rootMargin: '900px 0px' });
    io.observe($('.results__rail'));
  } else eager();

  if (!animate) return;

  const st = (trigger, start = 'top 82%') => ({ trigger, start });

  // Плакатные заголовки: буквы поднимаются из-под маски, после анимации split снимаем
  function revealChars(selector, opts = {}) {
    const el = $(selector);
    const split = SplitText.create(el, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    gsap.from(split.chars, {
      yPercent: 110, duration: 1, stagger: opts.stagger || 0.025, ease: 'expo.out',
      scrollTrigger: st(opts.trigger || el, opts.start),
      onComplete: () => split.revert(),
    });
  }
  // Обычный текст — строками из-под маски
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: st(trigger || selector, 'top 85%'),
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* =========== 0–1. Обложка: вход =========== */
    const l1 = SplitText.create('.cover__line--1', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const l2 = SplitText.create('.cover__line--2', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const medal = $('.cover__medal');

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { l1.revert(); l2.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.cover__glow', { scale: 0.5, autoAlpha: 0, duration: 1.8, ease: 'expo.out' }, 0.1)
      .from('.cover__ring', { scale: 0.7, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.5)
      .from('.cover__kicker span', { y: 10, autoAlpha: 0, duration: 0.6 }, 0.2)
      .from('.cover__kicker i', { scaleX: 0, transformOrigin: '0 50%', duration: 1.1, ease: 'expo.inOut' }, 0.25)
      .from(l1.chars, { yPercent: 112, duration: 1.05, stagger: 0.055, ease: 'expo.out' }, 0.25)
      .from(l2.chars, { yPercent: 112, duration: 1.05, stagger: 0.04, ease: 'expo.out' }, 0.42)
      // фигура поднимается из сливового «пола» (сцена с overflow: hidden)
      .from('.cover__photo', { yPercent: 34, duration: 1.5, ease: 'expo.out' }, 0.35)
      .from(medal, { scale: 0, rotation: -140, transformOrigin: '50% 8%', duration: 1.1, ease: 'back.out(1.6)' }, 1.0)
      .from('.cover__band', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.85, ease: 'expo.inOut' }, 0.9)
      .from('.cover__band span', { yPercent: 110, autoAlpha: 0, duration: 0.6 }, 1.35)
      .from('.cover__ctas .btn', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 1.15);

    // медаль чуть покачивается на ленте
    gsap.timeline({ delay: 2.2, repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
      .fromTo(medal, { rotation: 0 }, { rotation: 6, duration: 1.6, transformOrigin: '50% 8%', immediateRender: false })
      .to(medal, { rotation: -6, duration: 3.2 });

    // глубина обложки: имя «тонет» за фигурой медленнее, чем уходит страница
    gsap.to('.cover__name', {
      yPercent: 16, ease: 'none',
      scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.cover__glow', {
      yPercent: 14, ease: 'none',
      scrollTrigger: { trigger: '.cover', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* =========== 2. Системное похудение: строки съезжаются навстречу и собираются ещё в нижней части экрана =========== */
    gsap.fromTo('.strip__line', { xPercent: i => (i % 2 ? 8 : -8) }, {
      xPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.strip', start: 'top bottom', end: 'top 55%', scrub: 0.6 },
    });
    gsap.from('.strip__sub', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: st('.strip', 'top 75%') });
    gsap.from('.strip__photo img', { yPercent: 30, duration: 1.4, ease: 'expo.out', scrollTrigger: st('.strip__photo', 'top 92%') });

    /* =========== 3. Я — Олеся Макеева =========== */
    revealChars('.about__title', { trigger: '.about__head' });
    gsap.from('.about__deck', { x: -14, autoAlpha: 0, duration: 0.9, scrollTrigger: st('.about__deck', 'top 88%') });
    revealLines('.about__lead');
    const checks = $$('.checks li');
    gsap.set(checks, { x: -18, autoAlpha: 0 });
    ScrollTrigger.batch(checks, {
      start: 'top 90%', once: true,
      onEnter: els => {
        gsap.to(els, { x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.09, ease: 'power3.out' });
        gsap.from(els.map(li => $('.checks__mark', li)), { scale: 0.3, duration: 0.6, stagger: 0.09, ease: 'back.out(2.2)' });
        gsap.from(els.map(li => $('path', li)), { strokeDashoffset: 24, duration: 0.5, stagger: 0.09, delay: 0.2, ease: 'power2.out' });
      },
    });
    gsap.from('.about__task', { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: st('.about__task', 'top 88%') });
    gsap.from('.about__task em', { clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'expo.inOut', delay: 0.3, scrollTrigger: st('.about__task', 'top 88%') });

    /* =========== 4. Форматы работы: стикер-заголовок «наклеивается», карточки ложатся веером =========== */
    gsap.timeline({ scrollTrigger: st('.plans__head', 'top 85%') })
      .from('.plans__title', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.8, ease: 'expo.inOut' })
      .from('.plans__title span', { yPercent: 115, duration: 0.7, ease: 'expo.out' }, 0.45);
    gsap.from(plans, {
      x: 70, y: 40, rotation: i => 4 + i * 2.5, transformOrigin: '0% 100%', autoAlpha: 0,
      duration: 1.1, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: st('.plans__rail', 'top 84%'),
    });
    gsap.from($$('.plan .emo'), { scale: 0, rotation: -40, duration: 0.7, stagger: 0.12, delay: 0.35, ease: 'back.out(2)', scrollTrigger: st('.plans__rail', 'top 84%') });
    $$('[data-count]').forEach(el => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      gsap.to(o, {
        v: to, duration: 1.5, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 95%', once: true },
        onStart: () => { el.textContent = MotionBase.money(0); },
        onUpdate: () => { el.textContent = MotionBase.money(to >= 100 ? Math.round(o.v / 10) * 10 : o.v); },
        onComplete: () => { el.textContent = MotionBase.money(to); },
      });
    });

    /* =========== 5–6. Диагностика кортизола =========== */
    gsap.from('.test__head .emo', { scale: 0, rotation: -40, duration: 0.7, ease: 'back.out(2)', scrollTrigger: st('.test__head') });
    revealChars('.test__title', { trigger: '.test__head' });
    gsap.from(card, { y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: st(card, 'top 88%') });
    gsap.from('.test__ask', { y: 20, skewX: -12, autoAlpha: 0, duration: 0.9, delay: 0.25, scrollTrigger: st(card, 'top 88%') });
    gsap.from('.gauge__count', { y: 16, autoAlpha: 0, duration: 0.8, delay: 0.35, ease: 'power3.out', scrollTrigger: st(card, 'top 88%') });
    gsap.from(gaugeEl, { scaleY: 0, transformOrigin: '50% 0%', duration: 1.2, ease: 'expo.inOut', delay: 0.2, scrollTrigger: st(card, 'top 88%') });
    gsap.from('.test__line', { scaleX: 0, transformOrigin: '100% 50%', duration: 1, ease: 'expo.inOut', delay: 0.6, scrollTrigger: st(card, 'top 88%') });
    gsap.from('.test__list li', { x: -14, autoAlpha: 0, duration: 0.6, stagger: 0.06, delay: 0.15, ease: 'power3.out', scrollTrigger: st(card, 'top 88%') });

    // реакция шкалы на каждую отметку; на пересечении «3+» — короткая вспышка трека и счётчик на розовом
    const riskTag = $('.gauge__risk b');
    onCount = (n, crossed) => {
      gsap.fromTo(countEl, { yPercent: -40, scale: 1.35 }, { yPercent: 0, scale: 1, duration: 0.55, ease: 'back.out(2.4)' });
      if (crossed) {
        // заливка (CSS, 0.8 с) доходит до пунктира примерно через 0.45 с
        gsap.fromTo(gaugeEl, { scaleX: 1 }, { scaleX: 1.15, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1, delay: 0.45 });
        gsap.fromTo('.gauge__num', { scale: 1.14 }, { scale: 1, duration: 0.6, ease: 'back.out(2.4)', delay: 0.4 });
        gsap.fromTo(riskTag, { scale: 1.6 }, { scale: 1, duration: 0.7, ease: 'back.out(2.6)', delay: 0.35 });
        gsap.fromTo('.test__result', { y: 8 }, { y: 0, duration: 0.7, ease: 'power3.out', delay: 0.2 });
      }
    };
    // демонстрация: первые три пункта отмечаются по скроллу, по одному (очередь, чтобы на десктопе не сработали разом)
    let queueAt = 0;
    const autoCheck = (b) => {
      const now = gsap.ticker.time;
      const at = Math.max(now + 0.15, queueAt);
      queueAt = at + 0.45;
      gsap.delayedCall(at - now, () => {
        if (touched || b.checked) return;
        b.checked = true;
        update();
        gsap.fromTo(b.nextElementSibling, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
      });
    };
    boxes.slice(0, 3).forEach(b => ScrollTrigger.create({
      trigger: b.closest('li'), start: 'top 68%', once: true,
      onEnter: () => autoCheck(b),
    }));

    /* =========== 7. Олеся Макеева — «Мне нужна глубокая система»: имя проявляется клипом вместе с фото =========== */
    gsap.timeline({ scrollTrigger: st('.deep__frame', 'top 80%') })
      .fromTo('.deep__frame', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
      .from('.deep__img', { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.2)
      .from('.deep__name span', { yPercent: 30, duration: 1.4, stagger: 0.08, ease: 'expo.out' }, 0.15)
      .from('.deep .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.0);
    gsap.to('.deep__img', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.deep__frame', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    /* =========== 8. Результаты: лента-заголовок раскатывается и бежит, телефоны поднимаются из плашек =========== */
    gsap.fromTo('.results__title', { clipPath: 'inset(0% 100% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut', clearProps: 'clipPath',
      scrollTrigger: st('.results__head', 'top 88%'),
    });
    gsap.to('.results__run', { xPercent: -50, ease: 'none', duration: 16, repeat: -1 });
    $$('.shot').forEach((shot, i) => {
      gsap.timeline({ scrollTrigger: st('.results__rail', 'top 86%') })
        .from(shot, { y: 70, autoAlpha: 0, duration: 1, ease: 'expo.out' }, i * 0.12)
        .from($('.phone', shot), { yPercent: 45, duration: 1.3, ease: 'expo.out' }, i * 0.12 + 0.15);
    });

    /* =========== 9. Ограничения: сначала падает штамп, от удара из-за него выходят круги; заголовок — строками =========== */
    gsap.from('.limits__eyebrow', { y: 12, autoAlpha: 0, duration: 0.7, scrollTrigger: st('.limits__text') });
    revealLines('.limits__title', '.limits__text');
    const stampNum = $('.stamp__big b');
    gsap.timeline({ scrollTrigger: st('.limits__art', 'top 80%') })
      .from('.stamp', { scale: 2.2, rotation: -16, autoAlpha: 0, duration: 0.5, ease: 'power4.in' }, 0)
      .from('.limits__ring', { scale: 0.5, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.5)
      .from('.circle', { y: 90, scale: 0.35, autoAlpha: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' }, 0.5)
      // «35» добегает до своего значения после удара
      .fromTo({ v: 0 }, { v: 0 }, {
        v: 35, duration: 0.9, ease: 'power2.out',
        onStart() { stampNum.textContent = '0'; },
        onUpdate() { stampNum.textContent = Math.round(this.targets()[0].v); },
        onComplete() { stampNum.textContent = '35'; },
      }, 0.55);
    gsap.to('.limits__ring', {
      rotation: 120, ease: 'none',
      scrollTrigger: { trigger: '.limits', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    /* =========== 10. Финал =========== */
    gsap.from('.final__pre', { y: 16, autoAlpha: 0, duration: 0.8, scrollTrigger: st('.final') });
    revealLines('.final__main', '.final');
    gsap.from('.final .btn', { y: 18, autoAlpha: 0, duration: 0.8, delay: 0.5, scrollTrigger: st('.final') });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: st('.concept-end', 'top 85%') });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
