// Диана Афанасьева — моушн концепта.
// Фирменная идея «собрать себя»: портрет складывается из смещённых полос, а название курса — из разлетевшихся букв.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- аккордеон запросов: работает и без GSAP ---------- */
  function setOpen(item, open, instant) {
    const head = $('.acc__head', item);
    const body = $('.acc__body', item);
    if (head.getAttribute('aria-expanded') === String(open)) return;
    head.setAttribute('aria-expanded', String(open));
    if (!animate || instant) {
      body.hidden = !open;
      return refresh();
    }
    gsap.killTweensOf(body);
    if (open) {
      body.hidden = false;
      gsap.fromTo(body, { height: 0 }, {
        height: 'auto', duration: 0.6, ease: 'power3.out',
        onComplete: () => { body.style.height = ''; refresh(); },
      });
      gsap.from($$('li', body), { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.04, delay: 0.1, ease: 'power2.out' });
    } else {
      gsap.to(body, {
        height: 0, duration: 0.45, ease: 'power3.inOut',
        onComplete: () => { body.hidden = true; body.style.height = ''; refresh(); },
      });
    }
  }
  $$('.acc__item').forEach(item => {
    $('.acc__head', item).addEventListener('click', () => {
      const open = $('.acc__head', item).getAttribute('aria-expanded') !== 'true';
      $$('.acc__item').forEach(other => other !== item && setOpen(other, false));
      setOpen(item, open);
    });
  });

  if (!animate) {
    setOpen($('.acc__item'), true, true);
    return;
  }

  // Режем кадр на вертикальные полосы-копии того же фото; основное <img> остаётся в DOM для доступности
  function shatter(frame, count) {
    const img = $('img', frame);
    const wrap = document.createElement('div');
    wrap.className = 'shards';
    wrap.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < count; i++) {
      const shard = document.createElement('span');
      shard.className = 'shard';
      shard.style.left = `${(i * 100) / count}%`;
      shard.style.width = `${100 / count}%`;
      const copy = img.cloneNode();
      copy.removeAttribute('fetchpriority');
      copy.alt = '';
      copy.style.width = `${count * 100}%`;   // внутри полосы картинка шириной во весь кадр…
      copy.style.left = `${-i * 100}%`;        // …и сдвинута так, чтобы полоса показала свой кусок
      shard.appendChild(copy);
      wrap.appendChild(shard);
    }
    frame.appendChild(wrap);
    return { wrap, img, shards: [...wrap.children] };
  }

  // Заголовок строками из-под маски; после анимации split снимаем, чтобы перенос строк жил при ресайзе
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { reduceWhiteSpace: false, type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.1, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    const mobile = matchMedia('(max-width: 899px)').matches;

    /* ---------- 1. Hero: портрет собирается из полос ---------- */
    const frame = $('[data-shatter]');
    const { wrap, img, shards } = shatter(frame, mobile ? 7 : 9);
    // Смещения полос: «разбитый» кадр, чётные вверх, нечётные вниз, к краям сильнее
    const mid = (shards.length - 1) / 2;
    const offset = i => (i % 2 ? 1 : -1) * (10 + Math.abs(i - mid) * 5);
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });

    gsap.set(img, { autoAlpha: 0 });
    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => { name.revert(); },
    });
    intro
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .from('.hero__mast > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.15)
      .fromTo(shards,
        { yPercent: i => offset(i), autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1.7, ease: 'expo.out', stagger: { each: 0.07, from: 'center' } }, 0.2)
      .fromTo($$('img', wrap), { scale: 1.18 }, { scale: 1, duration: 2.1, ease: 'expo.out', stagger: { each: 0.07, from: 'center' } }, 0.2)
      .add(() => { gsap.set(img, { autoAlpha: 1 }); wrap.remove(); }, 2.6)
      .from(name.chars, { yPercent: 110, stagger: 0.04, duration: 1.1, ease: 'expo.out' }, 0.75)
      .from('.hero__lead', { y: 18, autoAlpha: 0, duration: 0.9 }, 1.15)
      .from('.hero__cta .btn', { y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.8 }, 1.3);

    /* Лёгкий параллакс портрета */
    gsap.to(img, {
      yPercent: 4, scale: 1.1, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* ---------- Курс: буквы названия «собираются» по скроллу ---------- */
    const title = SplitText.create('.course__title', { type: 'words,chars', wordsClass: 'sw' });
    const rnd = gsap.utils.random;
    gsap.from(title.chars, {
      yPercent: () => rnd(-160, 160), xPercent: () => rnd(-60, 60), rotation: () => rnd(-28, 28), autoAlpha: 0,
      ease: 'power2.out', stagger: { each: 0.02, from: 'random' },
      scrollTrigger: { trigger: '.course', start: 'top 85%', end: 'center 55%', scrub: 0.8, once: true },
      onComplete: () => title.revert(),
    });
    gsap.from(['.course__eyebrow', '.course__text', '.course__link'], {
      y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.12,
      scrollTrigger: { trigger: '.course', start: 'top 70%' },
    });

    /* ---------- 2. С чем можно обратиться ---------- */
    revealLines('.help h2', '.help .sec-head');
    gsap.from('.help .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.help .sec-head', start: 'top 85%' } });
    // Рамки рисуются от угла, затем пункты поднимаются по одному
    $$('.box').forEach((box, b) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 82%' } });
      tl.fromTo($('.box__line', box),
        { clipPath: b ? 'inset(0% 0% 100% 100%)' : 'inset(0% 100% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
        .from($$('.points li', box), { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out' }, 0.35);
    });
    revealLines('.approach__title', '.approach');
    gsap.from('.approach__body > p', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.approach', start: 'top 82%' } });
    gsap.from('.schools li', {
      y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: '.schools', start: 'top 90%' },
    });

    /* ---------- 3. Запросы ---------- */
    gsap.from('.req .eyebrow', { y: 14, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: '.req', start: 'top 80%' } });
    const items = $$('.acc__item');
    gsap.from(items, {
      y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.acc', start: 'top 85%' },
    });
    // Первый пункт раскрывается сам, чтобы было видно, что список живой
    ScrollTrigger.create({
      trigger: '.acc', start: 'top 62%', once: true,
      onEnter: () => gsap.delayedCall(0.7, () => setOpen(items[0], true)),
    });

    gsap.timeline({ scrollTrigger: { trigger: '.contact', start: 'top 82%' } })
      .fromTo('.contact__photo', { clipPath: 'inset(50% 50% 50% 50% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.3, ease: 'expo.out' })
      .from('.contact__photo img', { scale: 1.4, duration: 1.6, ease: 'expo.out' }, 0)
      .from('.contact__title', { y: 20, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, 0.15)
      .from('.contact .btn', { y: 16, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.3)
      .from('.socials > *', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.4);

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
