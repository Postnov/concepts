// Екатерина Суворова — моушн концепта. Идея: «система координат» — рамка фокуса сходится на портрете,
// а разбросанные запросы и слова «хаоса» собираются в ровную систему, когда до них доходит прокрутка.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- «Подробнее» в карточках: работает и без GSAP ---------- */
  function setOpen(box, open) {
    const head = $('.more__head', box);
    const body = $('.more__body', box);
    head.setAttribute('aria-expanded', String(open));
    if (!animate) { body.hidden = !open; return; }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, {
        height: 'auto', duration: 0.6, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from(body.querySelectorAll('p, li'), { x: -10, autoAlpha: 0, duration: 0.45, stagger: 0.035, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.4, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.more').forEach(box => {
    $('.more__head', box).addEventListener('click', () => {
      setOpen(box, $('.more__head', box).getAttribute('aria-expanded') !== 'true');
    });
  });

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger, delay = 0) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.1, stagger: 0.1, ease: 'expo.out', delay,
      scrollTrigger: { trigger: trigger || selector, start: 'top 84%' },
      onComplete: () => split.revert(),
    });
  }
  // Детерминированный «разброс»: одинаковый при каждом открытии, без Math.random
  const jitter = (i, k, amp) => (((i * 7 + k * 13) % 11) / 10 - 0.5) * 2 * amp;

  // Рамка фокуса «сходится» к лицу: уголки стартуют от краёв кадра (доли l, t, r, b) и едут на место только через transform —
  // без анимации left/top/width/height, иначе сдвиги вёрстки (CLS)
  function focusIn(box, l, t, r, b) {
    const f = box.parentElement.getBoundingClientRect();
    const cs = [...box.querySelectorAll('.scope__c')];
    const from = cs.map(c => {
      const k = c.getBoundingClientRect();
      const left = /--tl|--bl/.test(c.className);
      const top = /--tl|--tr/.test(c.className);
      return {
        x: left ? f.left + f.width * l - k.left : f.right - f.width * r - k.right,
        y: top ? f.top + f.height * t - k.top : f.bottom - f.height * b - k.bottom,
      };
    });
    return { cs, x: i => from[i].x, y: i => from[i].y };
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: сетка, кадр, фокус сходится на лице ---------- */
    const first = SplitText.create('.hero__first', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const last = SplitText.create('.hero__last', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    // счётчик часов практики: 0 → 4000+
    const hoursEl = $('.hero__stat b');
    const hours = { v: 0 };
    const showHours = () => { hoursEl.textContent = `${Math.round(hours.v / 50) * 50}+`; };
    const heroFocus = focusIn($('.hero .scope__box'), 0.05, 0.04, 0.05, 0.04);
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { first.revert(); last.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__grid span', { scaleY: 0, duration: 1.6, stagger: 0.07, ease: 'expo.inOut' }, 0)
      .fromTo('.hero__photo .frame', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'expo.inOut' }, 0.1)
      .from('.hero__photo img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.3)
      .from('.hero .scope__x', { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, 0.75)
      .from('.hero .scope__y', { scaleY: 0, duration: 1.1, ease: 'expo.inOut' }, 0.85)
      // рамка фокуса: от краёв кадра к лицу, как автофокус
      .from('.hero .scope__box', { autoAlpha: 0, duration: 0.6 }, 0.9)
      .from(heroFocus.cs, { x: heroFocus.x, y: heroFocus.y, duration: 1.3, ease: 'expo.inOut' }, 0.9)
      .from('.hero__motto', { autoAlpha: 0, y: -8, duration: 0.8 }, 1.1)
      .from(first.chars, { yPercent: 110, stagger: 0.04, duration: 1.05, ease: 'expo.out' }, 0.55)
      .from(last.chars, { yPercent: 110, stagger: 0.045, duration: 1.05, ease: 'expo.out' }, 0.8)
      .from('.hero__role > *', { y: 12, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.05)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 1.15)
      .from('.hero__cta > *', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.35)
      .from('.hero__stat', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.5)
      .to(hours, { v: 4000, duration: 1.6, ease: 'power2.out', onStart: showHours, onUpdate: showHours }, 1.5);

    // Блик на главных кнопках раз в несколько секунд
    gsap.utils.toArray('.btn:not(.btn--ghost):not(.btn--small)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 4, delay: 2.6 + i * 0.7 });
    });

    // Лёгкий параллакс портрета
    gsap.to('.hero__photo img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- 2. Запросы: из хаоса в систему ---------- */
    revealLines('.pains h2', '.pains .sec-head');
    gsap.from('.pains .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.pains .sec-head', start: 'top 84%' } });
    // каждый пункт влетает «криво» и встаёт ровно на своё место
    $$('.pains__list li').forEach((li, i) => {
      gsap.from($('.pains__t', li), {
        x: jitter(i, 1, 46), y: jitter(i, 2, 10), rotation: jitter(i, 3, 4), autoAlpha: 0.15,
        duration: 1.15, ease: 'expo.out',
        scrollTrigger: { trigger: li, start: 'top 92%' },
      });
      gsap.from($('.pains__n', li), { scale: 0, autoAlpha: 0, duration: 0.6, ease: 'back.out(2.4)', delay: 0.15, scrollTrigger: { trigger: li, start: 'top 92%' } });
    });
    gsap.fromTo('.pains__list', { '--axis': 0 }, {
      '--axis': 1, duration: 2.6, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.pains__list', start: 'top 78%' },
    });
    // слова «хаоса» разлетелись — и собираются в одну строку
    const words = $$('.chaos__w');
    gsap.from(words, {
      x: i => jitter(i, 4, 110), y: i => jitter(i, 5, 70), rotation: i => jitter(i, 6, 16), autoAlpha: 0.2, scale: i => 0.8 + ((i * 3) % 4) * 0.12,
      duration: 1.6, stagger: { each: 0.07, from: 'random' }, ease: 'expo.out',
      scrollTrigger: { trigger: '.chaos', start: 'top 80%' },
    });

    gsap.timeline({ scrollTrigger: { trigger: '.meet', start: 'top 80%' } })
      .fromTo('.meet', { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' })
      .from('.meet__meta span', { y: 10, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, 0.6)
      .from('.meet__steps li', { x: -18, autoAlpha: 0, stagger: 0.09, duration: 0.7, ease: 'power3.out' }, 0.7)
      .from('.meet .btn', { y: 16, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 1.0);
    revealLines('.meet__lead', '.meet', 0.45);

    /* ---------- 3. Форматы ---------- */
    revealLines('.formats h2', '.formats .sec-head');
    gsap.from('.formats .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formats .sec-head', start: 'top 84%' } });
    // карточки «выстраиваются в сетку»: каждая подъезжает со своей стороны
    $$('.card').forEach((card, i) => {
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
        .from(card, { x: i % 2 ? 40 : -40, y: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        // цены не «набегают»: число стоит в разметке, строка цены проявляется целиком — вместе с остальным текстом карточки
        .from(card.querySelectorAll('.card__title, .card__meta, .card__price, .card__lead, .more, .btn'), { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.6, ease: 'power3.out' }, 0.25);
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
