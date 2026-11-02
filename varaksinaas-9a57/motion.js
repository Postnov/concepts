// Алена Вараксина — моушн концепта. Фирменная идея — «тарелка»: портрет на круглом блюде с её строкой по ободу,
// а рационы по дням поворачиваются, как блюдо на столе, и КБЖУ дня пересчитывается на глазах.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const animate = window.MotionBase ? MotionBase.init() : false;
  const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();

  /* ---------- «день на тарелке»: работает и без GSAP ---------- */
  const day = $('[data-day]');
  const imgs = $$('.day__plate img', day);
  const tabs = $$('.day__tabs button', day);
  const badge = $('.day__n', day);
  const outs = $$('[data-k]', day);              // значения: data-k — индекс в data-kbju (клетч|жиры|углев|белки|ккал)
  const bars = $$('.kbju__bar i', day);           // полоски в порядке: белки, жиры, углеводы, клетчатка
  const barK = [3, 1, 2, 0];
  const parse = img => img.dataset.kbju.split('|');
  const num = s => parseFloat(s.replace(',', '.'));
  const dec = s => (s.split(',')[1] || '').length;
  const fmt = (v, d) => v.toFixed(d).replace('.', ',');
  let cur = 0;
  let shown = parse(imgs[0]).map(num);             // что сейчас на табло (для плавного пересчёта)

  function setDay(i, anim) {
    if (i === cur) return;
    const prev = imgs[cur];
    const next = imgs[i];
    const vals = parse(next);
    cur = i;
    tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === i)));
    if (!anim) {
      imgs.forEach(img => img.classList.toggle('is-on', img === next));
      badge.textContent = i + 1;
      outs.forEach(o => { o.textContent = vals[o.dataset.k]; });
      bars.forEach((b, k) => b.style.setProperty('--v', Math.min(1, num(vals[barK[k]]) / b.dataset.max)));
      shown = vals.map(num);
      return;
    }
    // Блюдо поворачивается: новое въезжает с поворотом, старое уходит дальше по кругу
    gsap.killTweensOf(imgs);
    imgs.forEach(img => { if (img !== prev && img !== next) { img.classList.remove('is-on'); gsap.set(img, { clearProps: 'all' }); } });
    next.classList.add('is-on');
    gsap.set(prev, { zIndex: 1 });
    gsap.fromTo(next, { zIndex: 2, rotation: -75, scale: 1.18, autoAlpha: 0 }, { rotation: 0, scale: 1.03, autoAlpha: 1, duration: 1.15, ease: 'expo.out' });
    gsap.to(prev, {
      rotation: 40, scale: 0.96, duration: 0.8, ease: 'power2.inOut',
      onComplete: () => { prev.classList.remove('is-on'); gsap.set(prev, { clearProps: 'all' }); },
    });
    gsap.timeline()
      .to(badge, { yPercent: -60, autoAlpha: 0, duration: 0.22, ease: 'power2.in' })
      .call(() => { badge.textContent = i + 1; })
      .fromTo(badge, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' });
    // КБЖУ пересчитывается от прошлого дня к новому
    const o = { t: 0 };
    const from = shown.slice();
    const to = vals.map(num);
    gsap.to(o, {
      t: 1, duration: 1.1, ease: 'power3.out',
      onUpdate: () => outs.forEach(el => {
        const k = +el.dataset.k;
        el.textContent = fmt(from[k] + (to[k] - from[k]) * o.t, dec(vals[k]));
      }),
      onComplete: () => outs.forEach(el => { el.textContent = vals[el.dataset.k]; }),
    });
    shown = to;
    bars.forEach((b, k) => gsap.to(b, { scaleX: Math.min(1, to[barK[k]] / b.dataset.max), duration: 1, ease: 'power3.out' }));
  }

  // Автопоказ дней, пока блок на экране; любое нажатие — показ останавливается
  let auto = null;
  let userTook = false;
  const stopAuto = () => { if (auto) { auto.kill(); auto = null; } };
  const startAuto = () => {
    if (auto || userTook) return;
    const tick = () => { setDay((cur + 1) % imgs.length, true); auto = gsap.delayedCall(3.4, tick); };
    auto = gsap.delayedCall(2.6, tick);
  };
  tabs.forEach((t, k) => t.addEventListener('click', () => { userTook = true; stopAuto(); setDay(k, animate); }));

  if (!animate) return;

  // Заголовок строками из-под маски; после анимации split снимаем
  function revealLines(selector, trigger) {
    const split = SplitText.create(selector, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 100, duration: 1.05, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || selector, start: 'top 82%' },
      onComplete: () => split.revert(),
    });
  }

  MotionBase.ready(() => {
    /* ---------- 1. Hero: блюдо поворачивается и «подаётся» ---------- */
    const name = SplitText.create('.hero__name', { type: 'words,chars', wordsClass: 'sw', mask: 'chars' });
    const lead = SplitText.create('.hero__lead', { type: 'lines', mask: 'lines' });

    gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { name.revert(); lead.revert(); } })
      .from('[data-concept]', { yPercent: -100, duration: 0.6 }, 0)
      .fromTo('.plate', { clipPath: 'circle(0% at 50% 50%)', rotation: -35 }, { clipPath: 'circle(50% at 50% 50%)', rotation: 0, duration: 1.4, ease: 'expo.inOut' }, 0.1)
      .from('.plate img', { scale: 1.35, duration: 2, ease: 'expo.out' }, 0.35)
      .from('.rim', { autoAlpha: 0, scale: 0.86, duration: 1.6, ease: 'expo.out' }, 0.7)
      .from('.kicker > *', { y: 12, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, 0.5)
      .from(name.chars, { yPercent: 115, stagger: 0.035, duration: 1.05, ease: 'expo.out' }, 0.55)
      .from(lead.lines, { yPercent: 100, stagger: 0.09, duration: 0.95 }, 0.95)
      .from('.hero__about', { y: 16, autoAlpha: 0, duration: 0.8 }, 1.15)
      .from('.hero .btn', { y: 18, autoAlpha: 0, duration: 0.7 }, 1.25)
      .from('.socials li', { y: 14, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 1.35);

    // Обод медленно вращается всегда, а прокрутка добавляет к нему поворот
    gsap.to('.rim', { rotation: 360, duration: 70, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
    gsap.to('.rim-wrap', {
      rotation: 70, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.plate img', {
      yPercent: -5, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    // Блик на главной кнопке раз в несколько секунд
    gsap.fromTo('.hero .btn', { '--shine': '-120%' }, { '--shine': '120%', duration: 1.2, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.6, delay: 2.6 });

    /* ---------- 2. Рационы ---------- */
    revealLines('.rations h2', '.rations .sec-head');
    gsap.from(['.rations .eyebrow', '.rations .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.rations .sec-head', start: 'top 82%' },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.day', start: 'top 78%' } })
      .from('.day__plate', { rotation: -120, scale: 0.7, autoAlpha: 0, duration: 1.5, ease: 'expo.out' })
      .from('.day__badge', { scale: 0, rotation: -60, duration: 0.9, ease: 'back.out(1.8)' }, 0.5)
      .from('.day__panel', { y: 30, autoAlpha: 0, duration: 0.9 }, 0.3)
      .from('.kbju li', { x: -14, autoAlpha: 0, stagger: 0.07, duration: 0.6 }, 0.6)
      .from(bars, { scaleX: 0, duration: 1.2, stagger: 0.08, ease: 'power3.out' }, 0.7)
      .from('.day__tabs button', { scale: 0.4, autoAlpha: 0, stagger: 0.035, duration: 0.5, ease: 'back.out(2)' }, 0.8);
    // Калории «набегают» от нуля при первом показе
    const kc = $('.kcal__v');
    const o = { v: 0 };
    gsap.to(o, {
      v: num(kc.textContent), duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: '.day', start: 'top 70%', once: true },
      onStart: () => { kc.textContent = '0'; },
      onUpdate: () => { kc.textContent = Math.round(o.v); },
      onComplete: () => { kc.textContent = parse(imgs[cur])[4]; },
    });
    ScrollTrigger.create({
      trigger: '.day', start: 'top 60%', end: 'bottom 30%',
      onToggle: self => (self.isActive ? startAuto() : stopAuto()),
    });

    gsap.from('.offer', {
      y: 46, autoAlpha: 0, duration: 1, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.offers', start: 'top 85%' },
    });
    gsap.from('.offer__cover img', {
      scale: 1.25, duration: 1.6, stagger: 0.14, ease: 'expo.out',
      scrollTrigger: { trigger: '.offers', start: 'top 85%' },
    });

    /* ---------- 3. Сборники: раздаются со стопки, как книги на стол ---------- */
    revealLines('.books h2', '.books .sec-head');
    gsap.from(['.books .eyebrow', '.books .sec-sub'], {
      y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.15,
      scrollTrigger: { trigger: '.books .sec-head', start: 'top 82%' },
    });
    gsap.from('.book', {
      xPercent: i => -i * 60, y: 70, rotation: i => -8 + i * 5, autoAlpha: 0,
      duration: 1.25, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.shelf', start: 'top 82%' },
    });

    gsap.from('.concept-end > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: '.concept-end', start: 'top 85%' } });

    window.addEventListener('load', refresh, { once: true });
  });
})();
