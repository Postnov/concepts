// Виктория Елькина — моушн концепта.
// Фирменная идея «перевод с астрологического на русский» (её же слова): на месте букв сначала проступают
// золотые астрологические символы — планеты и аспекты, нарисованные тонкой линией, как на её баннерах, —
// и слово за словом «переводятся» в обычный текст. Так появляются имя в hero, фраза «с астрологического на русский»
// и «а не приговор» в цитате. Остальное спокойно: мерцание звёзд, прорисовка линий на карточках, мягкие подъёмы.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  if (!animate) return; // статичная страница: всё видно, символов нет

  const NS = 'http://www.w3.org/2000/svg';
  // Символы в квадрате 24×24, линии с pathLength=1 — чтобы прорисовывать их stroke-dashoffset
  const G = {
    sun: '<circle cx="12" cy="12" r="8"/><circle class="dot" cx="12" cy="12" r="1.2"/>',
    moon: '<path d="M15.5 4.2A8 8 0 1 0 15.5 19.8A6.4 6.4 0 1 1 15.5 4.2Z"/>',
    mercury: '<circle cx="12" cy="10.6" r="4.3"/><path d="M8.2 2.8a4 4 0 0 0 7.6 0M12 14.9V22M9 18.8h6"/>',
    venus: '<circle cx="12" cy="8.5" r="5.2"/><path d="M12 13.7V22M8.5 18.2h7"/>',
    mars: '<circle cx="10" cy="14" r="5.4"/><path d="M13.8 10.2L19.5 4.5M14.6 4.5h4.9v4.9"/>',
    jupiter: '<path d="M5.5 6.6c2.5-3 7-2 5.6 2.6L6 16.5h13.5M16 4v18"/>',
    saturn: '<path d="M8 3v13M5 6h6M8 12.6c1.8-3.2 8-3.6 8 1.2 0 3-3.6 4.2-3 7.8"/>',
    trine: '<path d="M12 4.5L20 18.5H4Z"/>',
    neptune: '<path d="M5 5c0 6 3 8.6 7 8.6S19 11 19 5M12 4v18M8.8 18.4h6.4"/>',
    opposition: '<circle cx="6.2" cy="17.6" r="3"/><circle cx="17.8" cy="6.4" r="3"/><path d="M8.4 15.5l7.2-7"/>',
    pluto: '<circle cx="12" cy="6.8" r="3"/><path d="M6.2 6a5.8 5.8 0 0 0 11.6 0M12 12.2V22M8.8 18.4h6.4"/>',
    uranus: '<path d="M6 4v10M18 4v10M6 9h12M12 4v11.6"/><circle cx="12" cy="18.6" r="2.6"/>',
  };
  for (const k in G) G[k] = G[k].replace(/<(circle|path)/g, '<$1 pathLength="1"');
  const ORDER = Object.keys(G);

  // «Перевод»: target режется на буквы (под масками), в host кладётся слой символов на местах букв.
  // Символы прорисовываются, затем по очереди тают вверх, а буквы поднимаются из-под масок
  function translate(target, host, seed = 0) {
    const split = SplitText.create(target, { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const hb = host.getBoundingClientRect();
    const layer = document.createElement('span');
    layer.className = 'glyph-layer';
    layer.setAttribute('aria-hidden', 'true');
    const glyphs = split.chars.map((c, i) => {
      const r = c.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(c).fontSize);
      const size = fs * (fs > 50 ? 0.5 : 0.64); // в мелком тексте символ крупнее, чтобы читался
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('class', 'glyph');
      svg.innerHTML = G[ORDER[(i * 5 + seed) % ORDER.length]];
      svg.style.width = svg.style.height = `${size}px`;
      svg.style.left = `${r.left - hb.left + r.width / 2 - size / 2}px`;
      svg.style.top = `${r.top - hb.top + r.height * 0.56 - size / 2}px`;
      layer.appendChild(svg);
      return svg;
    });
    host.appendChild(layer);
    const strokes = glyphs.flatMap(g => [...g.querySelectorAll('[pathLength]')]);
    const n = split.chars.length;
    const step = Math.min(0.05, 0.75 / n);
    return gsap.timeline({ onComplete: () => { split.revert(); layer.remove(); } })
      .fromTo(glyphs, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: step * 0.6, ease: 'power2.out' }, 0)
      .fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: step * 0.3, ease: 'power2.inOut' }, 0)
      .to(glyphs, { autoAlpha: 0, yPercent: -70, scale: 0.55, duration: 0.5, stagger: step, ease: 'power2.in' }, 0.75)
      .from(split.chars, { yPercent: 130, duration: 0.85, stagger: step, ease: 'expo.out' }, 0.85);
  }

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  // Мерцающие звёзды: детерминированный «случайный» разброс, чтобы кадры роликов совпадали
  function sky(section, count) {
    let s = count * 97;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const box = document.createElement('div');
    box.className = 'sky';
    box.setAttribute('aria-hidden', 'true');
    // Звёзды не садятся на текст: иначе точка над буквой читается как ударение
    const sb = section.getBoundingClientRect();
    const busy = $$('h1, h2, p, li, a, .btn', section).map(el => {
      const r = el.getBoundingClientRect();
      return [r.left - sb.left - 10, r.top - sb.top - 10, r.right - sb.left + 10, r.bottom - sb.top + 10];
    });
    for (let i = 0; i < count; i++) {
      let x, y, tries = 0;
      do {
        x = rnd() * sb.width; y = rnd() * sb.height;
      } while (busy.some(([l, t, r, b]) => x > l && x < r && y > t && y < b) && ++tries < 30);
      if (tries >= 30) continue;
      const st = document.createElement('span');
      st.className = rnd() > 0.75 ? 'star star--gold' : 'star';
      const k = 0.6 + rnd() * 1.1;
      st.style.cssText = `left:${(x / sb.width * 100).toFixed(2)}%;top:${(y / sb.height * 100).toFixed(2)}%;width:${(2 * k).toFixed(1)}px;height:${(2 * k).toFixed(1)}px`;
      box.appendChild(st);
    }
    section.prepend(box);
    $$('.star', box).forEach(st => gsap.fromTo(st, { autoAlpha: 0 }, {
      autoAlpha: 0.25 + rnd() * 0.75, duration: 1.4 + rnd() * 2.2, delay: 0.6 + rnd() * 2.5,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
    }));
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero ---------- */
    sky($('.hero'), 26);
    const name = $('.hero__name');
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });
    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => lead.revert() })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.hero__photo img', { scale: 1.16, filter: 'brightness(0.12)' }, { scale: 1, filter: 'brightness(1)', duration: 2.8, ease: 'power2.out' }, 0)
      .from('.kicker', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.35)
      .add(translate('.hero__name', name, 0), 0.25)
      .from('.hero__sub', { y: 12, autoAlpha: 0, duration: 0.7 }, 1.35)
      .from(lead.lines, { yPercent: 105, duration: 0.95, stagger: 0.08, ease: 'expo.out' }, 1.45)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 1.65)
      .from('.hero__tags li', { y: 10, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 1.85);

    // Луна с портретом уходит медленнее страницы
    gsap.to('.hero__photo', {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- Манифест: фраза переводится на глазах ---------- */
    sky($('.intro'), 14);
    gsap.timeline({ scrollTrigger: { trigger: '.intro__text', start: 'top 78%' } })
      .from('.intro__text', { y: 26, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0)
      .add(translate('.intro__tr', $('.intro__text'), 3), 0.35);
    gsap.from('.intro__more', { y: 18, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.intro__more', start: 'top 88%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.intro__fact', start: 'top 86%' } })
      .from('.fact__big', { y: 24, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0)
      .from('.fact__text', { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.15);

    /* ---------- 2. Разборы ---------- */
    gsap.from('.razbory .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.razbory .sec-head', start: 'top 84%' } });
    revealLines('.razbory h2', '.razbory .sec-head');
    $$('.card').forEach((card, i) => {
      const strokes = $$('.card__art [pathLength]', card);
      gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
        .from(card, { y: 60, autoAlpha: 0, duration: 1.05, ease: 'expo.out', delay: window.innerWidth >= 900 ? (i % 2) * 0.12 : 0 })
        .fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, stagger: 0.18, ease: 'power2.inOut' }, 0.25)
        .from($$('.card__dots circle', card), { scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.07, ease: 'back.out(3)' }, 0.9)
        .from([$('.card__tag', card), $('.card__title', card), $('.card__text', card), $('.card__foot', card)], {
          y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out',
        }, 0.2);
    });
    gsap.from('.ask > *', { y: 20, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.ask', start: 'top 86%' } });

    /* ---------- 3. Обо мне ---------- */
    gsap.from('.about .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about .sec-head', start: 'top 84%' } });
    revealLines('.about h2', '.about .sec-head');
    gsap.timeline({ scrollTrigger: { trigger: '.about__photo', start: 'top 82%' } })
      .fromTo('.about__photo .frame', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
      .from('.about__photo img', { scale: 1.28, duration: 2, ease: 'expo.out' }, 0.2)
      .fromTo('.about__orbit circle', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, 0.5);
    gsap.to('.about__orbit', { rotation: 360, duration: 90, repeat: -1, ease: 'none' });
    const aboutLead = SplitText.create('.about__lead', { type: 'lines', mask: 'lines' });
    gsap.from(aboutLead.lines, {
      yPercent: 105, duration: 1, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '.about__lead', start: 'top 86%' }, onComplete: () => aboutLead.revert(),
    });
    $$('.about__text > p:not(.about__lead)').forEach(p => gsap.from(p, {
      y: 18, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 90%' },
    }));
    gsap.timeline({ scrollTrigger: { trigger: '.quote', start: 'top 80%' } })
      .from('.quote p', { y: 30, autoAlpha: 0, duration: 1, ease: 'power3.out' }, 0)
      .add(translate('.quote__tr', $('.quote p'), 7), 0.4);
    gsap.from('.about__cta .btn', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.about__cta', start: 'top 92%' } });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
