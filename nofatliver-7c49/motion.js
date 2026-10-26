// Георгий Лакеев — моушн концепта. Идея: жир — это янтарные капли. Они дрейфуют и сливаются вверху,
// при прокрутке растворяются, а в списке результатов капля превращается в галочку («чисто»).
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;

  /* ---------- «по полочкам»: предметы на полках (декор, строим скриптом) ---------- */
  $$('.shelf__items').forEach(box => {
    const n = +box.dataset.n;
    const kind = box.dataset.kind;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i');
      if (kind === 'a') {
        el.style.setProperty('--h', (14 + ((i * 7 + ((i * i) % 5) * 3) % 13) * 1.15).toFixed(1) + 'px');
        if (i % 9 === 4) el.className = 'hot';
      }
      frag.appendChild(el);
    }
    box.appendChild(frag);
  });

  if (!animate) return;

  // «Слияние» капель — SVG-фильтр на HTML-элементе: в Safari он ведёт себя нестабильно, там капли остаются обычными шариками
  if (!/^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)) $('.fat').style.filter = 'url(#goo)';

  // Число набегает от нуля (не цена). Рамку по ширине держит скрытый «призрак» с итоговым числом
  function countUp(cnt, vars = {}) {
    const live = $('.cnt__l', cnt);
    const to = +cnt.dataset.to;
    const o = { v: 0 };
    live.textContent = '0';
    return gsap.to(o, {
      v: to, duration: vars.duration || 1.6, ease: 'power2.out', delay: vars.delay || 0,
      scrollTrigger: vars.trigger ? { trigger: vars.trigger, start: vars.start || 'top 88%', once: true } : undefined,
      onUpdate: () => { live.textContent = String(Math.round(o.v)); },
      onComplete: () => { live.textContent = String(to); },
    });
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
    /* ---------- 1. Hero: вход ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); lead.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.drop', { scale: 0, duration: 1.5, ease: 'back.out(1.5)', stagger: { each: 0.06, from: 'random' } }, 0.15)
      .from('.hero__photo .frame', { scale: 0.72, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 0.15)
      .from('.hero__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.2)
      .from('.hero__orbit', { scale: 0.72, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.35)
      .from('.stamp', { y: 26, scale: 0.82, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)' }, 1.05)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.35)
      .from(name.chars, { yPercent: 115, stagger: 0.04, duration: 1.0, ease: 'expo.out' }, 0.4)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.8)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.7 }, 1.15)
      .from('.hero__plan', { y: 10, autoAlpha: 0, duration: 0.7 }, 1.45);
    countUp($('.stamp .cnt'), { delay: 1.1, duration: 2.2 });

    /* Капли «жира»: медленно дрейфуют (в золотом фильтре сливаются в большие), на экране героя */
    const drift = $$('.drop').map(d => gsap.to(d, {
      x: gsap.utils.random(-16, 16), y: gsap.utils.random(-22, 22),
      duration: gsap.utils.random(3.2, 6), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: gsap.utils.random(0, 1.4),
    }));
    const orbit = gsap.to('.hero__orbit', { rotation: 360, duration: 28, repeat: -1, ease: 'none' });
    const wave = gsap.to('.hero__wave svg', { xPercent: -50, duration: 18, repeat: -1, ease: 'none' });
    ScrollTrigger.create({
      trigger: '.hero', start: 'top bottom', end: 'bottom top',
      onToggle: self => [...drift, orbit, wave].forEach(t => (self.isActive ? t.play() : t.pause())),
    });

    /* Прокрутка: капли растворяются — печень «очищается» */
    gsap.to('.fat', {
      '--k': 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 40%', scrub: true },
    });

    /* Блик на главных кнопках раз в несколько секунд */
    $$('.btn:not(.btn--ghost):not(.btn--ghost-ox):not(.btn--ox)').forEach((btn, i) => {
      gsap.fromTo(btn, { '--shine': '-120%' }, { '--shine': '120%', duration: 1.3, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.8, delay: 2.6 + i * 0.8 });
    });

    /* ---------- 2. Мои подопечные ---------- */
    revealLines('.clients h2', '.clients .sec-head');
    gsap.from(['.clients .eyebrow', '.clients .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.clients .sec-head', start: 'top 84%' },
    });
    gsap.from('.fact', { y: 34, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.facts', start: 'top 90%' } });
    $$('.fact .cnt').forEach(c => countUp(c, { trigger: '.facts', start: 'top 88%', duration: 1.4 }));

    // Каждый результат: капля «жира» превращается в галочку
    $$('.gain').forEach(li => {
      const ok = $('.mk__ok', li);
      gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%', once: true } })
        .from($('p', li), { y: 22, autoAlpha: 0, duration: 0.85, ease: 'power3.out' }, 0)
        .fromTo($('.mk__drop', li), { scale: 1, autoAlpha: 1 }, { scale: 0, autoAlpha: 0, duration: 0.5, ease: 'back.in(2)' }, 0.5)
        .from($('circle', ok), { scale: 0.2, svgOrigin: '18 18', duration: 0.55, ease: 'back.out(2.2)' }, 0.85)
        .from($('path', ok), { strokeDashoffset: 26, duration: 0.45, ease: 'power2.out' }, 1.1);
    });

    /* ---------- 3. Группа по питанию ---------- */
    revealLines('.group h2', '.group .sec-head');
    gsap.from(['.group .eyebrow', '.group .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.group .sec-head', start: 'top 84%' },
    });
    $$('.shelf').forEach(shelf => {
      gsap.from(shelf, { y: 48, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: shelf, start: 'top 92%' } });
      const items = $$('.shelf__items i', shelf);
      gsap.from(items, {
        y: -38, autoAlpha: 0, duration: 0.7, ease: 'power3.out',
        stagger: { amount: Math.min(1.2, items.length * 0.02), from: 'random' },
        scrollTrigger: { trigger: shelf, start: 'top 84%' },
      });
      countUp($('.cnt', shelf), { trigger: shelf, start: 'top 88%', duration: 1.5 });
    });
    gsap.from('.shelves__more', { y: 18, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.shelves__more', start: 'top 94%' } });
    revealLines('.motto');
    gsap.from('.join .btn', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: '.join', start: 'top 92%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
