// Ксюша · «Код Таро» — моушн концепта.
// Фирменная идея — «кодовый замок»: буквы КОД ТАРО, итог формулы и цены тарифов
// прокручиваются барабанами (перебор букв и цифр) и защёлкиваются на нужном знаке — код подобран.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеоны «Что входит»: работают и без GSAP ---------- */
  function setOpen(item, open) {
    const head = $('.acc__head', item);
    const body = $('.acc__body', item);
    if (head.getAttribute('aria-expanded') === String(open)) return;
    head.setAttribute('aria-expanded', String(open));
    if (!animate) {
      body.hidden = !open;
      return refresh();
    }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, {
        height: 'auto', duration: 0.55, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from($$('li', body), { x: -10, autoAlpha: 0, duration: 0.45, stagger: 0.045, delay: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.4, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.acc').forEach(acc => {
    const items = $$('.acc__item', acc);
    items.forEach(item => {
      $('.acc__head', item).addEventListener('click', () => {
        const open = $('.acc__head', item).getAttribute('aria-expanded') !== 'true';
        items.forEach(other => other !== item && setOpen(other, false));
        setOpen(item, open);
      });
    });
  });

  if (!animate) return;

  /* ---------- «кодовый замок» ---------- */
  const LETTERS = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ';
  const DIGITS = '0123456789';

  // Каждый знак → окно .rl с лентой случайных знаков над настоящим.
  // Лента детерминирована (seed), чтобы тёмный и светлый слои заголовка крутились одинаково.
  function buildReel(el, set, seed, count = i => 5 + (i % 3) + Math.min(i, 8)) {
    const original = el.innerHTML;
    const text = el.textContent.trim();
    el.textContent = '';
    const items = [];
    let i = 0;
    text.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); return; }
      const word = document.createElement('span');
      word.className = 'sw';
      for (const ch of part) {
        const rl = document.createElement('span');
        rl.className = 'rl';
        const inner = document.createElement('span');
        inner.className = 'rl__in';
        const strip = document.createElement('span');
        strip.className = 'rl__strip';
        strip.setAttribute('aria-hidden', 'true');
        const n = count(i);
        for (let k = 0; k < n; k++) {
          const g = document.createElement('i');
          g.textContent = set[(seed * 5 + i * 7 + k * 11) % set.length];
          strip.appendChild(g);
        }
        inner.append(strip, ch);
        rl.appendChild(inner);
        word.appendChild(rl);
        items.push({ el: inner, n });
        i++;
      }
      el.appendChild(word);
    });
    return { items, revert: () => { el.innerHTML = original; } };
  }

  // Прокрутка барабанов: слои (массив buildReel) крутятся синхронно, по окончании — исходный текст
  function spin(layers, { duration = 1.25, stagger = 0.06 } = {}) {
    const tl = gsap.timeline({ onComplete: () => layers.forEach(l => l.revert()) });
    layers[0].items.forEach((item, i) => {
      tl.fromTo(layers.map(l => l.items[i].el), { yPercent: item.n * 100 }, {
        yPercent: 0, duration: duration + i * 0.03, ease: 'expo.out',
      }, i * stagger);
    });
    return tl;
  }

  // Заголовок строками из-под маски; split снимаем после анимации
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
    const stage = $('.hero__stage');
    const [baseTitle, ghostTitle] = $$('.hero__title');
    const words = [0, 1].map(k => [
      buildReel($$('[data-reel]', baseTitle)[k], LETTERS, k + 1),
      buildReel($$('[data-reel]', ghostTitle)[k], LETTERS, k + 1),
    ]);
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      // Фото и светлый слой букв раскрываются снизу вверх одной переменной --rv
      .fromTo(stage, { '--rv': 0 }, { '--rv': 1, duration: 1.4, ease: 'expo.inOut' }, 0.1)
      .from('.hero__frame img', { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.25)
      .from('.hero__aura span', { scale: 0.5, autoAlpha: 0, duration: 2, stagger: 0.2, ease: 'expo.out' }, 0.2)
      .add(spin(words[0], { duration: 1.5, stagger: 0.09 }), 0.3)
      .add(spin(words[1], { duration: 1.5, stagger: 0.09 }), 0.5)
      .from('.kicker > *', { y: 10, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.6)
      .from('.hero__lead', { y: 18, autoAlpha: 0, duration: 0.9 }, 1.05)
      .from('.hero .btn', { y: 16, autoAlpha: 0, duration: 0.7 }, 1.3);

    // Медленное «дыхание» ауры за фото
    gsap.to('.hero__aura span:nth-child(1)', { xPercent: 10, yPercent: -6, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.hero__aura span:nth-child(2)', { xPercent: -12, yPercent: 8, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    // Лёгкий параллакс портрета внутри рамки
    gsap.fromTo('.hero__frame img', { yPercent: 0 }, {
      yPercent: 6, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- манифест: мифы зачёркиваются ---------- */
    gsap.timeline({ scrollTrigger: { trigger: '.manifest__no', start: 'top 82%' } })
      .from('.manifest__no li', { y: 14, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out' })
      .from('.strike', { scaleX: 0, stagger: 0.24, duration: 0.7, ease: 'power3.inOut' }, 0.45);
    revealLines('.manifest__big');
    gsap.from('.manifest__sub', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.manifest__sub', start: 'top 90%' } });
    gsap.from('.qa__item', {
      y: 34, autoAlpha: 0, duration: 0.9, stagger: 0.15, ease: 'expo.out',
      scrollTrigger: { trigger: '.qa', start: 'top 85%' },
    });
    gsap.from('.qa__a', {
      xPercent: 8, autoAlpha: 0, duration: 0.9, stagger: 0.15, delay: 0.25, ease: 'expo.out',
      scrollTrigger: { trigger: '.qa', start: 'top 85%' },
    });
    gsap.from('.manifest__choice', { y: 18, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.manifest__choice', start: 'top 90%' } });

    /* ---------- 2. Формула: карты переворачиваются, итог подбирается кодом ---------- */
    revealLines('.formula h2', '.formula .sec-head');
    gsap.from('.formula .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.formula .sec-head', start: 'top 84%' } });
    const result = buildReel($('.eq__res-text'), LETTERS, 3, i => 3 + (i % 3));
    gsap.timeline({ scrollTrigger: { trigger: '.eq', start: 'top 78%' } })
      .from('.eq__inner', { rotateY: -180, duration: 1.2, stagger: 0.22, ease: 'expo.out' })
      .from('.eq__op', { scale: 0.4, autoAlpha: 0, duration: 0.5, stagger: 0.22, ease: 'power3.out' }, 0.3)
      .from('.eq__result', { y: 28, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.85)
      .add(spin([result], { duration: 1.1, stagger: 0.045 }), 0.95);

    /* Кто я */
    gsap.timeline({ scrollTrigger: { trigger: '.who', start: 'top 78%' } })
      .fromTo('.who__photo .frame',
        { clipPath: 'inset(100% 0% 0% 0% round 26px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 26px)', duration: 1.4, ease: 'expo.inOut' })
      .from('.who__photo img', { scale: 1.3, duration: 1.9, ease: 'expo.out' }, 0.15)
      .from('.who__tag', { y: 16, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.9);
    gsap.from('.who__lead', { y: 24, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.who__lead', start: 'top 86%' } });
    gsap.timeline({ scrollTrigger: { trigger: '.path', start: 'top 82%' } })
      .from('.path__label', { y: 12, autoAlpha: 0, duration: 0.6 })
      .from('.path__step', { x: -14, autoAlpha: 0, duration: 0.7, stagger: 0.5, ease: 'power3.out' }, 0.15)
      .from('.path__rail span', { scaleY: 0, duration: 0.9, ease: 'power2.inOut' }, 0.4)
      .from('.path__step--to .path__dot', { scale: 0, duration: 0.5, ease: 'power3.out' }, 1.15);
    gsap.from(['.who__sys', '.who__end'], {
      y: 20, autoAlpha: 0, duration: 0.85, stagger: 0.15,
      scrollTrigger: { trigger: '.who__sys', start: 'top 90%' },
    });

    /* ---------- 3. Тарифы ---------- */
    revealLines('.tariffs h2', '.tariffs .sec-head');
    gsap.from('.tariffs .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.tariffs .sec-head', start: 'top 84%' } });
    $$('.plan').forEach(plan => {
      gsap.timeline({ scrollTrigger: { trigger: plan, start: 'top 86%' } })
        .from(plan, { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out' })
        .from($('.plan__img img', plan), { scale: 1.25, duration: 1.6, ease: 'expo.out' }, 0);
      // Цена подбирается, как код, когда доходит до экрана
      const price = buildReel($('.plan__price [data-reel]', plan), DIGITS, 2);
      gsap.timeline({ scrollTrigger: { trigger: $('.plan__price', plan), start: 'top 88%' } })
        .add(spin([price], { duration: 1.4, stagger: 0.07 }))
        .from($('.plan__price .rub', plan), { autoAlpha: 0, x: -8, duration: 0.6 }, 0.5);
    });
    // Первый пункт «Что входит» первого тарифа раскрывается сам — видно, что список живой
    const firstItem = $('.plan .acc__item');
    ScrollTrigger.create({
      trigger: firstItem, start: 'top 70%', once: true,
      onEnter: () => gsap.delayedCall(0.4, () => setOpen(firstItem, true)),
    });
    gsap.from('.care', { y: 24, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: '.care', start: 'top 90%' } });
    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 88%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
