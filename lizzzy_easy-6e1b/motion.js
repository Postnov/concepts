// Елизавета Кузьмина — моушн концепта.
// Фирменная идея «Партитура речи»: текст размечен, как роль у актрисы, — карандаш ставит логические ударения
// (подчёркивание), паузы ( | и || ) и обводит главное слово, а голос «прочитывает» фразу: слова по очереди
// наливаются цветом в темпе живой речи и замирают на паузах. Без GSAP или при reduced motion — статичная страница с готовой разметкой.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return;

  const root = getComputedStyle(document.documentElement);
  const INK = root.getPropertyValue('--ink').trim();
  const PALE = root.getPropertyValue('--pale').trim();
  const refresh = () => ScrollTrigger.refresh();

  // Каждое слово — в обычный inline-span: перенос строк и кернинг не меняются, revert не нужен
  function wrapWords(el) {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement.closest('svg, .pz') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    for (let n; (n = walk.nextNode());) nodes.push(n);
    nodes.forEach(n => {
      const frag = document.createDocumentFragment();
      n.data.split(/([ \t\n]+)/).forEach(part => {
        if (!part) return;
        if (/^[ \t\n]+$/.test(part)) return frag.append(part);
        const w = document.createElement('span');
        w.className = 'kw';
        w.textContent = part;
        frag.append(w);
      });
      n.replaceWith(frag);
    });
    return $$('.kw', el);
  }

  // Штрих карандаша: длина пунктира с запасом (non-scaling-stroke меряет длину в пикселях экрана), после рисования — сброс
  function pencil(path) {
    const svg = path.ownerSVGElement;
    const vb = svg.viewBox.baseVal;
    const box = svg.getBoundingClientRect();
    const k = Math.max(box.width / vb.width, box.height / vb.height, 1);
    const d = Math.ceil(path.getTotalLength() * k * 1.3) + 4;
    gsap.set(path, { strokeDasharray: `${d} ${d}` });
    return { path, d };
  }
  function draw(tl, path, at, duration) {
    const { d } = pencil(path);
    tl.fromTo(path, { strokeDashoffset: d }, {
      strokeDashoffset: 0, duration, ease: 'power2.inOut',
      onComplete: () => gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' }),
    }, at);
  }

  // «Прочтение» фразы: слова наливаются цветом по очереди, на паузах карандаш ставит черту и голос замирает
  function voice(tl, el, at, pace = 1) {
    const words = el.__words || (el.__words = wrapWords(el));
    gsap.set(words, { color: PALE });
    const when = new Map();
    let t = at;
    $$('.kw, .pz', el).forEach(n => {
      if (n.classList.contains('pz')) {
        tl.from($$('i', n), { scaleY: 0, duration: 0.3, stagger: 0.09, ease: 'power2.out' }, t);
        t += (n.classList.contains('pz--2') ? 0.5 : 0.3) * pace;
        return;
      }
      when.set(n, t);
      tl.to(n, { color: INK, duration: 0.32, ease: 'power1.out' }, t);
      t += (0.1 + n.textContent.length * 0.016) * pace;
    });
    // Подчёркивание тянется под словами, пока они звучат; овал обводит слово сразу после него
    $$('.u', el).forEach(u => {
      const ws = $$('.kw', u);
      const t0 = when.get(ws[0]);
      const t1 = when.get(ws.at(-1)) + 0.25;
      draw(tl, $('path', u), t0, Math.max(0.4, t1 - t0));
    });
    $$('.o', el).forEach(o => draw(tl, $('path', o), when.get($('.kw', o)) + 0.15, 0.7));
    return t;
  }

  // Заголовок строками из-под маски
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Отдельный штрих по скроллу
  function drawOnScroll(path, trigger, delay = 0.2, duration = 0.8) {
    const tl = gsap.timeline({ scrollTrigger: { trigger, start: 'top 82%' } });
    draw(tl, path, delay, duration);
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = $('.hero__lead');
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => name.revert() });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.curtain', { clipPath: 'inset(0% 50% 0% 50% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.6, ease: 'expo.inOut' }, 0.15)
      .from('.curtain img', { scale: 1.22, duration: 2.2, ease: 'expo.out' }, 0.35)
      .from('.hero__roles > *', { y: 10, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.2)
      .from(name.chars, { yPercent: 112, stagger: 0.026, duration: 1, ease: 'expo.out' }, 0.3)
      .from(lead, { y: 14, autoAlpha: 0, duration: 0.7 }, 0.75)
      .from('.hero__note, .hero__cta-note', { autoAlpha: 0, y: 8, duration: 0.8 }, 1.3)
      .from('.photo-cta .btn, .hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 1.1)
      .from('.facts__item', { y: 14, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35);
    const end = voice(intro, lead, 0.9, 0.78);
    // Стрелка «мои услуги» дорисовывается, когда фраза дочитана
    $$('.hero__note path, .hero__cta-note path').forEach(p => draw(intro, p, Math.max(1.6, end - 0.3), 0.7));

    gsap.to('.curtain img', {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Кому подойдёт ---------- */
    revealLines('.fit h2', '.fit__head');
    gsap.from('.fit__pre, .fit__post', { autoAlpha: 0, x: -10, duration: 0.8, stagger: 0.35, scrollTrigger: { trigger: '.fit__head', start: 'top 84%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.fit__photo', start: 'top 88%' } })
      .fromTo('.fit__photo .ph', { clipPath: 'inset(0% 100% 0% 0% round 26px)' }, { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.3, ease: 'expo.inOut' })
      .from('.fit__photo img', { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.1);
    $$('.fit__list .line').forEach(li => {
      const p = $('p', li);
      const tl = gsap.timeline({ paused: true });
      tl.from($('.line__n', li), { autoAlpha: 0, x: -8, duration: 0.5 }, 0);
      voice(tl, p, 0.1, 0.62);
      ScrollTrigger.create({ trigger: li, start: 'top 86%', once: true, onEnter: () => tl.play() });
    });

    /* ---------- 3. Форматы ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.sec-head__pre', { autoAlpha: 0, x: -10, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 84%' } });
    drawOnScroll($('.formats h2 .u path'), '.formats .sec-head', 0.7, 0.9);

    $$('.offer').forEach(card => {
      const flip = card.classList.contains('offer--flip');
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 84%' } })
        .from(card, { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .fromTo($('.ph', card),
          { clipPath: flip ? 'inset(0% 0% 0% 100% round 22px)' : 'inset(0% 100% 0% 0% round 22px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.3, ease: 'expo.inOut' }, 0.15)
        .from($('.ph img', card), { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.25)
        .from($('.tag', card), { autoAlpha: 0, y: -8, duration: 0.6 }, 0.9)
        .from($$('.offer__title, .offer__text', card), { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.35);
      // Метка «Что входит» — карандашный овал
      const label = $('.offer__label', card);
      const lt = gsap.timeline({ scrollTrigger: { trigger: label, start: 'top 86%' } });
      lt.from(label, { autoAlpha: 0, y: 10, duration: 0.6 }, 0);
      draw(lt, $('.o path', label), 0.3, 0.8);
      gsap.from($$('.dash li, .train li', card), {
        x: -16, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: $('.dash, .train', card), start: 'top 86%' },
      });
      // Цена появляется целиком, без «набегания»
      gsap.from($$('.chip, .chips__note, .offer__foot .btn', card), {
        y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: $('.offer__foot', card), start: 'top 90%' },
      });
    });

    gsap.from('.sessions', { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.sessions', start: 'top 86%' } });
    $$('.session').forEach(s => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: s, start: 'top 84%' } });
      const ph = $('.ph', s);
      if (ph) {
        tl.fromTo(ph, { clipPath: 'inset(100% 0% 0% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.1, ease: 'expo.inOut' }, 0)
          .from($('img', ph), { scale: 1.2, duration: 1.5, ease: 'expo.out' }, 0.1);
      }
      tl.from($$('.session__main > *', s), { y: 18, autoAlpha: 0, duration: 0.75, stagger: 0.08, ease: 'power3.out' }, 0.15)
        .from($$('.session__meta > *', s), { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.35)
        .from($('.btn', s), { y: 12, autoAlpha: 0, duration: 0.6 }, 0.5);
    });

    /* ---------- концепт ---------- */
    const ce = gsap.timeline({ scrollTrigger: { trigger: '.concept-end', start: 'top 86%' } });
    ce.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 0);
    draw(ce, $('.concept-end .u path'), 0.5, 0.8);

    window.addEventListener('load', refresh, { once: true });
  });
})();
